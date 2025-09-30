/**
 * LibrarySourceToggle Atomic Component
 * Toggle switch for switching between local and remote lesson sources
 */

import React, { useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Tooltip,
  FormHelperText
} from '@mui/material';
import {
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Sync as SyncIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Source type
type LibrarySource = 'local' | 'remote';

// Sync status type
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// Component props interface
interface LibrarySourceToggleProps {
  value?: LibrarySource;
  onChange?: (source: LibrarySource) => void;
  localLabel?: string;
  remoteLabel?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  syncStatus?: SyncStatus;
  showIcons?: boolean;
  compact?: boolean;
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'default';
  error?: boolean;
  helperText?: string;
  tooltip?: string;
}

// Status indicator component
const StatusIndicator: React.FC<{ syncStatus: SyncStatus; isRemote: boolean }> = ({ syncStatus, isRemote }) => {
  if (!isRemote || syncStatus === 'idle') return null;
  
  const statusConfig = {
    syncing: { icon: <SyncIcon sx={{ fontSize: 16 }} />, text: 'Syncing...', color: 'info' as const },
    success: { icon: <CheckCircleIcon sx={{ fontSize: 16 }} />, text: 'Synced', color: 'success' as const },
    error: { icon: <ErrorIcon sx={{ fontSize: 16 }} />, text: 'Sync Error', color: 'error' as const }
  };

  const config = statusConfig[syncStatus];
  if (!config) return null;

  return (
    <Chip
      icon={config.icon}
      label={config.text}
      size="small"
      color={config.color}
      variant="outlined"
      sx={{ ml: 1 }}
    />
  );
};

// Label content component
const LabelContent: React.FC<{
  showIcons: boolean;
  isRemote: boolean;
  localLabel: string;
  remoteLabel: string;
  compact: boolean;
  syncStatus: SyncStatus;
  loading: boolean;
}> = ({ showIcons, isRemote, localLabel, remoteLabel, compact, syncStatus, loading }) => (
  <Box display="flex" alignItems="center" gap={1}>
    {showIcons && (
      <Box display="flex" alignItems="center" gap={0.5}>
        <StorageIcon 
          data-testid="StorageIcon"
          sx={{ 
            fontSize: 20, 
            opacity: isRemote ? 0.5 : 1,
            color: isRemote ? 'text.secondary' : 'primary.main'
          }} 
        />
        <CloudIcon 
          data-testid="CloudIcon"
          sx={{ 
            fontSize: 20, 
            opacity: isRemote ? 1 : 0.5,
            color: isRemote ? 'primary.main' : 'text.secondary'
          }} 
        />
      </Box>
    )}
    
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {isRemote ? remoteLabel : localLabel}
      {!compact && !isRemote && ' Library'}
      {!compact && isRemote && ' Library'}
    </Typography>
    
    <StatusIndicator syncStatus={syncStatus} isRemote={isRemote} />
    
    {loading && (
      <CircularProgress 
        size={16}
        sx={{ ml: 1 }}
      />
    )}
  </Box>
);

export const LibrarySourceToggle: React.FC<LibrarySourceToggleProps> = ({
  value,
  onChange,
  localLabel = 'Local',
  remoteLabel = 'Remote',
  description,
  disabled = false,
  loading = false,
  syncStatus = 'idle',
  showIcons = false,
  compact = false,
  size = 'medium',
  color = 'primary',
  error = false,
  helperText,
  tooltip
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<LibrarySource>('local');
  
  // Determine current value
  const currentValue = value ?? internalValue;
  
  // Handle invalid values
  const validValue = (currentValue === 'local' || currentValue === 'remote') ? currentValue : 'local';
  const isValidRemote = validValue === 'remote';

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || loading) return;
    
    const newValue: LibrarySource = event.target.checked ? 'remote' : 'local';
    
    if (onChange) {
      onChange(newValue);
    } else {
      // Uncontrolled mode
      setInternalValue(newValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' && !disabled && !loading) {
      event.preventDefault();
      const newValue: LibrarySource = isValidRemote ? 'local' : 'remote';
      
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  const switchElement = (
    <FormControl error={error} disabled={disabled || loading}>
      <FormControlLabel
        control={
          <Switch
            checked={isValidRemote}
            onChange={handleToggle}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            size={size}
            color={color}
            slotProps={{
              input: {
                'aria-describedby': description ? 'source-toggle-description' : undefined,
                tabIndex: 0
              }
            }}
          />
        }
        label={
          <LabelContent 
            showIcons={showIcons}
            isRemote={isValidRemote}
            localLabel={localLabel}
            remoteLabel={remoteLabel}
            compact={compact}
            syncStatus={syncStatus}
            loading={loading}
          />
        }
        sx={{
          m: 0,
          '& .MuiFormControlLabel-label': {
            flex: 1
          }
        }}
      />
      
      {description && (
        <Typography 
          id="source-toggle-description"
          variant="caption" 
          color="text.secondary"
          sx={{ mt: 0.5, pl: 0 }}
        >
          {description}
        </Typography>
      )}
      
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        <Box>{switchElement}</Box>
      </Tooltip>
    );
  }

  return switchElement;
};