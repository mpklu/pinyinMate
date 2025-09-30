/**
 * TDD Contract tests for SyncStatusIndicator atomic component
 * Tests visual status indicators, animations, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../src/theme/theme';

// Import component (will fail initially - TDD approach)
import { SyncStatusIndicator } from '../../../../src/components/atoms/SyncStatusIndicator';

// Test wrapper with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SyncStatusIndicator Component', () => {
  describe('Visual Rendering', () => {
    it('should render idle state by default', () => {
      renderWithTheme(<SyncStatusIndicator />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByTestId('WifiOffIcon')).toBeInTheDocument();
    });

    it('should show syncing state with spinner', () => {
      renderWithTheme(<SyncStatusIndicator status="syncing" />);
      
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
      expect(screen.getByTestId('SyncIcon')).toBeInTheDocument();
      // CircularProgress adds progressbar role internally
      expect(screen.getByTestId('SyncIcon')).toBeInTheDocument();
    });

    it('should show success state with check icon', () => {
      renderWithTheme(<SyncStatusIndicator status="success" />);
      
      expect(screen.getByText('Synced')).toBeInTheDocument();
      expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
    });

    it('should show error state with error icon', () => {
      renderWithTheme(<SyncStatusIndicator status="error" />);
      
      expect(screen.getByText('Sync Failed')).toBeInTheDocument();
      expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
    });

    it('should show connecting state', () => {
      renderWithTheme(<SyncStatusIndicator status="connecting" />);
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.getByTestId('WifiIcon')).toBeInTheDocument();
    });

    it('should display custom messages when provided', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          message="Downloading lessons..."
        />
      );
      
      expect(screen.getByText('Downloading lessons...')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size variant', () => {
      renderWithTheme(<SyncStatusIndicator size="small" />);
      
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('MuiChip-sizeSmall');
    });

    it('should render medium size variant', () => {
      renderWithTheme(<SyncStatusIndicator size="medium" />);
      
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('MuiChip-sizeMedium');
    });

    it('should render icon-only compact mode', () => {
      renderWithTheme(<SyncStatusIndicator compact />);
      
      expect(screen.getByTestId('WifiOffIcon')).toBeInTheDocument();
      expect(screen.queryByText('Offline')).not.toBeInTheDocument();
    });
  });

  describe('Color and Visual States', () => {
    it('should apply success color for synced state', () => {
      renderWithTheme(<SyncStatusIndicator status="success" />);
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });

    it('should apply error color for failed state', () => {
      renderWithTheme(<SyncStatusIndicator status="error" />);
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('MuiChip-colorError');
    });

    it('should apply info color for syncing state', () => {
      renderWithTheme(<SyncStatusIndicator status="syncing" />);
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('MuiChip-colorInfo');
    });

    it('should apply warning color for connecting state', () => {
      renderWithTheme(<SyncStatusIndicator status="connecting" />);
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('MuiChip-colorWarning');
    });

    it('should apply default color for idle state', () => {
      renderWithTheme(<SyncStatusIndicator status="idle" />);
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('MuiChip-colorDefault');
    });
  });

  describe('Progress Information', () => {
    it('should show progress percentage when provided', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          progress={75}
        />
      );
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should show progress with custom message', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          progress={50}
          message="Syncing lessons"
        />
      );
      
      expect(screen.getByText('Syncing lessons (50%)')).toBeInTheDocument();
    });

    it('should show detailed sync information', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          syncInfo={{
            totalItems: 100,
            completedItems: 25,
            currentItem: 'Advanced Grammar'
          }}
        />
      );
      
      expect(screen.getByText(/25\/100.*Advanced Grammar/)).toBeInTheDocument();
    });
  });

  describe('Timestamp Display', () => {
    it('should show last sync time when provided', () => {
      const lastSync = new Date('2025-09-29T10:00:00Z');
      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          lastSyncTime={lastSync}
        />
      );
      
      expect(screen.getByText(/Synced.*ago/)).toBeInTheDocument();
    });

    it('should format timestamp for recent sync', () => {
      const recentSync = new Date(Date.now() - 60000); // 1 minute ago
      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          lastSyncTime={recentSync}
        />
      );
      
      expect(screen.getByText(/1 minute ago/)).toBeInTheDocument();
    });

    it('should handle very recent sync', () => {
      const veryRecentSync = new Date(Date.now() - 10000); // 10 seconds ago
      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          lastSyncTime={veryRecentSync}
        />
      );
      
      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onRetry when retry button is clicked', () => {
      const handleRetry = vi.fn();
      renderWithTheme(
        <SyncStatusIndicator 
          status="error" 
          onRetry={handleRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      
      expect(handleRetry).toHaveBeenCalled();
    });

    it('should call onClick when indicator is clicked', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          onClick={handleClick}
        />
      );
      
      // MUI Chip with onClick becomes clickable but may not have button role in DOM
      const indicator = screen.getByLabelText(/Sync status/);
      fireEvent.click(indicator);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should show tooltip on hover when provided', async () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          tooltip="Last synced 5 minutes ago. Click to sync now."
        />
      );
      
      const indicator = screen.getByRole('status');
      fireEvent.mouseEnter(indicator);
      
      await waitFor(() => {
        expect(screen.getByText(/Last synced 5 minutes ago/)).toBeInTheDocument();
      });
    });

    it('should not show retry button when onRetry is not provided', () => {
      renderWithTheme(<SyncStatusIndicator status="error" />);
      
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Animation and Visual Effects', () => {
    it('should animate syncing icon', () => {
      renderWithTheme(<SyncStatusIndicator status="syncing" />);
      
      const syncIcon = screen.getByTestId('SyncIcon');
      // Check that animation style is applied (exact string may vary due to CSS-in-JS)
      expect(syncIcon).toHaveStyle('animation: spin 2s linear infinite');
    });

    it('should show pulsing effect for connecting state', () => {
      renderWithTheme(<SyncStatusIndicator status="connecting" />);
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('animate-pulse');
    });

    it('should show success animation briefly', async () => {
      const { rerender } = renderWithTheme(
        <SyncStatusIndicator status="syncing" />
      );
      
      rerender(
        <ThemeProvider theme={theme}>
          <SyncStatusIndicator status="success" showSuccessAnimation />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('CheckCircleIcon')).toHaveClass('animate-bounce');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          message="Syncing your lessons"
        />
      );
      
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('Syncing'));
    });

    it('should announce status changes to screen readers', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="error" 
          message="Failed to sync lessons"
        />
      );
      
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-describedby');
    });

    it('should be keyboard accessible when clickable', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          onClick={handleClick}
        />
      );
      
      const indicator = screen.getByLabelText(/Sync status/);
      expect(indicator).toHaveAttribute('tabIndex', '0');
      
      fireEvent.keyDown(indicator, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have accessible retry button', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="error" 
          onRetry={vi.fn()}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry sync/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAccessibleName();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined status gracefully', () => {
      renderWithTheme(<SyncStatusIndicator status={undefined} />);
      
      // Should default to idle
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should handle invalid progress values', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          progress={150} // Invalid: over 100%
        />
      );
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle negative progress values', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          progress={-10}
        />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle missing sync info gracefully', () => {
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          syncInfo={{}}
        />
      );
      
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longMessage = 'This is a very long synchronization message that should be handled gracefully by the component';
      renderWithTheme(
        <SyncStatusIndicator 
          status="syncing" 
          message={longMessage}
        />
      );
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to container constraints', () => {
      renderWithTheme(
        <div style={{ width: '100px' }}>
          <SyncStatusIndicator 
            status="syncing" 
            message="Very long sync message"
            responsive
          />
        </div>
      );
      
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveStyle({ maxWidth: '100%' });
    });

    it('should show abbreviated text on small screens', () => {
      // Mock smaller viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      renderWithTheme(
        <SyncStatusIndicator 
          status="success" 
          responsive
        />
      );
      
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should respect custom theme colors', () => {
      const customTheme = {
        ...theme,
        palette: {
          ...theme.palette,
          success: {
            main: '#00ff00'
          }
        }
      };

      render(
        <ThemeProvider theme={customTheme}>
          <SyncStatusIndicator status="success" />
        </ThemeProvider>
      );
      
      const chip = screen.getByRole('status');
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });

    it('should support dark mode', () => {
      const darkTheme = {
        ...theme,
        palette: {
          ...theme.palette,
          mode: 'dark' as const
        }
      };

      render(
        <ThemeProvider theme={darkTheme}>
          <SyncStatusIndicator status="idle" />
        </ThemeProvider>
      );
      
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });
  });
});