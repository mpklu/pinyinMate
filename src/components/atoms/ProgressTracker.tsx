/**
 * ProgressTracker - Atomic progress indicator for lesson study
 * Shows completion status and progress through lesson content
 */

import React from 'react';
import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import { CheckCircle, PlayCircle, PauseCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface ProgressTrackerProps {
  /** Current progress percentage (0-100) */
  progress: number;
  
  /** Current status of the lesson */
  status: 'not-started' | 'in-progress' | 'completed';
  
  /** Total number of segments in the lesson */
  totalSegments: number;
  
  /** Number of segments completed */
  completedSegments: number;
  
  /** Time spent studying (in seconds) */
  timeSpent?: number;
  
  /** Display variant */
  variant?: 'minimal' | 'detailed' | 'compact';
  
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Show percentage text */
  showPercentage?: boolean;
  
  /** Show time information */
  showTime?: boolean;
  
  /** Custom color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  status,
  totalSegments,
  completedSegments,
  timeSpent,
  variant = 'detailed',
  size = 'medium',
  showPercentage = true,
  showTime = true,
  color = 'primary'
}) => {
  const theme = useTheme();

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'in-progress':
        return <PlayCircle sx={{ color: theme.palette.primary.main }} />;
      case 'not-started':
      default:
        return <PauseCircle sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'not-started': return 'default';
      default: return 'default';
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const getProgressHeight = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 12;
      default: return 8;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 'caption';
      case 'large': return 'body1';
      default: return 'body2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return { fontSize: '1rem' };
      case 'large': return { fontSize: '1.5rem' };
      default: return { fontSize: '1.25rem' };
    }
  };

  if (variant === 'minimal') {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={color}
          sx={{ height: getProgressHeight() }}
        />
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ ...getIconSize() }}>
          {getStatusIcon()}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={color}
            sx={{ height: getProgressHeight() }}
          />
        </Box>
        {showPercentage && (
          <Typography variant={getFontSize()} sx={{ minWidth: 35, textAlign: 'right' }}>
            {Math.round(progress)}%
          </Typography>
        )}
      </Box>
    );
  }

  // Detailed variant (default)
  return (
    <Box sx={{ width: '100%' }}>
      {/* Status and Progress Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ ...getIconSize() }}>
            {getStatusIcon()}
          </Box>
          <Chip
            label={status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            color={getStatusColor() as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            size={size === 'small' ? 'small' : 'medium'}
            variant="outlined"
          />
        </Box>
        
        {showPercentage && (
          <Typography variant={getFontSize()} color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        )}
      </Box>

      {/* Progress Bar */}
      <Box sx={{ width: '100%', mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={color}
          sx={{
            height: getProgressHeight(),
            backgroundColor: theme.palette.grey[200],
            borderRadius: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            },
          }}
        />
      </Box>

      {/* Progress Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant={getFontSize()} color="text.secondary">
          {completedSegments} / {totalSegments} segments
        </Typography>
        
        {showTime && timeSpent !== undefined && timeSpent > 0 && (
          <Typography variant={getFontSize()} color="text.secondary">
            {formatTime(timeSpent)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProgressTracker;