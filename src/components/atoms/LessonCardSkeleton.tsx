/**
 * LessonCardSkeleton - Loading skeleton for lesson cards
 * Provides visual feedback during lesson loading operations
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  styled,
} from '@mui/material';

const SkeletonCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

export interface LessonCardSkeletonProps {
  /** Show additional metadata skeletons */
  showMetadata?: boolean;
  /** Show difficulty badge skeleton */
  showDifficulty?: boolean;
  /** Show progress indicator skeleton */
  showProgress?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const LessonCardSkeleton: React.FC<LessonCardSkeletonProps> = ({
  showMetadata = true,
  showDifficulty = true,
  showProgress = false,
  className,
}) => {
  return (
    <SkeletonCard className={className}>
      <CardContent>
        {/* Title skeleton */}
        <Skeleton
          variant="text"
          width="80%"
          height={28}
          sx={{ mb: 1 }}
          animation="wave"
        />
        
        {/* Description skeleton */}
        <Skeleton
          variant="text"
          width="100%"
          height={20}
          sx={{ mb: 1 }}
          animation="wave"
        />
        <Skeleton
          variant="text"
          width="60%"
          height={20}
          sx={{ mb: 2 }}
          animation="wave"
        />

        {/* Metadata row */}
        {showMetadata && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            {/* Category/tags */}
            <Box display="flex" gap={0.5}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
            
            {/* Time estimate */}
            <Skeleton variant="text" width={40} height={20} />
          </Box>
        )}

        {/* Difficulty badge */}
        {showDifficulty && (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton variant="rounded" width={70} height={28} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        )}

        {/* Progress bar */}
        {showProgress && (
          <Box mt={2}>
            <Skeleton variant="rounded" width="100%" height={6} />
          </Box>
        )}
      </CardContent>
    </SkeletonCard>
  );
};