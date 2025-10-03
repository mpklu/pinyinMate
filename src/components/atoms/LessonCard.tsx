/**
 * LessonCard Atomic Component
 * Displays lesson information in a card format with title, difficulty, progress, and metadata
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  MenuBook as BookIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import type { Lesson } from '../../types/lesson';

// Progress information interface
interface LessonProgress {
  completed: boolean;
  score: number;
  lastStudied: string;
}

// Component props interface
interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  onClick?: (lesson: Lesson) => void;
  disabled?: boolean;
}

// Difficulty color mapping
const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (difficulty) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'error';
    default:
      return 'default';
  }
};

// Progress status text
const getProgressStatus = (progress?: LessonProgress) => {
  if (!progress) return 'Not Started';
  if (progress.completed) return 'Completed';
  return 'In Progress';
};

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  progress,
  onClick,
  disabled = false
}) => {
  const handleClick = () => {
    if (onClick && !disabled) {
      onClick(lesson);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onClick && !disabled) {
      onClick(lesson);
    }
  };

  const progressStatus = getProgressStatus(progress);
  const isCompleted = progress?.completed ?? false;
  const vocabularyCount = lesson.metadata.vocabulary?.length ?? 0;

  return (
    <Card
      sx={{
        maxWidth: 345,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: !disabled ? 'translateY(-2px)' : 'none',
          boxShadow: !disabled ? 3 : 1
        },
        opacity: disabled ? 0.6 : 1,
        cursor: onClick && !disabled ? 'pointer' : 'default'
      }}
      className={isCompleted ? 'lesson-card-completed' : ''}
    >
      <CardActionArea
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={`Lesson: ${lesson.title}`}
        aria-disabled={disabled}
        tabIndex={onClick ? 0 : -1}

      >
        <CardContent>
          {/* Header with title and difficulty */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                flex: 1,
                mr: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {lesson.title}
            </Typography>
            <Chip
              label={lesson.metadata.difficulty}
              color={getDifficultyColor(lesson.metadata.difficulty)}
              size="small"
              sx={{ flexShrink: 0 }}
            />
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {lesson.description}
          </Typography>

          {/* Progress section */}
          {progress && (
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {progressStatus}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress.score}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress.score}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: isCompleted ? 'success.main' : 'primary.main'
                  }
                }}
              />
            </Box>
          )}

          {/* No progress case */}
          {!progress && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Not Started
              </Typography>
            </Box>
          )}

          {/* Metadata row */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {/* Vocabulary count */}
            <Box display="flex" alignItems="center" gap={0.5}>
              <BookIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {vocabularyCount} words
              </Typography>
            </Box>

            {/* Estimated time */}
            {Boolean(lesson.metadata.estimatedTime) && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {lesson.metadata.estimatedTime} min
                </Typography>
              </Box>
            )}

            {/* Category */}
            <Box display="flex" alignItems="center" gap={0.5}>
              <CategoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {lesson.metadata.category}
              </Typography>
            </Box>
          </Stack>

          {/* Screen reader description */}
          <Box component="span" sx={{ position: 'absolute', left: -9999 }}>
            {lesson.metadata.difficulty} level lesson with {vocabularyCount} words
            {progress ? `, ${progress.score}% complete` : ''}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};