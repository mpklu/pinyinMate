/**
 * PinyinText component with toggle visibility
 * Displays pinyin romanization with optional visibility controls
 */

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, IconButton, Box, Fade } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface PinyinTextProps {
  /** The pinyin text to display */
  pinyin: string;
  /** Whether to show tone marks (mā) or numbers (ma1) */
  showToneMarks?: boolean;
  /** Initial visibility state */
  initiallyVisible?: boolean;
  /** Whether to show the visibility toggle button */
  showToggle?: boolean;
  /** Size of the text */
  size?: 'small' | 'medium' | 'large';
  /** Alignment of the text */
  align?: 'left' | 'center' | 'right';
  /** Custom color for the pinyin text */
  color?: 'primary' | 'secondary' | 'text' | 'inherit';
  /** Click handler */
  onClick?: () => void;
}

const StyledPinyinContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  verticalAlign: 'top',
}));

const StyledPinyinText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'pinyinSize',
})<{ pinyinSize?: 'small' | 'medium' | 'large' }>(({ theme, pinyinSize = 'medium' }) => {
  const sizeMap = {
    small: theme.typography.caption,
    medium: theme.typography.body2,
    large: theme.typography.body1,
  };

  return {
    ...sizeMap[pinyinSize],
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontStyle: 'italic',
    letterSpacing: '0.03em',
    cursor: 'pointer',
    userSelect: 'text',
    transition: theme.transitions.create(['color', 'opacity'], {
      duration: theme.transitions.duration.shorter,
    }),
    
    '&:hover': {
      opacity: 0.8,
    },
  };
});

const StyledToggleButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.25),
  marginLeft: theme.spacing(0.25),
  opacity: 0.6,
  transition: theme.transitions.create(['opacity'], {
    duration: theme.transitions.duration.shorter,
  }),
  
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.action.hover,
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

/**
 * Converts tone numbers to tone marks
 */
const convertToToneMarks = (pinyin: string): string => {
  // This is a simplified implementation
  // In a real app, you'd use a proper pinyin conversion library
  const toneMap: Record<string, Record<string, string>> = {
    'a': { '1': 'ā', '2': 'á', '3': 'ǎ', '4': 'à' },
    'e': { '1': 'ē', '2': 'é', '3': 'ě', '4': 'è' },
    'i': { '1': 'ī', '2': 'í', '3': 'ǐ', '4': 'ì' },
    'o': { '1': 'ō', '2': 'ó', '3': 'ǒ', '4': 'ò' },
    'u': { '1': 'ū', '2': 'ú', '3': 'ǔ', '4': 'ù' },
    'ü': { '1': 'ǖ', '2': 'ǘ', '3': 'ǚ', '4': 'ǜ' },
  };

  return pinyin.replace(/([aeiouü])([1-4])/gi, (match, vowel, tone) => {
    const lowerVowel = vowel.toLowerCase();
    const toneChar = toneMap[lowerVowel]?.[tone];
    if (toneChar) {
      return vowel === lowerVowel 
        ? toneChar
        : toneChar.toUpperCase();
    }
    return match;
  });
};

/**
 * Converts tone marks to tone numbers
 */
const convertToToneNumbers = (pinyin: string): string => {
  const toneMarkMap: Record<string, string> = {
    // First tone
    'ā': 'a1', 'ē': 'e1', 'ī': 'i1', 'ō': 'o1', 'ū': 'u1', 'ǖ': 'ü1',
    'Ā': 'A1', 'Ē': 'E1', 'Ī': 'I1', 'Ō': 'O1', 'Ū': 'U1', 'Ǖ': 'Ü1',
    // Second tone
    'á': 'a2', 'é': 'e2', 'í': 'i2', 'ó': 'o2', 'ú': 'u2', 'ǘ': 'ü2',
    'Á': 'A2', 'É': 'E2', 'Í': 'I2', 'Ó': 'O2', 'Ú': 'U2', 'Ǘ': 'Ü2',
    // Third tone
    'ǎ': 'a3', 'ě': 'e3', 'ǐ': 'i3', 'ǒ': 'o3', 'ǔ': 'u3', 'ǚ': 'ü3',
    'Ǎ': 'A3', 'Ě': 'E3', 'Ǐ': 'I3', 'Ǒ': 'O3', 'Ǔ': 'U3', 'Ǚ': 'Ü3',
    // Fourth tone
    'à': 'a4', 'è': 'e4', 'ì': 'i4', 'ò': 'o4', 'ù': 'u4', 'ǜ': 'ü4',
    'À': 'A4', 'È': 'E4', 'Ì': 'I4', 'Ò': 'O4', 'Ù': 'U4', 'Ǜ': 'Ü4',
  };

  let result = pinyin;
  Object.entries(toneMarkMap).forEach(([mark, number]) => {
    result = result.replace(new RegExp(mark, 'g'), number);
  });
  
  return result;
};

/**
 * Displays pinyin text with optional visibility toggle
 */
const PinyinText: React.FC<PinyinTextProps> = ({
  pinyin,
  showToneMarks = true,
  initiallyVisible = true,
  showToggle = true,
  size = 'medium',
  align = 'left',
  color = 'text',
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(initiallyVisible);

  const displayText = showToneMarks 
    ? convertToToneMarks(pinyin)
    : convertToToneNumbers(pinyin);

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const handleTextClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <StyledPinyinContainer>
      <Fade in={isVisible} timeout={200}>
        <StyledPinyinText
          pinyinSize={size}
          color={color}
          align={align}
          onClick={handleTextClick}
        >
          {isVisible ? displayText : '•••'}
        </StyledPinyinText>
      </Fade>
      
      {showToggle && (
        <StyledToggleButton
          onClick={handleToggleVisibility}
          size="small"
          aria-label={isVisible ? 'Hide pinyin' : 'Show pinyin'}
        >
          {isVisible ? <VisibilityOff /> : <Visibility />}
        </StyledToggleButton>
      )}
    </StyledPinyinContainer>
  );
};

export default PinyinText;
export type { PinyinTextProps };