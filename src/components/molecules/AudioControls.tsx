/**
 * AudioControls - Comprehensive audio playback controls for lessons
 * Molecular component for managing lesson audio playback and segment navigation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  Repeat,
  RepeatOne,
  Speed
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { TextSegmentWithAudio } from '../../types';

export type RepeatMode = 'none' | 'all' | 'one';

export interface AudioControlsProps {
  /** Array of segments with audio */
  segments: TextSegmentWithAudio[];
  
  /** Currently active/playing segment index */
  currentSegmentIndex?: number;
  
  /** Whether audio is currently playing */
  isPlaying?: boolean;
  
  /** Current playback position (0-100) */
  playbackPosition?: number;
  
  /** Current volume (0-100) */
  volume?: number;
  
  /** Playback speed multiplier */
  playbackSpeed?: number;
  
  /** Repeat mode */
  repeatMode?: RepeatMode;
  
  /** Whether controls are disabled */
  disabled?: boolean;
  
  /** Display variant */
  variant?: 'full' | 'compact' | 'mini';
  
  /** Callback when play/pause is toggled */
  onPlayPause?: (isPlaying: boolean) => void;
  
  /** Callback when stop is pressed */
  onStop?: () => void;
  
  /** Callback when segment navigation occurs */
  onSegmentChange?: (segmentIndex: number) => void;
  
  /** Callback when playback position changes */
  onSeek?: (position: number) => void;
  
  /** Callback when volume changes */
  onVolumeChange?: (volume: number) => void;
  
  /** Callback when playback speed changes */
  onSpeedChange?: (speed: number) => void;
  
  /** Callback when repeat mode changes */
  onRepeatModeChange?: (mode: RepeatMode) => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const AudioControls: React.FC<AudioControlsProps> = ({
  segments,
  currentSegmentIndex = 0,
  isPlaying = false,
  playbackPosition = 0,
  volume = 100,
  playbackSpeed = 1,
  repeatMode = 'none',
  disabled = false,
  variant = 'full',
  onPlayPause,
  onStop,
  onSegmentChange,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onRepeatModeChange
}) => {
  const theme = useTheme();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSegment = segments[currentSegmentIndex];

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    if (onPlayPause) {
      onPlayPause(!isPlaying);
    }
  }, [isPlaying, onPlayPause]);

  const handleStop = useCallback(() => {
    if (onStop) {
      onStop();
    }
  }, [onStop]);

  const handlePrevious = useCallback(() => {
    if (onSegmentChange && currentSegmentIndex > 0) {
      onSegmentChange(currentSegmentIndex - 1);
    }
  }, [currentSegmentIndex, onSegmentChange]);

  const handleNext = useCallback(() => {
    if (onSegmentChange && currentSegmentIndex < segments.length - 1) {
      onSegmentChange(currentSegmentIndex + 1);
    }
  }, [currentSegmentIndex, segments.length, onSegmentChange]);

  const handleSeek = useCallback((_event: Event, newValue: number | number[]) => {
    const position = Array.isArray(newValue) ? newValue[0] : newValue;
    if (onSeek) {
      onSeek(position);
    }
  }, [onSeek]);

  const handleVolumeChange = useCallback((_event: Event, newValue: number | number[]) => {
    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  }, [onVolumeChange]);

  const handleVolumeClick = useCallback(() => {
    setShowVolumeSlider(!showVolumeSlider);
    
    // Auto-hide volume slider after 3 seconds
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 3000);
  }, [showVolumeSlider]);

  const handleSpeedChange = useCallback((event: { target: { value: number } }) => {
    const newSpeed = event.target.value;
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  }, [onSpeedChange]);

  const handleRepeatModeToggle = useCallback(() => {
    if (onRepeatModeChange) {
      let nextMode: RepeatMode;
      if (repeatMode === 'none') {
        nextMode = 'all';
      } else if (repeatMode === 'all') {
        nextMode = 'one';
      } else {
        nextMode = 'none';
      }
      onRepeatModeChange(nextMode);
    }
  }, [repeatMode, onRepeatModeChange]);

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeOff />;
    if (volume < 50) return <VolumeDown />;
    return <VolumeUp />;
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <RepeatOne />;
    return <Repeat />;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (variant === 'mini') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={handlePlayPause}
          disabled={disabled || !currentSegment?.audioReady}
          size="small"
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          {currentSegmentIndex + 1}/{segments.length}
        </Typography>
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Paper
        elevation={1}
        sx={{
          padding: theme.spacing(1),
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton
          onClick={handlePrevious}
          disabled={disabled || currentSegmentIndex === 0}
          size="small"
        >
          <SkipPrevious />
        </IconButton>
        
        <IconButton
          onClick={handlePlayPause}
          disabled={disabled || !currentSegment?.audioReady}
          color="primary"
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton
          onClick={handleNext}
          disabled={disabled || currentSegmentIndex === segments.length - 1}
          size="small"
        >
          <SkipNext />
        </IconButton>
        
        <Box sx={{ flexGrow: 1, mx: 2 }}>
          <Slider
            value={playbackPosition}
            onChange={handleSeek}
            disabled={disabled}
            size="small"
            sx={{ color: theme.palette.primary.main }}
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          {currentSegmentIndex + 1}/{segments.length}
        </Typography>
      </Paper>
    );
  }

  // Full variant (default)
  return (
    <Paper
      elevation={2}
      sx={{
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Current Segment Info */}
      <Box sx={{ marginBottom: theme.spacing(2) }}>
        <Typography variant="h6" gutterBottom>
          Segment {currentSegmentIndex + 1} of {segments.length}
        </Typography>
        {currentSegment && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentSegment.text}
          </Typography>
        )}
        {currentSegment?.audioReady ? (
          <Chip label="Audio Ready" color="success" size="small" sx={{ mt: 0.5 }} />
        ) : (
          <Chip label="Audio Loading..." color="warning" size="small" sx={{ mt: 0.5 }} />
        )}
      </Box>

      {/* Main Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton
          onClick={handlePrevious}
          disabled={disabled || currentSegmentIndex === 0}
        >
          <SkipPrevious />
        </IconButton>
        
        <IconButton
          onClick={handlePlayPause}
          disabled={disabled || !currentSegment?.audioReady}
          color="primary"
          size="large"
          sx={{
            backgroundColor: theme.palette.primary.light,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton
          onClick={handleStop}
          disabled={disabled}
        >
          <Stop />
        </IconButton>
        
        <IconButton
          onClick={handleNext}
          disabled={disabled || currentSegmentIndex === segments.length - 1}
        >
          <SkipNext />
        </IconButton>
      </Box>

      {/* Progress Slider */}
      <Box sx={{ mb: 2 }}>
        <Slider
          value={playbackPosition}
          onChange={handleSeek}
          disabled={disabled}
          sx={{
            color: theme.palette.primary.main,
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {formatTime((playbackPosition / 100) * 60)} {/* Assuming 60s max per segment */}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(60)} {/* Assuming 60s max per segment */}
          </Typography>
        </Box>
      </Box>

      {/* Additional Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <IconButton onClick={handleVolumeClick} size="small">
            {getVolumeIcon()}
          </IconButton>
          {showVolumeSlider && (
            <Box
              sx={{
                position: 'absolute',
                left: 40,
                bottom: 0,
                width: 100,
                zIndex: 1,
                backgroundColor: theme.palette.background.paper,
                padding: theme.spacing(1),
                borderRadius: 1,
                boxShadow: theme.shadows[3],
              }}
            >
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                orientation="horizontal"
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Speed Control */}
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Speed</InputLabel>
          <Select
            value={playbackSpeed}
            onChange={handleSpeedChange}
            label="Speed"
            startAdornment={<Speed sx={{ mr: 1, fontSize: '1rem' }} />}
          >
            {PLAYBACK_SPEEDS.map(speed => (
              <MenuItem key={speed} value={speed}>
                {speed}x
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Repeat Mode */}
        <Tooltip title={`Repeat: ${repeatMode}`}>
          <IconButton
            onClick={handleRepeatModeToggle}
            color={repeatMode !== 'none' ? 'primary' : 'default'}
            size="small"
          >
            {getRepeatIcon()}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default AudioControls;