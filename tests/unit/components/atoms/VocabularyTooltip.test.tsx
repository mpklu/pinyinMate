import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import { VocabularyTooltip, type VocabularyData } from '../../../../src/components/atoms/VocabularyTooltip';

const theme = createTheme();

const mockVocabulary: VocabularyData = {
  word: '你好',
  pinyin: 'nǐ hǎo',
  definition: 'hello; hi',
  example: '你好世界',
  exampleTranslation: 'Hello world',
  pronunciation: 'audio-url'
};

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('VocabularyTooltip Component', () => {
  describe('Visual Rendering', () => {
    it('should render children correctly', () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      expect(screen.getByText('你好')).toBeInTheDocument();
    });

    it('should show tooltip content on hover', async () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
        expect(screen.getByText('hello; hi')).toBeInTheDocument();
      });
    });

    it('should hide tooltip content on mouse leave', async () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(trigger);
      
      await waitFor(() => {
        expect(screen.queryByText('nǐ hǎo')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interactive Behavior', () => {
    it('should close tooltip on click outside', async () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
      });
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('nǐ hǎo')).not.toBeInTheDocument();
      });
    });

    it('should respond to keyboard navigation', async () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.focus(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
      });
    });
  });

  describe('Pronunciation Features', () => {
    it('should show pronunciation button when onPronounce is provided', async () => {
      const handlePronounce = vi.fn();
      
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary} onPronounce={handlePronounce}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Pronounce 你好')).toBeInTheDocument();
      });
    });

    it('should call onPronounce when pronunciation button is clicked', async () => {
      const handlePronounce = vi.fn();
      
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary} onPronounce={handlePronounce}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        const pronunciationButton = screen.getByLabelText('Pronounce 你好');
        fireEvent.click(pronunciationButton);
        expect(handlePronounce).toHaveBeenCalledWith('你好');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      expect(trigger).toHaveAttribute('tabIndex', '0');
      expect(trigger).toHaveAttribute('aria-label');
    });

    it('should announce tooltip content to screen readers', async () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        const tooltipContent = screen.getByText('nǐ hǎo');
        const tooltipContainer = tooltipContent.closest('[aria-live="polite"]');
        expect(tooltipContainer).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Styling and Theming', () => {
    it('should apply custom styles to tooltip', async () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary} sx={{ backgroundColor: 'red' }}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        const tooltipContent = screen.getByText('nǐ hǎo');
        const tooltipContainer = tooltipContent.closest('[id*="vocabulary-tooltip"]');
        expect(tooltipContainer).toBeInTheDocument();
      });
    });

    it('should apply custom styles to trigger', () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary} triggerSx={{ color: 'blue' }}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      expect(trigger).toHaveStyle({ color: 'rgb(0, 0, 255)' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty vocabulary object', () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={{}}>
          你好
        </VocabularyTooltip>
      );
      
      expect(screen.getByText('你好')).toBeInTheDocument();
    });

    it('should handle very long definitions', async () => {
      const longDefinition = 'A very long definition that should wrap properly in the tooltip and not break the layout or overflow the container boundaries';
      
      renderWithTheme(
        <VocabularyTooltip vocabulary={{ ...mockVocabulary, definition: longDefinition }}>
          你好
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText(longDefinition)).toBeInTheDocument();
      });
    });

    it('should handle special characters in content', async () => {
      const specialVocabulary = {
        word: '你好！',
        pinyin: 'nǐ hǎo!',
        definition: 'hello! (with punctuation)',
      };
      
      renderWithTheme(
        <VocabularyTooltip vocabulary={specialVocabulary}>
          你好！
        </VocabularyTooltip>
      );
      
      const trigger = screen.getByText('你好！');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo!')).toBeInTheDocument();
        expect(screen.getByText('hello! (with punctuation)')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not render tooltip content until opened', () => {
      renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      expect(screen.queryByText('nǐ hǎo')).not.toBeInTheDocument();
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = renderWithTheme(
        <VocabularyTooltip vocabulary={mockVocabulary}>
          你好
        </VocabularyTooltip>
      );
      
      // First trigger the tooltip to set up event listeners
      const trigger = screen.getByText('你好');
      fireEvent.mouseEnter(trigger);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
      removeEventListenerSpy.mockRestore();
    });
  });
});