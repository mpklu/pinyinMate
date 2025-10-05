/**
 * ReaderView - Organism Component
 * Complete reader mode interface with theme support, pinyin display, and accessibility
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Container, LinearProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReadingSegment } from '../atoms/ReadingSegment';
import type { ReaderViewProps, ReaderTheme } from '../../types/reader';

// Theme configurations for the reader container
const getReaderThemeStyles = (theme: ReaderTheme) => {
  switch (theme) {
    case 'dark':
      return {
        backgroundColor: '#1a1a1a',
        color: '#e0e0e0',
        borderColor: '#555555',
      };
    case 'sepia':
      return {
        backgroundColor: '#f4f1e8',
        color: '#5c4b37',
        borderColor: '#c7b299',
      };
    case 'highContrast':
      return {
        backgroundColor: '#ffffff',
        color: '#000000',
        borderColor: '#000000',
      };
    case 'default':
    default:
      return {
        backgroundColor: '#ffffff',
        color: '#333333',
        borderColor: '#e0e0e0',
      };
  }
};

const ReaderContainer = styled(Container, {
  shouldForwardProp: (prop) => !['readerTheme'].includes(prop as string),
})<{
  readerTheme: ReaderTheme;
}>(({ theme, readerTheme }) => {
  const themeStyles = getReaderThemeStyles(readerTheme);
  
  return {
    backgroundColor: themeStyles.backgroundColor,
    color: themeStyles.color,
    height: 'calc(100vh - 140px)', // Full height minus space for header/controls and bottom margin
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${themeStyles.borderColor}`,
    boxShadow: theme.shadows[2],
    transition: 'all 0.3s ease-in-out',
  };
});

const ContentArea = styled(Box)(({ theme }) => ({
  lineHeight: 2,
  fontSize: '1.1rem',
  textAlign: 'left',
  wordSpacing: theme.spacing(0.5),
  userSelect: 'text',
}));

const ProgressHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const ReaderView: React.FC<ReaderViewProps> = ({
  segments,
  readerState,
  fontSize,
  lineHeight,
  playingAudioId,
  onSegmentSelect,
  onPlayAudio,
  onProgressChange,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLElement>(null);

  // Auto-scroll functionality
  const scrollToActiveSegment = useCallback(() => {
    if (activeSegmentRef.current && contentRef.current) {
      const container = contentRef.current;
      const activeElement = activeSegmentRef.current;
      
      // Get container and element positions
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      
      // Calculate if element is out of view
      const isAboveViewport = elementRect.top < containerRect.top;
      const isBelowViewport = elementRect.bottom > containerRect.bottom;
      
      if (isAboveViewport || isBelowViewport) {
        // Scroll to center the active segment
        const elementTop = activeElement.offsetTop;
        const containerHeight = container.clientHeight;
        const elementHeight = activeElement.offsetHeight;
        
        const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
        
        container.scrollTo({
          top: scrollTo,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (readerState.autoScroll.enabled && !readerState.autoScroll.paused) {
      scrollToActiveSegment();
    }
  }, [readerState.progress.currentSegmentIndex, readerState.autoScroll.enabled, readerState.autoScroll.paused, scrollToActiveSegment]);

  // Auto-advance segments when auto-scroll is enabled
  useEffect(() => {
    if (readerState.autoScroll.enabled && !readerState.autoScroll.paused) {
      const interval = setInterval(() => {
        const currentIndex = readerState.progress.currentSegmentIndex;
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < segments.length) {
          onProgressChange(nextIndex);
        }
      }, (3000 / readerState.autoScroll.speed)); // Adjust timing based on speed
      
      return () => clearInterval(interval);
    }
  }, [
    readerState.autoScroll.enabled,
    readerState.autoScroll.paused,
    readerState.autoScroll.speed,
    readerState.progress.currentSegmentIndex,
    segments.length,
    onProgressChange,
  ]);

  const handleSegmentClick = useCallback((segmentId: string, index: number) => {
    onSegmentSelect(segmentId, index);
    onProgressChange(index);
  }, [onSegmentSelect, onProgressChange]);

  const handleAudioPlay = useCallback((segmentId: string, text: string) => {
    onPlayAudio(segmentId, text);
  }, [onPlayAudio]);

  if (!segments || segments.length === 0) {
    return (
      <ReaderContainer readerTheme={readerState.theme} maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            No content available for reading mode
          </Typography>
        </Box>
      </ReaderContainer>
    );
  }

  return (
    <ReaderContainer readerTheme={readerState.theme} maxWidth="lg">
      {/* Progress Header */}
      <ProgressHeader>
        <Typography variant="h6" sx={{ minWidth: 'fit-content' }}>
          Reading Progress
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={readerState.progress.progressPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {readerState.progress.currentSegmentIndex + 1} / {readerState.progress.totalSegments}
        </Typography>
      </ProgressHeader>

      {/* Main Content */}
      <ContentArea
        ref={contentRef}
        sx={{
          fontSize: `${fontSize}rem`,
          lineHeight: lineHeight,
          flex: 1,
          overflowY: 'auto',
          padding: 2,
        }}
      >
        {segments.map((segment, index) => {
          const isActive = index === readerState.progress.currentSegmentIndex;
          const isPlaying = playingAudioId === segment.id;

          return (
            <Box
              key={segment.id}
              ref={isActive ? activeSegmentRef : undefined}
              component="span"
            >
              <ReadingSegment
                segment={segment}
                theme={readerState.theme}
                pinyinMode={readerState.pinyinMode}
                showToneColors={readerState.showToneColors}
                fontSize={fontSize}
                lineHeight={lineHeight}
                isActive={isActive}
                isPlaying={isPlaying}
                onClick={() => handleSegmentClick(segment.id, index)}
                onPlayAudio={handleAudioPlay}
              />
            </Box>
          );
        })}
      </ContentArea>


    </ReaderContainer>
  );
};

export default ReaderView;