/**
 * VocabularyHighlight - Highlight vocabulary words within text segments
 * Atomic component for highlighting and interacting with vocabulary words
 */

import React, { useState, useCallback, memo } from 'react';
import { Box, Typography, Popover, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { VocabularyEntryWithPinyin, DifficultyLevel } from '../../types';

export interface VocabularyHighlightProps {
  /** The vocabulary word to highlight */
  word: string;
  
  /** Vocabulary entry with detailed information */
  vocabularyEntry?: VocabularyEntryWithPinyin;
  
  /** Difficulty level for color coding */
  difficulty?: DifficultyLevel;
  
  /** Whether the highlight is active/selected */
  active?: boolean;
  
  /** Whether the vocabulary is clickable */
  clickable?: boolean;
  
  /** Callback when vocabulary word is clicked */
  onVocabularyClick?: (word: string, entry?: VocabularyEntryWithPinyin) => void;
  
  /** Display variant */
  variant?: 'underline' | 'background' | 'border';
  
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Show popover on hover */
  showPopover?: boolean;
}

const VocabularyHighlightComponent: React.FC<VocabularyHighlightProps> = ({
  word,
  vocabularyEntry,
  difficulty = 'beginner',
  active = false,
  clickable = true,
  onVocabularyClick,
  variant = 'underline',
  size = 'medium',
  showPopover = true
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (showPopover && vocabularyEntry) {
      setAnchorEl(event.currentTarget);
      setPopoverOpen(true);
    }
  }, [showPopover, vocabularyEntry]);

  const handleMouseLeave = useCallback(() => {
    if (showPopover) {
      setPopoverOpen(false);
      setAnchorEl(null);
    }
  }, [showPopover]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (clickable && onVocabularyClick) {
      onVocabularyClick(word, vocabularyEntry);
    }
  }, [clickable, onVocabularyClick, word, vocabularyEntry]);

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return theme.palette.success.main;
      case 'intermediate': return theme.palette.warning.main;
      case 'advanced': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return '0.875rem';
      case 'large': return '1.25rem';
      default: return '1rem';
    }
  };

  const getHighlightStyles = () => {
    const baseColor = getDifficultyColor();
    const activeColor = active ? baseColor : `${baseColor}80`; // 50% opacity when not active
    
    switch (variant) {
      case 'background':
        return {
          backgroundColor: `${activeColor}20`,
          color: theme.palette.text.primary,
          padding: theme.spacing(0.25, 0.5),
          borderRadius: 2,
        };
      case 'border':
        return {
          border: `2px solid ${activeColor}`,
          color: theme.palette.text.primary,
          padding: theme.spacing(0.25, 0.5),
          borderRadius: 2,
        };
      case 'underline':
      default:
        return {
          borderBottom: `2px solid ${activeColor}`,
          color: theme.palette.text.primary,
          paddingBottom: '1px',
        };
    }
  };

  return (
    <>
      <Typography
        component="span"
        sx={{
          ...getHighlightStyles(),
          fontSize: getFontSize(),
          cursor: clickable ? 'pointer' : 'default',
          fontWeight: active ? 'medium' : 'normal',
          transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': clickable ? {
            opacity: 0.8,
          } : {},
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={vocabularyEntry ? `Vocabulary: ${word} - ${vocabularyEntry.translation}` : `Vocabulary: ${word}`}
      >
        {word}
      </Typography>

      {/* Vocabulary Popover */}
      {showPopover && vocabularyEntry && (
        <Popover
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handleMouseLeave}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            pointerEvents: 'none', // Prevent popover from interfering with mouse events
          }}
          slotProps={{
            paper: {
              sx: {
                maxWidth: 300,
                pointerEvents: 'auto',
              }
            }
          }}
        >
          <Card elevation={3}>
            <CardContent sx={{ padding: theme.spacing(1.5) }}>
              <Box sx={{ marginBottom: theme.spacing(1) }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {word}
                </Typography>
                {vocabularyEntry.pinyin && (
                  <Typography variant="body2" color="text.secondary">
                    {vocabularyEntry.pinyin}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" sx={{ marginBottom: theme.spacing(0.5) }}>
                {vocabularyEntry.translation}
              </Typography>
              
              {vocabularyEntry.partOfSpeech && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {vocabularyEntry.partOfSpeech}
                </Typography>
              )}
              
              {vocabularyEntry.contextUsage && (
                <Box sx={{ marginTop: theme.spacing(1) }}>
                  <Typography variant="caption" color="text.secondary">
                    Usage: {vocabularyEntry.contextUsage}
                  </Typography>
                </Box>
              )}
              
              {vocabularyEntry.frequency !== undefined && (
                <Box sx={{ marginTop: theme.spacing(0.5) }}>
                  <Typography variant="caption" color="text.secondary">
                    Frequency: {vocabularyEntry.frequency}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Popover>
      )}
    </>
  );
};

// Memoized export for performance
export const VocabularyHighlight = memo(VocabularyHighlightComponent);
export default VocabularyHighlight;