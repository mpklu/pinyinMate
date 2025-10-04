import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  LibraryBooks,
  CloudDownload,
  Folder,
  AccessTime,
  Category,
  Refresh
} from '@mui/icons-material';

import { librarySourceService } from '../../services/librarySourceService';
import type { LibrarySource, LoadingState } from '../../types/library';

interface SourceCardProps {
  source: LibrarySource;
  loadingState: LoadingState;
  onRefresh: (sourceId: string) => void;
  onNavigate: (sourceId: string) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ 
  source, 
  loadingState, 
  onRefresh, 
  onNavigate 
}) => {
  const [lessonCount, setLessonCount] = useState<number | null>(source.metadata.totalLessons || null);

  // Load lesson count on mount if not available
  useEffect(() => {
    const loadLessonCount = async () => {
      if (lessonCount === null || lessonCount === 0) {
        try {
          const result = await librarySourceService.loadSourceLessons(source.id);
          setLessonCount(result.lessons.length);
        } catch (error) {
          console.warn(`Failed to load lesson count for ${source.id}:`, error);
          setLessonCount(0);
        }
      }
    };

    loadLessonCount();
  }, [source.id, lessonCount]);

  const handleRefresh = () => {
    setLessonCount(null); // Reset count to trigger reload
    onRefresh(source.id);
  };

  const handleExplore = () => {
    onNavigate(source.id);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={handleExplore}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          {source.type === 'local' ? (
            <Folder color="primary" sx={{ mr: 1 }} />
          ) : (
            <CloudDownload color="secondary" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6" component="h2">
            {source.name}
          </Typography>
          <Chip
            label={source.type}
            size="small"
            color={source.type === 'local' ? 'primary' : 'secondary'}
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {source.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip
            icon={<LibraryBooks />}
            label={lessonCount !== null ? `${lessonCount} lessons` : 'Loading...'}
            size="small"
            variant="outlined"
          />
          {source.metadata.categories && (
            <Chip
              icon={<Category />}
              label={`${source.metadata.categories.length} categories`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {source.metadata.lastUpdated && (
          <Box display="flex" alignItems="center" mt={1}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              Updated: {new Date(source.metadata.lastUpdated).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        {source.metadata.organization && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            By {source.metadata.organization}
          </Typography>
        )}

        {loadingState.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {loadingState.error}
          </Alert>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleExplore();
          }}
          disabled={loadingState.isLoading}
          startIcon={loadingState.isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {loadingState.isLoading ? 'Loading...' : 'Explore'}
        </Button>
        
        {source.type === 'remote' && (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={loadingState.isLoading}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const SourceCardSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="rectangular" width={60} height={24} sx={{ ml: 'auto', borderRadius: 1 }} />
      </Box>
      
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="90%" />
      
      <Box display="flex" gap={1} mt={2}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
    <CardActions>
      <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
    </CardActions>
  </Card>
);

export const LibrarySourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [sources, setSources] = useState<LibrarySource[]>([]);
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSources = async () => {
      try {
        console.log('🔍 [LibrarySourcesPage] Starting initialization...');
        await librarySourceService.initialize();
        console.log('✅ [LibrarySourcesPage] Initialize completed');
        
        const availableSources = librarySourceService.getSources();
        console.log('📋 [LibrarySourcesPage] Available sources:', availableSources.length);
        console.log('📋 [LibrarySourcesPage] Sources details:', availableSources);
        
        // Set sources without pre-loading (load on demand)
        setSources(availableSources);

        // Get initial loading states
        const states = new Map<string, LoadingState>();
        availableSources.forEach(source => {
          states.set(source.id, librarySourceService.getLoadingState(source.id));
        });
        setLoadingStates(states);

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize library sources';
        setError(errorMessage);
        console.error('Failed to initialize library sources:', err);
      } finally {
        setInitializing(false);
      }
    };

    initializeSources();
  }, []);

  const handleRefreshSource = async (sourceId: string) => {
    try {
      // Update loading state
      setLoadingStates(prev => new Map(prev).set(sourceId, { isLoading: true }));

      await librarySourceService.refreshSource(sourceId);
      
      // Update the source and loading state
      const updatedSource = librarySourceService.getSource(sourceId);
      const updatedLoadingState = librarySourceService.getLoadingState(sourceId);
      
      if (updatedSource) {
        setSources(prev => prev.map(s => s.id === sourceId ? updatedSource : s));
      }
      setLoadingStates(prev => new Map(prev).set(sourceId, updatedLoadingState));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh source';
      setLoadingStates(prev => new Map(prev).set(sourceId, { 
        isLoading: false, 
        error: errorMessage 
      }));
      console.error('Failed to refresh source:', err);
    }
  };

  const handleNavigateToSource = (sourceId: string) => {
    navigate(`/library/${sourceId}`);
  };

  if (initializing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lesson Library
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Loading available sources...
        </Typography>
        
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          }}
          gap={3}
        >
          {[1, 2, 3].map(index => (
            <SourceCardSkeleton key={index} />
          ))}
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lesson Library
        </Typography>
        
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lesson Library
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Choose a source to explore lessons from local collections and remote repositories.
      </Typography>

      {sources.length === 0 ? (
        <Alert severity="info">
          No lesson sources are currently available. Check your configuration.
          <br />
          Debug: sources.length = {sources.length}
        </Alert>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          }}
          gap={3}
        >
          {sources.map(source => (
            <SourceCard
              key={source.id}
              source={source}
              loadingState={loadingStates.get(source.id) || { isLoading: false }}
              onRefresh={handleRefreshSource}
              onNavigate={handleNavigateToSource}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};