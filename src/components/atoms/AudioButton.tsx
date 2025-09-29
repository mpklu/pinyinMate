/**
 * AudioButton component with playback controls
 * Provides audio playback functionality for Chinese text pronunciation
 */

import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { 
  VolumeUp, 
  PlayArrow, 
  Pause, 
  Error as ErrorIcon 
} from '@mui/icons-material';

interface AudioButtonProps {
  /** The text to synthesize and play */
  text: string;
  /** Optional audio URL if already generated */
  audioUrl?: string;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether to auto-play when component mounts */
  autoPlay?: boolean;
  /** Playback speed (0.5 to 2.0) */
  speed?: number;
  /** Custom tooltip text */
  tooltip?: string;
  /** Callback when audio starts playing */
  onPlay?: () => void;
  /** Callback when audio pauses */
  onPause?: () => void;
  /** Callback when audio ends */
  onEnd?: () => void;
  /** Callback when audio fails to load */
  onError?: (error: string) => void;
}

type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

const StyledAudioButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'audioState',
})<{ audioState: AudioState }>(({ theme, audioState }) => ({
  transition: theme.transitions.create(['color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  
  ...(audioState === 'playing' && {
    color: theme.palette.primary.main,
    transform: 'scale(1.1)',
  }),
  
  ...(audioState === 'error' && {
    color: theme.palette.error.main,
  }),
  
  ...(audioState === 'loading' && {
    color: theme.palette.action.disabled,
  }),
  
  '&:hover': {
    transform: audioState === 'playing' ? 'scale(1.15)' : 'scale(1.05)',
  },
  
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const LoadingContainer = styled('div')({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Hook for managing audio playback state
 */
const useAudioPlayback = (
  text: string,
  audioUrl: string | undefined,
  speed: number,
  onPlay?: () => void,
  onPause?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
) => {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadstart', handleLoadStart);
      audioRef.current.removeEventListener('canplay', handleCanPlay);
      audioRef.current.removeEventListener('play', handlePlay);
      audioRef.current.removeEventListener('pause', handlePause);
      audioRef.current.removeEventListener('ended', handleEnd);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current = null;
    }
    
    if (utteranceRef.current) {
      speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  };

  const handleLoadStart = () => setAudioState('loading');
  const handleCanPlay = () => setAudioState('idle');
  const handlePlay = () => {
    setAudioState('playing');
    onPlay?.();
  };
  const handlePause = () => {
    setAudioState('paused');
    onPause?.();
  };
  const handleEnd = () => {
    setAudioState('idle');
    onEnd?.();
  };
  const handleError = () => {
    setAudioState('error');
    onError?.('Audio playback failed');
  };

  const playAudio = async () => {
    try {
      cleanup();
      setAudioState('loading');

      // Try to use provided audio URL first
      if (audioUrl && audioUrl !== 'web-speech-synthesis' && audioUrl !== 'fallback-audio-placeholder') {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnd);
        audio.addEventListener('error', handleError);
        
        audio.playbackRate = speed;
        await audio.play();
        return;
      }

      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        
        // Try to find a Chinese voice
        const voices = speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => 
          voice.lang.startsWith('zh') || 
          voice.lang.startsWith('cmn') ||
          voice.name.toLowerCase().includes('chinese')
        );
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
          utterance.lang = chineseVoice.lang;
        } else {
          utterance.lang = 'zh-CN';
        }
        
        utterance.rate = speed;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = handlePlay;
        utterance.onend = handleEnd;
        utterance.onerror = (event) => {
          setAudioState('error');
          onError?.(`Speech synthesis failed: ${event.error}`);
        };
        
        speechSynthesis.speak(utterance);
        return;
      }

      throw new Error('No audio playback method available');
      
    } catch (error) {
      setAudioState('error');
      onError?.(error instanceof Error ? error.message : 'Unknown audio error');
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (utteranceRef.current) {
      speechSynthesis.pause();
      setAudioState('paused');
      onPause?.();
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    } else if (utteranceRef.current && speechSynthesis.paused) {
      speechSynthesis.resume();
      setAudioState('playing');
      onPlay?.();
    }
  };



  useEffect(() => {
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    audioState,
    playAudio,
    pauseAudio,
    resumeAudio,
  };
};

/**
 * Audio button component for playing Chinese text pronunciation
 */
const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  audioUrl,
  size = 'medium',
  disabled = false,
  autoPlay = false,
  speed = 1.0,
  tooltip,
  onPlay,
  onPause,
  onEnd,
  onError,
}) => {
  const {
    audioState,
    playAudio,
    pauseAudio,
    resumeAudio,
  } = useAudioPlayback(text, audioUrl, speed, onPlay, onPause, onEnd, onError);

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
  }, [text, autoPlay, playAudio]);

  const handleClick = () => {
    if (disabled) return;

    switch (audioState) {
      case 'idle':
      case 'error':
        playAudio();
        break;
      case 'playing':
        pauseAudio();
        break;
      case 'paused':
        resumeAudio();
        break;
      case 'loading':
        // Do nothing while loading
        break;
    }
  };

  const getIcon = () => {
    switch (audioState) {
      case 'loading': {
        let spinnerSize = 20;
        if (size === 'small') spinnerSize = 16;
        else if (size === 'large') spinnerSize = 24;
        return <CircularProgress size={spinnerSize} />;
      }
      case 'playing':
        return <Pause />;
      case 'paused':
        return <PlayArrow />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <VolumeUp />;
    }
  };

  const getTooltipText = () => {
    if (tooltip) return tooltip;
    
    switch (audioState) {
      case 'loading':
        return 'Loading audio...';
      case 'playing':
        return 'Pause audio';
      case 'paused':
        return 'Resume audio';
      case 'error':
        return 'Audio unavailable';
      default:
        return `Play pronunciation of "${text}"`;
    }
  };

  return (
    <Tooltip title={getTooltipText()} arrow>
      <span>
        <StyledAudioButton
          audioState={audioState}
          size={size}
          disabled={disabled || audioState === 'loading'}
          onClick={handleClick}
          aria-label={getTooltipText()}
        >
          {audioState === 'loading' ? (
            <LoadingContainer>
              {getIcon()}
            </LoadingContainer>
          ) : (
            getIcon()
          )}
        </StyledAudioButton>
      </span>
    </Tooltip>
  );
};

export default AudioButton;
export type { AudioButtonProps };