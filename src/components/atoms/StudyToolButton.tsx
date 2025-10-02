/**
 * StudyToolButton - Floating action button for study tools
 * Atomic component for triggering flashcard and quiz generation
 */

import React, { useState } from 'react';
import { Fab, Tooltip, Badge, CircularProgress } from '@mui/material';
import { 
  Quiz, 
  Style, 
  PlayArrow, 
  Download,
  Assessment,
  School
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export type StudyToolType = 'flashcards' | 'quiz' | 'audio' | 'export' | 'assessment' | 'study';

export interface StudyToolButtonProps {
  /** Type of study tool */
  toolType: StudyToolType;
  
  /** Whether the tool is currently loading/processing */
  loading?: boolean;
  
  /** Whether the tool is disabled */
  disabled?: boolean;
  
  /** Badge count (e.g., number of flashcards generated) */
  badgeCount?: number;
  
  /** Callback when button is clicked */
  onClick?: (toolType: StudyToolType) => void;
  
  /** Tooltip text override */
  tooltipText?: string;
  
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  
  /** Button color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /** Button variant */
  variant?: 'circular' | 'extended';
  
  /** Extended button text (for extended variant) */
  extendedText?: string;
}

export const StudyToolButton: React.FC<StudyToolButtonProps> = ({
  toolType,
  loading = false,
  disabled = false,
  badgeCount,
  onClick,
  tooltipText,
  size = 'medium',
  color = 'primary',
  variant = 'circular',
  extendedText
}) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const getToolIcon = () => {
    switch (toolType) {
      case 'flashcards':
        return <Style />;
      case 'quiz':
        return <Quiz />;
      case 'audio':
        return <PlayArrow />;
      case 'export':
        return <Download />;
      case 'assessment':
        return <Assessment />;
      case 'study':
        return <School />;
      default:
        return <School />;
    }
  };

  const getDefaultTooltip = () => {
    switch (toolType) {
      case 'flashcards':
        return 'Generate Flashcards';
      case 'quiz':
        return 'Create Quiz';
      case 'audio':
        return 'Play Audio';
      case 'export':
        return 'Export Content';
      case 'assessment':
        return 'Start Assessment';
      case 'study':
        return 'Study Mode';
      default:
        return 'Study Tool';
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      setIsPressed(true);
      onClick(toolType);
      
      // Reset pressed state after animation
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const getProgressSize = () => {
    if (size === 'small') return 20;
    if (size === 'large') return 28;
    return 24;
  };

  const buttonContent = loading ? (
    <CircularProgress
      size={getProgressSize()}
      color="inherit"
    />
  ) : (
    getToolIcon()
  );

  const fabButton = (
    <Fab
      size={size}
      color={color}
      variant={variant}
      onClick={handleClick}
      disabled={disabled || loading}
      sx={{
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        boxShadow: isPressed ? theme.shadows[2] : theme.shadows[6],
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: theme.shadows[8],
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
        '&.Mui-disabled': {
          opacity: 0.6,
        },
      }}
      aria-label={tooltipText || getDefaultTooltip()}
    >
      {variant === 'extended' && extendedText ? (
        <>
          {buttonContent}
          <span style={{ marginLeft: theme.spacing(1) }}>
            {extendedText}
          </span>
        </>
      ) : (
        buttonContent
      )}
    </Fab>
  );

  const buttonWithBadge = badgeCount && badgeCount > 0 ? (
    <Badge
      badgeContent={badgeCount}
      color="secondary"
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: '0.75rem',
          height: 20,
          minWidth: 20,
        },
      }}
    >
      {fabButton}
    </Badge>
  ) : (
    fabButton
  );

  return (
    <Tooltip 
      title={tooltipText || getDefaultTooltip()} 
      placement="left"
      arrow
    >
      <span> {/* Wrapper span to ensure tooltip works with disabled button */}
        {buttonWithBadge}
      </span>
    </Tooltip>
  );
};

export default StudyToolButton;