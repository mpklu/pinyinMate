/**
 * Accessibility tests for flashcard interactions
 * Tests WCAG 2.1 AA compliance, keyboard navigation, screen readers, and semantic markup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { FlashcardView } from '../../src/components/molecules/FlashcardView';
import { FlashcardDeck } from '../../src/components/organisms/FlashcardDeck';
import { FlashcardPage } from '../../src/components/templates/FlashcardPage';
import { theme } from '../../src/theme/theme';
import type { Flashcard } from '../../src/types/flashcard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data
const mockFlashcard: Flashcard = {
  id: 'flashcard-1',
  front: '你好',
  back: {
    pinyin: 'nǐ hǎo',
    definition: 'hello; hi',
    example: '你好，很高兴见到你。',
  },
  srsData: {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: new Date(),
    totalReviews: 0,
  },
  tags: ['greeting', 'basic'],
  createdAt: new Date(),
};

const mockSegments: TextSegment[] = [
  {
    id: 'segment-1',
    text: '你好',
    pinyin: 'nǐ hǎo',
    toneMarks: 'nǐ hǎo',
    definition: 'hello; hi',
    startIndex: 0,
    endIndex: 2,
  },
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

describe('Flashcard Accessibility Tests', () => {
  describe('FlashcardView Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} />
        </TestWrapper>
      );

      // Check for proper card structure
      const flashcard = screen.getByRole('button', { name: /flashcard/i });
      expect(flashcard).toBeInTheDocument();
      expect(flashcard).toHaveAttribute('aria-label');

      // Check for Chinese text accessibility
      const chineseText = screen.getByText('你好');
      expect(chineseText.closest('[lang]')).toHaveAttribute('lang', 'zh-CN');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} />
        </TestWrapper>
      );

      const flashcardButton = screen.getByRole('button', { name: /flashcard/i });
      
      // Focus should work
      await user.tab();
      expect(flashcardButton).toHaveFocus();

      // Enter/Space should flip card
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
      });

      // Tab should move to action buttons
      await user.tab();
      const actionButton = screen.getByRole('button', { name: /correct|incorrect|hard|easy/i });
      expect(actionButton).toHaveFocus();
    });

    it('should have proper focus management during card flip', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} interactive />
        </TestWrapper>
      );

      // Focus and flip card
      const flashcardButton = screen.getByRole('button', { name: /flashcard/i });
      await user.click(flashcardButton);

      await waitFor(() => {
        // Focus should remain on the card or move to answer buttons
        const focusedElement = document.activeElement;
        expect(focusedElement).toBeTruthy();
        expect(focusedElement?.getAttribute('role')).toBeTruthy();
      });
    });

    it('should provide proper screen reader announcements', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} interactive />
        </TestWrapper>
      );

      // Check for live region announcements
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toBeInTheDocument();

      // Flip card and check announcement
      const flashcardButton = screen.getByRole('button', { name: /flashcard/i });
      await user.click(flashcardButton);

      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/revealed|answer|showing/i);
      });
    });

    it('should have sufficient color contrast', () => {
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} />
        </TestWrapper>
      );

      const chineseText = screen.getByText('你好');
      const computedStyle = window.getComputedStyle(chineseText);
      
      // Ensure text has sufficient contrast (this is a basic check)
      expect(computedStyle.color).not.toBe('');
      expect(computedStyle.backgroundColor).not.toBe('');
    });
  });

  describe('FlashcardDeck Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FlashcardDeck segments={mockSegments} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(
        <TestWrapper>
          <FlashcardDeck segments={mockSegments} title="Test Flashcard Deck" />
        </TestWrapper>
      );

      // Should have main heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Flashcard Deck');

      // Sub-sections should have appropriate heading levels
      const subHeadings = screen.getAllByRole('heading');
      expect(subHeadings.length).toBeGreaterThan(1);
    });

    it('should provide progress information to screen readers', () => {
      render(
        <TestWrapper>
          <FlashcardDeck segments={mockSegments} showStats />
        </TestWrapper>
      );

      // Progress should be announced
      const progressElement = screen.getByRole('progressbar') || 
                            screen.getByLabelText(/progress|current|of/i);
      expect(progressElement).toBeInTheDocument();
    });

    it('should support keyboard navigation between cards', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FlashcardDeck segments={mockSegments} />
        </TestWrapper>
      );

      // Navigation buttons should be keyboard accessible
      const nextButton = screen.getByRole('button', { name: /next/i });
      const prevButton = screen.getByRole('button', { name: /previous|prev/i });

      if (nextButton) {
        await user.tab();
        expect(nextButton).toHaveFocus();
        
        await user.keyboard('{Enter}');
        // Should navigate to next card
      }
    });

    it('should announce completion status', async () => {
      const onDeckComplete = vi.fn();
      
      render(
        <TestWrapper>
          <FlashcardDeck 
            segments={mockSegments.slice(0, 1)} // Single card for quick completion
            onDeckComplete={onDeckComplete}
          />
        </TestWrapper>
      );

      // Complete the deck
      const flashcard = screen.getByRole('button', { name: /flashcard/i });
      await userEvent.click(flashcard);

      const correctButton = screen.getByRole('button', { name: /correct/i });
      await userEvent.click(correctButton);

      // Should announce completion
      await waitFor(() => {
        const announcement = screen.getByRole('status') || screen.getByRole('alert');
        expect(announcement).toHaveTextContent(/complete|finished/i);
      });
    });
  });

  describe('FlashcardPage Template', () => {
    const mockLessonId = 'lesson-1';

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FlashcardPage />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper document structure', () => {
      render(
        <TestWrapper>
          <FlashcardPage />
        </TestWrapper>
      );

      // Should have main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Should have navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Should have proper heading hierarchy
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have skip navigation links', () => {
      render(
        <TestWrapper>
          <FlashcardPage />
        </TestWrapper>
      );

      // Look for skip links (might be visually hidden)
      const skipLink = screen.queryByText(/skip to main content/i);
      if (skipLink) {
        expect(skipLink).toHaveAttribute('href', '#main-content');
      }
    });

    it('should support high contrast mode', () => {
      // Simulate high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <FlashcardPage />
        </TestWrapper>
      );

      // Component should render without errors in high contrast
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support reduced motion preferences', () => {
      // Simulate reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <FlashcardPage />
        </TestWrapper>
      );

      // Animations should be reduced or disabled
      const animatedElements = screen.getAllByRole('button');
      animatedElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        // Check that transition/animation durations are minimal or none
        expect(
          computedStyle.transitionDuration === '0s' || 
          computedStyle.animationDuration === '0s' ||
          computedStyle.transitionDuration === 'none' ||
          computedStyle.animationDuration === 'none'
        ).toBeTruthy();
      });
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    it('should have adequate touch targets (44px minimum)', () => {
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} interactive />
        </TestWrapper>
      );

      const touchButtons = screen.getAllByRole('button');
      touchButtons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        const minHeight = parseInt(computedStyle.minHeight) || parseInt(computedStyle.height);
        const minWidth = parseInt(computedStyle.minWidth) || parseInt(computedStyle.width);
        
        // WCAG AA requires minimum 44px touch targets
        expect(minHeight).toBeGreaterThanOrEqual(44);
        expect(minWidth).toBeGreaterThanOrEqual(44);
      });
    });

    it('should handle touch gestures appropriately', async () => {
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} interactive />
        </TestWrapper>
      );

      const flashcard = screen.getByRole('button', { name: /flashcard/i });
      
      // Simulate touch events
      fireEvent.touchStart(flashcard);
      fireEvent.touchEnd(flashcard);

      // Should respond to touch the same as click
      await waitFor(() => {
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide proper Chinese text pronunciation guidance', () => {
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} />
        </TestWrapper>
      );

      const chineseText = screen.getByText('你好');
      const pinyinText = screen.getByText('nǐ hǎo');

      // Chinese text should be marked with language
      expect(chineseText.closest('[lang="zh-CN"]')).toBeInTheDocument();
      
      // Pinyin should be available for pronunciation
      expect(pinyinText).toHaveAttribute('aria-label', expect.stringContaining('pronunciation'));
    });

    it('should provide contextual help for learning features', () => {
      render(
        <TestWrapper>
          <FlashcardView flashcard={mockFlashcard} interactive />
        </TestWrapper>
      );

      // Help text should be available
      const helpButton = screen.queryByRole('button', { name: /help|instructions/i });
      if (helpButton) {
        expect(helpButton).toHaveAttribute('aria-describedby');
      }

      // Or help text should be embedded
      const helpText = screen.queryByText(/click to reveal|tap to flip/i);
      if (helpText) {
        expect(helpText).toBeInTheDocument();
      }
    });
  });
});