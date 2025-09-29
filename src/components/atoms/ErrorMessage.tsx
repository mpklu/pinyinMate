/**
 * ErrorMessage - Atomic component
 * Material-UI enhanced error display with different severity levels
 */

import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  styled,
} from '@mui/material';
import type { AlertProps } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';

export interface ErrorMessageProps extends Omit<AlertProps, 'severity'> {
  /**
   * Error message
   */
  message: string;
  /**
   * Error title
   */
  title?: string;
  /**
   * Error severity
   */
  severity?: 'error' | 'warning' | 'info';
  /**
   * Show close button
   */
  closable?: boolean;
  /**
   * Show retry button
   */
  retryable?: boolean;
  /**
   * Close handler
   */
  onClose?: () => void;
  /**
   * Retry handler
   */
  onRetry?: () => void;
  /**
   * Full width alert
   */
  fullWidth?: boolean;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '& .MuiAlert-message': {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  '& .MuiAlert-action': {
    alignItems: 'flex-start',
    paddingTop: 0,
    gap: theme.spacing(0.5),
  },
}));

const ErrorText = styled('div')(({ theme }) => ({
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
}));

const ActionContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

/**
 * ErrorMessage component with retry and close functionality
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  severity = 'error',
  closable = false,
  retryable = false,
  onClose,
  onRetry,
  fullWidth = true,
  ...props
}) => {
  const actions = (
    <ActionContainer>
      {retryable && onRetry && (
        <IconButton
          size="small"
          onClick={onRetry}
          aria-label="Retry"
          color="inherit"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      )}
      {closable && onClose && (
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close error"
          color="inherit"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </ActionContainer>
  );

  return (
    <StyledAlert
      {...props}
      severity={severity}
      action={actions}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        ...props.sx,
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <ErrorText>{message}</ErrorText>
    </StyledAlert>
  );
};

export default ErrorMessage;