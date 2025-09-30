/**
 * QuizSkeleton - Loading skeleton for quiz components
 * Provides visual feedback during quiz generation and loading
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  styled,
} from '@mui/material';

const SkeletonContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 500,
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

export interface QuizSkeletonProps {
  /** Show progress bar skeleton */
  showProgress?: boolean;
  /** Number of answer options to show */
  optionCount?: number;
  /** Question type variant */
  variant?: 'multiple-choice' | 'fill-blank' | 'matching';
  /** Custom CSS class */
  className?: string;
}

export const QuizSkeleton: React.FC<QuizSkeletonProps> = ({
  showProgress = true,
  optionCount = 4,
  variant = 'multiple-choice',
  className,
}) => {
  const renderQuestionSkeleton = () => {
    switch (variant) {
      case 'fill-blank':
        return (
          <>
            {/* Question with blank */}
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Skeleton variant="text" width="30%" height={24} />
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="text" width="40%" height={24} />
            </Box>
          </>
        );

      case 'matching':
        return (
          <Box display="flex" gap={4}>
            {/* Left column */}
            <Box flex={1}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              ))}
            </Box>
            {/* Right column */}
            <Box flex={1}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              ))}
            </Box>
          </Box>
        );

      default: // multiple-choice
        return (
          <>
            {/* Question text */}
            <Skeleton variant="text" width="85%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="65%" height={24} sx={{ mb: 3 }} />

            {/* Answer options */}
            {[...Array(optionCount)].map((_, i) => (
              <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width="75%" height={20} />
              </Box>
            ))}
          </>
        );
    }
  };

  return (
    <SkeletonContainer className={className}>
      {/* Header with title and progress */}
      <Box mb={3}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        
        {showProgress && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="rounded" width="100%" height={8} />
            <Skeleton variant="text" width="15%" height={20} />
          </Box>
        )}

        {/* Stats chips */}
        <Box display="flex" gap={1}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Box>
      </Box>

      {/* Main question area */}
      <QuestionCard>
        <CardContent>
          {renderQuestionSkeleton()}
        </CardContent>
      </QuestionCard>

      {/* Action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Skeleton variant="rounded" width={100} height={40} />
        <Box display="flex" gap={2}>
          <Skeleton variant="rounded" width={80} height={40} />
          <Skeleton variant="rounded" width={80} height={40} />
        </Box>
        <Skeleton variant="rounded" width={100} height={40} />
      </Box>

      {/* Results placeholder */}
      <Box mt={4} textAlign="center">
        <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
      </Box>
    </SkeletonContainer>
  );
};