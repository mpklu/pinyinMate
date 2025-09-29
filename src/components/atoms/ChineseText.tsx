/**
 * ChineseText component with tone coloring
 * Displays Chinese text with visual tone indicators
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography, type TypographyProps } from '@mui/material';

interface ChineseTextProps extends Omit<TypographyProps, 'children' | 'onClick'> {
  /** The Chinese text to display */
  text: string;
  /** Whether to show tone colors */
  showToneColors?: boolean;
  /** Size variant */
  variant?: 'body1' | 'body2' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'caption';
  /** Whether text is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive text */
  onClick?: (text: string) => void;
}

// Tone colors based on traditional Chinese tone color associations
const toneColors = {
  1: '#FF6B6B', // First tone - red (flat)
  2: '#4ECDC4', // Second tone - teal (rising)
  3: '#45B7D1', // Third tone - blue (dipping)
  4: '#96CEB4', // Fourth tone - green (falling)
  0: '#95A5A6', // Neutral tone - gray
};

const StyledChineseText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'interactive' && prop !== 'showToneColors',
})<{ interactive?: boolean; showToneColors?: boolean }>(({ theme, interactive, showToneColors }) => ({
  fontFamily: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: '0.02em',
  cursor: interactive ? 'pointer' : 'inherit',
  userSelect: interactive ? 'none' : 'inherit',
  transition: theme.transitions.create(['color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  
  ...(interactive && {
    '&:hover': {
      transform: 'scale(1.05)',
      color: theme.palette.primary.main,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  }),

  // Individual character styling when tone colors are enabled
  ...(showToneColors && {
    '& .tone-1': { color: toneColors[1] },
    '& .tone-2': { color: toneColors[2] },
    '& .tone-3': { color: toneColors[3] },
    '& .tone-4': { color: toneColors[4] },
    '& .tone-0': { color: toneColors[0] },
  }),
}));

/**
 * Simple tone detection based on pinyin patterns
 * This is a basic implementation - in a real app you'd get this from the segmentation service
 */
const detectTone = (char: string): number => {
  // This is a placeholder - real implementation would use the pinyin data
  // For now, return a random tone for demonstration
  const tones = [1, 2, 3, 4, 0];
  const charCode = char.charCodeAt(0);
  return tones[charCode % tones.length];
};

/**
 * Renders Chinese text with optional tone coloring
 */
const ChineseText: React.FC<ChineseTextProps> = ({
  text,
  showToneColors = false,
  variant = 'body1',
  interactive = false,
  onClick,
  ...typographyProps
}) => {
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(text);
    }
  };

  // If tone colors are enabled, wrap each character in a span with tone class
  const renderColoredText = () => {
    return text.split('').map((char, index) => {
      // Only apply tone colors to Chinese characters
      const isChinese = /[\u4e00-\u9fff]/.test(char);
      if (isChinese && showToneColors) {
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

  return (
    <StyledChineseText
      variant={variant}
      interactive={interactive}
      showToneColors={showToneColors}
      onClick={handleClick}
      {...typographyProps}
    >
      {showToneColors ? renderColoredText() : text}
    </StyledChineseText>
  );
};

export default ChineseText;
export type { ChineseTextProps };