/**
 * Card - Atomic component
 * Material-UI enhanced card with Chinese learning app styling
 */

import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  styled,
} from '@mui/material';
import type { CardProps as MuiCardProps } from '@mui/material';

export interface CardProps extends MuiCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Card actions (buttons, etc.)
   */
  actions?: React.ReactNode;
  /**
   * Card padding
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /**
   * Hover effect
   */
  hoverable?: boolean;
  /**
   * Selected state
   */
  selected?: boolean;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'hoverable' && prop !== 'selected',
})<{ hoverable?: boolean; selected?: boolean }>(({ theme, hoverable, selected }) => ({
  borderRadius: theme.spacing(1.5),
  transition: theme.transitions.create([
    'box-shadow',
    'transform',
    'border-color',
  ], {
    duration: theme.transitions.duration.short,
  }),
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  
  ...(hoverable && {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
    },
  }),
  
  ...(selected && {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08',
  }),
}));

const StyledCardContent = styled(CardContent, {
  shouldForwardProp: (prop) => prop !== 'padding',
})<{ padding?: string }>(({ theme, padding = 'medium' }) => {
  const paddingMap = {
    none: 0,
    small: theme.spacing(1),
    medium: theme.spacing(2),
    large: theme.spacing(3),
  };

  return {
    padding: paddingMap[padding as keyof typeof paddingMap] || paddingMap.medium,
    '&:last-child': {
      paddingBottom: paddingMap[padding as keyof typeof paddingMap] || paddingMap.medium,
    },
  };
});

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}));

/**
 * Card component with hover effects and customizable padding
 */
export const Card: React.FC<CardProps> = ({
  children,
  actions,
  padding = 'medium',
  hoverable = false,
  selected = false,
  onClick,
  ...props
}) => {
  return (
    <StyledCard
      {...props}
      hoverable={hoverable}
      selected={selected}
      onClick={onClick}
    >
      <StyledCardContent padding={padding}>
        {children}
      </StyledCardContent>
      {actions && (
        <StyledCardActions>
          {actions}
        </StyledCardActions>
      )}
    </StyledCard>
  );
};

export default Card;