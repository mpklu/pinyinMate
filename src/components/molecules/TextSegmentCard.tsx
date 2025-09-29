/**
 * TextSegmentCard component (Chinese + pinyin + definition)
 * Displays a Chinese text segment with its linguistic annotations
 */

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Card, 
  CardContent, 
  CardActions,
  Typography, 
  Box, 
  IconButton,
  Tooltip,
  Chip,
  Collapse,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,

  ContentCopy as CopyIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

import { ChineseText, PinyinText, AudioButton } from '../atoms';
import type { TextSegment } from '../../types/annotation';

interface TextSegmentCardProps {
  /** The text segment data */
  segment: TextSegment;
  /** Whether to show pinyin by default */
  showPinyin?: boolean;
  /** Whether to show definition by default */
  showDefinition?: boolean;
  /** Whether to show tone colors */
  showToneColors?: boolean;
  /** Whether the card is interactive */
  interactive?: boolean;
  /** Card variant */
  variant?: 'outlined' | 'elevation';
  /** Card size */
  size?: 'compact' | 'standard' | 'detailed';
  /** Whether to show audio button */
  showAudio?: boolean;
  /** Whether to show copy button */
  showCopyButton?: boolean;
  /** Click handler for the segment */
  onSegmentClick?: (segment: TextSegment) => void;
  /** Audio play handler */
  onAudioPlay?: (text: string) => void;
  /** Copy handler */
  onCopy?: (text: string) => void;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'cardSize' && prop !== 'interactive',
})<{ cardSize?: 'compact' | 'standard' | 'detailed'; interactive?: boolean }>(({ theme, cardSize = 'standard', interactive }) => ({
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  cursor: interactive ? 'pointer' : 'default',
  
  ...(cardSize === 'compact' && {
    '& .MuiCardContent-root': {
      padding: theme.spacing(1),
      '&:last-child': {
        paddingBottom: theme.spacing(1),
      },
    },
  }),
  
  ...(cardSize === 'detailed' && {
    '& .MuiCardContent-root': {
      padding: theme.spacing(2),
    },
  }),
  
  ...(interactive && {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),
}));

const StyledChineseSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const StyledPinyinSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const StyledDefinitionSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const StyledExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  marginLeft: 'auto',
}));

const StyledActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

/**
 * Text segment card component
 */
const TextSegmentCard: React.FC<TextSegmentCardProps> = ({
  segment,
  showPinyin = true,
  showDefinition = true,
  showToneColors = false,
  interactive = false,
  variant = 'outlined',
  size = 'standard',
  showAudio = true,
  showCopyButton = true,
  onSegmentClick,
  onAudioPlay,
  onCopy,
}) => {
  const [expanded, setExpanded] = useState(showDefinition);
  const [pinyinVisible] = useState(showPinyin);

  const handleCardClick = () => {
    if (interactive && onSegmentClick) {
      onSegmentClick(segment);
    }
  };

  const handleExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCopyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onCopy) {
      onCopy(segment.text);
    } else {
      // Default copy behavior
      navigator.clipboard?.writeText(segment.text);
    }
  };

  const handleAudioPlay = () => {
    if (onAudioPlay) {
      onAudioPlay(segment.text);
    }
  };

  const hasDefinition = Boolean(segment.definition);
  const hasAudio = Boolean(segment.audioUrl) || showAudio;

  return (
    <StyledCard 
      variant={variant}
      cardSize={size}
      interactive={interactive}
      onClick={handleCardClick}
    >
      <CardContent>
        {/* Chinese Text Section */}
        <StyledChineseSection>
          <ChineseText
            text={segment.text}
            showToneColors={showToneColors}
            variant={size === 'compact' ? 'body2' : 'h6'}
            interactive={false}
          />
          
          {size !== 'compact' && (
            <Chip
              label={`Pos: ${segment.position.start}-${segment.position.end}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </StyledChineseSection>

        {/* Pinyin Section */}
        {(segment.pinyin || segment.toneMarks) && (
          <StyledPinyinSection>
            <PinyinText
              pinyin={segment.toneMarks || segment.pinyin}
              showToneMarks={Boolean(segment.toneMarks)}
              initiallyVisible={pinyinVisible}
              showToggle={size !== 'compact'}
              size={size === 'compact' ? 'small' : 'medium'}
              color="primary"
            />
          </StyledPinyinSection>
        )}

        {/* Definition Section (Collapsible) */}
        {hasDefinition && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <StyledDefinitionSection>
              <Typography 
                variant={size === 'compact' ? 'caption' : 'body2'} 
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                {segment.definition}
              </Typography>
            </StyledDefinitionSection>
          </Collapse>
        )}
      </CardContent>

      {/* Action Buttons */}
      {(hasAudio || showCopyButton || hasDefinition) && (
        <CardActions disableSpacing>
          <StyledActionButtons>
            {/* Audio Button */}
            {hasAudio && (
              <AudioButton
                text={segment.text}
                audioUrl={segment.audioUrl}
                size="small"
                tooltip={`Play pronunciation of "${segment.text}"`}
                onPlay={handleAudioPlay}
              />
            )}

            {/* Copy Button */}
            {showCopyButton && (
              <Tooltip title="Copy to clipboard" arrow>
                <IconButton
                  size="small"
                  onClick={handleCopyClick}
                  aria-label="Copy text"
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Info Button */}
            {size === 'compact' && hasDefinition && (
              <Tooltip title="Show definition" arrow>
                <IconButton
                  size="small"
                  onClick={handleExpandClick}
                  aria-label="Show definition"
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </StyledActionButtons>

          {/* Expand Button for Definition */}
          {hasDefinition && size !== 'compact' && (
            <StyledExpandButton
              expanded={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="Show definition"
            >
              <ExpandMoreIcon />
            </StyledExpandButton>
          )}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default TextSegmentCard;
export type { TextSegmentCardProps };