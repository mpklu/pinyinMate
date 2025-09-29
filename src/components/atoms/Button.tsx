/**
 * Button - Atomic component
 * Material-UI enhanced button with Chinese learning app styling
 */

import React from 'react';
import {
  Button as MuiButton,
  CircularProgress,
  styled,
} from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  /**
   * Button color variant
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Icon to display before text
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display after text
   */
  endIcon?: React.ReactNode;
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 500,
  minHeight: 40,
  transition: theme.transitions.create([
    'background-color',
    'box-shadow',
    'border-color',
    'color',
  ], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

/**
 * Button component with loading state and Material-UI integration
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled,
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <LoadingSpinner size={16} /> : startIcon}
      endIcon={!loading ? endIcon : undefined}
    >
      {children}
    </StyledButton>
  );
};

export default Button;