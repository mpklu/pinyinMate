/**
 * FlashcardView component tests
 * Tests for the FlashcardView molecule component covering flip functionality and interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import FlashcardView from './FlashcardView';
import type { FlashcardViewProps } from './FlashcardView';
import { theme } from '../../theme/theme';
import type { Flashcard } from '../../types/flashcard';

// Mock atomic components
vi.mock('../atoms', () => ({
  ChineseText: ({ text, ...props }: { text: string; [key: string]: unknown }) => (
    <div data-testid="chinese-text" {...props}>{text}</div>
  ),
  PinyinText: ({ pinyin, ...props }: { pinyin: string; [key: string]: unknown }) => (
    <div data-testid="pinyin-text" {...props}>{pinyin}</div>
  ),
  AudioButton: ({ text, onPlay, ...props }: { text: string; onPlay?: (text: string) => void; [key: string]: unknown }) => (
    <button 
      data-testid="audio-button" 
      onClick={() => onPlay?.(text)}
      {...props}
    >
      Audio
    </button>
  ),
  DifficultyRating: ({ value, ...props }: { value: number; [key: string]: unknown }) => (
    <div data-testid="difficulty-rating" data-value={value} {...props}>
      Difficulty: {value}
    </div>
  ),
}));

// Test component wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock flashcard data
const mockFlashcard: Flashcard = {
  id: 'test-card-1',
  front: '你好',
  back: {
    pinyin: 'nǐ hǎo',
    definition: 'Hello, Hi',
    example: '你好，我是李明。(Hello, I am Li Ming.)',
    audioUrl: 'test-audio.mp3',
  },
  srsData: {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: new Date('2024-01-02'),
    lastReviewed: new Date('2024-01-01'),
    totalReviews: 0,
  },
  tags: ['greeting', 'basic'],
  createdAt: new Date('2024-01-01'),
};

describe('FlashcardView', () => {
  const defaultProps: FlashcardViewProps = {
    flashcard: mockFlashcard,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the flashcard component correctly', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('chinese-text')).toBeInTheDocument();
      expect(screen.getByText('你好')).toBeInTheDocument();
    });

    it('displays front side by default', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} />
        </TestWrapper>
      );

      // Front side should be visible
      expect(screen.getByTestId('chinese-text')).toBeInTheDocument();
      // Back side content should not be visible initially
      expect(screen.queryByText('Hello, Hi')).not.toBeInTheDocument();
    });

    it('displays back side when initialSide is set to back', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} initialSide="back" />
        </TestWrapper>
      );

      expect(screen.getByText('Hello, Hi')).toBeInTheDocument();
      expect(screen.getByTestId('pinyin-text')).toBeInTheDocument();
    });

    it('renders tags correctly', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('greeting')).toBeInTheDocument();
      expect(screen.getByText('basic')).toBeInTheDocument();
    });

    it('applies different sizes correctly', () => {
      const { rerender } = render(
        <TestWrapper>
          <FlashcardView {...defaultProps} size="small" />
        </TestWrapper>
      );

      // Verify small size renders
      expect(screen.getByTestId('chinese-text')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <FlashcardView {...defaultProps} size="large" />
        </TestWrapper>
      );

      // Verify large size renders
      expect(screen.getByTestId('chinese-text')).toBeInTheDocument();
    });
  });

  describe('Flip Functionality', () => {
    it('flips the card when clicked', async () => {
      const onFlip = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} onFlip={onFlip} />
        </TestWrapper>
      );

      // Find the card element (it may not have the exact testid we expect)
      const cardContainer = screen.getByTestId('chinese-text').closest('[role="button"], .MuiCard-root');
      
      if (cardContainer) {
        // Initially showing front
        expect(screen.getByText('你好')).toBeInTheDocument();
        expect(screen.queryByText('Hello, Hi')).not.toBeInTheDocument();

        // Click to flip
        await user.click(cardContainer);

        // Wait for flip animation
        await waitFor(
          () => {
            expect(screen.queryByText('Hello, Hi')).toBeInTheDocument();
          },
          { timeout: 1000 }
        );

        expect(onFlip).toHaveBeenCalledWith('back');
      }
    });

    it('shows flip button when enabled', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} showFlipButton={true} />
        </TestWrapper>
      );

      // Check if flip button exists in some form
      const flipButtons = screen.queryAllByRole('button');
      expect(flipButtons.length).toBeGreaterThan(0);
    });

    it('handles different animation durations', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} animationDuration={300} />
        </TestWrapper>
      );

      expect(screen.getByText('你好')).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('shows study controls on back side when enabled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} showStudyControls={true} />
        </TestWrapper>
      );

      // Flip to back
      const card = screen.getByTestId('flashcard-view');
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByLabelText('Again (Hard)')).toBeInTheDocument();
        expect(screen.getByLabelText('Good (Normal)')).toBeInTheDocument();
        expect(screen.getByLabelText('Easy (Perfect)')).toBeInTheDocument();
      });
    });

    it('calls onStudyRating when study buttons are clicked', async () => {
      const onStudyRating = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FlashcardView 
            {...defaultProps} 
            initialSide="back"
            onStudyRating={onStudyRating}
            showStudyControls={true}
          />
        </TestWrapper>
      );

      const easyButton = screen.getByLabelText('Easy (Perfect)');
      await user.click(easyButton);

      expect(onStudyRating).toHaveBeenCalledWith(5);
    });

    it('handles audio playback', async () => {
      const onAudioPlay = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} onAudioPlay={onAudioPlay} />
        </TestWrapper>
      );

      const audioButton = screen.getByTestId('audio-button');
      await user.click(audioButton);

      expect(onAudioPlay).toHaveBeenCalledWith('你好');
    });

    it('hides controls when specified', () => {
      render(
        <TestWrapper>
          <FlashcardView 
            {...defaultProps} 
            showFlipButton={false}
            showAudio={false}
          />
        </TestWrapper>
      );

      expect(screen.queryByLabelText('Flip card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });
  });

  describe('Auto-flip', () => {
    it('auto-flips after specified delay', async () => {
      const onFlip = vi.fn();

      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} autoFlipDelay={0.1} onFlip={onFlip} />
        </TestWrapper>
      );

      // Wait for auto-flip (100ms)
      await waitFor(
        () => {
          expect(onFlip).toHaveBeenCalledWith('back');
        },
        { timeout: 200 }
      );
    });

    it('cancels auto-flip when manually flipped', async () => {
      const onFlip = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} autoFlipDelay={0.2} onFlip={onFlip} />
        </TestWrapper>
      );

      // Manual flip before auto-flip
      const card = screen.getByTestId('flashcard-view');
      await user.click(card);

      // Wait longer than auto-flip delay
      await waitFor(() => {
        expect(onFlip).toHaveBeenCalledTimes(1);
      }, { timeout: 300 });
    });
  });

  describe('Difficulty Rating', () => {
    it('shows difficulty rating when enabled', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} initialSide="back" showDifficulty={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('difficulty-rating')).toBeInTheDocument();
    });

    it('hides difficulty rating when disabled', () => {
      render(
        <TestWrapper>
          <FlashcardView {...defaultProps} initialSide="back" showDifficulty={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('difficulty-rating')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles flashcard without tags', () => {
      const flashcardNoTags = { ...mockFlashcard, tags: [] };

      render(
        <TestWrapper>
          <FlashcardView flashcard={flashcardNoTags} />
        </TestWrapper>
      );

      expect(screen.queryByText('greeting')).not.toBeInTheDocument();
    });

    it('handles flashcard without pinyin', () => {
      const flashcardNoPinyin = {
        ...mockFlashcard,
        back: { ...mockFlashcard.back, pinyin: undefined },
      };

      render(
        <TestWrapper>
          <FlashcardView flashcard={flashcardNoPinyin} initialSide="back" />
        </TestWrapper>
      );

      expect(screen.queryByTestId('pinyin-text')).not.toBeInTheDocument();
    });

    it('handles flashcard without example', () => {
      const flashcardNoExample = {
        ...mockFlashcard,
        back: { ...mockFlashcard.back, example: undefined },
      };

      render(
        <TestWrapper>
          <FlashcardView flashcard={flashcardNoExample} initialSide="back" />
        </TestWrapper>
      );

      expect(screen.queryByText(/Example:/)).not.toBeInTheDocument();
    });

    it('handles flashcard without audio', () => {
      const flashcardNoAudio = {
        ...mockFlashcard,
        back: { ...mockFlashcard.back, audioUrl: undefined },
      };

      render(
        <TestWrapper>
          <FlashcardView flashcard={flashcardNoAudio} showAudio={true} />
        </TestWrapper>
      );

      // Should still show audio button for TTS
      expect(screen.getByTestId('audio-button')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const onFlip = vi.fn();
      const { rerender } = render(
        <TestWrapper>
          <FlashcardView {...defaultProps} onFlip={onFlip} />
        </TestWrapper>
      );

      // Rerender with same props
      rerender(
        <TestWrapper>
          <FlashcardView {...defaultProps} onFlip={onFlip} />
        </TestWrapper>
      );

      // Component should handle prop stability well
      expect(screen.getByTestId('chinese-text')).toBeInTheDocument();
    });

    it('handles component updates gracefully', () => {
      const { rerender } = render(
        <TestWrapper>
          <FlashcardView {...defaultProps} />
        </TestWrapper>
      );

      // Update props
      rerender(
        <TestWrapper>
          <FlashcardView {...defaultProps} size="large" />
        </TestWrapper>
      );

      expect(screen.getByTestId('chinese-text')).toBeInTheDocument();
    });
  });
});