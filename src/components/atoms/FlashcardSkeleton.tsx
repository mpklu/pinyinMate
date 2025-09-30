/**
 * FlashcardSkeleton - Loading skeleton for flashcard components
 * Provides visual feedback during flashcard loading and generation
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
  minHeight: 300,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

export interface FlashcardSkeletonProps {
  /** Show action buttons skeleton */
  showActions?: boolean;
  /** Show progress indicators */
  showProgress?: boolean;
  /** Variant for different flashcard types */
  variant?: 'standard' | 'compact' | 'detailed';
  /** Custom CSS class */
  className?: string;
}

export const FlashcardSkeleton: React.FC<FlashcardSkeletonProps> = ({
  showActions = true,
  showProgress = false,
  variant = 'standard',
  className,
}) => {
  const getSkeletonSizes = () => {
    switch (variant) {
      case 'compact':
        return { height: 200, textHeight: 24, subTextHeight: 16 };
      case 'detailed':
        return { height: 400, textHeight: 32, subTextHeight: 20 };
      default:
        return { height: 300, textHeight: 28, subTextHeight: 18 };
    }
  };

  const sizes = getSkeletonSizes();

  return (
    <Box className={className}>
      {/* Progress indicators */}
      {showProgress && (
        <Box display="flex" justifyContent="center" gap={1} mb={2}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Box>
      )}

      {/* Main flashcard skeleton */}
      <SkeletonCard sx={{ minHeight: sizes.height }}>
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Chinese text skeleton */}
          <Skeleton
            variant="text"
            width="60%"
            height={sizes.textHeight}
            sx={{ mb: 2, fontSize: '2rem' }}
            animation="wave"
          />

          {/* Pinyin skeleton */}
          <Skeleton
            variant="text"
            width="50%"
            height={sizes.subTextHeight}
            sx={{ mb: 1 }}
            animation="wave"
          />

          {/* Definition skeleton */}
          <Skeleton
            variant="text"
            width="80%"
            height={sizes.subTextHeight}
            sx={{ mb: 1 }}
            animation="wave"
          />

          {variant === 'detailed' && (
            <>
              {/* Example sentence skeleton */}
              <Skeleton
                variant="text"
                width="90%"
                height={sizes.subTextHeight}
                sx={{ mb: 1 }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="75%"
                height={sizes.subTextHeight}
                sx={{ mb: 2 }}
                animation="wave"
              />
            </>
          )}
        </CardContent>

        {/* Action buttons skeleton */}
        {showActions && (
          <Box display="flex" justifyContent="center" gap={2} p={2}>
            <Skeleton variant="rounded" width={80} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>
        )}
      </SkeletonCard>

      {/* Navigation controls skeleton */}
      {showProgress && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rounded" width={120} height={6} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      )}
    </Box>
  );
};