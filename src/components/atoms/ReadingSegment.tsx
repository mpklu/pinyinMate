/**
 * ReadingSegment - Atom Component
 * Individual text segment for reader mode with pinyin, tone colors, and interactions
 */

import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ReadingSegmentProps, ReaderTheme } from '../../types/reader';

// Theme configurations
const getThemeStyles = (theme: ReaderTheme) => {
  switch (theme) {
    case 'dark':
      return {
        backgroundColor: '#1a1a1a',
        color: '#e0e0e0',
        activeBackground: '#4a90e2',
        playingBackground: '#e24a4a',
        border: '#ffffff',
      };
    case 'sepia':
      return {
        backgroundColor: '#f4f1e8',
        color: '#5c4b37',
        activeBackground: '#d4a574',
        playingBackground: '#c4956b',
        border: '#8b4513',
      };
    case 'highContrast':
      return {
        backgroundColor: '#ffffff',
        color: '#000000',
        activeBackground: '#ffff00',
        playingBackground: '#ff00ff',
        border: '#000000',
      };
    case 'default':
    default:
      return {
        backgroundColor: '#ffffff',
        color: '#333333',
        activeBackground: '#2196f3',
        playingBackground: '#ff5722',
        border: '#1976d2',
      };
  }
};

// Tone color mappings (matching existing system)
const getToneColor = (toneNumber: number) => {
  switch (toneNumber) {
    case 1: return '#FF6B6B'; // First tone - red
    case 2: return '#4ECDC4'; // Second tone - cyan  
    case 3: return '#45B7D1'; // Third tone - blue
    case 4: return '#96CEB4'; // Fourth tone - green
    default: return '#666666'; // Neutral tone - gray
  }
};

const SegmentButton = styled('button', {
  shouldForwardProp: (prop) => !['themeStyles', 'isActive', 'isPlaying'].includes(prop as string),
})<{
  themeStyles: ReturnType<typeof getThemeStyles>;
  isActive?: boolean;
  isPlaying?: boolean;
}>(({ theme, themeStyles, isActive, isPlaying }) => ({
  display: 'inline-block',
  margin: theme.spacing(0.25),
  padding: theme.spacing(0.25, 0.5),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: (() => {
    if (isActive) return themeStyles.activeBackground;
    if (isPlaying) return themeStyles.playingBackground;
    return 'transparent';
  })(),
  border: `2px solid ${isActive || isPlaying ? themeStyles.border : 'transparent'}`,
  fontFamily: 'inherit',


  fontWeight: isActive || isPlaying ? 'bold' : 'normal',
  color: isActive || isPlaying ? '#ffffff' : 'inherit',
  '&:hover': {
    backgroundColor: themeStyles.activeBackground,
    transform: 'scale(1.02)',
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
}));

const PinyinText = styled(Typography, {
  shouldForwardProp: (prop) => !['showToneColors', 'toneNumber'].includes(prop as string),
})<{
  showToneColors: boolean;
  toneNumber?: number;
}>(({ theme, showToneColors, toneNumber }) => ({
  fontSize: '0.75em',
  lineHeight: 1.2,
  textAlign: 'center',
  marginBottom: theme.spacing(0.25),
  color: showToneColors && toneNumber ? getToneColor(toneNumber) : 'inherit',
  opacity: 0.8,
  fontWeight: 500,
}));

const ChineseText = styled(Typography, {
  shouldForwardProp: (prop) => !['showToneColors', 'toneNumber'].includes(prop as string),
})<{
  showToneColors: boolean;
  toneNumber?: number;
}>(({ showToneColors, toneNumber }) => ({
  fontFamily: '"Noto Sans SC", "Inter", sans-serif',
  fontWeight: 400,
  color: showToneColors && toneNumber ? getToneColor(toneNumber) : 'inherit',
}));

// Extract tone number from pinyin with tone marks
const extractToneNumber = (pinyinWithMarks: string): number => {
  // Simple tone detection - could be enhanced with more sophisticated logic
  if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(pinyinWithMarks)) {
    if (/[āēīōūǖ]/.test(pinyinWithMarks)) return 1;
    if (/[áéíóúǘ]/.test(pinyinWithMarks)) return 2;
    if (/[ǎěǐǒǔǚ]/.test(pinyinWithMarks)) return 3;
    if (/[àèìòùǜ]/.test(pinyinWithMarks)) return 4;
  }
  return 0; // Neutral tone or no tone detected
};

// Convert pinyin with tone marks to tone numbers
const convertToToneNumbers = (pinyinWithMarks: string): string => {
  if (!pinyinWithMarks) return '';
  
  const toneMap: { [key: string]: string } = {
    'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4',
    'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4',
    'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4',
    'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4',
    'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4',
    'ǖ': 'ü1', 'ǘ': 'ü2', 'ǚ': 'ü3', 'ǜ': 'ü4',
  };
  
  return pinyinWithMarks.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => toneMap[match] || match);
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
  // onVocabularyClick - reserved for future use
}) => {
  const themeStyles = getThemeStyles(theme);
  
  // Process pinyin display
  const { displayPinyin, toneNumber } = useMemo(() => {
    if (pinyinMode === 'hidden' || !segment.pinyin) {
      return { displayPinyin: null, toneNumber: 0 };
    }
    
    const pinyin = pinyinMode === 'toneMarks' 
      ? segment.pinyin 
      : segment.pinyinNumbers || convertToToneNumbers(segment.pinyin);
      
    const tone = pinyinMode === 'toneMarks' 
      ? extractToneNumber(segment.pinyin) 
      : parseInt(pinyin.slice(-1)) || 0;
    
    return { displayPinyin: pinyin, toneNumber: tone };
  }, [segment.pinyin, segment.pinyinNumbers, pinyinMode]);

  const handleClick = () => {
    if (onClick) {
      onClick(segment.id);
    }
    // Play audio on single click
    if (onPlayAudio && segment.hasAudio) {
      onPlayAudio(segment.id, segment.text);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <SegmentButton
      themeStyles={themeStyles}
      isActive={isActive}
      isPlaying={isPlaying}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={displayPinyin ? `Chinese text: ${segment.text}, Pinyin: ${displayPinyin}` : `Chinese text: ${segment.text}`}
      style={{
        backgroundColor: themeStyles.backgroundColor,
        color: themeStyles.color,
      }}
    >
      {/* Pinyin display */}
      {displayPinyin && (
        <PinyinText
          variant="caption"
          showToneColors={showToneColors}
          toneNumber={toneNumber}
          sx={{ fontSize: `${fontSize * 0.75}em` }}
        >
          {displayPinyin}
        </PinyinText>
      )}
      
      {/* Chinese text */}
            <ChineseText
        variant="body1"
        showToneColors={showToneColors}
        toneNumber={toneNumber}
        sx={{ 
          fontSize: `${fontSize}em`,
          lineHeight: lineHeight,
        }}
      >
        {segment.text}
      </ChineseText>
    </SegmentButton>
  );
};

export default ReadingSegment;