/**
 * TDD Contract tests for LibrarySourceToggle atomic component
 * Tests toggle switch functionality, visual states, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../src/theme/theme';

// Import component (will fail initially - TDD approach)
import { LibrarySourceToggle } from '../../../../src/components/atoms/LibrarySourceToggle';

// Test wrapper with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LibrarySourceToggle Component', () => {
  describe('Visual Rendering', () => {
    it('should render with default "Local" state', () => {
      renderWithTheme(<LibrarySourceToggle />);
      
      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByText('Local')).toBeInTheDocument();
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('should show "Remote" when toggled on', () => {
      renderWithTheme(<LibrarySourceToggle value="remote" />);
      
      expect(screen.getByText('Remote')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('should display custom labels when provided', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          localLabel="Device Storage"
          remoteLabel="Cloud Library"
        />
      );
      
      expect(screen.getByText('Device Storage')).toBeInTheDocument();
    });

    it('should show toggle switch with proper styling', () => {
      renderWithTheme(<LibrarySourceToggle />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('MuiSwitch-input');
    });

    it('should display descriptive text when provided', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          description="Choose between local device storage or remote cloud library"
        />
      );
      
      expect(screen.getByText('Choose between local device storage or remote cloud library')).toBeInTheDocument();
    });
  });

  describe('Toggle Behavior', () => {
    it('should call onChange when toggled', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <LibrarySourceToggle 
          value="local"
          onChange={handleChange}
        />
      );
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(handleChange).toHaveBeenCalledWith('remote');
    });

    it('should toggle from remote to local', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <LibrarySourceToggle 
          value="remote"
          onChange={handleChange}
        />
      );
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(handleChange).toHaveBeenCalledWith('local');
    });

    it('should handle controlled state changes', () => {
      const { rerender } = renderWithTheme(
        <LibrarySourceToggle value="local" />
      );
      
      expect(screen.getByText('Local')).toBeInTheDocument();
      expect(screen.getByRole('switch')).not.toBeChecked();
      
      rerender(
        <ThemeProvider theme={theme}>
          <LibrarySourceToggle value="remote" />
        </ThemeProvider>
      );
      
      expect(screen.getByText('Remote')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('should work in uncontrolled mode', () => {
      renderWithTheme(<LibrarySourceToggle />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
      
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();
    });
  });

  describe('Loading and Status States', () => {
    it('should show loading state when switching', () => {
      renderWithTheme(<LibrarySourceToggle loading />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show sync status indicator', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          syncStatus="syncing"
          value="remote"
        />
      );
      
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });

    it('should show error status', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          syncStatus="error"
          value="remote"
        />
      );
      
      expect(screen.getByText('Sync Error')).toBeInTheDocument();
    });

    it('should show success status', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          syncStatus="success"
          value="remote"
        />
      );
      
      expect(screen.getByText('Synced')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should show disabled state', () => {
      renderWithTheme(<LibrarySourceToggle disabled />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    });

    it('should apply size variants', () => {
      renderWithTheme(<LibrarySourceToggle size="small" />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle.parentElement).toHaveClass('MuiSwitch-sizeSmall');
    });

    it('should apply color variants', () => {
      renderWithTheme(<LibrarySourceToggle color="secondary" />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle.parentElement).toHaveClass('MuiSwitch-colorSecondary');
    });

    it('should show compact layout when specified', () => {
      renderWithTheme(<LibrarySourceToggle compact />);
      
      // Should not show descriptive labels, only icons or minimal text
      expect(screen.queryByText('Local Library')).not.toBeInTheDocument();
    });
  });

  describe('Icons and Visual Indicators', () => {
    it('should show local storage icon for local source', () => {
      renderWithTheme(<LibrarySourceToggle value="local" showIcons />);
      
      expect(screen.getByTestId('StorageIcon')).toBeInTheDocument();
    });

    it('should show cloud icon for remote source', () => {
      renderWithTheme(<LibrarySourceToggle value="remote" showIcons />);
      
      expect(screen.getByTestId('CloudIcon')).toBeInTheDocument();
    });

    it('should show both icons in toggle view', () => {
      renderWithTheme(<LibrarySourceToggle showIcons />);
      
      expect(screen.getByTestId('StorageIcon')).toBeInTheDocument();
      expect(screen.getByTestId('CloudIcon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          value="local"
          description="Toggle between local and remote library"
        />
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      expect(toggle).toHaveAttribute('aria-describedby');
    });

    it('should have accessible labels', () => {
      renderWithTheme(<LibrarySourceToggle />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAccessibleName();
    });

    it('should be keyboard accessible', () => {
      const handleChange = vi.fn();
      renderWithTheme(<LibrarySourceToggle onChange={handleChange} />);
      
      const toggle = screen.getByRole('switch');
      toggle.focus();
      expect(toggle).toHaveFocus();
      
      fireEvent.keyDown(toggle, { key: ' ' });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should have proper tabindex', () => {
      renderWithTheme(<LibrarySourceToggle />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('tabIndex', '0');
    });

    it('should support screen reader announcements', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          value="local"
          description="Currently using local device storage"
        />
      );
      
      expect(screen.getByText('Currently using local device storage')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined value gracefully', () => {
      renderWithTheme(<LibrarySourceToggle value={undefined} />);
      
      // Should default to local
      expect(screen.getByText('Local')).toBeInTheDocument();
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('should handle invalid value gracefully', () => {
      renderWithTheme(<LibrarySourceToggle value={'invalid' as 'local' | 'remote'} />);
      
      // Should default to local
      expect(screen.getByText('Local')).toBeInTheDocument();
    });

    it('should handle missing onChange gracefully', () => {
      renderWithTheme(<LibrarySourceToggle />);
      
      const toggle = screen.getByRole('switch');
      expect(() => fireEvent.click(toggle)).not.toThrow();
    });

    it('should prevent interaction when loading', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <LibrarySourceToggle 
          loading
          onChange={handleChange}
        />
      );
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle rapid toggle attempts', () => {
      const handleChange = vi.fn();
      renderWithTheme(<LibrarySourceToggle onChange={handleChange} />);
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      
      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with form validation', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          error
          helperText="Remote source is currently unavailable"
        />
      );
      
      expect(screen.getByText('Remote source is currently unavailable')).toBeInTheDocument();
    });

    it('should support tooltip for additional context', () => {
      renderWithTheme(
        <LibrarySourceToggle 
          tooltip="Local: Faster access, limited lessons. Remote: Full library, requires internet."
        />
      );
      
      const toggle = screen.getByRole('switch');
      fireEvent.mouseEnter(toggle);
      
      expect(screen.getByText(/Local: Faster access/)).toBeInTheDocument();
    });

    it('should handle connection status changes', () => {
      const { rerender } = renderWithTheme(
        <LibrarySourceToggle 
          value="remote"
          syncStatus="success"
        />
      );
      
      expect(screen.getByText('Synced')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <LibrarySourceToggle 
            value="remote"
            syncStatus="error"
          />
        </ThemeProvider>
      );
      
      expect(screen.getByText('Sync Error')).toBeInTheDocument();
    });
  });
});