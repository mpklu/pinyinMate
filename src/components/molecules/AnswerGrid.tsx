/**
 * AnswerGrid - Standalone component for multiple choice quiz answers
 * Displays answer options in an interactive 2x2 grid layout with animations
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  styled,
  alpha,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export interface AnswerGridProps {
  /** Array of answer options (max 4 for 2x2 grid) */
  options: string[];
  /** Currently selected answer */
  selectedAnswer?: string;
  /** Callback when an answer is selected */
  onAnswerSelect?: (answer: string) => void;
  /** Whether the grid is interactive */
  disabled?: boolean;
  /** Show correct answer indicator */
  showCorrectAnswer?: boolean;
  /** The correct answer for highlighting */
  correctAnswer?: string;
  /** Whether to show selection feedback */
  showFeedback?: boolean;
}

// Color palette for answer cards - using Material Design inspired colors
const ANSWER_COLORS = [
  { bg: '#E3F2FD', hover: '#BBDEFB', text: '#0D47A1' }, // Blue
  { bg: '#E8F5E8', hover: '#C8E6C9', text: '#1B5E20' }, // Green  
  { bg: '#FFF3E0', hover: '#FFE0B2', text: '#E65100' }, // Orange
  { bg: '#F3E5F5', hover: '#E1BEE7', text: '#4A148C' }, // Purple
];

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  width: '100%',
  
  // Mobile: Stack vertically (1 column)
  gridTemplateColumns: '1fr',
  
  // Tablet and up: 2x2 grid
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

const AnswerCard = styled(Card)<{
  colorIndex: number;
  isSelected: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  disabled: boolean;
}>(({ theme, colorIndex, isSelected, isCorrect, isIncorrect, disabled }) => {
  const colors = ANSWER_COLORS[colorIndex % ANSWER_COLORS.length];
  
  return {
    backgroundColor: colors.bg,
    border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
    borderRadius: theme.spacing(2),
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    transition: 'all 250ms ease-in-out',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    
    // Correct answer styling
    ...(isCorrect && {
      backgroundColor: alpha(theme.palette.success.main, 0.1),
      borderColor: theme.palette.success.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.success.main, 0.2)}`,
    }),
    
    // Incorrect answer styling  
    ...(isIncorrect && {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      borderColor: theme.palette.error.main,
      opacity: 0.7,
    }),
    
    // Disabled state
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed',
    }),
    
    // Interactive states (only when not disabled)
    ...(!disabled && {
      '&:hover': {
        backgroundColor: colors.hover,
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[4],
      },
      
      '&:active': {
        transform: 'scale(0.98)',
        transition: 'transform 100ms ease-in-out',
      },
    }),
    
    // Mobile responsive sizing
    [theme.breakpoints.down('sm')]: {
      minHeight: '60px',
    },
    
    // Desktop larger sizing
    [theme.breakpoints.up('md')]: {
      minHeight: '100px',
    },
  };
});

const AnswerContent = styled(CardContent)<{ colorIndex: number }>(({ theme, colorIndex }) => {
  const colors = ANSWER_COLORS[colorIndex % ANSWER_COLORS.length];
  
  return {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    width: '100%',
    
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
    
    '& .MuiTypography-root': {
      color: colors.text,
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.4,
      
      // Chinese text styling
      fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
    },
    
    // Responsive text sizing
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
      '& .MuiTypography-root': {
        fontSize: '0.9rem',
      },
    },
    
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
      '& .MuiTypography-root': {
        fontSize: '1.1rem',
      },
    },
  };
});

const CorrectIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.success.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const OptionLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  fontSize: '0.75rem',
  fontWeight: 600,
  opacity: 0.7,
  color: 'inherit',
}));

/**
 * AnswerGrid component for interactive multiple choice answers
 * 
 * Features:
 * - 2x2 grid layout (responsive to mobile stack)
 * - 4 distinct color schemes
 * - Smooth hover and click animations
 * - Selection state management
 * - Accessibility support
 * - Correct/incorrect answer feedback
 */
export const AnswerGrid: React.FC<AnswerGridProps> = ({
  options,
  selectedAnswer,
  onAnswerSelect,
  disabled = false,
  showCorrectAnswer = false,
  correctAnswer,
  showFeedback = false,
}) => {
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  // Limit to 4 options for 2x2 grid
  const gridOptions = options.slice(0, 4);
  
  const handleCardClick = useCallback((option: string) => {
    if (disabled) return;
    
    // Visual feedback
    setClickedCard(option);
    setTimeout(() => setClickedCard(null), 150);
    
    // Notify parent
    onAnswerSelect?.(option);
  }, [disabled, onAnswerSelect]);

  const getCardState = (option: string) => {
    const isSelected = selectedAnswer === option;
    const isCorrect = showCorrectAnswer && correctAnswer === option;
    const isIncorrect = showFeedback && selectedAnswer === option && correctAnswer !== option;
    
    return { isSelected, isCorrect, isIncorrect };
  };

  return (
    <Box role="radiogroup" aria-label="Answer options">
      <GridContainer>
        {gridOptions.map((option, index) => {
          const { isSelected, isCorrect, isIncorrect } = getCardState(option);
          const isClicked = clickedCard === option;
          
          return (
            <Box key={option} position="relative">
              {/* Hidden radio input for accessibility */}
              <input
                type="radio"
                name="quiz-answer"
                value={option}
                checked={isSelected}
                onChange={() => handleCardClick(option)}
                disabled={disabled}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                aria-label={`Option ${index + 1}: ${option}`}
              />
              
              <AnswerCard
                colorIndex={index}
                isSelected={isSelected}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                disabled={disabled}
                onClick={() => handleCardClick(option)}
                style={{
                  transform: isClicked ? 'scale(0.96)' : undefined,
                }}
              >
              <AnswerContent colorIndex={index}>
                {/* Option label (A, B, C, D) */}
                <OptionLabel>
                  {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                </OptionLabel>
                
                {/* Answer text */}
                <Typography>
                  {option}
                </Typography>
                
                {/* Correct answer indicator */}
                {isCorrect && showCorrectAnswer && (
                  <CorrectIndicator>
                    <CheckCircle fontSize="small" />
                  </CorrectIndicator>
                )}
              </AnswerContent>
            </AnswerCard>
            </Box>
          );
        })}
      </GridContainer>
    </Box>
  );
};

export default AnswerGrid;