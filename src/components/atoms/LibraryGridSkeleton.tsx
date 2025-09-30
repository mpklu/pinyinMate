/**
 * LibraryGridSkeleton - Loading skeleton for library lesson grid
 * Provides visual feedback during library loading operations
 */

import React from 'react';
import {
  Box,
  Skeleton,
  styled,
} from '@mui/material';
import { LessonCardSkeleton } from './LessonCardSkeleton';

const SearchSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export interface LibraryGridSkeletonProps {
  /** Number of lesson cards to show */
  cardCount?: number;
  /** Show search and filter controls */
  showControls?: boolean;
  /** Show category tabs */
  showTabs?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const LibraryGridSkeleton: React.FC<LibraryGridSkeletonProps> = ({
  cardCount = 12,
  showControls = true,
  showTabs = true,
  className,
}) => {
  return (
    <Box className={className}>
      {/* Header */}
      <Box mb={3}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="70%" height={24} />
      </Box>

      {/* Category tabs */}
      {showTabs && (
        <Box display="flex" gap={2} mb={3}>
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={90} height={36} />
          <Skeleton variant="rounded" width={85} height={36} />
        </Box>
      )}

      {/* Search and filters */}
      {showControls && (
        <SearchSection>
          <Box display="flex" gap={2} mb={2}>
            {/* Search bar */}
            <Skeleton variant="rounded" width="100%" height={48} />
            
            {/* Filter button */}
            <Skeleton variant="rounded" width={100} height={48} />
          </Box>

          {/* Filter chips */}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Skeleton variant="rounded" width={70} height={28} />
            <Skeleton variant="rounded" width={85} height={28} />
            <Skeleton variant="rounded" width={65} height={28} />
            <Skeleton variant="rounded" width={90} height={28} />
          </Box>
        </SearchSection>
      )}

      {/* Results count */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width="25%" height={24} />
        <Box display="flex" gap={1}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>

      {/* Lesson cards grid */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={3}
      >
        {Array.from({ length: cardCount }, (_, index) => (
          <LessonCardSkeleton
            key={`lesson-skeleton-${index}`}
            showMetadata
            showDifficulty
            showProgress={index % 3 === 0} // Randomly show progress on some cards
          />
        ))}
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Box display="flex" gap={1} alignItems="center">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="rounded" width={24} height={32} />
          <Skeleton variant="rounded" width={24} height={32} />
          <Skeleton variant="rounded" width={24} height={32} />
          <Skeleton variant="text" width={20} height={20} />
          <Skeleton variant="rounded" width={24} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>
    </Box>
  );
};