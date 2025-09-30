import React, { useState, useCallback } from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import type { BoxProps, SxProps, Theme } from '@mui/material';

export interface SegmentHighlightProps extends Omit<BoxProps, 'color' | 'onSelect'> {
  /** Content to highlight */
  children?: React.ReactNode;
  /** Highlight color theme */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  /** Type of highlight for semantic meaning */
  type?: 'vocabulary' | 'grammar' | 'difficulty' | 'custom';
  /** Highlight intensity */
  intensity?: 'light' | 'medium' | 'strong';
  /** Border radius variant */
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  /** Whether the highlight is selected */
  selected?: boolean;
  /** Whether the highlight is selectable */
  selectable?: boolean;
  /** Whether the highlight is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Hover handler */
  onHover?: (event: React.MouseEvent) => void;
  /** Mouse leave handler */
  onLeave?: (event: React.MouseEvent) => void;
  /** Selection change handler */
  onSelect?: (selected: boolean) => void;
  /** Custom styles */
  sx?: SxProps<Theme>;
}

export const SegmentHighlight: React.FC<SegmentHighlightProps> = ({
  children,
  color = 'default',
  type = 'custom',
  intensity = 'medium',
  borderRadius = 'small',
  selected = false,
  selectable = false,
  disabled = false,
  onClick,
  onHover,
  onLeave,
  onSelect,
  sx = {},
  ...boxProps
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [internalSelected, setInternalSelected] = useState(selected);

  // Get color based on theme and color prop
  const getHighlightColor = useCallback(() => {
    if (color === 'default') {
      return theme.palette.warning.main; // Default yellow highlight
    }
    return theme.palette[color].main;
  }, [color, theme.palette]);

  // Get background color with intensity
  const getBackgroundColor = useCallback(() => {
    const baseColor = getHighlightColor();
    const alphaValues = {
      light: 0.1,
      medium: 0.2,
      strong: 0.3,
    };
    
    let alphaValue = alphaValues[intensity];
    
    if (internalSelected) {
      alphaValue = Math.min(alphaValue * 1.5, 0.4);
    }
    
    if (isHovered && !disabled) {
      alphaValue = Math.min(alphaValue * 1.2, 0.5);
    }
    
    if (disabled) {
      alphaValue = alphaValue * 0.5;
    }
    
    return alpha(baseColor, alphaValue);
  }, [getHighlightColor, intensity, internalSelected, isHovered, disabled]);

  // Get border radius value
  const getBorderRadius = useCallback(() => {
    const radiusMap = {
      none: 0,
      small: theme.spacing(0.5),
      medium: theme.spacing(1),
      large: theme.spacing(1.5),
    };
    return radiusMap[borderRadius];
  }, [borderRadius, theme]);

  // Handle click events
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    if (selectable && onSelect) {
      const newSelected = !internalSelected;
      setInternalSelected(newSelected);
      onSelect(newSelected);
    }
    
    if (onClick) {
      onClick(event);
    }
  }, [disabled, selectable, internalSelected, onSelect, onClick]);

  // Handle hover events
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    setIsHovered(true);
    if (onHover) {
      onHover(event);
    }
  }, [disabled, onHover]);

  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    setIsHovered(false);
    if (onLeave) {
      onLeave(event);
    }
  }, [disabled, onLeave]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event as unknown as React.MouseEvent);
      }
      if (selectable && onSelect) {
        const newSelected = !internalSelected;
        setInternalSelected(newSelected);
        onSelect(newSelected);
      }
    }
  }, [disabled, onClick, selectable, internalSelected, onSelect]);

  // Determine if interactive
  const isInteractive = !disabled && (onClick || onHover || selectable);

  // Create CSS classes for states
  const stateClasses = [
    internalSelected && 'selected',
    isHovered && 'hover',
    disabled && 'disabled',
  ].filter(Boolean).join(' ');

  return (
    <Box
      component="mark"
      data-highlight-type={type}
      data-intensity={intensity}
      className={stateClasses}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      aria-selected={selectable ? internalSelected : undefined}
      sx={{
        display: 'inline',
        backgroundColor: getBackgroundColor(),
        borderRadius: getBorderRadius(),
        padding: theme.spacing(0.25, 0.5), // Small padding for better visual separation
        cursor: isInteractive ? 'pointer' : 'inherit',
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        '&.selected': {
          boxShadow: `0 0 0 1px ${alpha(getHighlightColor(), 0.5)}`,
        },
        ...sx,
      }}
      {...boxProps}
    >
      {children}
    </Box>
  );
};