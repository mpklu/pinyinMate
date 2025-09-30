/**
 * TextSegmentSkeleton - Loading skeleton for text segmentation and annotation
 * Provides visual feedback during text processing operations
 */

import React from 'react';
import {
  Box,
  Paper,
  Skeleton,
  styled,
} from '@mui/material';

const SegmentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const SegmentLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export interface TextSegmentSkeletonProps {
  /** Number of text segments to show */
  segmentCount?: number;
  /** Show annotation controls */
  showControls?: boolean;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const TextSegmentSkeleton: React.FC<TextSegmentSkeletonProps> = ({
  segmentCount = 5,
  showControls = true,
  showProgress = false,
  className,
}) => {
  return (
    <Box className={className}>
      {/* Header with title and controls */}
      {showControls && (
        <Box mb={3}>
          <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
          
          {/* Control buttons */}
          <Box display="flex" gap={2} mb={2}>
            <Skeleton variant="rounded" width={120} height={36} />
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>

          {/* Progress indicator */}
          {showProgress && (
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton variant="text" width="25%" height={20} />
              <Skeleton variant="rounded" width="100%" height={6} />
            </Box>
          )}
        </Box>
      )}

      {/* Text input area */}
      <SegmentContainer sx={{ mb: 3 }}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={120} />
      </SegmentContainer>

      {/* Segmented text display */}
      <SegmentContainer>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        
        {/* Text segments */}
        {[...Array(segmentCount)].map((_, index) => (
          <SegmentLine key={`segment-${index}`}>
            {/* Chinese character */}
            <Skeleton variant="rounded" width={40} height={30} />
            
            {/* Pinyin */}
            <Skeleton variant="text" width={60} height={20} />
            
            {/* Definition */}
            <Skeleton variant="text" width={120} height={20} />
            
            {/* Actions */}
            <Box display="flex" gap={1} ml="auto">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
          </SegmentLine>
        ))}
      </SegmentContainer>

      {/* Export/action area */}
      {showControls && (
        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={2}>
            <Skeleton variant="rounded" width={100} height={40} />
            <Skeleton variant="rounded" width={120} height={40} />
          </Box>
          
          <Box display="flex" gap={1}>
            <Skeleton variant="rounded" width={60} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </Box>
        </Box>
      )}
    </Box>
  );
};