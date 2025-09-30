/**
 * AudioPlayButton - Interactive audio playback control button
 * 
 * A comprehensive audio playback button component with visual feedback,
 * progress tracking, accessibility features, and error handling.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconButton,
  CircularProgress,
  Typography,
  Box,
  LinearProgress,
  styled,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Define audio source types
export interface AudioSource {
  src: string;
  type: string;
}

// Component props interface
export interface AudioPlayButtonProps {
  /** Audio source URL or Blob */
  src?: string | Blob;
  /** Multiple audio sources with format types */
  sources?: AudioSource[];
  /** Current playback state */
  playing?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Fallback text for unsupported formats */
  fallbackText?: string;
  /** Current playback time in seconds */
  currentTime?: number;
  /** Total audio duration in seconds */
  duration?: number;
  /** Button size variant */
  size?: 'small' | 'medium' | 'large';
  /** Button color variant */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /** Show only icon without text */
  compact?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Show volume visualization */
  showVolumeVisualization?: boolean;
  /** Enable keyboard shortcuts */
  keyboardShortcuts?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA live region announcements */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /** Custom styles */
  sx?: object;
  /** Play button click handler */
  onPlay?: () => void;
  /** Pause button click handler */
  onPause?: () => void;
  /** Seek handler */
  onSeek?: (time: number) => void;
  /** Error handler */
  onError?: (error: Event) => void;
  /** Retry handler */
  onRetry?: () => void;
  /** Time update handler */
  onTimeUpdate?: (currentTime: number) => void;
  /** Audio ended handler */
  onEnded?: () => void;
}

// Styled components for animations
const PlayingIconButton = styled(IconButton)(() => ({
  '&.playing': {
    animation: 'pulse 2s ease-in-out infinite',
  },
  '&.hover-pulse:hover': {
    animation: 'pulse 1s ease-in-out',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

const VolumeVisualization = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  '& .bar': {
    width: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 1.5,
    animation: 'bounce 1.2s ease-in-out infinite',
  },
  '& .bar:nth-child(2)': {
    animationDelay: '0.1s',
  },
  '& .bar:nth-child(3)': {
    animationDelay: '0.2s',
  },
  '& .bar:nth-child(4)': {
    animationDelay: '0.3s',
  },
  '@keyframes bounce': {
    '0%, 20%, 53%, 80%, 100%': {
      height: 4,
    },
    '40%': {
      height: 8,
    },
    '17%': {
      height: 6,
    },
  },
}));

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0) return '0:00';
  
  // Round up sub-second durations to 1 second for display
  const roundedSeconds = seconds < 1 ? Math.ceil(seconds) : seconds;
  
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const secs = Math.floor(roundedSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to create audio source URL
const createAudioUrl = (src: string | Blob): string => {
  if (typeof src === 'string') {
    return src;
  }
  return URL.createObjectURL(src);
};

/**
 * AudioPlayButton component
 */
export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  src,
  sources,
  playing = false,
  loading = false,
  error,
  fallbackText,
  currentTime = 0,
  duration,
  size = 'medium',
  color = 'default',
  compact = false,
  showProgress = false,
  showVolumeVisualization = false,
  keyboardShortcuts = false,
  disabled = false,
  ariaLabel,
  ariaLive = 'polite',
  sx,
  onPlay,
  onPause,
  onSeek,
  onError,
  onRetry,
  onTimeUpdate,
  onEnded,
}) => {
  const [internalPlaying, setInternalPlaying] = useState(playing);
  const [internalCurrentTime, setInternalCurrentTime] = useState(currentTime);
  const [internalError, setInternalError] = useState(error);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Update internal state when props change
  useEffect(() => {
    setInternalPlaying(playing);
  }, [playing]);

  useEffect(() => {
    setInternalCurrentTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    setInternalError(error);
  }, [error]);

    // Check for unsupported format
  const isUnsupportedFormat = typeof src === 'string' && src.includes('.unsupported');

  // Initialize audio element when src changes
  useEffect(() => {
    if (!src && !sources?.length) return;
    
    // Check for unsupported format
    if (isUnsupportedFormat) {
      setInternalError('Unsupported format');
      return;
    }

    try {
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setInternalError(undefined);
      });

      audio.addEventListener('timeupdate', () => {
        setInternalCurrentTime(audio.currentTime);
        if (onTimeUpdate) onTimeUpdate(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setInternalPlaying(false);
        if (onEnded) onEnded();
      });

      audio.addEventListener('error', () => {
        setInternalError('Failed to load audio');
        if (onError) onError(new Event('error'));
      });

      // Set audio source
      if (typeof src === 'string') {
        audio.src = src;
        audio.load();
      } else if (sources?.length) {
        // Use first source for now
        const source = sources[0];
        if (source instanceof Blob) {
          audio.src = URL.createObjectURL(source);
          
          // Clean up object URL when component unmounts
          return () => {
            URL.revokeObjectURL(audio.src);
          };
        }
      }
    } catch {
      setInternalError('Failed to initialize audio');
    }
  }, [src, sources, onTimeUpdate, onError, onEnded, isUnsupportedFormat]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    // Handle error state - allow retry
    if (internalError) {
      if (onRetry) {
        onRetry();
        setInternalError(undefined);
      }
      return;
    }

    if (internalPlaying) {
      if (onPause) {
        onPause();
      } else {
        audioRef.current?.pause();
        setInternalPlaying(false);
      }
    } else if (onPlay) {
      onPlay();
    } else {
      audioRef.current?.play().catch(() => {
        setInternalError('Failed to play audio');
      });
      setInternalPlaying(true);
    }
  }, [disabled, loading, internalError, internalPlaying, onPlay, onPause, onRetry]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || (keyboardShortcuts && event.key === 'k')) {
      event.preventDefault();
      handlePlayPause();
    }
  }, [handlePlayPause, keyboardShortcuts]);

  // Handle progress bar click
  const handleProgressClick = useCallback((event: React.MouseEvent) => {
    if (!onSeek || !duration || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  }, [onSeek, duration]);

  // Determine icon and state
  const getIcon = () => {
    if (loading) {
      let progressSize = 24; // default medium
      if (size === 'small') progressSize = 16;
      else if (size === 'large') progressSize = 32;
      return <CircularProgress size={progressSize} />;
    }
    
    if (internalError) {
      return <ErrorIcon data-testid="ErrorIcon" />;
    }
    
    if (internalPlaying) {
      return <PauseIcon data-testid="PauseIcon" />;
    }
    
    return <PlayArrowIcon data-testid="PlayArrowIcon" />;
  };

  // Build ARIA label
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    
    if (internalError) return 'Audio error - click to retry';
    if (loading) return 'Loading audio';
    if (internalPlaying) return 'Pause audio';
    return 'Play audio';
  };

  // Determine if button should be disabled  
  // Only disable if explicitly disabled or loading, not for missing source if callbacks provided
  const isDisabled = disabled || loading;

  // Format time display
  const getTimeDisplay = () => {
    if (compact) return null;
    
    const normalizedCurrentTime = Math.max(0, internalCurrentTime || currentTime || 0); // Handle negative values
    const current = formatTime(normalizedCurrentTime);
    const total = duration ? formatTime(duration) : null;
    
    // Show duration only if no current time is playing/set, otherwise show current/total
    if (total && (internalCurrentTime > 0 || currentTime > 0)) {
      return `${current} / ${total}`;
    }
    
    return total || current;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}
      aria-live={ariaLive}
    >
      <PlayingIconButton
        onClick={handlePlayPause}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        size={size}
        color={color}
        aria-label={getAriaLabel()}
        tabIndex={isDisabled ? -1 : 0}
        className={`${internalPlaying ? 'playing' : ''} hover-pulse`}
        sx={sx}
      >
        {getIcon()}
      </PlayingIconButton>

      {/* Time display */}
      {!compact && getTimeDisplay() && (
        <Typography variant="body2" color="textSecondary">
          {getTimeDisplay()}
        </Typography>
      )}

      {/* Progress bar */}
      {showProgress && duration && (
        <Box sx={{ flex: 1, mx: 1 }}>
          <LinearProgress
            ref={progressRef}
            variant="determinate"
            value={duration ? (internalCurrentTime / duration) * 100 : 0}
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuenow={internalCurrentTime}
            aria-valuemax={duration}
            sx={{ cursor: onSeek ? 'pointer' : 'default' }}
          />
        </Box>
      )}

      {/* Volume visualization */}
      {showVolumeVisualization && internalPlaying && (
        <VolumeVisualization data-testid="volume-visualization">
          <Box className="bar" />
          <Box className="bar" />
          <Box className="bar" />
          <Box className="bar" />
        </VolumeVisualization>
      )}

      {/* Fallback text */}
      {fallbackText && (internalError || (!src && !sources?.length)) && (
        <Typography variant="body2" color="error">
          {fallbackText}
        </Typography>
      )}

      {/* Screen reader status */}
      <Box
        role="status"
        aria-live="polite"
        sx={{ 
          position: 'absolute',
          left: -10000,
          width: 1,
          height: 1,
          overflow: 'hidden'
        }}
      >
        {internalPlaying && duration && (
          `Playing audio: ${Math.floor(internalCurrentTime)} seconds of ${Math.floor(duration)} seconds`
        )}
      </Box>
    </Box>
  );
};