/**
 * ReadingSegment - Molecule Component
 * Interactive text segment for reader mode with pinyin, audio, and vocabulary
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  type Theme,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  VolumeUp as AudioIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { 
  ReadingSegmentProps,
  ReaderTheme
} from '../../types/reader';

// Theme-specific styling
const getThemeStyles = (theme: ReaderTheme, muiTheme: Theme) => {
  switch (theme) {
    case 'dark':
      return {
        backgroundColor: '#1a1a1a',
        color: '#e0e0e0',
        borderColor: '#333333',
        hoverBgColor: '#2d2d2d',
        pinyinColor: '#90caf9',
      };
    case 'sepia':
      return {
        backgroundColor: '#f7f3e9',
        color: '#5d4037',
        borderColor: '#d7cc9a',
        hoverBgColor: '#f0ead2',
        pinyinColor: '#8d6e63',
      };
    case 'highContrast':
      return {
        backgroundColor: '#ffffff',
        color: '#000000',
        borderColor: '#000000',
        hoverBgColor: '#f5f5f5',
        pinyinColor: '#1976d2',
      };
    default: // 'default'
      return {
        backgroundColor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        borderColor: muiTheme.palette.divider,
        hoverBgColor: alpha(muiTheme.palette.primary.main, 0.04),
        pinyinColor: muiTheme.palette.primary.main,
      };
  }
};

// Tone colors for Chinese characters (consistent with existing ChineseText component)
const toneColors = {
  1: '#FF6B6B', // First tone - red (flat)
  2: '#4ECDC4', // Second tone - teal (rising)
  3: '#45B7D1', // Third tone - blue (dipping)
  4: '#96CEB4', // Fourth tone - green (falling)
  0: '#95A5A6', // Neutral tone - gray
};

interface StyledSegmentProps {
  readerTheme: ReaderTheme;
  isActive: boolean;
  isPlaying: boolean;
  fontSize: number;
  lineHeight: number;
}

const StyledSegment = styled(Box, {
  shouldForwardProp: (prop) => 
    !['readerTheme', 'isActive', 'isPlaying', 'fontSize', 'lineHeight'].includes(prop as string),
})<StyledSegmentProps>(({ theme, readerTheme, isActive, isPlaying, fontSize, lineHeight }) => {
  const themeStyles = getThemeStyles(readerTheme, theme);
  
  return {
    padding: theme.spacing(2, 3),
    margin: theme.spacing(1, 0),
    borderRadius: theme.spacing(1),
    border: `2px solid ${isActive ? theme.palette.primary.main : 'transparent'}`,
    backgroundColor: isActive 
      ? alpha(theme.palette.primary.main, 0.08)
      : themeStyles.backgroundColor,
    color: themeStyles.color,
    cursor: 'pointer',
    transition: theme.transitions.create(['all'], {
      duration: theme.transitions.duration.short,
    }),
    position: 'relative',
    
    '&:hover': {
      backgroundColor: isActive 
        ? alpha(theme.palette.primary.main, 0.12)
        : themeStyles.hoverBgColor,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[2],
    },

    // Active reading indicator
    ...(isActive && {
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: theme.palette.primary.main,
        borderRadius: '0 4px 4px 0',
      },
    }),

    // Playing animation
    ...(isPlaying && {
      animation: 'pulse 1.5s ease-in-out infinite',
      '@keyframes pulse': {
        '0%': {
          boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.7)}`,
        },
        '70%': {
          boxShadow: `0 0 0 10px ${alpha(theme.palette.secondary.main, 0)}`,
        },
        '100%': {
          boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0)}`,
        },
      },
    }),

    // Responsive font sizing
    fontSize: `${fontSize}rem`,
    lineHeight: lineHeight,
  };
});

const ChineseText = styled(Typography, {
  shouldForwardProp: (prop) => 
    !['showToneColors', 'readerTheme'].includes(prop as string),
})<{ showToneColors: boolean; readerTheme: ReaderTheme }>(({ 
  theme, 
  showToneColors, 
  readerTheme 
}) => {
  const themeStyles = getThemeStyles(readerTheme, theme);
  
  return {
    fontFamily: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
    color: themeStyles.color,
    
    // Tone color styling when enabled
    ...(showToneColors && {
      '& .tone-1': { color: toneColors[1] },
      '& .tone-2': { color: toneColors[2] },
      '& .tone-3': { color: toneColors[3] },
      '& .tone-4': { color: toneColors[4] },
      '& .tone-0': { color: toneColors[0] },
    }),
  };
});

const PinyinText = styled(Typography, {
  shouldForwardProp: (prop) => 
    !['readerTheme'].includes(prop as string),
})<{ readerTheme: ReaderTheme }>(({ theme, readerTheme }) => {
  const themeStyles = getThemeStyles(readerTheme, theme);
  
  return {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '0.9em',
    fontStyle: 'italic',
    color: themeStyles.pinyinColor,
    marginBottom: theme.spacing(1),
    letterSpacing: '0.02em',
  };
});

const AudioControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: theme.spacing(1),
}));

const VocabularyWord = styled('span')<{ onClick?: () => void }>(({ theme, onClick }) => ({
  position: 'relative',
  cursor: onClick ? 'pointer' : 'inherit',
  borderBottom: onClick ? `1px dotted ${theme.palette.primary.main}` : 'none',
  
  '&:hover': onClick ? {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderRadius: 2,
  } : {},
}));

// Simple tone detection (placeholder - would use actual pinyin data in real implementation)
const detectTone = (char: string): number => {
  const charCode = char.charCodeAt(0);
  return [1, 2, 3, 4, 0][charCode % 5];
};

// Render Chinese text with tone colors
const renderChineseText = (text: string, showToneColors: boolean): React.ReactNode => {
  if (!showToneColors) {
    return text;
  }

  return text.split('').map((char, index) => {
    const isChinese = /[\u4e00-\u9fff]/.test(char);
    if (isChinese) {
      const tone = detectTone(char);
      return (
        <span key={`${char}-${index}`} className={`tone-${tone}`}>
          {char}
        </span>
      );
    }
    return <span key={`${char}-${index}`}>{char}</span>;
  });
};

// Render text with vocabulary highlighting
const renderTextWithVocabulary = (
  segment: ReadingSegmentProps['segment'],
  showToneColors: boolean,
  onVocabularyClick?: ReadingSegmentProps['onVocabularyClick']
): React.ReactNode => {
  if (!segment.vocabularyReferences || segment.vocabularyReferences.length === 0) {
    return renderChineseText(segment.text, showToneColors);
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort vocabulary references by start index
  const sortedRefs = [...segment.vocabularyReferences].sort((a, b) => a.startIndex - b.startIndex);

  sortedRefs.forEach((vocab) => {
    // Add text before vocabulary word
    if (vocab.startIndex > lastIndex) {
      const beforeText = segment.text.slice(lastIndex, vocab.startIndex);
      elements.push(
        <span key={`before-${vocab.startIndex}-${vocab.endIndex}`}>
          {renderChineseText(beforeText, showToneColors)}
        </span>
      );
    }

    // Add vocabulary word with highlighting
    const vocabText = segment.text.slice(vocab.startIndex, vocab.endIndex);
    elements.push(
      <VocabularyWord
        key={`vocab-${vocab.word}-${vocab.startIndex}`}
        onClick={onVocabularyClick ? () => onVocabularyClick(vocab.word, vocab.definition) : undefined}
      >
        {renderChineseText(vocabText, showToneColors)}
      </VocabularyWord>
    );

    lastIndex = vocab.endIndex;
  });

  // Add remaining text after last vocabulary word
  if (lastIndex < segment.text.length) {
    const remainingText = segment.text.slice(lastIndex);
    elements.push(
      <span key="remaining">
        {renderChineseText(remainingText, showToneColors)}
      </span>
    );
  }

  return elements;
};

export const ReadingSegment: React.FC<ReadingSegmentProps> = ({
  segment,
  theme,
  pinyinMode,
  showToneColors,
  fontSize,
  lineHeight,
  isActive = false,
  isPlaying = false,
  onClick,
  onPlayAudio,
  onVocabularyClick,
}) => {
  const handleSegmentClick = () => {
    if (onClick) {
      onClick(segment.id);
    }
  };

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayAudio) {
      onPlayAudio(segment.id, segment.text);
    }
  };

  // Determine pinyin to display
  const displayPinyin = (() => {
    switch (pinyinMode) {
      case 'toneMarks':
        return segment.pinyin;
      case 'numbers':
        return segment.pinyinNumbers;
      default:
        return null;
    }
  })();

  return (
    <StyledSegment
      readerTheme={theme}
      isActive={isActive}
      isPlaying={isPlaying}
      fontSize={fontSize}
      lineHeight={lineHeight}
      onClick={handleSegmentClick}
    >
      {/* Pinyin display */}
      {displayPinyin && pinyinMode !== 'hidden' && (
        <PinyinText variant="body2" readerTheme={theme}>
          {displayPinyin}
        </PinyinText>
      )}

      {/* Chinese text with vocabulary highlighting */}
      <ChineseText
        variant="h6"
        showToneColors={showToneColors}
        readerTheme={theme}
      >
        {renderTextWithVocabulary(segment, showToneColors, onVocabularyClick)}
      </ChineseText>

      {/* Audio controls */}
      <AudioControls>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {segment.hasAudio && (
            <Tooltip title="Play pronunciation">
              <IconButton
                size="small"
                onClick={handleAudioClick}
                color={isPlaying ? "secondary" : "primary"}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                {isPlaying ? <AudioIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            {isPlaying ? 'Playing...' : 'Click to hear'}
          </Typography>
        </Box>

        {/* Segment position indicator */}
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
          {segment.position.start}-{segment.position.end}
        </Typography>
      </AudioControls>
    </StyledSegment>
  );
};

export default ReadingSegment;