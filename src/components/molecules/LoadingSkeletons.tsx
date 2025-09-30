/**
 * Loading States and Skeleton Components
 * Provides skeleton screens and loading indicators for better UX
 */

import React from 'react';
import { Skeleton, Box, Card, CardContent, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Shimmer animation for skeleton components
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Custom skeleton with shimmer effect
const ShimmerSkeleton = styled(Skeleton)(({ theme }) => ({
  '&::after': {
    background: `linear-gradient(90deg, transparent, ${theme.palette.action.hover}, transparent)`,
    animation: `${shimmer} 1.6s ease-in-out infinite`,
  },
}));

// Loading container
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

/**
 * Lesson Card Skeleton
 */
export const LessonCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <ShimmerSkeleton variant="text" width="80%" height={28} />
      <ShimmerSkeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
        <ShimmerSkeleton variant="circular" width={24} height={24} />
        <ShimmerSkeleton variant="text" width="40%" height={16} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <ShimmerSkeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
        <ShimmerSkeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Lesson Grid Skeleton
 */
export const LessonGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      },
      gap: 2,
    }}
  >
    {Array.from({ length: count }, (_, index) => (
      <LessonCardSkeleton key={`lesson-skeleton-${index}`} />
    ))}
  </Box>
);

/**
 * Lesson Content Skeleton
 */
export const LessonContentSkeleton: React.FC = () => (
  <LoadingContainer>
    {/* Title */}
    <ShimmerSkeleton variant="text" width="70%" height={40} />
    
    {/* Metadata */}
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <ShimmerSkeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
      <ShimmerSkeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      <ShimmerSkeleton variant="circular" width={32} height={32} />
    </Box>

    {/* Content paragraphs */}
    <Box sx={{ mt: 3 }}>
      <ShimmerSkeleton variant="text" width="100%" height={24} />
      <ShimmerSkeleton variant="text" width="95%" height={24} />
      <ShimmerSkeleton variant="text" width="85%" height={24} />
      <ShimmerSkeleton variant="text" width="90%" height={24} />
    </Box>

    {/* Vocabulary section */}
    <Box sx={{ mt: 4 }}>
      <ShimmerSkeleton variant="text" width="40%" height={28} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {Array.from({ length: 4 }, (_, index) => (
          <Box key={`vocab-skeleton-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShimmerSkeleton variant="text" width={80} height={24} />
            <ShimmerSkeleton variant="text" width={100} height={20} />
            <ShimmerSkeleton variant="text" width={120} height={20} />
            <ShimmerSkeleton variant="circular" width={24} height={24} />
          </Box>
        ))}
      </Box>
    </Box>
  </LoadingContainer>
);

/**
 * Flashcard Skeleton
 */
export const FlashcardSkeleton: React.FC = () => (
  <Card
    sx={{
      minHeight: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    <CardContent sx={{ textAlign: 'center', width: '100%' }}>
      <ShimmerSkeleton variant="text" width="60%" height={48} sx={{ mx: 'auto' }} />
      <ShimmerSkeleton variant="text" width="40%" height={24} sx={{ mx: 'auto', mt: 2 }} />
      <ShimmerSkeleton variant="text" width="70%" height={20} sx={{ mx: 'auto', mt: 1 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <ShimmerSkeleton variant="circular" width={48} height={48} />
        <ShimmerSkeleton variant="circular" width={48} height={48} />
      </Box>
    </CardContent>
    
    {/* Progress indicator */}
    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
      <ShimmerSkeleton variant="text" width={40} height={16} />
    </Box>
  </Card>
);

/**
 * Quiz Question Skeleton
 */
export const QuizQuestionSkeleton: React.FC = () => (
  <LoadingContainer>
    {/* Progress bar */}
    <ShimmerSkeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
    
    {/* Question */}
    <Box sx={{ mt: 3 }}>
      <ShimmerSkeleton variant="text" width="80%" height={32} />
      <ShimmerSkeleton variant="text" width="60%" height={24} />
    </Box>

    {/* Answer options */}
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <ShimmerSkeleton
          key={`quiz-option-${index}`}
          variant="rectangular"
          width="100%"
          height={48}
          sx={{ borderRadius: 1 }}
        />
      ))}
    </Box>

    {/* Action buttons */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
      <ShimmerSkeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
      <ShimmerSkeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
    </Box>
  </LoadingContainer>
);

/**
 * Navigation Skeleton
 */
export const NavigationSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
    <ShimmerSkeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} />
    <Box sx={{ flexGrow: 1 }} />
    <ShimmerSkeleton variant="circular" width={32} height={32} />
    <ShimmerSkeleton variant="circular" width={32} height={32} />
    <ShimmerSkeleton variant="circular" width={32} height={32} />
  </Box>
);

/**
 * Search Bar Skeleton
 */
export const SearchBarSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    <ShimmerSkeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1 }} />
    <ShimmerSkeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 1 }} />
    <ShimmerSkeleton variant="rectangular" width={80} height={48} sx={{ borderRadius: 1 }} />
  </Box>
);

/**
 * Page Loading Skeleton (combines multiple skeletons for full page)
 */
export const PageLoadingSkeleton: React.FC<{
  type: 'library' | 'lesson' | 'quiz' | 'flashcard';
}> = ({ type }) => {
  const renderContent = () => {
    switch (type) {
      case 'library':
        return (
          <>
            <SearchBarSkeleton />
            <LessonGridSkeleton count={9} />
          </>
        );
      case 'lesson':
        return <LessonContentSkeleton />;
      case 'quiz':
        return <QuizQuestionSkeleton />;
      case 'flashcard':
        return <FlashcardSkeleton />;
      default:
        return <LessonContentSkeleton />;
    }
  };

  return (
    <Box>
      <NavigationSkeleton />
      <Box sx={{ p: 2 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

/**
 * Inline Loading States
 */
export const InlineLoader: React.FC<{
  size?: 'small' | 'medium' | 'large';
  text?: string;
}> = ({ size = 'medium', text }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
      <ShimmerSkeleton variant="circular" width={getSize()} height={getSize()} />
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Content Placeholder for empty states
 */
export const ContentPlaceholder: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      py: 8,
      px: 4,
    }}
  >
    {icon && (
      <Box sx={{ mb: 2, opacity: 0.5 }}>
        {icon}
      </Box>
    )}
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
    )}
    {action}
  </Box>
);

/**
 * Progressive Loading Component
 * Shows skeleton initially, then fades to actual content
 */
export const ProgressiveLoader: React.FC<{
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}> = ({ loading, skeleton, children, delay = 0 }) => {
  const [showSkeleton, setShowSkeleton] = React.useState(loading);

  React.useEffect(() => {
    if (!loading && delay > 0) {
      const timer = setTimeout(() => setShowSkeleton(false), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(loading);
    }
  }, [loading, delay]);

  return (
    <Box
      sx={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: showSkeleton ? 0.8 : 1,
      }}
    >
      {showSkeleton ? skeleton : children}
    </Box>
  );
};

// Export all components
export {
  ShimmerSkeleton,
  LoadingContainer,
};