/**
 * LoadingSpinner - Atomic component
 * Material-UI enhanced loading spinner with different sizes and overlay options
 */

import React from 'react';
import {
  CircularProgress,
  Box,
  Typography,
  styled,
} from '@mui/material';
import type { CircularProgressProps } from '@mui/material';

export interface LoadingSpinnerProps extends Omit<CircularProgressProps, 'size'> {
  /**
   * Spinner size
   */
  size?: 'small' | 'medium' | 'large' | number;
  /**
   * Loading message
   */
  message?: string;
  /**
   * Center spinner in container
   */
  center?: boolean;
  /**
   * Overlay mode (covers parent container)
   */
  overlay?: boolean;
  /**
   * Show backdrop
   */
  backdrop?: boolean;
}

const sizeMap = {
  small: 20,
  medium: 40,
  large: 60,
};

const LoadingContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'center' && prop !== 'overlay',
})<{ center?: boolean; overlay?: boolean }>(({ center, overlay }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  
  ...(center && {
    minHeight: 200,
  }),
  
  ...(overlay && {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  }),
}));

const BackdropOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: theme.palette.background.paper + 'CC',
  backdropFilter: 'blur(2px)',
  zIndex: 999,
}));

const LoadingMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  textAlign: 'center',
}));

/**
 * LoadingSpinner component with customizable size and overlay options
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  center = false,
  overlay = false,
  backdrop = false,
  color = 'primary',
  ...props
}) => {
  const spinnerSize = typeof size === 'number' ? size : sizeMap[size];

  const spinner = (
    <LoadingContainer center={center} overlay={overlay}>
      <CircularProgress
        {...props}
        size={spinnerSize}
        color={color}
        thickness={4}
      />
      {message && (
        <LoadingMessage variant="body2">
          {message}
        </LoadingMessage>
      )}
    </LoadingContainer>
  );

  if (overlay) {
    return (
      <>
        {backdrop && <BackdropOverlay />}
        {spinner}
      </>
    );
  }

  return spinner;
};

export default LoadingSpinner;