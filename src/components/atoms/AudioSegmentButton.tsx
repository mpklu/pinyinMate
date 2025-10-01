/**
 * AudioSegmentButton - Clickable text segment with audio playback
 * Atomic component for interactive text segments that can play audio
 */

import React, { useState, useCallback, memo } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface AudioSegmentButtonProps {
  /** Unique identifier for the text segment */
  segmentId: string;
  
  /** Chinese text content */
  text: string;
  
  /** Pinyin pronunciation */
  pinyin?: string;
  
  /** Whether audio is ready to play */
  audioReady: boolean;
  
  /** Whether the segment is currently selected/highlighted */
  selected?: boolean;
  
  /** Whether the segment is clickable */
  clickable?: boolean;
  
  /** Callback when segment is clicked */
  onSegmentClick?: (segmentId: string) => void;
  
  /** Callback when audio play is requested */
  onPlayAudio?: (segmentId: string) => void;
  
  /** Optional tooltip content */
  tooltip?: string;
  
  /** Display size variant */
  size?: 'small' | 'medium' | 'large';
}

const AudioSegmentButtonComponent: React.FC<AudioSegmentButtonProps> = ({
  segmentId,
  text,
  pinyin,
  audioReady,
  selected = false,
  clickable = true,
  onSegmentClick,
  onPlayAudio,
  tooltip,
  size = 'medium'
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSegmentClick = useCallback(() => {
    if (clickable && onSegmentClick) {
      onSegmentClick(segmentId);
    }
  }, [clickable, onSegmentClick, segmentId]);

  const handleAudioClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent segment click
    if (audioReady && onPlayAudio) {
      setIsPlaying(true);
      onPlayAudio(segmentId);
      // Reset playing state after a short delay (audio feedback)
      setTimeout(() => setIsPlaying(false), 1000);
    }
  }, [audioReady, onPlayAudio, segmentId]);

  const getFontSize = () => {
    switch (size) {
      case 'small': return '0.875rem';
      case 'large': return '1.5rem';
      default: return '1rem';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'small' as const;
      case 'large': return 'large' as const;
      default: return 'medium' as const;
    }
  };

  const segmentContent = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        padding: theme.spacing(0.5, 1),
        borderRadius: theme.shape.borderRadius,
        cursor: clickable ? 'pointer' : 'default',
        backgroundColor: selected ? theme.palette.primary.light : 'transparent',
        color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
        border: `1px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': clickable ? {
          backgroundColor: selected ? theme.palette.primary.light : theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
        } : {},
      }}
      onClick={handleSegmentClick}
    >
      <Box>
        <Typography
          variant="body1"
          component="span"
          sx={{
            fontSize: getFontSize(),
            fontWeight: selected ? 'medium' : 'normal',
            lineHeight: 1.4,
          }}
        >
          {text}
        </Typography>
        {pinyin && (
          <Typography
            variant="caption"
            component="div"
            sx={{
              fontSize: `calc(${getFontSize()} * 0.75)`,
              color: selected ? 'inherit' : theme.palette.text.secondary,
              lineHeight: 1.2,
              marginTop: theme.spacing(0.25),
            }}
          >
            {pinyin}
          </Typography>
        )}
      </Box>
      
      {audioReady && (
        <IconButton
          size={getIconSize()}
          onClick={handleAudioClick}
          sx={{
            marginLeft: theme.spacing(0.5),
            color: 'inherit',
            opacity: isPlaying ? 1 : 0.7,
            '&:hover': {
              opacity: 1,
              backgroundColor: theme.palette.action.hover,
            },
          }}
          aria-label={`Play audio for ${text}`}
        >
          {isPlaying ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="top">
        {segmentContent}
      </Tooltip>
    );
  }

  return segmentContent;
};

// Memoized export for performance
export const AudioSegmentButton = memo(AudioSegmentButtonComponent);
export default AudioSegmentButton;