/**
 * FlashcardPreview - Molecular component
 * Preview display for flashcard content with flip functionality
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  styled,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import { Card } from '../atoms';
import { pinyinService } from '../../services/pinyinService';
import type { Flashcard } from '../../types';

export interface FlashcardPreviewProps {
  /**
   * Flashcard data
   */
  flashcard: Flashcard;
  /**
   * Show back by default
   */
  showBack?: boolean;
  /**
   * Interactive mode
   */
  interactive?: boolean;
  /**
   * Bookmarked state
   */
  bookmarked?: boolean;
  /**
   * Card click handler
   */
  onClick?: (flashcard: Flashcard) => void;
  /**
   * Audio play handler
   */
  onPlayAudio?: (text: string) => void;
  /**
   * Bookmark toggle handler
   */
  onToggleBookmark?: (flashcard: Flashcard) => void;
  /**
   * Card size
   */
  size?: 'small' | 'medium' | 'large';
}

const FlashcardContainer = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: string }>(({ theme, size = 'medium' }) => {
  const sizeMap = {
    small: {
      minHeight: 120,
      padding: theme.spacing(1.5),
    },
    medium: {
      minHeight: 160,
      padding: theme.spacing(2),
    },
    large: {
      minHeight: 200,
      padding: theme.spacing(2.5),
    },
  };

  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...sizeMap[size as keyof typeof sizeMap],
  };
});

const CardContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  flex: 1,
});

const ChineseText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
  marginBottom: theme.spacing(1),
}));

const DefinitionText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
  marginTop: theme.spacing(1),
  textAlign: 'center',
  fontWeight: 500,
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
}));

const SideLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.disabled,
  fontWeight: 500,
  textTransform: 'uppercase',
}));

/**
 * FlashcardPreview component for displaying flashcard content
 */
export const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({
  flashcard,
  showBack: initialShowBack = false,
  interactive = true,
  bookmarked = false,
  onClick,
  onPlayAudio,
  onToggleBookmark,
  size = 'medium',
}) => {
  const [showBack, setShowBack] = useState(initialShowBack);
  const [generatedPinyin, setGeneratedPinyin] = useState<string | null>(null);

  // Generate pinyin if not provided in flashcard data
  React.useEffect(() => {
    const generatePinyinForFlashcard = async () => {
      if (!flashcard.back.pinyin && flashcard.front) {
        try {
          const pinyinResult = await pinyinService.generateToneMarks(flashcard.front);
          if (pinyinResult && pinyinResult.trim().length > 0) {
            setGeneratedPinyin(pinyinResult);
          }
        } catch (error) {
          console.warn('Failed to generate pinyin for flashcard:', error);
        }
      }
    };

    generatePinyinForFlashcard();
  }, [flashcard.front, flashcard.back.pinyin]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    // Don't flip if clicking on control buttons
    const target = event.target as HTMLElement;
    if (target.closest('[data-no-flip]')) {
      return;
    }
    
    // Flip the card
    setShowBack(!showBack);
    
    // Call onClick if provided
    if (interactive && onClick) {
      onClick(flashcard);
    }
  }, [interactive, onClick, flashcard, showBack]);

  const handlePlayAudio = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onPlayAudio) {
      const text = showBack && flashcard.back.pinyin 
        ? flashcard.back.pinyin 
        : flashcard.front;
      onPlayAudio(text);
    }
  }, [onPlayAudio, showBack, flashcard]);

  const handleToggleBookmark = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(flashcard);
    }
  }, [onToggleBookmark, flashcard]);

  return (
    <FlashcardContainer
      size={size}
      onClick={handleClick}
      hoverable={interactive}
      padding="none"
    >
      <CardContent>
        <SideLabel>
          {showBack ? 'Back' : 'Front'}
        </SideLabel>

        {!showBack ? (
          // Front side - Chinese text
          <ChineseText>
            {flashcard.front}
          </ChineseText>
        ) : (
          // Back side - Aligned pinyin over Chinese characters
          <>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* Pinyin row */}
              {(flashcard.back.pinyin || generatedPinyin) && (
                <Typography 
                  variant="body1"
                  color="primary.main"
                  sx={{ 
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    letterSpacing: '0.5em',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}
                >
                  {(flashcard.back.pinyin || generatedPinyin || '').split(' ').join('  ')}
                </Typography>
              )}
              
              {/* Chinese characters row */}
              <ChineseText>
                {flashcard.front}
              </ChineseText>
            </Box>
            
            {flashcard.back.definition && (
              <DefinitionText>
                {flashcard.back.definition}
              </DefinitionText>
            )}
          </>
        )}
      </CardContent>

      <ActionBar>
        <Box sx={{ display: 'flex', gap: 0.5, marginLeft: 'auto' }} data-no-flip>
          {(onPlayAudio && (flashcard.back.audioUrl || !showBack)) && (
            <Tooltip title="Play pronunciation">
              <IconButton
                size="small"
                onClick={handlePlayAudio}
                color="primary"
              >
                <VolumeUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onToggleBookmark && (
            <Tooltip title={bookmarked ? "Remove bookmark" : "Add bookmark"}>
              <IconButton
                size="small"
                onClick={handleToggleBookmark}
                color={bookmarked ? "primary" : "default"}
              >
                {bookmarked ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </ActionBar>
    </FlashcardContainer>
  );
};

export default FlashcardPreview;