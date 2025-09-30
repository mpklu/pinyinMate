import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Box, 
  Tooltip, 
  Typography, 
  IconButton, 
  Divider,

  useTheme 
} from '@mui/material';
import { VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import type { SxProps, Theme } from '@mui/material';

export interface VocabularyData {
  /** Chinese word or phrase */
  word?: string;
  /** Pinyin pronunciation */
  pinyin?: string;
  /** English definition */
  definition?: string;
  /** Example sentence in Chinese */
  example?: string;
  /** Example sentence translation */
  exampleTranslation?: string;
  /** Audio file URL for pronunciation */
  pronunciation?: string;
}

interface VocabularyTooltipProps {
  /** The child element that triggers the tooltip */
  children: React.ReactNode;
  /** Vocabulary data to display in the tooltip */
  vocabulary: VocabularyData;
  /** Placement of the tooltip */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to show arrow on tooltip */
  arrow?: boolean;
  /** Callback for pronunciation button click */
  onPronounce?: (word: string) => void;
  /** Custom styles for the tooltip container */
  sx?: SxProps<Theme>;
  /** Custom styles for the trigger element */
  triggerSx?: SxProps<Theme>;
  /** Whether tooltip should be interactive */
  interactive?: boolean;
}

export const VocabularyTooltip: React.FC<VocabularyTooltipProps> = ({
  children,
  vocabulary,
  placement = 'top',
  arrow = true,
  onPronounce,
  sx,
  triggerSx,
  interactive = true
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const id = useMemo(() => `vocabulary-tooltip-${Math.random().toString(36).substring(2)}`, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  // Handle clicks outside to close tooltip
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (anchorEl && !anchorEl.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, anchorEl]);

  const handlePronounce = useCallback(() => {
    if (onPronounce && vocabulary.word) {
      onPronounce(vocabulary.word);
    }
  }, [onPronounce, vocabulary.word]);

  const tooltipContent = (
    <>
      {/* Main word */}
      {vocabulary.word && (
        <Typography variant="h6" component="h6" className="vocabulary-word" sx={{ mb: 1, fontWeight: 'bold' }}>
          {vocabulary.word}
        </Typography>
      )}
      
      {/* Pinyin */}
      {vocabulary.pinyin && (
        <Typography variant="body2" className="pinyin" sx={{ mb: 1, fontStyle: 'italic', color: theme.palette.text.secondary }}>
          {vocabulary.pinyin}
        </Typography>
      )}
      
      {/* Definition */}
      {vocabulary.definition && (
        <Typography variant="body2" className="definition" sx={{ mb: 1 }}>
          {vocabulary.definition}
        </Typography>
      )}
      
      {/* Example */}
      {vocabulary.example && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" className="example" sx={{ mb: 0.5, fontWeight: 500 }}>
            {vocabulary.example}
          </Typography>
          {vocabulary.exampleTranslation && (
            <Typography variant="caption" className="example-translation" sx={{ color: theme.palette.text.secondary }}>
              {vocabulary.exampleTranslation}
            </Typography>
          )}
        </>
      )}
      
      {/* Pronunciation button */}
      {(onPronounce && vocabulary.word) && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton 
            size="small" 
            onClick={handlePronounce}
            aria-label={`Pronounce ${vocabulary.word}`}
            className="pronunciation-button"
          >
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </>
  );

  return (
    <Tooltip
      title={
        <Box
          id={id}
          aria-live="polite"
          sx={{
            p: 2,
            minWidth: 200,
            maxWidth: 300,
            ...sx
          }}
        >
          {tooltipContent}
        </Box>
      }
      placement={placement}
      arrow={arrow}
      open={open}
      onClose={handleClose}
      disableInteractive={!interactive}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
              },
            },
          ],
        },
      }}
    >
      <Box
        component="span"
        onClick={handleOpen}
        onMouseEnter={handleOpen}
        onFocus={handleOpen}
        onMouseLeave={handleClose}
        onBlur={handleClose}
        tabIndex={0}
        aria-describedby={open ? id : undefined}

        aria-label={`Show definition for ${vocabulary.word || 'word'}`}
        sx={{
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          ...triggerSx
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

export default VocabularyTooltip;