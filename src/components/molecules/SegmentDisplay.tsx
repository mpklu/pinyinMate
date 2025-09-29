/**
 * SegmentDisplay - Molecular component
 * Displays Chinese text segments with pinyin, definitions, and interactive features
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  styled,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  ExpandMore as ExpandMoreIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import { Card } from '../atoms';
import type { TextSegment } from '../../types';

export interface SegmentDisplayProps {
  /**
   * Text segment data
   */
  segment: TextSegment;
  /**
   * Show pinyin
   */
  showPinyin?: boolean;
  /**
   * Show tone marks
   */
  showToneMarks?: boolean;
  /**
   * Show definition
   */
  showDefinition?: boolean;
  /**
   * Interactive mode (clickable)
   */
  interactive?: boolean;
  /**
   * Selected state
   */
  selected?: boolean;
  /**
   * Bookmarked state
   */
  bookmarked?: boolean;
  /**
   * Click handler
   */
  onClick?: (segment: TextSegment) => void;
  /**
   * Audio play handler
   */
  onPlayAudio?: (segment: TextSegment) => void;
  /**
   * Bookmark toggle handler
   */
  onToggleBookmark?: (segment: TextSegment) => void;
  /**
   * Display size
   */
  size?: 'small' | 'medium' | 'large';
}

const SegmentContainer = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: string }>(({ theme, size = 'medium' }) => {
  const sizeMap = {
    small: {
      padding: theme.spacing(1),
      fontSize: '0.875rem',
    },
    medium: {
      padding: theme.spacing(1.5),
      fontSize: '1rem',
    },
    large: {
      padding: theme.spacing(2),
      fontSize: '1.125rem',
    },
  };

  return {
    cursor: 'default',
    ...sizeMap[size as keyof typeof sizeMap],
  };
});

const ChineseText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: string }>(({ theme, size = 'medium' }) => {
  const fontSizeMap = {
    small: '1.25rem',
    medium: '1.5rem',
    large: '1.75rem',
  };

  return {
    fontWeight: 600,
    fontSize: fontSizeMap[size as keyof typeof fontSizeMap],
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
  };
});

const PinyinText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.primary.main,
  fontWeight: 500,
  marginTop: theme.spacing(0.5),
  fontFamily: 'monospace',
}));

const DefinitionText = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  lineHeight: 1.4,
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  minHeight: 32,
}));

const LeftActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const RightActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 20,
  '& .MuiChip-label': {
    padding: theme.spacing(0, 0.75),
  },
}));

/**
 * SegmentDisplay component for showing annotated Chinese text
 */
export const SegmentDisplay: React.FC<SegmentDisplayProps> = ({
  segment,
  showPinyin = true,
  showToneMarks = true,
  showDefinition = true,
  interactive = false,
  selected = false,
  bookmarked = false,
  onClick,
  onPlayAudio,
  onToggleBookmark,
  size = 'medium',
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback(() => {
    if (interactive && onClick) {
      onClick(segment);
    }
  }, [interactive, onClick, segment]);

  const handlePlayAudio = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onPlayAudio) {
      onPlayAudio(segment);
    }
  }, [onPlayAudio, segment]);

  const handleToggleBookmark = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(segment);
    }
  }, [onToggleBookmark, segment]);

  const handleExpandClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  let displayPinyin: string | null = null;
  if (showToneMarks && segment.toneMarks) {
    displayPinyin = segment.toneMarks;
  } else if (showPinyin && segment.pinyin) {
    displayPinyin = segment.pinyin;
  }

  const hasDefinition = showDefinition && segment.definition;
  const hasAudio = segment.audioUrl || onPlayAudio;

  return (
    <SegmentContainer
      size={size}
      onClick={handleClick}
      hoverable={interactive}
      selected={selected}
      padding="medium"
    >
      <ChineseText size={size} variant="h6">
        {segment.text}
      </ChineseText>

      {displayPinyin && (
        <PinyinText variant="body2">
          {displayPinyin}
        </PinyinText>
      )}

      <ActionBar>
        <LeftActions>
          {segment.position && (
            <StyledChip
              label={`Position: ${segment.position.start}-${segment.position.end}`}
              variant="outlined"
              size="small"
            />
          )}
        </LeftActions>

        <RightActions>
          {hasAudio && (
            <Tooltip title="Play pronunciation">
              <IconButton
                size="small"
                onClick={handlePlayAudio}
                color="primary"
              >
                <VolumeUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onToggleBookmark && (
            <Tooltip title={bookmarked ? "Remove bookmark" : "Add bookmark"}>
              <IconButton
                size="small"
                onClick={handleToggleBookmark}
                color={bookmarked ? "primary" : "default"}
              >
                {bookmarked ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}

          {hasDefinition && (
            <Tooltip title={expanded ? "Hide definition" : "Show definition"}>
              <IconButton
                size="small"
                onClick={handleExpandClick}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </RightActions>
      </ActionBar>

      {hasDefinition && (
        <Collapse in={expanded}>
          <DefinitionText variant="body2">
            {segment.definition}
          </DefinitionText>
        </Collapse>
      )}
    </SegmentContainer>
  );
};

export default SegmentDisplay;