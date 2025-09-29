/**
 * AudioPlayer - Molecular component
 * Audio playback control with Chinese text-to-speech support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  styled,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  Forward10,
  Replay10,
} from '@mui/icons-material';

import { Card } from '../atoms/Card';
import { audioService } from '../../services/audioService';

// Styled components
const PlayerContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 280,
  maxWidth: 600,
}));

const ControlsSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

const InfoSection = styled(Box)({
  flex: 1,
  minWidth: 0,
  marginLeft: 8,
});

const TitleText = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const TimeDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  minWidth: 45,
}));

const ProgressContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
});

const VolumeControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  minWidth: 100,
});

export interface AudioPlayerProps {
  /** Audio source - URL or Chinese text for TTS */
  source: string;
  /** Type of audio source */
  sourceType?: 'url' | 'tts';
  /** Display title */
  title?: string;
  /** Show compact version */
  compact?: boolean;
  /** Show volume controls */
  showVolume?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Auto-play audio */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Playback rate */
  playbackRate?: number;
  /** Initial volume (0-1) */
  initialVolume?: number;
  /** Custom CSS class */
  className?: string;
  /** Callback when audio loads */
  onAudioLoad?: () => void;
  /** Callback when audio fails to load */
  onAudioError?: (error: Error) => void;
  /** Callback when playback ends */
  onPlaybackEnd?: () => void;
  /** Callback when play/pause state changes */
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  source,
  sourceType = 'url',
  title,
  compact = false,
  showVolume = true,
  showProgress = true,
  autoPlay = false,
  loop = false,
  playbackRate = 1,
  initialVolume = 0.8,
  className,
  onAudioLoad,
  onAudioError,
  onPlaybackEnd,
  onPlayStateChange,
}) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(initialVolume);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle TTS playback
  const handleTTSPlayback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await audioService.synthesize({
        text: source,
        options: {
          speed: playbackRate,
          voice: 'female',
        },
      });

      if (result.success && result.data) {
        // For Web Speech API, playback happens immediately
        setIsPlaying(true);
        onPlayStateChange?.(true);
        
        // Simulate duration for UI
        const estimatedDuration = source.length * 0.1;
        setTimeout(() => {
          setIsPlaying(false);
          onPlayStateChange?.(false);
          onPlaybackEnd?.();
        }, estimatedDuration * 1000);
      } else {
        const error = new Error(result.error || 'TTS synthesis failed');
        setError(error.message);
        onAudioError?.(error);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('TTS playback failed');
      setError(error.message);
      onAudioError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [source, playbackRate, onPlayStateChange, onPlaybackEnd, onAudioError]);

  // Handle audio file playback
  const handleAudioPlayback = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Audio playback failed');
      setError(error.message);
      onAudioError?.(error);
    }
  }, [isPlaying, onAudioError]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (sourceType === 'tts') {
      if (isPlaying) {
        // Stop TTS (Web Speech API)
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        onPlayStateChange?.(false);
      } else {
        await handleTTSPlayback();
      }
    } else {
      await handleAudioPlayback();
    }
  }, [sourceType, isPlaying, onPlayStateChange, handleTTSPlayback, handleAudioPlayback]);

  // Handle stop
  const handleStop = useCallback(() => {
    if (sourceType === 'tts') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    onPlayStateChange?.(false);
  }, [sourceType, onPlayStateChange]);

  // Handle seek
  const handleSeek = useCallback((_event: Event, newValue: number | number[]) => {
    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    if (audioRef.current && sourceType === 'url') {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [sourceType]);

  // Handle skip forward/backward
  const handleSkip = useCallback((seconds: number) => {
    if (audioRef.current && sourceType === 'url') {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [sourceType, currentTime, duration]);

  // Handle volume change
  const handleVolumeChange = useCallback((_event: Event, newValue: number | number[]) => {
    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume || 0.5);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  }, [isMuted, volume, previousVolume]);

  // Get volume icon
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeMute />;
    if (volume < 0.5) return <VolumeDown />;
    return <VolumeUp />;
  };

  // Audio element event handlers
  const handleAudioLoad = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setError(null);
      onAudioLoad?.();
    }
  }, [onAudioLoad]);

  const handleAudioError = useCallback(() => {
    const error = new Error('Failed to load audio');
    setError(error.message);
    onAudioError?.(error);
  }, [onAudioError]);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true);
    onPlayStateChange?.(true);
  }, [onPlayStateChange]);

  const handleAudioPause = useCallback(() => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onPlayStateChange?.(false);
    onPlaybackEnd?.();
  }, [onPlayStateChange, onPlaybackEnd]);

  // Effects
  useEffect(() => {
    if (sourceType === 'url' && source) {
      const audio = new Audio(source);
      audio.volume = volume;
      audio.loop = loop;
      audio.playbackRate = playbackRate;
      
      audio.addEventListener('loadedmetadata', handleAudioLoad);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('timeupdate', handleAudioTimeUpdate);
      audio.addEventListener('play', handleAudioPlay);
      audio.addEventListener('pause', handleAudioPause);
      audio.addEventListener('ended', handleAudioEnded);
      
      audioRef.current = audio;
      
      if (autoPlay) {
        audio.play().catch(err => {
          const error = err instanceof Error ? err : new Error('Auto-play failed');
          setError(error.message);
          onAudioError?.(error);
        });
      }
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleAudioLoad);
        audio.removeEventListener('error', handleAudioError);
        audio.removeEventListener('timeupdate', handleAudioTimeUpdate);
        audio.removeEventListener('play', handleAudioPlay);
        audio.removeEventListener('pause', handleAudioPause);
        audio.removeEventListener('ended', handleAudioEnded);
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [
    sourceType,
    source,
    volume,
    loop,
    playbackRate,
    autoPlay,
    handleAudioLoad,
    handleAudioError,
    handleAudioTimeUpdate,
    handleAudioPlay,
    handleAudioPause,
    handleAudioEnded,
    onAudioError,
  ]);

  // Update volume when prop changes
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume;
    }
  }, [volume, isMuted]);

  if (error) {
    return (
      <PlayerContainer className={className} variant="outlined">
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      </PlayerContainer>
    );
  }

  return (
    <PlayerContainer className={className}>
      {/* Main controls */}
      <ControlsSection>
        <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
          <span>
            <IconButton
              onClick={handlePlayPause}
              disabled={isLoading}
              size={compact ? 'small' : 'medium'}
              sx={{ color: 'primary.main' }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </span>
        </Tooltip>

        {!compact && (
          <>
            <Tooltip title="Stop">
              <IconButton
                onClick={handleStop}
                disabled={isLoading}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <Stop />
              </IconButton>
            </Tooltip>

            {sourceType === 'url' && (
              <>
                <Tooltip title="Replay 10s">
                  <IconButton
                    onClick={() => handleSkip(-10)}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Replay10 />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Forward 10s">
                  <IconButton
                    onClick={() => handleSkip(10)}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Forward10 />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </>
        )}
      </ControlsSection>

      {/* Info and progress */}
      <InfoSection>
        {title && !compact && (
          <TitleText variant="body2" sx={{ mb: 0.5 }}>
            {title}
          </TitleText>
        )}

        {showProgress && sourceType === 'url' && duration > 0 && (
          <ProgressContainer>
            <TimeDisplay variant="caption">
              {formatTime(currentTime)}
            </TimeDisplay>
            
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              size="small"
              sx={{
                flex: 1,
                mx: 1,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            
            <TimeDisplay variant="caption">
              {formatTime(duration)}
            </TimeDisplay>
          </ProgressContainer>
        )}
      </InfoSection>

      {/* Volume controls */}
      {showVolume && sourceType === 'url' && (
        <VolumeControls>
          <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
            <IconButton onClick={handleMuteToggle} size="small">
              {getVolumeIcon()}
            </IconButton>
          </Tooltip>
          
          {!compact && (
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              size="small"
              sx={{
                width: 60,
                '& .MuiSlider-thumb': {
                  width: 10,
                  height: 10,
                },
              }}
            />
          )}
        </VolumeControls>
      )}
    </PlayerContainer>
  );
};