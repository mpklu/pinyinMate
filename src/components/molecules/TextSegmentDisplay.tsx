/**
 * TextSegmentDisplay - Interactive text segment with vocabulary highlighting
 * Molecular component combining text display, vocabulary highlighting, and audio controls
 */

import React, { useCallback, memo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AudioSegmentButton, VocabularyHighlight } from '../atoms';
import type { 
  TextSegmentWithAudio, 
  VocabularyEntryWithPinyin, 
  VocabularyReference 
} from '../../types';

export interface TextSegmentDisplayProps {
  /** The text segment to display */
  segment: TextSegmentWithAudio;
  
  /** Vocabulary entries for highlighting */
  vocabularyMap?: Map<string, VocabularyEntryWithPinyin>;
  
  /** Whether the segment is currently selected */
  selected?: boolean;
  
  /** Whether to show pinyin */
  showPinyin?: boolean;
  
  /** Whether to enable vocabulary highlighting */
  enableVocabularyHighlight?: boolean;
  
  /** Whether to show audio controls */
  showAudioControls?: boolean;
  
  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** Callback when segment is clicked */
  onSegmentClick?: (segmentId: string) => void;
  
  /** Callback when audio is requested */
  onPlayAudio?: (segmentId: string) => void;
  
  /** Callback when vocabulary is clicked */
  onVocabularyClick?: (word: string, entry?: VocabularyEntryWithPinyin) => void;
}

const TextSegmentDisplayComponent: React.FC<TextSegmentDisplayProps> = ({
  segment,
  vocabularyMap,
  selected = false,
  showPinyin = true,
  enableVocabularyHighlight = true,
  showAudioControls = true,
  variant = 'default',
  onSegmentClick,
  onPlayAudio,
  onVocabularyClick
}) => {
  const theme = useTheme();


  const handleVocabularyClick = useCallback((word: string, entry?: VocabularyEntryWithPinyin) => {
    if (onVocabularyClick) {
      onVocabularyClick(word, entry);
    }
  }, [onVocabularyClick]);

  const getVocabularySize = () => {
    if (variant === 'compact') return 'small';
    if (variant === 'detailed') return 'large';
    return 'medium';
  };

  const renderTextWithVocabulary = () => {
    if (!enableVocabularyHighlight || !segment.vocabularyWords || segment.vocabularyWords.length === 0) {
      // No vocabulary highlighting, render plain text
      return (
        <Typography
          variant={variant === 'compact' ? 'body2' : 'body1'}
          component="span"
          sx={{ 
            fontSize: variant === 'detailed' ? '1.125rem' : undefined,
            lineHeight: 1.6,
          }}
        >
          {segment.text}
        </Typography>
      );
    }

    // Sort vocabulary references by start index to process in order
    const sortedVocab = [...segment.vocabularyWords].sort((a, b) => a.startIndex - b.startIndex);
    const textParts = [];
    let lastIndex = 0;

    sortedVocab.forEach((vocabRef: VocabularyReference) => {
      // Add text before this vocabulary word
      if (vocabRef.startIndex > lastIndex) {
        const beforeText = segment.text.slice(lastIndex, vocabRef.startIndex);
        textParts.push(
          <Typography
            key={`text-${lastIndex}`}
            variant={variant === 'compact' ? 'body2' : 'body1'}
            component="span"
            sx={{ 
              fontSize: variant === 'detailed' ? '1.125rem' : undefined,
              lineHeight: 1.6,
            }}
          >
            {beforeText}
          </Typography>
        );
      }

      // Add vocabulary word with highlighting
      const vocabularyEntry = vocabularyMap?.get(vocabRef.word);
      textParts.push(
        <VocabularyHighlight
          key={`vocab-${vocabRef.startIndex}`}
          word={vocabRef.word}
          vocabularyEntry={vocabularyEntry}
          difficulty={vocabRef.difficulty}
          active={selected}
          onVocabularyClick={handleVocabularyClick}
          variant="underline"
          size={getVocabularySize()}
        />
      );

      lastIndex = vocabRef.endIndex;
    });

    // Add remaining text after last vocabulary word
    if (lastIndex < segment.text.length) {
      const remainingText = segment.text.slice(lastIndex);
      textParts.push(
        <Typography
          key={`text-${lastIndex}`}
          variant={variant === 'compact' ? 'body2' : 'body1'}
          component="span"
          sx={{ 
            fontSize: variant === 'detailed' ? '1.125rem' : undefined,
            lineHeight: 1.6,
          }}
        >
          {remainingText}
        </Typography>
      );
    }

    return <>{textParts}</>;
  };

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          padding: theme.spacing(0.5),
          borderRadius: 1,
          backgroundColor: selected ? theme.palette.primary.light : 'transparent',
          cursor: segment.clickable ? 'pointer' : 'default',
        }}
        onClick={() => segment.clickable && onSegmentClick?.(segment.id)}
      >
        <Box>
          {renderTextWithVocabulary()}
          {showPinyin && segment.pinyin && (
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                marginTop: 0.25,
              }}
            >
              {segment.pinyin}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={selected ? 3 : 1}
      sx={{
        padding: theme.spacing(variant === 'detailed' ? 2 : 1.5),
        marginBottom: theme.spacing(1),
        backgroundColor: selected ? theme.palette.primary.light : theme.palette.background.paper,
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
        transition: theme.transitions.create(['elevation', 'border-color', 'background-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          elevation: 2,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      {/* Main Content */}
      <Box sx={{ marginBottom: showPinyin && segment.pinyin ? theme.spacing(1) : 0 }}>
        <Box
          sx={{
            cursor: segment.clickable ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
          onClick={() => segment.clickable && onSegmentClick?.(segment.id)}
        >
          {renderTextWithVocabulary()}
          {showAudioControls && segment.audioReady && (
            <AudioSegmentButton
              segmentId={segment.id}
              text={segment.text}
              pinyin={segment.pinyin}
              audioReady={segment.audioReady}
              selected={selected}
              clickable={false} // Prevent double click handling
              onPlayAudio={onPlayAudio}
              size={variant === 'detailed' ? 'large' : 'medium'}
            />
          )}
        </Box>
      </Box>

      {/* Pinyin Display */}
      {showPinyin && segment.pinyin && (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            marginTop: theme.spacing(0.5),
            fontSize: variant === 'detailed' ? '0.9rem' : '0.8rem',
          }}
        >
          {segment.pinyin}
        </Typography>
      )}

      {/* Segment Metadata (for detailed variant) */}
      {variant === 'detailed' && (
        <Box sx={{ marginTop: theme.spacing(1), display: 'flex', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Type: {segment.segmentType}
          </Typography>
          {segment.vocabularyWords && segment.vocabularyWords.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Vocabulary: {segment.vocabularyWords.length} words
            </Typography>
          )}
          {segment.audioReady && (
            <Typography variant="caption" color="success.main">
              Audio Ready
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

// Memoized export for performance
export const TextSegmentDisplay = memo(TextSegmentDisplayComponent);
export default TextSegmentDisplay;