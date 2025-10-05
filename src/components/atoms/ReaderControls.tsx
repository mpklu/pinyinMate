/**
 * ReaderControls - Atom Component
 * Control panel for reader mode settings (theme, pinyin, auto-scroll)
 */

import React from 'react';
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import {
  AutoStories as ReaderIcon,
  ViewColumn,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Contrast as ContrastIcon,
  Coffee as SepiaIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Speed as SpeedIcon,
  Palette as ColorsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type {
  ReaderControlsProps,
  PinyinDisplayMode,
  AutoScrollSpeed
} from '../../types/reader';

// Styled components
const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  flexWrap: 'wrap',
  minHeight: 56, // Standard toolbar height
}));

const ControlSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    padding: theme.spacing(0.5),
    minWidth: 'auto',
    height: 32,
    border: `1px solid ${theme.palette.divider}`,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  minWidth: 100,
  height: 32,
  '& .MuiSelect-select': {
    padding: theme.spacing(0.5, 1),
    fontSize: '0.875rem',
  },
}));

// Helper function to get auto-scroll icon
const getAutoScrollIcon = (enabled: boolean, paused: boolean) => {
  if (!enabled) return <SpeedIcon fontSize="small" />;
  return paused ? <PlayIcon fontSize="small" /> : <PauseIcon fontSize="small" />;
};

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  readerState,
  onToggleReaderMode,
  onThemeChange,
  onPinyinModeChange,
  onToggleToneColors,
  onToggleAutoScroll,
  onAutoScrollSpeedChange,
}) => {
  return (
    <ControlsContainer>
      {/* Reader Mode Toggle */}
      <ControlSection>
        <Tooltip title={readerState.isActive ? "Exit Reader Mode" : "Enter Reader Mode"}>
          <IconButton
            onClick={onToggleReaderMode}
            color={readerState.isActive ? "primary" : "default"}
            size="small"
          >
            {readerState.isActive ? <ViewColumn /> : <ReaderIcon />}
          </IconButton>
        </Tooltip>
        <Chip
          label={readerState.isActive ? "Reader" : "Lesson"}
          size="small"
          color={readerState.isActive ? "primary" : "default"}
          variant={readerState.isActive ? "filled" : "outlined"}
        />
      </ControlSection>

      {readerState.isActive && (
        <>
          <Divider orientation="vertical" flexItem />
          
          {/* Theme Selection */}
          <ControlSection>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Theme:
            </Typography>
            <StyledToggleButtonGroup
              value={readerState.theme}
              exclusive
              onChange={(_, value) => value && onThemeChange(value)}
              size="small"
            >
              <ToggleButton value="default">
                <Tooltip title="Light Theme">
                  <LightIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="dark">
                <Tooltip title="Dark Theme">
                  <DarkIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="sepia">
                <Tooltip title="Sepia Theme">
                  <SepiaIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="highContrast">
                <Tooltip title="High Contrast">
                  <ContrastIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </StyledToggleButtonGroup>
          </ControlSection>

          <Divider orientation="vertical" flexItem />

          {/* Pinyin Controls */}
          <ControlSection>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Pinyin:
            </Typography>
            <FormControl size="small">
              <StyledSelect
                value={readerState.pinyinMode}
                onChange={(e) => onPinyinModeChange(e.target.value as PinyinDisplayMode)}
                displayEmpty
              >
                <MenuItem value="hidden">Hidden</MenuItem>
                <MenuItem value="toneMarks">Tone Marks</MenuItem>
                <MenuItem value="numbers">Numbers</MenuItem>
              </StyledSelect>
            </FormControl>
            
            <Tooltip title="Toggle Tone Colors">
              <IconButton
                onClick={onToggleToneColors}
                color={readerState.showToneColors ? "primary" : "default"}
                size="small"
              >
                <ColorsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ControlSection>

          <Divider orientation="vertical" flexItem />

          {/* Auto-scroll Controls */}
          <ControlSection>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Auto-scroll:
            </Typography>
            <Tooltip title={readerState.autoScroll.enabled ? "Disable Auto-scroll" : "Enable Auto-scroll"}>
              <IconButton
                onClick={onToggleAutoScroll}
                color={readerState.autoScroll.enabled ? "primary" : "default"}
                size="small"
              >
                {getAutoScrollIcon(readerState.autoScroll.enabled, readerState.autoScroll.paused)}
              </IconButton>
            </Tooltip>
            
            {readerState.autoScroll.enabled && (
              <FormControl size="small">
                <StyledSelect
                  value={readerState.autoScroll.speed}
                  onChange={(e) => onAutoScrollSpeedChange(e.target.value as AutoScrollSpeed)}
                  startAdornment={<SpeedIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />}
                >
                  <MenuItem value={0.75}>0.75x</MenuItem>
                  <MenuItem value={1.0}>1.0x</MenuItem>
                  <MenuItem value={1.25}>1.25x</MenuItem>
                </StyledSelect>
              </FormControl>
            )}
          </ControlSection>

          <Divider orientation="vertical" flexItem />

          {/* Reading Progress */}
          <ControlSection>
            <Typography variant="caption" color="text.secondary">
              Progress:
            </Typography>
            <Chip
              label={`${readerState.progress.currentSegmentIndex + 1} / ${readerState.progress.totalSegments}`}
              size="small"
              variant="outlined"
              sx={{ 
                minWidth: 60,
                '& .MuiChip-label': {
                  fontSize: '0.75rem',
                }
              }}
            />
            <Typography variant="caption" color="primary" sx={{ ml: 0.5 }}>
              {Math.round(readerState.progress.progressPercentage)}%
            </Typography>
          </ControlSection>
        </>
      )}
    </ControlsContainer>
  );
};

export default ReaderControls;