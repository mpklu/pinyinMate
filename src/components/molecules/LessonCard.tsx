/**
 * LessonCard - Molecule component
 * Displays a lesson preview with metadata and action buttons
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  CircularProgress,
  styled,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Visibility as PreviewIcon,
  AccessTime as TimeIcon,
  Translate as CharacterIcon,
} from '@mui/icons-material';

import type { LessonReference, LoadingState } from '../../types/library';
import type { DifficultyLevel } from '../../types/common';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create(['elevation', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    elevation: 4,
    transform: 'translateY(-2px)',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
}));

const MetadataContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  flexWrap: 'wrap',
}));

const TagContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  flexWrap: 'wrap',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: 0,
  paddingBottom: theme.spacing(1),
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
  justifyContent: 'space-between',
}));

// Difficulty color mapping
const getDifficultyColor = (difficulty: DifficultyLevel): 'success' | 'warning' | 'error' => {
  switch (difficulty) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'error';
    default:
      return 'success';
  }
};

export interface LessonCardProps {
  /** Lesson reference data */
  lesson: LessonReference;
  /** Category name */
  category: string;
  /** Loading state */
  loadingState?: LoadingState;
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether to show detailed metadata */
  showDetails?: boolean;
  /** Callback when lesson is selected to start */
  onStart?: (lessonId: string) => void;
  /** Callback when lesson is previewed */
  onPreview?: (lessonId: string) => void;
  /** Custom CSS class */
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  category,
  loadingState,
  selected = false,
  showDetails = true,
  onStart,
  onPreview,
  className,
}) => {
  const isLoading = loadingState?.isLoading ?? false;
  const error = loadingState?.error;

  const handleStart = () => {
    if (!isLoading && onStart) {
      onStart(lesson.id);
    }
  };

  const handlePreview = () => {
    if (!isLoading && onPreview) {
      onPreview(lesson.id);
    }
  };

  return (
    <StyledCard 
      className={className}
      variant={selected ? 'outlined' : 'elevation'}
      sx={{
        borderColor: selected ? 'primary.main' : undefined,
        borderWidth: selected ? 2 : undefined,
      }}
    >
      <CardHeader>
        <Typography variant="h6" component="h3" gutterBottom>
          {lesson.title}
        </Typography>
        
        <Chip
          label={lesson.metadata.difficulty}
          color={getDifficultyColor(lesson.metadata.difficulty)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </CardHeader>

      <StyledCardContent>
        {lesson.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
          >
            {lesson.description}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Category: {category}
        </Typography>

        {showDetails && (
          <MetadataContainer>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CharacterIcon fontSize="small" color="action" />
              <Typography variant="caption">
                {lesson.metadata.characterCount} chars
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={0.5}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="caption">
                {lesson.metadata.estimatedTime} min
              </Typography>
            </Box>
          </MetadataContainer>
        )}

        {lesson.metadata.tags.length > 0 && (
          <TagContainer>
            {lesson.metadata.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            ))}
            {lesson.metadata.tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{lesson.metadata.tags.length - 3} more
              </Typography>
            )}
          </TagContainer>
        )}

        {error && (
          <Typography 
            variant="caption" 
            color="error"
            sx={{ mt: 1, display: 'block' }}
          >
            Error: {error}
          </Typography>
        )}
      </StyledCardContent>

      <StyledCardActions>
        <Button
          size="small"
          startIcon={onPreview ? <PreviewIcon /> : undefined}
          onClick={handlePreview}
          disabled={isLoading || !onPreview}
        >
          Preview
        </Button>
        
        <Button
          variant="contained"
          size="small"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PlayIcon />
            )
          }
          onClick={handleStart}
          disabled={isLoading || !onStart}
        >
          {isLoading ? 'Loading...' : 'Start'}
        </Button>
      </StyledCardActions>
    </StyledCard>
  );
};

export default LessonCard;