/**
 * Lesson Browser Component
 * Browse, search, and select existing lessons from GitHub sources
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Divider,
} from '@mui/material';
import { Search, Edit, Refresh, FilterList } from '@mui/icons-material';
import type { Lesson } from '../types';
import type {
  LessonListItem,
  RemoteSourceConfig,
  SearchFilters,
} from '../services/githubFetchService';
import {
  listLessonsFromSource,
  filterLessons,
  getLessonMetadata,
} from '../services/githubFetchService';

interface LessonBrowserProps {
  onLessonSelect: (lesson: Lesson, source: any, sha?: string) => void;
  onClose?: () => void;
}

const LessonBrowser = ({ onLessonSelect, onClose }: LessonBrowserProps) => {
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Load lessons from configured sources
  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load from LSCS Depot (primary source)
      const sourceConfig: RemoteSourceConfig = {
        id: 'lscs-depot',
        name: 'LSCS Chinese Lesson Depot',
        owner: 'gelileo',
        repo: 'chinese-lesson-depot',
        branch: 'main',
        url: 'https://raw.githubusercontent.com/gelileo/chinese-lesson-depot/main/manifest.json',
      };

      const fetchedLessons = await listLessonsFromSource(sourceConfig);
      setLessons(fetchedLessons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  // Filter lessons based on search and filters
  const filteredLessons = useMemo(() => {
    return filterLessons(lessons, searchQuery, filters);
  }, [lessons, searchQuery, filters]);

  // Group lessons by difficulty
  const lessonsByDifficulty = useMemo(() => {
    const groups: Record<string, LessonListItem[]> = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };

    filteredLessons.forEach((item) => {
      const difficulty = item.lesson.metadata.difficulty || 'beginner';
      if (groups[difficulty]) {
        groups[difficulty].push(item);
      }
    });

    return groups;
  }, [filteredLessons]);

  const handleLessonSelect = async (item: LessonListItem) => {
    try {
      // Get fresh SHA before loading
      const sha = await getLessonMetadata(
        item.source.sourceId === 'lscs-depot' ? 'gelileo' : '',
        item.source.sourceId === 'lscs-depot' ? 'chinese-lesson-depot' : '',
        item.source.path
      );
      
      onLessonSelect(item.lesson, item.source, sha.sha);
    } catch (err) {
      console.error('Failed to load lesson:', err);
      setError('Failed to load lesson. Please try again.');
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderLessonCard = (item: LessonListItem) => {
    const { lesson, metadata } = item;
    const formattedDate = new Date(metadata.lastModified).toLocaleDateString();

    return (
      <Card key={lesson.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {lesson.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {lesson.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={lesson.metadata.difficulty}
                  size="small"
                  color={
                    lesson.metadata.difficulty === 'beginner'
                      ? 'success'
                      : lesson.metadata.difficulty === 'intermediate'
                      ? 'warning'
                      : 'error'
                  }
                />
                {lesson.metadata.lscsLevel && (
                  <Chip label={lesson.metadata.lscsLevel} size="small" variant="outlined" />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {lesson.metadata.tags.slice(0, 5).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {lesson.metadata.characterCount} characters • {lesson.metadata.estimatedTime} min •{' '}
                {lesson.metadata.vocabulary.length} vocab
                <br />
                Last updated: {formattedDate}
                {metadata.author && ` by ${metadata.author}`}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => handleLessonSelect(item)}
            variant="contained"
          >
            Edit
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Browse Existing Lessons
        </Typography>
        <Button startIcon={<Refresh />} onClick={loadLessons} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search lessons by title, tags, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty?.[0] || ''}
                onChange={(e) =>
                  handleFilterChange('difficulty', e.target.value ? [e.target.value] : [])
                }
                label="Difficulty"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Min Characters</InputLabel>
              <Select
                value={filters.minCharacterCount || ''}
                onChange={(e) => handleFilterChange('minCharacterCount', e.target.value)}
                label="Min Characters"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value={50}>50+</MenuItem>
                <MenuItem value={100}>100+</MenuItem>
                <MenuItem value={200}>200+</MenuItem>
                <MenuItem value={500}>500+</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
              <FilterList fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lessons List */}
      {!loading && !error && (
        <Box>
          {Object.entries(lessonsByDifficulty).map(([difficulty, items]) => {
            if (items.length === 0) return null;

            return (
              <Box key={difficulty} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                  📚 {difficulty} ({items.length} lesson{items.length !== 1 ? 's' : ''})
                </Typography>
                {items.map(renderLessonCard)}
              </Box>
            );
          })}

          {filteredLessons.length === 0 && (
            <Alert severity="info">
              No lessons found. Try adjusting your search or filters.
            </Alert>
          )}
        </Box>
      )}

      {/* Close Button */}
      {onClose && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      )}
    </Paper>
  );
};

export default LessonBrowser;
