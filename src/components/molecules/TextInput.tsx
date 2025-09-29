/**
 * TextInput - Molecular component
 * Enhanced text input for Chinese text with validation and processing features
 */

import React, { useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, styled } from '@mui/material';
import {
  Translate as TranslateIcon,
  VolumeUp as VolumeUpIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Input } from '../atoms';
import type { InputProps } from '../atoms';

export interface TextInputProps extends Omit<InputProps, 'onChange'> {
  /**
   * Text change handler
   */
  onChange?: (value: string) => void;
  /**
   * Show character counter
   */
  showCharCount?: boolean;
  /**
   * Maximum character limit
   */
  maxLength?: number;
  /**
   * Show clear button
   */
  clearable?: boolean;
  /**
   * Show translate button
   */
  showTranslate?: boolean;
  /**
   * Show audio button
   */
  showAudio?: boolean;
  /**
   * Translate handler
   */
  onTranslate?: (text: string) => void;
  /**
   * Audio handler
   */
  onPlayAudio?: (text: string) => void;
  /**
   * Auto-focus on mount
   */
  autoFocus?: boolean;
  /**
   * Validation function
   */
  validator?: (text: string) => string | null;
}

const InputContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

/**
 * TextInput component with Chinese text processing features
 */
export const TextInput: React.FC<TextInputProps> = ({
  value = '',
  onChange,
  showCharCount = false,
  maxLength,
  clearable = false,
  showTranslate = false,
  showAudio = false,
  onTranslate,
  onPlayAudio,
  autoFocus = false,
  validator,
  error: externalError,
  helperText: externalHelperText,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(
    typeof value === 'string' ? value : ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const currentValue = typeof value === 'string' ? value : internalValue;
  const hasValue = currentValue.length > 0;

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Run validation if provided
    if (validator) {
      const error = validator(newValue);
      setValidationError(error);
    }
    
    // Update internal state if not controlled
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    // Call external onChange
    onChange?.(newValue);
  }, [onChange, validator, value]);

  const handleClear = useCallback(() => {
    const newValue = '';
    setValidationError(null);
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  }, [onChange, value]);

  const handleTranslate = useCallback(() => {
    if (hasValue && onTranslate) {
      onTranslate(currentValue);
    }
  }, [currentValue, hasValue, onTranslate]);

  const handlePlayAudio = useCallback(() => {
    if (hasValue && onPlayAudio) {
      onPlayAudio(currentValue);
    }
  }, [currentValue, hasValue, onPlayAudio]);

  const isError = Boolean(externalError || validationError);
  const displayHelperText = externalHelperText || validationError;

  const actionButtons = (
    <ActionButtons>
      {showTranslate && (
        <Tooltip title="Translate text">
          <span>
            <StyledIconButton
              size="small"
              onClick={handleTranslate}
              disabled={!hasValue}
              color="primary"
            >
              <TranslateIcon fontSize="small" />
            </StyledIconButton>
          </span>
        </Tooltip>
      )}
      
      {showAudio && (
        <Tooltip title="Play audio">
          <span>
            <StyledIconButton
              size="small"
              onClick={handlePlayAudio}
              disabled={!hasValue}
              color="primary"
            >
              <VolumeUpIcon fontSize="small" />
            </StyledIconButton>
          </span>
        </Tooltip>
      )}
      
      {clearable && (
        <Tooltip title="Clear text">
          <span>
            <StyledIconButton
              size="small"
              onClick={handleClear}
              disabled={!hasValue}
              color="secondary"
            >
              <ClearIcon fontSize="small" />
            </StyledIconButton>
          </span>
        </Tooltip>
      )}
    </ActionButtons>
  );

  return (
    <InputContainer>
      <Input
        {...props}
        value={currentValue}
        onChange={handleChange}
        error={isError}
        helperText={displayHelperText}
        showCharCount={showCharCount}
        maxLength={maxLength}
        autoFocus={autoFocus}
        placeholder={props.placeholder || 'Enter Chinese text...'}
        multiline={props.multiline}
        rows={props.rows}
        fullWidth
      />
      
      {(showTranslate || showAudio || clearable) && actionButtons}
    </InputContainer>
  );
};

export default TextInput;