/**
 * EnhancedLessonCard - Enhanced lesson card with preview functionality
 * Molecular component extending the basic LessonCard with preview modal and actions
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  MenuBook as BookIcon,
  Category as CategoryIcon,
  PlayArrow as PlayIcon,
  Visibility as PreviewIcon,
  MoreVert as MoreIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon
} from '@mui/icons-material';

import type { Lesson, EnhancedLesson } from '../../types/lesson';

// Progress information interface
interface LessonProgress {
  completed: boolean;
  score: number;
  lastStudied: string;
}

// Enhanced component props interface
export interface EnhancedLessonCardProps {
  lesson: Lesson | EnhancedLesson;
  progress?: LessonProgress;
  
  /** Whether the lesson is bookmarked */
  bookmarked?: boolean;
  
  /** Card display variant */
  variant?: 'standard' | 'compact' | 'detailed';
  
  /** Whether to show action buttons */
  showActions?: boolean;
  
  /** Whether to enable preview functionality */
  enablePreview?: boolean;
  
  /** Whether the card is disabled */
  disabled?: boolean;
  
  /** Callback when lesson is clicked to start */
  onStartLesson?: (lesson: Lesson | EnhancedLesson) => void;
  
  /** Callback when preview is requested */
  onPreviewLesson?: (lesson: Lesson | EnhancedLesson) => void;
  
  /** Callback when bookmark is toggled */
  onToggleBookmark?: (lesson: Lesson | EnhancedLesson, bookmarked: boolean) => void;
  
  /** Callback when share is requested */
  onShareLesson?: (lesson: Lesson | EnhancedLesson) => void;
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

export const EnhancedLessonCard: React.FC<EnhancedLessonCardProps> = ({
  lesson,
  progress,
  bookmarked = false,
  variant = 'standard',
  showActions = true,
  enablePreview = true,
  disabled = false,
  onStartLesson,
  onPreviewLesson,
  onToggleBookmark,
  onShareLesson
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleStartLesson = useCallback(() => {
    if (onStartLesson && !disabled) {
      onStartLesson(lesson);
    }
  }, [onStartLesson, lesson, disabled]);

  const handlePreview = useCallback(() => {
    if (enablePreview) {
      if (onPreviewLesson) {
        onPreviewLesson(lesson);
      } else {
        setPreviewOpen(true);
      }
    }
  }, [enablePreview, onPreviewLesson, lesson]);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const handleToggleBookmark = useCallback(() => {
    if (onToggleBookmark) {
      onToggleBookmark(lesson, !bookmarked);
    }
  }, [onToggleBookmark, lesson, bookmarked]);

  const handleShareLesson = useCallback(() => {
    if (onShareLesson) {
      onShareLesson(lesson);
    }
    setMenuAnchorEl(null);
  }, [onShareLesson, lesson]);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const progressStatus = getProgressStatus(progress);
  const isCompleted = progress?.completed ?? false;
  const vocabularyCount = lesson.metadata.vocabulary?.length ?? 0;
  const isEnhanced = 'processedContent' in lesson;

  const renderPreviewDialog = () => (
    <Dialog
      open={previewOpen}
      onClose={handleClosePreview}
      maxWidth="md"
      fullWidth
      slots={{ transition: Fade }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{lesson.title}</Typography>
          <Chip
            label={lesson.metadata.difficulty}
            color={getDifficultyColor(lesson.metadata.difficulty)}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {/* Lesson Description */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {lesson.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={<BookIcon />}
              label={`${vocabularyCount} vocabulary words`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<TimeIcon />}
              label={`${lesson.metadata.estimatedTime || 'N/A'} minutes`}
              variant="outlined"
              size="small"
            />
            {isEnhanced && (
              <Chip
                label="Enhanced Content"
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Full Lesson Content - Scrollable */}
        <Box 
          sx={{ 
            maxHeight: 400,
            overflow: 'auto',
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          <Typography
            variant="body1"
            sx={{
              p: 3,
              fontFamily: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              color: 'text.primary'
            }}
          >
            {lesson.content}
          </Typography>
        </Box>

        {/* Vocabulary Section in Preview */}
        {vocabularyCount > 0 && (
          <Box sx={{ p: 3, pt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Key Vocabulary
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {lesson.metadata.vocabulary.slice(0, 8).map((vocab, index) => (
                <Box
                  key={`preview-vocab-${vocab.word}-${index}`}
                  sx={{
                    p: 1,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    minWidth: 80
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {vocab.word}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {vocab.translation}
                  </Typography>
                </Box>
              ))}
              {vocabularyCount > 8 && (
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    +{vocabularyCount - 8} more...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClosePreview}>Close</Button>
        <Button
          variant="contained"
          onClick={() => {
            handleClosePreview();
            handleStartLesson();
          }}
          startIcon={<PlayIcon />}
        >
          Start Lesson
        </Button>
      </DialogActions>
    </Dialog>
  );

  const cardContent = (
    <CardContent sx={{ pb: showActions ? 1 : 2 }}>
      {/* Header with title and difficulty */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Typography
          variant={variant === 'compact' ? 'subtitle1' : 'h6'}
          component="h3"
          sx={{
            fontWeight: 600,
            flex: 1,
            mr: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'compact' ? 1 : 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {lesson.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={lesson.metadata.difficulty}
            color={getDifficultyColor(lesson.metadata.difficulty)}
            size="small"
            sx={{ flexShrink: 0 }}
          />
          {isEnhanced && (
            <Chip
              label="Enhanced"
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Description - hide in compact variant */}
      {variant !== 'compact' && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'detailed' ? 3 : 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {lesson.description}
        </Typography>
      )}

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

      {/* Metadata row */}
      <Stack
        direction="row"
        spacing={variant === 'compact' ? 1 : 2}
        alignItems="center"
        flexWrap="wrap"
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <BookIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {vocabularyCount} words
          </Typography>
        </Box>

        {Boolean(lesson.metadata.estimatedTime) && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {lesson.metadata.estimatedTime} min
            </Typography>
          </Box>
        )}

        {variant === 'detailed' && lesson.metadata.tags && lesson.metadata.tags.length > 0 && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <CategoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {lesson.metadata.tags[0]}
            </Typography>
          </Box>
        )}
      </Stack>
    </CardContent>
  );

  return (
    <>
      <Card
        sx={{
          maxWidth: variant === 'compact' ? 280 : 345,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: !disabled ? 'translateY(-2px)' : 'none',
            boxShadow: !disabled ? 3 : 1
          },
          opacity: disabled ? 0.6 : 1,
          position: 'relative'
        }}
        className={isCompleted ? 'lesson-card-completed' : ''}
      >
        {/* Bookmark indicator */}
        {bookmarked && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <BookmarkIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>
        )}

        <CardActionArea
          onClick={handleStartLesson}
          disabled={disabled}
          aria-label={`Start lesson: ${lesson.title}`}
        >
          {cardContent}
        </CardActionArea>

        {/* Action buttons */}
        {showActions && (
          <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
            <Box>
              {enablePreview && (
                <Tooltip title="Preview lesson">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview();
                    }}
                    disabled={disabled}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBookmark();
                  }}
                  disabled={disabled}
                >
                  {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Box>
              <Button
                size="small"
                startIcon={<PlayIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartLesson();
                }}
                disabled={disabled}
              >
                {progress?.completed ? 'Review' : 'Start'}
              </Button>
              
              <IconButton
                size="small"
                onClick={handleMenuClick}
                disabled={disabled}
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </CardActions>
        )}
      </Card>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleShareLesson}>
          <ShareIcon sx={{ mr: 1 }} />
          Share Lesson
        </MenuItem>
      </Menu>

      {/* Preview dialog */}
      {renderPreviewDialog()}
    </>
  );
};

export default EnhancedLessonCard;