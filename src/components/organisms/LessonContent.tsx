/**
 * LessonContent - Main lesson content organism
 * Combines text display, audio controls, and vocabulary highlighting for lesson study
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Toolbar,
  AppBar,
  Fade,
  Alert,
  Skeleton
} from '@mui/material';
import {
  TextSegmentDisplay,
  AudioControls
} from '../molecules';
import {
  ProgressTracker
} from '../atoms';
import type {
  EnhancedLesson,
  VocabularyEntryWithPinyin,
  LessonStudyProgress
} from '../../types';

export interface LessonContentProps {
  /** The lesson to display */
  lesson: EnhancedLesson;
  
  /** Current study progress */
  progress?: LessonStudyProgress;
  
  /** Currently selected segment index */
  currentSegmentIndex?: number;
  
  /** Whether audio is currently playing */
  isPlaying?: boolean;
  
  /** Audio playback position (0-100) */
  playbackPosition?: number;
  
  /** Whether content is loading */
  loading?: boolean;
  
  /** Error message if loading failed */
  error?: string;
  
  /** Display variant */
  variant?: 'full' | 'compact' | 'focused';
  
  /** Whether to show progress tracker */
  showProgress?: boolean;
  
  /** Whether to enable vocabulary highlighting */
  enableVocabularyHighlight?: boolean;
  
  /** Whether to show audio controls */
  showAudioControls?: boolean;
  
  /** Callback when segment is selected */
  onSegmentSelect?: (segmentIndex: number) => void;
  
  /** Callback when audio playback is requested */
  onPlayAudio?: (segmentId?: string) => void;
  
  /** Callback when audio playback is paused */
  onPauseAudio?: () => void;
  
  /** Callback when vocabulary is clicked */
  onVocabularyClick?: (word: string, entry?: VocabularyEntryWithPinyin) => void;
  
  /** Callback when progress is updated */
  onProgressUpdate?: (progress: Partial<LessonStudyProgress>) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  progress,
  currentSegmentIndex = 0,
  isPlaying = false,
  playbackPosition = 0,
  loading = false,
  error,
  variant = 'full',
  showProgress = true,
  enableVocabularyHighlight = true,
  showAudioControls = true,
  onSegmentSelect,
  onPlayAudio,
  onPauseAudio,
  onVocabularyClick,
  onProgressUpdate
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const segments = useMemo(() => lesson.processedContent?.segments || [], [lesson.processedContent?.segments]);
  const vocabularyMap = lesson.processedContent?.vocabularyMap || new Map();
  const currentSegment = segments[currentSegmentIndex];

  // Update progress when segment is viewed
  useEffect(() => {
    if (currentSegment && onProgressUpdate && progress) {
      const updatedProgress = {
        ...progress,
        segmentsViewed: new Set([...progress.segmentsViewed, currentSegment.id])
      };
      onProgressUpdate(updatedProgress);
    }
  }, [currentSegment, onProgressUpdate, progress]);

  const handleSegmentClick = useCallback((segmentId: string) => {
    const segmentIndex = segments.findIndex(s => s.id === segmentId);
    if (segmentIndex !== -1) {
      setSelectedSegmentId(segmentId);
      if (onSegmentSelect) {
        onSegmentSelect(segmentIndex);
      }
    }
  }, [segments, onSegmentSelect]);

  const handleSegmentAudio = useCallback((segmentId: string) => {
    if (onPlayAudio) {
      onPlayAudio(segmentId);
    }
  }, [onPlayAudio]);

  const handleAudioPlay = useCallback(() => {
    if (onPlayAudio) {
      onPlayAudio();
    }
  }, [onPlayAudio]);

  const handleAudioPause = useCallback(() => {
    if (onPauseAudio) {
      onPauseAudio();
    }
  }, [onPauseAudio]);

  const handleAudioPlayPause = useCallback((playing: boolean) => {
    if (playing) {
      handleAudioPlay();
    } else {
      handleAudioPause();
    }
  }, [handleAudioPlay, handleAudioPause]);

  const handleSegmentNavigation = useCallback((segmentIndex: number) => {
    if (onSegmentSelect) {
      onSegmentSelect(segmentIndex);
    }
  }, [onSegmentSelect]);

  const calculateProgress = () => {
    if (!progress || segments.length === 0) return 0;
    return Math.round((progress.segmentsViewed.size / segments.length) * 100);
  };

  const renderLoadingState = () => (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 4 }} />
        
        {Array.from({ length: 3 }).map((_, index) => (
          <Paper key={`loading-skeleton-${index}`} sx={{ p: 3, mb: 2 }}>
            <Skeleton variant="text" width="100%" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={24} />
          </Paper>
        ))}
      </Box>
    </Container>
  );

  const renderErrorState = () => (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Failed to load lesson content'}
        </Alert>
      </Box>
    </Container>
  );

  const renderSegments = () => {
    if (segments.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No processed content available for this lesson.
        </Alert>
      );
    }

    return segments.map((segment, index) => (
      <Fade in timeout={300 + (index * 100)} key={segment.id}>
        <Box sx={{ mb: 2 }}>
          <TextSegmentDisplay
            segment={segment}
            vocabularyMap={vocabularyMap}
            selected={segment.id === selectedSegmentId || index === currentSegmentIndex}
            showPinyin={true}
            enableVocabularyHighlight={enableVocabularyHighlight}
            showAudioControls={showAudioControls}
            variant={variant === 'compact' ? 'compact' : 'default'}
            onSegmentClick={handleSegmentClick}
            onPlayAudio={handleSegmentAudio}
            onVocabularyClick={onVocabularyClick}
          />
        </Box>
      </Fade>
    ));
  };

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (variant === 'focused') {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Fixed header with progress */}
        {showProgress && (
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" noWrap>
                  {lesson.title}
                </Typography>
              </Box>
              <Box sx={{ width: 200 }}>
                <ProgressTracker
                  progress={calculateProgress()}
                  status={progress?.status || 'not-started'}
                  totalSegments={segments.length}
                  completedSegments={progress?.segmentsViewed.size || 0}
                  variant="compact"
                  size="small"
                />
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Scrollable content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
          <Container maxWidth="md">
            {renderSegments()}
          </Container>
        </Box>

        {/* Fixed audio controls */}
        {showAudioControls && segments.length > 0 && (
          <Paper elevation={3} sx={{ borderRadius: 0 }}>
            <AudioControls
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              isPlaying={isPlaying}
              playbackPosition={playbackPosition}
              variant="compact"
              onPlayPause={handleAudioPlayPause}
              onSegmentChange={handleSegmentNavigation}
            />
          </Paper>
        )}
      </Box>
    );
  }

  // Full and compact variants
  return (
    <Container maxWidth={variant === 'compact' ? 'sm' : 'md'}>
      <Box sx={{ py: variant === 'compact' ? 2 : 4 }}>
        {/* Lesson header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant={variant === 'compact' ? 'h5' : 'h4'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {lesson.title}
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {lesson.description}
          </Typography>

          {showProgress && progress && (
            <Box sx={{ mb: 3 }}>
              <ProgressTracker
                progress={calculateProgress()}
                status={progress.status}
                totalSegments={segments.length}
                completedSegments={progress.segmentsViewed.size}
                timeSpent={progress.timeSpent}
                variant={variant === 'compact' ? 'compact' : 'detailed'}
              />
            </Box>
          )}
        </Box>

        {/* Audio controls - top position for full variant */}
        {showAudioControls && segments.length > 0 && variant === 'full' && (
          <Box sx={{ mb: 3 }}>
            <AudioControls
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              isPlaying={isPlaying}
              playbackPosition={playbackPosition}
              variant="full"
              onPlayPause={handleAudioPlayPause}
              onSegmentChange={handleSegmentNavigation}
            />
          </Box>
        )}

        {/* Lesson content segments */}
        <Box>
          {renderSegments()}
        </Box>

        {/* Audio controls - bottom position for compact variant */}
        {showAudioControls && segments.length > 0 && variant === 'compact' && (
          <Box sx={{ mt: 3, position: 'sticky', bottom: 0, zIndex: 10 }}>
            <AudioControls
              segments={segments}
              currentSegmentIndex={currentSegmentIndex}
              isPlaying={isPlaying}
              playbackPosition={playbackPosition}
              variant="compact"
              onPlayPause={handleAudioPlayPause}
              onSegmentChange={handleSegmentNavigation}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LessonContent;