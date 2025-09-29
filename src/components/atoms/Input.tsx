/**
 * Input - Atomic component
 * Material-UI enhanced text input with Chinese text support
 */

import React from 'react';
import {
  TextField,
  InputAdornment,
  styled,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  /**
   * Input variant
   */
  variant?: 'outlined' | 'filled' | 'standard';
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display at start of input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display at end of input
   */
  endIcon?: React.ReactNode;
  /**
   * Character counter
   */
  showCharCount?: boolean;
  /**
   * Maximum character count
   */
  maxLength?: number;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
  '& .MuiFormHelperText-root': {
    marginTop: theme.spacing(0.5),
    fontSize: '0.75rem',
  },
}));

const CharacterCount = styled('span')(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
  display: 'block',
}));

/**
 * Input component with Chinese text support and character counting
 */
export const Input: React.FC<InputProps> = ({
  startIcon,
  endIcon,
  showCharCount = false,
  maxLength,
  value,
  helperText,
  error,
  onChange,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxLength ? currentLength > maxLength : false;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength && event.target.value.length > maxLength) {
      return; // Prevent input beyond maxLength
    }
    onChange?.(event);
  };

  const displayHelperText = helperText || (showCharCount && maxLength ? (
    `${currentLength}/${maxLength} characters`
  ) : undefined);

  const textFieldProps = {
    ...props,
    value,
    onChange: handleChange,
    error: error || isOverLimit,
    helperText: displayHelperText,
    variant: props.variant || 'outlined' as const,
    fullWidth: props.fullWidth !== false,
    slotProps: {
      input: {
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : undefined,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : undefined,
      },
    },
  };

  return (
    <>
      <StyledTextField
        {...textFieldProps}
      />
      {showCharCount && !maxLength && (
        <CharacterCount>
          {currentLength} characters
        </CharacterCount>
      )}
    </>
  );
};

export default Input;