/**
 * DifficultyRating component (0-5 scale)
 * Displays and allows selection of difficulty levels for learning content
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Chip, Rating, Typography, Tooltip } from '@mui/material';
import { 
  School as BeginnerIcon,
  MenuBook as IntermediateIcon,
  AutoStories as AdvancedIcon,
} from '@mui/icons-material';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type SizeVariant = 'small' | 'medium' | 'large';

interface DifficultyRatingProps {
  /** Current difficulty value (0-5 scale or string level) */
  value?: number | DifficultyLevel;
  /** Whether the rating is interactive */
  readOnly?: boolean;
  /** Size of the rating component */
  size?: SizeVariant;
  /** Display variant */
  variant?: 'stars' | 'chips' | 'icons';
  /** Whether to show the text label */
  showLabel?: boolean;
  /** Custom labels for difficulty levels */
  labels?: Record<number, string>;
  /** Callback when rating changes */
  onChange?: (value: number | DifficultyLevel) => void;
  /** Additional styling class */
  className?: string;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledChipContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  gap: theme.spacing(0.5),
}));

const StyledIconContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

// Default labels for difficulty levels
const DEFAULT_LABELS: Record<number, string> = {
  0: 'Not rated',
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

// Mapping between string levels and numeric values
const LEVEL_TO_NUMBER: Record<DifficultyLevel, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
};

const NUMBER_TO_LEVEL: Record<number, DifficultyLevel> = {
  1: 'beginner',
  2: 'beginner',
  3: 'intermediate',
  4: 'advanced',
  5: 'advanced',
};

/**
 * Converts difficulty value to numeric scale (0-5)
 */
const normalizeValue = (value?: number | DifficultyLevel): number => {
  if (typeof value === 'string') {
    return LEVEL_TO_NUMBER[value] || 0;
  }
  return value || 0;
};

/**
 * Gets the difficulty level string from numeric value
 */
const getDifficultyLevel = (value: number): DifficultyLevel | null => {
  return NUMBER_TO_LEVEL[value] || null;
};

/**
 * Gets color for difficulty level
 */
const getDifficultyColor = (value: number): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  if (value <= 1) return 'success';
  if (value <= 2) return 'info';
  if (value <= 3) return 'warning';
  if (value <= 4) return 'error';
  return 'error';
};

/**
 * Star rating variant
 */
const StarRating: React.FC<{
  value: number;
  readOnly: boolean;
  size: SizeVariant;
  showLabel: boolean;
  labels: Record<number, string>;
  onChange?: (value: number) => void;
}> = ({ value, readOnly, size, showLabel, labels, onChange }) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: number | null) => {
    if (onChange && newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <StyledContainer>
      <Rating
        value={value}
        max={5}
        precision={1}
        size={size}
        readOnly={readOnly}
        onChange={handleChange}
      />
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          {labels[value] || labels[0]}
        </Typography>
      )}
    </StyledContainer>
  );
};

/**
 * Chip variant
 */
const ChipRating: React.FC<{
  value: number;
  readOnly: boolean;
  size: 'small' | 'medium';
  showLabel: boolean;
  labels: Record<number, string>;
  onChange?: (value: number) => void;
}> = ({ value, readOnly, size, showLabel, labels, onChange }) => {
  const chips = [1, 2, 3, 4, 5];

  const handleChipClick = (chipValue: number) => {
    if (!readOnly && onChange) {
      // Toggle behavior: click the same chip to unselect
      onChange(value === chipValue ? 0 : chipValue);
    }
  };

  return (
    <StyledContainer>
      <StyledChipContainer>
        {chips.map((chipValue) => (
          <Chip
            key={chipValue}
            label={chipValue}
            size={size}
            variant={value >= chipValue ? 'filled' : 'outlined'}
            color={value >= chipValue ? getDifficultyColor(chipValue) : 'default'}
            clickable={!readOnly}
            onClick={() => handleChipClick(chipValue)}
          />
        ))}
      </StyledChipContainer>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          {labels[value] || labels[0]}
        </Typography>
      )}
    </StyledContainer>
  );
};

/**
 * Icon variant
 */
const IconRating: React.FC<{
  value: number;
  readOnly: boolean;
  size: SizeVariant;
  showLabel: boolean;
  labels: Record<number, string>;
  onChange?: (value: DifficultyLevel) => void;
}> = ({ value, readOnly, size, showLabel, labels, onChange }) => {
  const level = getDifficultyLevel(value);
  
  let iconSize: SizeVariant = 'medium';
  if (size === 'small') iconSize = 'small';
  else if (size === 'large') iconSize = 'large';
  
  const icons = [
    { level: 'beginner' as const, icon: BeginnerIcon, label: 'Beginner' },
    { level: 'intermediate' as const, icon: IntermediateIcon, label: 'Intermediate' },
    { level: 'advanced' as const, icon: AdvancedIcon, label: 'Advanced' },
  ];

  const handleIconClick = (clickedLevel: DifficultyLevel) => {
    if (!readOnly && onChange) {
      onChange(level === clickedLevel ? 'beginner' : clickedLevel);
    }
  };

  return (
    <StyledContainer>
      <StyledIconContainer>
        {icons.map(({ level: iconLevel, icon: Icon, label }) => {
          const isActive = level === iconLevel;
          const iconColor = isActive ? 'primary' : 'action';
          
          return (
            <Tooltip key={iconLevel} title={label} arrow>
              <Icon
                fontSize={iconSize}
                color={iconColor}
                style={{ 
                  cursor: readOnly ? 'default' : 'pointer',
                  opacity: isActive ? 1 : 0.5,
                }}
                onClick={() => handleIconClick(iconLevel)}
              />
            </Tooltip>
          );
        })}
      </StyledIconContainer>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          {level ? labels[LEVEL_TO_NUMBER[level]] : labels[0]}
        </Typography>
      )}
    </StyledContainer>
  );
};

/**
 * Difficulty rating component with multiple display variants
 */
const DifficultyRating: React.FC<DifficultyRatingProps> = ({
  value,
  readOnly = false,
  size = 'medium',
  variant = 'stars',
  showLabel = true,
  labels = DEFAULT_LABELS,
  onChange,
  className,
}) => {
  const numericValue = normalizeValue(value);

  const handleStarChange = (newValue: number) => {
    if (onChange) {
      if (typeof value === 'string') {
        const level = getDifficultyLevel(newValue);
        onChange(level || 'beginner');
      } else {
        onChange(newValue);
      }
    }
  };

  const handleLevelChange = (newLevel: DifficultyLevel) => {
    if (onChange) {
      if (typeof value === 'string') {
        onChange(newLevel);
      } else {
        onChange(LEVEL_TO_NUMBER[newLevel]);
      }
    }
  };

  const containerProps = {
    className,
    'aria-label': `Difficulty rating: ${labels[numericValue] || 'Not rated'}`,
  };

  switch (variant) {
    case 'chips':
      return (
        <Box {...containerProps}>
          <ChipRating
            value={numericValue}
            readOnly={readOnly}
            size={size === 'large' ? 'medium' : size}
            showLabel={showLabel}
            labels={labels}
            onChange={handleStarChange}
          />
        </Box>
      );
    
    case 'icons':
      return (
        <Box {...containerProps}>
          <IconRating
            value={numericValue}
            readOnly={readOnly}
            size={size}
            showLabel={showLabel}
            labels={labels}
            onChange={handleLevelChange}
          />
        </Box>
      );
    
    case 'stars':
    default:
      return (
        <Box {...containerProps}>
          <StarRating
            value={numericValue}
            readOnly={readOnly}
            size={size}
            showLabel={showLabel}
            labels={labels}
            onChange={handleStarChange}
          />
        </Box>
      );
  }
};

export default DifficultyRating;
export type { DifficultyRatingProps, DifficultyLevel };