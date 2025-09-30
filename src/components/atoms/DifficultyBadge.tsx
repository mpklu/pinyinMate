import React from 'react';
import { Chip } from '@mui/material';
import { 
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import type { SxProps, Theme } from '@mui/material';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface DifficultyBadgeProps {
  /** The difficulty level */
  level: DifficultyLevel;
  /** Custom label to display instead of default */
  label?: string;
  /** Whether to show difficulty icon */
  showIcon?: boolean;
  /** Badge variant */
  variant?: 'filled' | 'outlined';
  /** Badge size */
  size?: 'small' | 'medium';
  /** Custom styles */
  sx?: SxProps<Theme>;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Click handler - makes badge clickable */
  onClick?: (level: DifficultyLevel) => void;
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: 'Beginner',
    color: 'success' as const,
    icon: StarBorderIcon
  },
  intermediate: {
    label: 'Intermediate', 
    color: 'info' as const,
    icon: StarHalfIcon
  },
  advanced: {
    label: 'Advanced',
    color: 'warning' as const, 
    icon: StarIcon
  },
  expert: {
    label: 'Expert',
    color: 'error' as const,
    icon: AutoAwesomeIcon
  }
} as const;

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  level,
  label,
  showIcon = false,
  variant = 'filled', 
  size = 'medium',
  sx,
  'aria-label': ariaLabel,
  onClick
}) => {
  // Handle invalid or undefined levels
  const config = DIFFICULTY_CONFIG[level] || {
    label: 'Unknown',
    color: 'default' as const,
    icon: StarBorderIcon
  };

  const displayLabel = label || config.label;
  const IconComponent = config.icon;
  
  // Get icon testid based on difficulty level
  const getIconTestId = () => {
    switch (level) {
      case 'beginner': return 'StarBorderIcon';
      case 'intermediate': return 'StarHalfIcon';
      case 'advanced': return 'StarIcon';
      case 'expert': return 'AutoAwesomeIcon';
      default: return 'StarBorderIcon';
    }
  };

  const handleClick = () => {
    if (onClick && level) {
      onClick(level);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <Chip
      label={displayLabel}
      color={config.color}
      variant={variant}
      size={size}
      icon={showIcon ? <IconComponent data-testid={getIconTestId()} /> : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}

      aria-label={ariaLabel || `Difficulty level: ${displayLabel}`}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        ...sx
      }}
    />
  );
};

export default DifficultyBadge;