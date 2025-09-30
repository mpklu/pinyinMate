/**
 * LessonBrowser - Organism component
 * Main interface for browsing and selecting lessons from the library
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Skeleton,
  Paper,
  Button,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  styled,
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { LessonCard } from '../molecules/LessonCard';
import { CategoryFilter } from '../molecules/CategoryFilter';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';

import { lessonLibraryService } from '../../services/lessonLibraryService';
import type {
  LessonCategory,
  SearchQuery,
  LessonSearchResult,
  LoadingState,
} from '../../types/library';

// Styled components
const BrowserContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: theme.spacing(2),
}));

const HeaderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexGrow: 1,
  minHeight: 0, // Allow flex shrinking
}));

const FilterSidebar = styled(Box)(({ theme }) => ({
  width: 300,
  flexShrink: 0,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const LessonGrid = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
}));

const ViewControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

type ViewMode = 'grid' | 'list';
type SortOption = 'title' | 'difficulty' | 'duration' | 'characters';

export interface LessonBrowserProps {
  /** Initial search query */
  initialQuery?: SearchQuery;
  /** Whether to show the filter sidebar */
  showFilters?: boolean;
  /** Maximum number of lessons to display */
  maxResults?: number;
  /** Callback when a lesson is selected to start */
  onLessonStart?: (lessonId: string) => void;
  /** Callback when a lesson is previewed */
  onLessonPreview?: (lessonId: string) => void;
  /** Callback when search results change */
  onResultsChange?: (results: LessonSearchResult[]) => void;
  /** Custom CSS class */
  className?: string;
}

export const LessonBrowser: React.FC<LessonBrowserProps> = ({
  initialQuery = {},
  showFilters = true,
  maxResults = 50,
  onLessonStart,
  onLessonPreview,
  onResultsChange,
  className,
}) => {
  // State
  const [categories, setCategories] = useState<LessonCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(initialQuery);
  const [searchResults, setSearchResults] = useState<LessonSearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  
  // Menu state for sort options
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  // Flatten category lessons helper function
  const flattenLessons = useCallback((categories: LessonCategory[]): LessonSearchResult[] => {
    const results: LessonSearchResult[] = [];
    categories.forEach(category => {
      category.lessons.forEach(lesson => {
        results.push({
          lesson,
          category: category.name,
          relevanceScore: 1,
          matchedFields: [],
        });
      });
    });
    return results;
  }, []);

  // Perform search when query changes
  const performSearch = useCallback(async (query: SearchQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await lessonLibraryService.searchLessons(query);
      setSearchResults(results.slice(0, maxResults));
      onResultsChange?.(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [maxResults, onResultsChange]);

  // Load initial data
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cats = await lessonLibraryService.getCategories();
        setCategories(cats);
        
        // Show all lessons by default initially
        const results = flattenLessons(cats);
        setSearchResults(results);
        onResultsChange?.(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [flattenLessons, onResultsChange]);

  // Handle search query changes separately
  useEffect(() => {
    if (Object.keys(searchQuery).length > 0) {
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  // Handle search query changes
  const handleQueryChange = useCallback((query: SearchQuery) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  // Handle lesson actions
  const handleLessonStart = useCallback(async (lessonId: string) => {
    try {
      // Set loading state
      setLoadingStates(prev => new Map(prev).set(lessonId, { isLoading: true, stage: 'fetching' }));
      
      // Load the lesson content
      await lessonLibraryService.loadLesson(lessonId);
      
      // Clear loading state
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(lessonId);
        return newMap;
      });
      
      onLessonStart?.(lessonId);
    } catch (err) {
      setLoadingStates(prev => new Map(prev).set(lessonId, { 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Failed to load lesson'
      }));
    }
  }, [onLessonStart]);

  const handleLessonPreview = useCallback((lessonId: string) => {
    onLessonPreview?.(lessonId);
  }, [onLessonPreview]);

  // Sort results
  const sortedResults = useMemo(() => {
    const results = [...searchResults];
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    
    results.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.lesson.title.localeCompare(b.lesson.title);
        case 'difficulty': {
          return difficultyOrder[a.lesson.metadata.difficulty] - difficultyOrder[b.lesson.metadata.difficulty];
        }
        case 'duration':
          return a.lesson.metadata.estimatedTime - b.lesson.metadata.estimatedTime;
        case 'characters':
          return a.lesson.metadata.characterCount - b.lesson.metadata.characterCount;
        default:
          return a.relevanceScore - b.relevanceScore;
      }
    });
    
    return results;
  }, [searchResults, sortBy]);

  // Filter by selected category
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'all') {
      return sortedResults;
    }
    return sortedResults.filter(result => result.category === selectedCategory);
  }, [sortedResults, selectedCategory]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await lessonLibraryService.clearCache();
      window.location.reload(); // Simple refresh for now
    } catch {
      setError('Failed to refresh content');
    }
  }, []);

  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <BrowserContainer className={className}>
        <LoadingSpinner message="Loading lesson library..." />
      </BrowserContainer>
    );
  }

  // Render error state
  if (error && categories.length === 0) {
    return (
      <BrowserContainer className={className}>
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      </BrowserContainer>
    );
  }

  return (
    <BrowserContainer className={className}>
      {/* Header */}
      <HeaderContainer>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Lesson Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredResults.length} lesson{filteredResults.length !== 1 ? 's' : ''} available
          </Typography>
        </Box>
        
        <ViewControls>
          <IconButton onClick={handleRefresh} title="Refresh content">
            <RefreshIcon />
          </IconButton>
          
          <Button
            startIcon={<SortIcon />}
            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
            size="small"
          >
            Sort: {sortBy}
          </Button>
          
          <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ListViewIcon />
            </IconButton>
          </Box>
        </ViewControls>
      </HeaderContainer>

      {/* Category Tabs */}
      <Paper>
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Categories" value="all" />
          {categories.map((category) => (
            <Tab
              key={category.id}
              label={`${category.name} (${category.totalLessons})`}
              value={category.name}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      <ContentContainer>
        {/* Filter Sidebar */}
        {showFilters && (
          <FilterSidebar>
            <CategoryFilter
              categories={categories}
              query={searchQuery}
              onQueryChange={handleQueryChange}
              onClear={() => handleQueryChange({})}
            />
          </FilterSidebar>
        )}

        {/* Lesson Grid */}
        <LessonGrid>
          {loading && (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }, (_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`skeleton-${index}`}>
                  <Skeleton variant="rectangular" height={280} />
                </Grid>
              ))}
            </Grid>
          )}
          
          {!loading && filteredResults.length === 0 && (
            <Alert severity="info">
              No lessons found matching your search criteria.
            </Alert>
          )}
          
          {!loading && filteredResults.length > 0 && (
            <Grid 
              container 
              spacing={2}
              sx={{
                '& > *': {
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
            >
              {filteredResults.map((result) => (
                <Grid 
                  size={{ 
                    xs: 12, 
                    sm: viewMode === 'list' ? 12 : 6, 
                    md: viewMode === 'list' ? 12 : 4 
                  }}
                  key={result.lesson.id}
                >
                  <LessonCard
                    lesson={result.lesson}
                    category={result.category}
                    loadingState={loadingStates.get(result.lesson.id)}
                    showDetails={viewMode === 'grid'}
                    onStart={handleLessonStart}
                    onPreview={handleLessonPreview}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </LessonGrid>
      </ContentContainer>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        {[
          { value: 'title', label: 'Title' },
          { value: 'difficulty', label: 'Difficulty' },
          { value: 'duration', label: 'Duration' },
          { value: 'characters', label: 'Character Count' },
        ].map((option) => (
          <MenuItem
            key={option.value}
            selected={sortBy === option.value}
            onClick={() => {
              setSortBy(option.value as SortOption);
              setSortMenuAnchor(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </BrowserContainer>
  );
};

export default LessonBrowser;