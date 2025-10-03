import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Alert,
  Container,
  Skeleton,
  Pagination,
  Divider,
  IconButton,
  Collapse,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Search,
  FilterList,
  Schedule,
  School,
  Tag,
  ExpandMore,
  ExpandLess,
  ArrowBack,
  Home
} from '@mui/icons-material';

import { librarySourceService } from '../../services/librarySourceService';
import type { 
  LibrarySource, 
  SourceLessonEntry, 
  PaginatedLessons, 
  SearchFilters 
} from '../../types/library';

interface LessonCardProps {
  lesson: SourceLessonEntry;
  onSelect: (lessonId: string) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onSelect }) => {
  const handleClick = () => {
    onSelect(lesson.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 2 }}>
            {lesson.title}
          </Typography>
          <Chip
            label={lesson.difficulty}
            size="small"
            color={getDifficultyColor(lesson.difficulty) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {lesson.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {lesson.lscsLevel && (
            <Chip
              icon={<School />}
              label={`Level ${lesson.lscsLevel}`}
              size="small"
              variant="outlined"
            />
          )}
          <Chip
            icon={<Schedule />}
            label={`${lesson.estimatedTime}m`}
            size="small"
            variant="outlined"
          />
          {lesson.characterCount > 0 && (
            <Chip
              label={`${lesson.characterCount} chars`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {lesson.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            <Tag fontSize="small" color="action" sx={{ mr: 1 }} />
            {lesson.tags.slice(0, 3).map((tag) => (
              <Chip
                key={`${lesson.id}-${tag}`}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: '20px' }}
              />
            ))}
            {lesson.tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{lesson.tags.length - 3} more
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const LessonCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="flex-start" mb={2}>
        <Skeleton variant="text" width="70%" height={28} sx={{ mr: 2 }} />
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      
      <Box display="flex" gap={1} mt={2} mb={2}>
        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      
      <Box display="flex" gap={0.5}>
        <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={70} height={20} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

export const SourceLessonsPage: React.FC = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();

  const [source, setSource] = useState<LibrarySource | null>(null);
  const [lessons, setLessons] = useState<PaginatedLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [lscsLevel, setLscsLevel] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Available filter options (derived from lessons)
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  const pageSize = 12;

  const searchLessons = useCallback(async () => {
    if (!sourceId) return;

    try {
      const filters: SearchFilters = {
        query: searchQuery || undefined,
        difficulty: difficulty.length > 0 ? difficulty : undefined,
        lscsLevel: lscsLevel.length > 0 ? lscsLevel : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      const paginatedResults = await librarySourceService.searchLessons(
        sourceId,
        filters,
        currentPage,
        pageSize
      );

      setLessons(paginatedResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search lessons';
      setError(errorMessage);
      console.error('Failed to search lessons:', err);
    }
  }, [sourceId, searchQuery, difficulty, lscsLevel, selectedTags, currentPage]);

  const loadSourceAndLessons = useCallback(async () => {
    if (!sourceId) return;

    try {
      setLoading(true);
      setError(null);

      const sourceData = librarySourceService.getSource(sourceId);
      if (!sourceData) {
        throw new Error('Source not found');
      }
      setSource(sourceData);

      // Load all lessons to build filter options
      const result = await librarySourceService.loadSourceLessons(sourceId);
      
      // Extract unique tags and levels for filters
      const allTags = new Set<string>();
      const allLevels = new Set<string>();
      
      result.lessons.forEach(lesson => {
        lesson.tags.forEach(tag => allTags.add(tag));
        if (lesson.lscsLevel) {
          allLevels.add(lesson.lscsLevel);
        }
      });

      setAvailableTags(Array.from(allTags).sort((a, b) => a.localeCompare(b)));
      setAvailableLevels(Array.from(allLevels).sort((a, b) => a.localeCompare(b)));

      // Initial search with no filters
      await searchLessons();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lessons';
      setError(errorMessage);
      console.error('Failed to load source lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [sourceId, searchLessons]);

  useEffect(() => {
    if (!sourceId) {
      setError('Source ID is required');
      setLoading(false);
      return;
    }

    loadSourceAndLessons();
  }, [sourceId, loadSourceAndLessons]);

  useEffect(() => {
    if (source) {
      searchLessons();
    }
  }, [source, searchLessons]);

  const handleLessonSelect = (lessonId: string) => {
    navigate(`/library/${sourceId}/lesson/${lessonId}`);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDifficulty([]);
    setLscsLevel([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="300px" height={40} />
        <Skeleton variant="text" width="500px" height={24} sx={{ mt: 1, mb: 3 }} />
        
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          }}
          gap={3}
        >
          {[1, 2, 3, 4, 5, 6].map(index => (
            <LessonCardSkeleton key={index} />
          ))}
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => navigate('/library')}>
            Back to Library
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!source || !lessons) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          No lessons found.
        </Alert>
      </Container>
    );
  }

  const totalPages = Math.ceil(lessons.totalCount / pageSize);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/library')}
        >
          Library
        </Link>
        <Typography color="text.primary">{source.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton
          onClick={() => navigate('/library')}
          sx={{ mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {source.name}
        </Typography>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        {lessons.totalCount} lessons available • {source.description}
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  multiple
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value as string[]);
                    setCurrentPage(1);
                  }}
                  label="Difficulty"
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>LSCS Level</InputLabel>
                <Select
                  multiple
                  value={lscsLevel}
                  onChange={(e) => {
                    setLscsLevel(e.target.value as string[]);
                    setCurrentPage(1);
                  }}
                  label="LSCS Level"
                >
                  {availableLevels.map(level => (
                    <MenuItem key={level} value={level}>Level {level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {availableTags.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {availableTags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagToggle(tag)}
                      color={selectedTags.includes(tag) ? 'primary' : 'default'}
                      variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Button onClick={clearFilters} size="small">
              Clear All Filters
            </Button>
          </Box>
        </Collapse>
      </Box>

      {/* Lessons Grid */}
      {lessons.lessons.length === 0 ? (
        <Alert severity="info">
          No lessons match your current filters. Try adjusting your search criteria.
        </Alert>
      ) : (
        <>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            }}
            gap={3}
            mb={4}
          >
            {lessons.lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onSelect={handleLessonSelect}
              />
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};