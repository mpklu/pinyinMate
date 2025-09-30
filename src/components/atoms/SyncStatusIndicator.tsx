/**
 * SyncStatusIndicator - Visual indicator for synchronization status
 * 
 * A comprehensive status indicator component that shows sync state between
 * local and remote sources with animations, progress tracking, and accessibility.
 */

import React from 'react';
import {
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Box,
  Typography,
  styled,
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Define sync status types
export type SyncStatus = 'idle' | 'connecting' | 'syncing' | 'success' | 'error';

// Define sync information structure
export interface SyncInfo {
  totalItems?: number;
  completedItems?: number;
  currentItem?: string;
}

// Component props interface
export interface SyncStatusIndicatorProps {
  /** Current synchronization status */
  status?: SyncStatus;
  /** Custom status message */
  message?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Detailed sync information */
  syncInfo?: SyncInfo;
  /** Last successful sync timestamp */
  lastSyncTime?: Date;
  /** Component size variant */
  size?: 'small' | 'medium';
  /** Show only icon without text */
  compact?: boolean;
  /** Tooltip text on hover */
  tooltip?: string;
  /** Responsive behavior for small screens */
  responsive?: boolean;
  /** Show success animation briefly */
  showSuccessAnimation?: boolean;
  /** Click handler for the indicator */
  onClick?: () => void;
  /** Retry handler for error state */
  onRetry?: () => void;
}

// Styled components for animations
const SpinningIcon = styled(SyncIcon)(() => ({
  animation: 'spin 2s linear infinite',
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

const PulsingChip = styled(Chip)(() => ({
  '&.animate-pulse': {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
}));

const BouncingIcon = styled(CheckCircleIcon)(() => ({
  '&.animate-bounce': {
    animation: 'bounce 1s infinite',
  },
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(-25%)',
      animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
    },
    '50%': {
      transform: 'none',
      animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
}));

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

// Helper function to clamp progress values
const clampProgress = (progress?: number): number => {
  if (typeof progress !== 'number') return 0;
  return Math.max(0, Math.min(100, progress));
};

// Helper function to check if screen is small
const isSmallScreen = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth <= 400;
};

// Helper function to get status configuration
const getStatusConfig = (status: SyncStatus, showSuccessAnimation: boolean) => {
  switch (status) {
    case 'connecting':
      return {
        icon: <WifiIcon data-testid="WifiIcon" />,
        color: 'warning' as const,
        defaultMessage: 'Connecting...',
        abbreviation: '⋯',
      };
    case 'syncing':
      return {
        icon: <SpinningIcon data-testid="SyncIcon" />,
        color: 'info' as const,
        defaultMessage: 'Syncing...',
        abbreviation: '↻',
      };
    case 'success':
      return {
        icon: showSuccessAnimation ? (
          <BouncingIcon data-testid="CheckCircleIcon" className="animate-bounce" />
        ) : (
          <CheckCircleIcon data-testid="CheckCircleIcon" />
        ),
        color: 'success' as const,
        defaultMessage: 'Synced',
        abbreviation: '✓',
      };
    case 'error':
      return {
        icon: <ErrorIcon data-testid="ErrorIcon" />,
        color: 'error' as const,
        defaultMessage: 'Sync Failed',
        abbreviation: '✗',
      };
    default: // idle
      return {
        icon: <WifiOffIcon data-testid="WifiOffIcon" />,
        color: 'default' as const,
        defaultMessage: 'Offline',
        abbreviation: '⊘',
      };
  }
};

// Helper function to build display message
const buildDisplayMessage = (
  message: string | undefined,
  defaultMessage: string,
  progress: number | undefined,
  syncInfo: SyncInfo | undefined,
  status: SyncStatus,
  lastSyncTime: Date | undefined
): string => {
  let displayMessage = message || defaultMessage;

  // Add progress information
  if (progress !== undefined) {
    const clampedProgress = clampProgress(progress);
    if (message) {
      displayMessage = `${message} (${clampedProgress}%)`;
    } else {
      displayMessage = `${clampedProgress}%`;
    }
  }

  // Add sync info
  if (syncInfo?.totalItems && syncInfo.completedItems !== undefined) {
    const progressText = `${syncInfo.completedItems}/${syncInfo.totalItems}`;
    displayMessage = syncInfo.currentItem 
      ? `${progressText} - ${syncInfo.currentItem}`
      : progressText;
  }

  // Add timestamp for success state
  if (status === 'success' && lastSyncTime && !message) {
    const timeAgo = formatRelativeTime(lastSyncTime);
    displayMessage = `Synced ${timeAgo}`;
  }

  return displayMessage;
};

// Helper function to get the chip icon
const getChipIcon = (
  status: SyncStatus,
  progress: number | undefined,
  icon: React.ReactNode
): React.ReactElement | undefined => {
  if (status === 'syncing' && progress !== undefined) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }
  return icon as React.ReactElement;
};

/**
 * SyncStatusIndicator component
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status = 'idle',
  message,
  progress,
  syncInfo,
  lastSyncTime,
  size = 'medium',
  compact = false,
  tooltip,
  responsive = false,
  showSuccessAnimation = false,
  onClick,
  onRetry,
}) => {
  const { icon, color, defaultMessage, abbreviation } = getStatusConfig(status, showSuccessAnimation);
  
  const displayMessage = buildDisplayMessage(
    message,
    defaultMessage,
    progress,
    syncInfo,
    status,
    lastSyncTime
  );

  const shouldAbbreviate = responsive && isSmallScreen();
  const finalMessage = shouldAbbreviate ? abbreviation : displayMessage;
  const ariaLabel = `Sync status: ${displayMessage}`;
  const isClickable = Boolean(onClick);

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      event.preventDefault();
      onClick();
    }
  };

  // Determine chip component and icon
  const ChipComponent = status === 'connecting' ? PulsingChip : Chip;
  const chipIcon = getChipIcon(status, progress, icon);

  // Main chip element
  const chipElement = (
    <ChipComponent
      icon={chipIcon}
      label={compact ? null : finalMessage}
      color={color}
      size={size}
      variant="filled"
      role={isClickable ? undefined : 'status'}
      aria-live="polite"
      aria-label={ariaLabel}
      aria-describedby={status === 'error' ? 'sync-error-description' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      className={status === 'connecting' ? 'animate-pulse' : undefined}
      sx={{
        cursor: isClickable ? 'pointer' : 'default',
        maxWidth: responsive ? '100%' : undefined,
        '& .MuiChip-label': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      }}
    />
  );

  // Wrap with tooltip if provided
  const tooltipElement = tooltip ? (
    <Tooltip title={tooltip}>
      {chipElement}
    </Tooltip>
  ) : chipElement;

  // Add retry button for error state
  if (status === 'error' && onRetry) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {tooltipElement}
        <IconButton
          size="small"
          onClick={onRetry}
          aria-label="Retry sync"
          color="error"
        >
          <RefreshIcon />
        </IconButton>
        {/* Hidden description for screen readers */}
        <Typography
          id="sync-error-description"
          variant="body2"
          sx={{ display: 'none' }}
        >
          Synchronization failed. Click retry to try again.
        </Typography>
      </Box>
    );
  }

  return tooltipElement;
};