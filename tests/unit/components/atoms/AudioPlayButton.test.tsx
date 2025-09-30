/**
 * TDD Contract tests for AudioPlayButton atomic component
 * Tests audio playback controls, visual states, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../src/theme/theme';

// Import component (will fail initially - TDD approach)
import { AudioPlayButton } from '../../../../src/components/atoms/AudioPlayButton';

// Test wrapper with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock audio playback for testing
const mockAudio = {
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 0,
  paused: true,
  ended: false,
  volume: 1,
  src: '',
};

// Mock HTML Audio constructor
global.Audio = vi.fn(() => mockAudio) as unknown as typeof Audio;

// Mock URL APIs for blob handling
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

describe('AudioPlayButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visual Rendering', () => {
    it('should render play button by default', () => {
      renderWithTheme(<AudioPlayButton />);
      
      expect(screen.getByRole('button', { name: /play audio/i })).toBeInTheDocument();
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    });

    it('should show pause icon when playing', () => {
      renderWithTheme(<AudioPlayButton playing />);
      
      expect(screen.getByRole('button', { name: /pause audio/i })).toBeInTheDocument();
      expect(screen.getByTestId('PauseIcon')).toBeInTheDocument();
    });

    it('should show loading spinner when loading', () => {
      renderWithTheme(<AudioPlayButton loading />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error state with error icon', () => {
      renderWithTheme(<AudioPlayButton error="Failed to load audio" />);
      
      expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should display duration when provided', () => {
      renderWithTheme(<AudioPlayButton duration={125} />);
      
      expect(screen.getByText('2:05')).toBeInTheDocument();
    });

    it('should display current time during playback', () => {
      renderWithTheme(
        <AudioPlayButton 
          playing 
          currentTime={45} 
          duration={125} 
        />
      );
      
      expect(screen.getByText('0:45 / 2:05')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size variant', () => {
      renderWithTheme(<AudioPlayButton size="small" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-sizeSmall');
    });

    it('should render medium size variant', () => {
      renderWithTheme(<AudioPlayButton size="medium" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-sizeMedium');
    });

    it('should render large size variant', () => {
      renderWithTheme(<AudioPlayButton size="large" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-sizeLarge');
    });

    it('should render compact mode without text', () => {
      renderWithTheme(
        <AudioPlayButton 
          compact 
          duration={125} 
        />
      );
      
      expect(screen.queryByText('2:05')).not.toBeInTheDocument();
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('should apply primary color', () => {
      renderWithTheme(<AudioPlayButton color="primary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-colorPrimary');
    });

    it('should apply secondary color', () => {
      renderWithTheme(<AudioPlayButton color="secondary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-colorSecondary');
    });

    it('should apply success color for completed playback', () => {
      renderWithTheme(<AudioPlayButton color="success" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-colorSuccess');
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onPlay when play button is clicked', () => {
      const handlePlay = vi.fn();
      renderWithTheme(<AudioPlayButton onPlay={handlePlay} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handlePlay).toHaveBeenCalled();
    });

    it('should call onPause when pause button is clicked', () => {
      const handlePause = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          playing 
          onPause={handlePause} 
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handlePause).toHaveBeenCalled();
    });

    it('should toggle play/pause state when no handlers provided', () => {
      const { rerender } = renderWithTheme(<AudioPlayButton />);
      
      const button = screen.getByRole('button');
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
      
      fireEvent.click(button);
      
      rerender(
        <ThemeProvider theme={theme}>
          <AudioPlayButton playing />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('PauseIcon')).toBeInTheDocument();
    });

    it('should not trigger actions when disabled', () => {
      const handlePlay = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          disabled 
          onPlay={handlePlay} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(handlePlay).not.toHaveBeenCalled();
    });

    it('should not trigger actions when loading', () => {
      const handlePlay = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          loading 
          onPlay={handlePlay} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(handlePlay).not.toHaveBeenCalled();
    });
  });

  describe('Audio Source Management', () => {
    it('should handle audio URL source', () => {
      renderWithTheme(
        <AudioPlayButton 
          src="https://example.com/audio.mp3" 
        />
      );
      
      // Audio should be created on mount, not on click
      expect(global.Audio).toHaveBeenCalledWith();
      // Verify that src was set on the audio element
      expect(mockAudio.src).toBe('https://example.com/audio.mp3');
    });

    it('should handle audio blob source', () => {
      const blob = new Blob(['audio data'], { type: 'audio/mp3' });
      renderWithTheme(<AudioPlayButton src={blob} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(global.Audio).toHaveBeenCalled();
    });

    it('should handle multiple audio sources', () => {
      const sources = [
        { src: 'audio.mp3', type: 'audio/mpeg' },
        { src: 'audio.ogg', type: 'audio/ogg' },
      ];
      
      renderWithTheme(<AudioPlayButton sources={sources} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(global.Audio).toHaveBeenCalled();
    });

    it('should call onError when audio fails to load', async () => {
      const handleError = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          src="invalid-url" 
          onError={handleError} 
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Simulate audio error
      const errorCallback = mockAudio.addEventListener.mock.calls
        .find(call => call[0] === 'error')?.[1];
      if (errorCallback) {
        errorCallback(new Event('error'));
      }
      
      await waitFor(() => {
        expect(handleError).toHaveBeenCalled();
      });
    });
  });

  describe('Progress and Time Display', () => {
    it('should format time correctly', () => {
      renderWithTheme(<AudioPlayButton duration={3661} />); // 1:01:01
      
      expect(screen.getByText('1:01:01')).toBeInTheDocument();
    });

    it('should show progress bar when enabled', () => {
      renderWithTheme(
        <AudioPlayButton 
          showProgress 
          currentTime={30} 
          duration={100} 
        />
      );
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should handle seek on progress bar click', () => {
      const handleSeek = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          showProgress 
          duration={100} 
          onSeek={handleSeek} 
        />
      );
      
      const progressBar = screen.getByRole('progressbar');
      fireEvent.click(progressBar, { 
        clientX: 50, 
        target: { getBoundingClientRect: () => ({ left: 0, width: 100 }) } 
      });
      
      expect(handleSeek).toHaveBeenCalledWith(50);
    });

    it('should update progress during playback', async () => {
      renderWithTheme(
        <AudioPlayButton 
          playing 
          showProgress 
          duration={100} 
        />
      );
      
      // Simulate time update
      const timeUpdateCallback = mockAudio.addEventListener.mock.calls
        .find(call => call[0] === 'timeupdate')?.[1];
      
      if (timeUpdateCallback) {
        mockAudio.currentTime = 25;
        timeUpdateCallback(new Event('timeupdate'));
      }
      
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '25');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <AudioPlayButton 
          duration={125} 
          ariaLabel="Play lesson audio" 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Play lesson audio');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should announce playback state changes', () => {
      renderWithTheme(
        <AudioPlayButton 
          playing 
          ariaLive="polite" 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    });

    it('should be keyboard accessible', () => {
      const handlePlay = vi.fn();
      renderWithTheme(<AudioPlayButton onPlay={handlePlay} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handlePlay).toHaveBeenCalled();
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(handlePlay).toHaveBeenCalledTimes(2);
    });

    it('should support keyboard shortcuts', () => {
      const handlePlay = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          onPlay={handlePlay} 
          keyboardShortcuts 
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'k' }); // Common play/pause shortcut
      
      expect(handlePlay).toHaveBeenCalled();
    });

    it('should provide screen reader feedback', () => {
      renderWithTheme(
        <AudioPlayButton 
          playing 
          currentTime={45} 
          duration={125} 
        />
      );
      
      const status = screen.getByRole('status', { hidden: true });
      expect(status).toHaveTextContent(/playing.*45.*125/i);
    });
  });

  describe('Visual States and Animations', () => {
    it('should show playing animation', () => {
      renderWithTheme(<AudioPlayButton playing />);
      
      const icon = screen.getByTestId('PauseIcon');
      expect(icon.closest('.playing')).toBeInTheDocument();
    });

    it('should show loading animation', () => {
      renderWithTheme(<AudioPlayButton loading />);
      
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toHaveClass('MuiCircularProgress-root');
    });

    it('should pulse on hover when interactive', () => {
      renderWithTheme(<AudioPlayButton />);
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      expect(button).toHaveClass('hover-pulse');
    });

    it('should show volume visualization when enabled', () => {
      renderWithTheme(
        <AudioPlayButton 
          playing 
          showVolumeVisualization 
        />
      );
      
      expect(screen.getByTestId('volume-visualization')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const handleError = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          src="https://invalid-url.com/audio.mp3" 
          onError={handleError} 
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Simulate network error
      const errorCallback = mockAudio.addEventListener.mock.calls
        .find(call => call[0] === 'error')?.[1];
      if (errorCallback) {
        errorCallback(new Event('error'));
      }
      
      await waitFor(() => {
        expect(handleError).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error' })
        );
      });
    });

    it('should retry failed audio loads', async () => {
      const handleRetry = vi.fn();
      renderWithTheme(
        <AudioPlayButton 
          error="Failed to load audio" 
          onRetry={handleRetry} 
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleRetry).toHaveBeenCalled();
    });

    it('should show fallback UI for unsupported formats', () => {
      renderWithTheme(
        <AudioPlayButton 
          src="audio.unsupported" 
          fallbackText="Audio not supported" 
        />
      );
      
      expect(screen.getByText('Audio not supported')).toBeInTheDocument();
    });

    it('should handle empty source gracefully', () => {
      renderWithTheme(<AudioPlayButton src="" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short audio files', () => {
      renderWithTheme(<AudioPlayButton duration={0.5} />);
      
      expect(screen.getByText('0:01')).toBeInTheDocument();
    });

    it('should handle very long audio files', () => {
      renderWithTheme(<AudioPlayButton duration={36000} />); // 10 hours
      
      expect(screen.getByText('10:00:00')).toBeInTheDocument();
    });

    it('should handle missing duration', () => {
      renderWithTheme(<AudioPlayButton currentTime={45} />);
      
      expect(screen.getByText('0:45')).toBeInTheDocument();
    });

    it('should handle negative time values', () => {
      renderWithTheme(<AudioPlayButton currentTime={-5} duration={100} />);
      
      expect(screen.getByText('0:00 / 1:40')).toBeInTheDocument();
    });

    it('should handle rapid play/pause clicks', () => {
      const handlePlay = vi.fn();
      const handlePause = vi.fn();
      
      renderWithTheme(
        <AudioPlayButton 
          onPlay={handlePlay} 
          onPause={handlePause} 
        />
      );
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handlePlay).toHaveBeenCalledTimes(3);
    });
  });

  describe('Theme Integration', () => {
    it('should respect custom theme colors', () => {
      const customTheme = {
        ...theme,
        palette: {
          ...theme.palette,
          primary: {
            main: '#ff0000'
          }
        }
      };

      render(
        <ThemeProvider theme={customTheme}>
          <AudioPlayButton color="primary" />
        </ThemeProvider>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-colorPrimary');
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
          <AudioPlayButton />
        </ThemeProvider>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle custom sizing', () => {
      renderWithTheme(
        <AudioPlayButton 
          sx={{ 
            width: 60, 
            height: 60 
          }} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '60px', height: '60px' });
    });
  });
});