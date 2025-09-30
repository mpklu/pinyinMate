import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DifficultyBadge, type DifficultyLevel } from '../../../../src/components/atoms/DifficultyBadge';

const theme = createTheme();

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('DifficultyBadge Component', () => {
  describe('Visual Rendering', () => {
    it('should render beginner difficulty correctly', () => {
      renderWithTheme(<DifficultyBadge level="beginner" />);
      
      expect(screen.getByText('Beginner')).toBeInTheDocument();
    });

    it('should render intermediate difficulty correctly', () => {
      renderWithTheme(<DifficultyBadge level="intermediate" />);
      
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });

    it('should render advanced difficulty correctly', () => {
      renderWithTheme(<DifficultyBadge level="advanced" />);
      
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('should render expert difficulty correctly', () => {
      renderWithTheme(<DifficultyBadge level="expert" />);
      
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    it('should display custom labels when provided', () => {
      renderWithTheme(<DifficultyBadge level="beginner" label="Easy" />);
      
      expect(screen.getByText('Easy')).toBeInTheDocument();
    });
  });

  describe('Color and Theming', () => {
    it('should apply different colors for different difficulty levels', () => {
      const { rerender } = renderWithTheme(<DifficultyBadge level="beginner" />);
      let badge = screen.getByText('Beginner').closest('.MuiChip-root');
      
      // Beginner should have success color (green-ish)
      expect(badge).toHaveClass('MuiChip-colorSuccess');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="intermediate" />
        </ThemeProvider>
      );
      badge = screen.getByText('Intermediate').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-colorInfo');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="advanced" />
        </ThemeProvider>
      );
      badge = screen.getByText('Advanced').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-colorWarning');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="expert" />
        </ThemeProvider>
      );
      badge = screen.getByText('Expert').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-colorError');
    });

    it('should support different variants', () => {
      const { rerender } = renderWithTheme(
        <DifficultyBadge level="beginner" variant="filled" />
      );
      
      let badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-filled');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="beginner" variant="outlined" />
        </ThemeProvider>
      );
      badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-outlined');
    });

    it('should support different sizes', () => {
      const { rerender } = renderWithTheme(
        <DifficultyBadge level="beginner" size="small" />
      );
      
      let badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-sizeSmall');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="beginner" size="medium" />
        </ThemeProvider>
      );
      badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toHaveClass('MuiChip-sizeMedium');
    });

    it('should apply custom styles', () => {
      renderWithTheme(
        <DifficultyBadge 
          level="beginner" 
          sx={{ backgroundColor: 'purple' }} 
        />
      );
      
      const badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Icons and Visual Elements', () => {
    it('should show icons when showIcon is true', () => {
      renderWithTheme(<DifficultyBadge level="beginner" showIcon />);
      
      const badge = screen.getByText('Beginner').closest('.MuiChip-root');
      const icon = badge?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should hide icons when showIcon is false', () => {
      renderWithTheme(<DifficultyBadge level="beginner" showIcon={false} />);
      
      const badge = screen.getByText('Beginner').closest('.MuiChip-root');
      const icon = badge?.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should use different icons for different difficulty levels', () => {
      const { rerender } = renderWithTheme(
        <DifficultyBadge level="beginner" showIcon />
      );
      
      let badge = screen.getByText('Beginner').closest('.MuiChip-root');
      let icon = badge?.querySelector('svg');
      expect(icon).toHaveAttribute('data-testid', 'StarBorderIcon');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="intermediate" showIcon />
        </ThemeProvider>
      );
      badge = screen.getByText('Intermediate').closest('.MuiChip-root');
      icon = badge?.querySelector('svg');
      expect(icon).toHaveAttribute('data-testid', 'StarHalfIcon');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="advanced" showIcon />
        </ThemeProvider>
      );
      badge = screen.getByText('Advanced').closest('.MuiChip-root');
      icon = badge?.querySelector('svg');
      expect(icon).toHaveAttribute('data-testid', 'StarIcon');
      
      rerender(
        <ThemeProvider theme={theme}>
          <DifficultyBadge level="expert" showIcon />
        </ThemeProvider>
      );
      badge = screen.getByText('Expert').closest('.MuiChip-root');
      icon = badge?.querySelector('svg');
      expect(icon).toHaveAttribute('data-testid', 'AutoAwesomeIcon');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(<DifficultyBadge level="intermediate" />);
      
      const badge = screen.getByText('Intermediate').closest('.MuiChip-root');

      expect(badge).toHaveAttribute('aria-label');
    });

    it('should have accessible description', () => {
      renderWithTheme(<DifficultyBadge level="beginner" />);
      
      const badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toHaveAttribute('aria-label', 'Difficulty level: Beginner');
    });

    it('should support custom aria-label', () => {
      renderWithTheme(
        <DifficultyBadge 
          level="advanced" 
          aria-label="Custom difficulty description" 
        />
      );
      
      const badge = screen.getByText('Advanced').closest('.MuiChip-root');
      expect(badge).toHaveAttribute('aria-label', 'Custom difficulty description');
    });

    it('should be focusable when clickable', () => {
      const handleClick = () => {};
      
      renderWithTheme(
        <DifficultyBadge level="beginner" onClick={handleClick} />
      );
      
      const badge = screen.getByText('Beginner').closest('.MuiChip-root');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      
      renderWithTheme(
        <DifficultyBadge level="beginner" onClick={handleClick} />
      );
      
      const badge = screen.getByText('Beginner');
      fireEvent.click(badge);
      
      expect(handleClick).toHaveBeenCalledWith('beginner');
    });

    it('should handle keyboard navigation', () => {
      const handleClick = vi.fn();
      
      renderWithTheme(
        <DifficultyBadge level="intermediate" onClick={handleClick} />
      );
      
      const badge = screen.getByText('Intermediate');
      fireEvent.keyDown(badge, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledWith('intermediate');
    });

    it('should handle space key activation', () => {
      const handleClick = vi.fn();
      
      renderWithTheme(
        <DifficultyBadge level="advanced" onClick={handleClick} />
      );
      
      const badge = screen.getByText('Advanced');
      fireEvent.keyDown(badge, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalledWith('advanced');
    });

    it('should not be clickable when no onClick is provided', () => {
      renderWithTheme(<DifficultyBadge level="beginner" />);
      
      const badge = screen.getByText('Beginner');
      expect(badge).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined level gracefully', () => {
      renderWithTheme(<DifficultyBadge level={null as unknown as DifficultyLevel} />);
      
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle invalid level gracefully', () => {
      renderWithTheme(<DifficultyBadge level={"invalid" as unknown as DifficultyLevel} />);
      
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle empty label gracefully', () => {
      renderWithTheme(<DifficultyBadge level="beginner" label="" />);
      
      expect(screen.getByText('Beginner')).toBeInTheDocument();
    });

    it('should handle very long labels', () => {
      const longLabel = 'This is a very long difficulty label that should be handled properly';
      
      renderWithTheme(<DifficultyBadge level="beginner" label={longLabel} />);
      
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly with minimal DOM updates', () => {
      const startTime = performance.now();
      
      renderWithTheme(<DifficultyBadge level="beginner" />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should render in less than 50ms
    });

    it('should handle rapid level changes efficiently', () => {
      const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
      const { rerender } = renderWithTheme(<DifficultyBadge level="beginner" />);
      
      levels.forEach(level => {
        rerender(
          <ThemeProvider theme={theme}>
            <DifficultyBadge level={level} />
          </ThemeProvider>
        );
        expect(screen.getByText(level.charAt(0).toUpperCase() + level.slice(1))).toBeInTheDocument();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should work well in lists', () => {
      const difficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      renderWithTheme(
        <div>
          {difficulties.map(level => (
            <DifficultyBadge key={level} level={level} />
          ))}
        </div>
      );
      
      difficulties.forEach(level => {
        const expectedText = level.charAt(0).toUpperCase() + level.slice(1);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    it('should support tooltip integration', () => {
      renderWithTheme(
        <div title="Difficulty indicator">
          <DifficultyBadge level="intermediate" />
        </div>
      );
      
      const container = screen.getByTitle('Difficulty indicator');
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });
  });
});