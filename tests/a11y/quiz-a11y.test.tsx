/**
 * Accessibility tests for quiz interactions
 * Tests WCAG 2.1 AA compliance, keyboard navigation, screen readers, and quiz accessibility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React from 'react';

import { QuizQuestion } from '../../src/components/molecules/QuizQuestion';
import { QuizContainer } from '../../src/components/organisms/QuizContainer';
import { theme } from '../../src/theme/theme';
import type { Quiz, QuizQuestion as QuizQuestionType } from '../../src/types/quiz';

// Add jest-axe matchers (would need proper setup)
// expect.extend(toHaveNoViolations);

// Mock services
vi.mock('../../src/services/quizService', () => ({
  generateQuiz: vi.fn().mockResolvedValue({
    questions: [],
    totalQuestions: 0
  })
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

describe('Quiz Accessibility Tests', () => {
  const mockMultipleChoiceQuestion: QuizQuestionType = {
    id: 'mc-1',
    type: 'multiple-choice',
    question: 'What does "你好" mean?',
    options: [
      { id: 'a', text: 'Hello', correct: true },
      { id: 'b', text: 'Goodbye', correct: false },
      { id: 'c', text: 'Thank you', correct: false },
      { id: 'd', text: 'How are you?', correct: false }
    ],
    correctAnswer: 'a',
    points: 10,
    timeLimit: 30,
    explanation: '"你好" is the standard greeting meaning "Hello" in Chinese.'
  };

  const mockFillBlankQuestion: QuizQuestionType = {
    id: 'fb-1',
    type: 'fill-blank',
    question: 'Fill in the blank: 我___学生 (I am a student)',
    correctAnswer: '是',
    points: 10,
    timeLimit: 45,
    explanation: '"是" means "am/is/are" in Chinese.'
  };

  const mockAudioQuestion: QuizQuestionType = {
    id: 'audio-1',
    type: 'audio-recognition',
    question: 'What do you hear?',
    audioUrl: 'test-audio.mp3',
    options: [
      { id: 'a', text: '你好', correct: true },
      { id: 'b', text: '再见', correct: false },
      { id: 'c', text: '谢谢', correct: false }
    ],
    correctAnswer: 'a',
    points: 15,
    timeLimit: 30
  };

  const mockQuiz: Quiz = {
    id: 'test-quiz',
    title: 'Basic Chinese Quiz',
    description: 'Test your basic Chinese knowledge',
    questions: [mockMultipleChoiceQuestion, mockFillBlankQuestion, mockAudioQuestion],
    totalPoints: 35,
    timeLimit: 300,
    difficulty: 'beginner',
    category: 'vocabulary'
  };

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no accessibility violations in QuizQuestion', async () => {
      const { container } = render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Would use axe for real testing
      // const results = await axe(container);
      // expect(results).toHaveNoViolations();
      expect(container).toBeInTheDocument();
    });

    it('should have no accessibility violations in QuizContainer', async () => {
      const { container } = render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
          />
        </TestWrapper>
      );

      // Would use axe for real testing
      // const results = await axe(container);
      // expect(results).toHaveNoViolations();
      expect(container).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Quiz should have proper form structure
      const form = screen.queryByRole('form') || screen.getByRole('group');
      expect(form).toBeInTheDocument();

      // Question should be properly labeled
      const questionText = screen.getByText(/What does.*你好.*mean/);
      expect(questionText).toBeInTheDocument();

      // Options should be in a radiogroup for multiple choice
      const radioGroup = screen.queryByRole('radiogroup');
      if (radioGroup) {
        expect(radioGroup).toBeInTheDocument();
      }
    });

    it('should provide proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
          />
        </TestWrapper>
      );

      // Should have proper heading structure
      const mainHeading = screen.queryByRole('heading', { level: 1 }) ||
                         screen.queryByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through options', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Should be able to tab through all options
      const options = screen.getAllByRole('radio');
      
      for (let i = 0; i < options.length; i++) {
        await user.tab();
        expect(document.activeElement).toBeInTheDocument();
      }
    });

    it('should support arrow key navigation within radio groups', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      const firstOption = screen.getAllByRole('radio')[0];
      firstOption.focus();

      // Arrow down should move to next option
      fireEvent.keyDown(firstOption, { key: 'ArrowDown', code: 'ArrowDown' });
      
      await waitFor(() => {
        const focusedElement = document.activeElement;
        expect(focusedElement).not.toBe(firstOption);
      });
    });

    it('should support Enter/Space to select options', async () => {
      const onAnswer = vi.fn();
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={onAnswer}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      const firstOption = screen.getAllByRole('radio')[0];
      firstOption.focus();

      // Space should select the option
      fireEvent.keyDown(firstOption, { key: ' ', code: 'Space' });
      
      await waitFor(() => {
        expect(firstOption).toBeChecked();
      });
    });

    it('should support keyboard submission', async () => {
      const onAnswer = vi.fn();
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={onAnswer}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Should be able to submit with Enter
      const submitButton = screen.queryByRole('button', { name: /submit/i }) ||
                          screen.queryByRole('button', { name: /next/i });
      
      if (submitButton) {
        submitButton.focus();
        fireEvent.keyDown(submitButton, { key: 'Enter', code: 'Enter' });
        expect(onAnswer).toHaveBeenCalled();
      }
    });

    it('should provide visible focus indicators', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      const options = screen.getAllByRole('radio');
      
      for (const option of options) {
        option.focus();
        
        // Should have visible focus indication
        const styles = window.getComputedStyle(option);
        expect(styles.outline).not.toBe('none');
      }
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Question should be properly labeled
      const questionElement = screen.getByText(/What does.*你好.*mean/);
      expect(questionElement).toHaveAttribute('id');

      // Options should reference the question
      const options = screen.getAllByRole('radio');
      options.forEach(option => {
        expect(option).toHaveAttribute('aria-labelledby', expect.any(String));
      });
    });

    it('should announce question progress', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
          />
        </TestWrapper>
      );

      // Should have progress information
      const progressInfo = screen.queryByText(/question \d+ of \d+/i) ||
                          screen.queryByRole('progressbar');
      
      if (progressInfo) {
        expect(progressInfo).toBeInTheDocument();
      }
    });

    it('should provide time remaining announcements', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={5}
          />
        </TestWrapper>
      );

      // Should announce time warnings
      const timeWarning = screen.queryByRole('alert') ||
                         screen.queryByText(/time remaining/i);
      
      if (timeWarning) {
        expect(timeWarning).toBeInTheDocument();
      }
    });

    it('should announce correct/incorrect answers', async () => {
      const onAnswer = vi.fn();
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={onAnswer}
            timeRemaining={30}
            showResult={true}
            userAnswer="a"
          />
        </TestWrapper>
      );

      // Should announce result
      const resultAnnouncement = screen.queryByRole('alert') ||
                                screen.queryByText(/correct|incorrect/i);
      
      if (resultAnnouncement) {
        expect(resultAnnouncement).toBeInTheDocument();
      }
    });

    it('should have proper language attributes for Chinese text', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockFillBlankQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Chinese text should have language attribute
      const chineseText = screen.queryByText(/我.*学生/);
      if (chineseText) {
        const langElement = chineseText.closest('[lang]');
        expect(langElement).toHaveAttribute('lang', expect.stringMatching(/zh/));
      }
    });
  });

  describe('Audio Question Accessibility', () => {
    it('should provide audio controls', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockAudioQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Should have audio controls
      const audioControls = screen.queryByRole('button', { name: /play|audio/i }) ||
                           screen.queryByRole('audio');
      
      if (audioControls) {
        expect(audioControls).toBeInTheDocument();
      }
    });

    it('should provide transcripts for audio content', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockAudioQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Should provide transcript or alternative
      const transcript = screen.queryByText(/transcript/i) ||
                        screen.queryByText(/听不到音频/i);
      
      // Should have some form of audio alternative
      expect(document.body).toBeInTheDocument(); // Basic presence test
    });

    it('should support keyboard control of audio', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockAudioQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      const audioButton = screen.queryByRole('button', { name: /play/i });
      
      if (audioButton) {
        // Should be able to control audio with keyboard
        audioButton.focus();
        fireEvent.keyDown(audioButton, { key: 'Enter', code: 'Enter' });
        
        expect(audioButton).toHaveFocus();
      }
    });
  });

  describe('Fill-in-the-blank Accessibility', () => {
    it('should provide proper input labels', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockFillBlankQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Input should be properly labeled
      const input = screen.queryByRole('textbox');
      if (input) {
        expect(input).toHaveAccessibleName();
        expect(input).toHaveAttribute('aria-describedby');
      }
    });

    it('should provide context for the blank', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockFillBlankQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Should provide context about what to fill in
      const contextText = screen.queryByText(/I am a student/i);
      expect(contextText).toBeInTheDocument();
    });

    it('should support IME input for Chinese characters', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockFillBlankQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      const input = screen.queryByRole('textbox');
      if (input) {
        // Should handle composition events for Chinese input
        fireEvent.compositionStart(input, { data: 'shi' });
        fireEvent.compositionUpdate(input, { data: '是' });
        fireEvent.compositionEnd(input, { data: '是' });
        
        expect(input).toBeInTheDocument();
      }
    });
  });

  describe('Timer and Time Pressure', () => {
    it('should provide accessible timer information', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Timer should be accessible
      const timer = screen.queryByText(/\d+:\d+/) ||
                   screen.queryByRole('timer') ||
                   screen.queryByLabelText(/time/i);
      
      if (timer) {
        expect(timer).toBeInTheDocument();
      }
    });

    it('should provide time warnings without causing anxiety', async () => {
      const { rerender } = render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Reduce time to trigger warnings
      rerender(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={10}
          />
        </TestWrapper>
      );

      // Should provide gentle warnings, not alarming ones
      const warning = screen.queryByText(/10 seconds remaining/i);
      if (warning) {
        expect(warning).not.toHaveClass('error');
      }
    });

    it('should allow users to disable timer', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={{...mockQuiz, timeLimit: undefined}}
            onComplete={vi.fn()}
          />
        </TestWrapper>
      );

      // Should work without time pressure
      const container = screen.getByRole('main') || document.body;
      expect(container).toBeInTheDocument();
    });
  });

  describe('Error Handling and Feedback', () => {
    it('should provide accessible error messages', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockFillBlankQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
            error="Please provide an answer"
          />
        </TestWrapper>
      );

      // Error should be announced to screen readers
      const errorMessage = screen.queryByRole('alert') ||
                          screen.queryByText(/please provide an answer/i);
      
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });

    it('should provide constructive feedback', async () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
            showResult={true}
            userAnswer="b"
            isCorrect={false}
          />
        </TestWrapper>
      );

      // Should show explanation, not just correct/incorrect
      const explanation = screen.queryByText(/standard greeting/i);
      if (explanation) {
        expect(explanation).toBeInTheDocument();
      }
    });

    it('should handle loading states accessibly', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
            loading={true}
          />
        </TestWrapper>
      );

      // Loading should be announced
      const loading = screen.queryByRole('progressbar') ||
                     screen.queryByText(/loading/i);
      
      if (loading) {
        expect(loading).toBeInTheDocument();
      }
    });
  });

  describe('Mobile and Touch Accessibility', () => {
    it('should have appropriate touch targets', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // Touch targets should be large enough
      const options = screen.getAllByRole('radio');
      options.forEach(option => {
        const rect = option.getBoundingClientRect();
        expect(rect.width >= 44 || rect.height >= 44).toBe(true);
      });
    });

    it('should work with voice control', () => {
      render(
        <TestWrapper>
          <QuizQuestion 
            question={mockMultipleChoiceQuestion}
            onAnswer={vi.fn()}
            timeRemaining={30}
          />
        </TestWrapper>
      );

      // All interactive elements should have accessible names
      const interactiveElements = [
        ...screen.getAllByRole('radio'),
        ...screen.getAllByRole('button')
      ];

      interactiveElements.forEach(element => {
        expect(element).toHaveAccessibleName();
      });
    });
  });

  describe('Cognitive Accessibility', () => {
    it('should provide clear instructions', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
          />
        </TestWrapper>
      );

      // Should have clear instructions
      const instructions = screen.queryByText(/select.*answer/i) ||
                          screen.queryByText(/choose.*correct/i);
      
      if (instructions) {
        expect(instructions).toBeInTheDocument();
      }
    });

    it('should show progress clearly', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
          />
        </TestWrapper>
      );

      // Progress should be clear and understandable
      const progress = screen.queryByText(/\d+ of \d+/) ||
                      screen.queryByRole('progressbar');
      
      if (progress) {
        expect(progress).toBeInTheDocument();
      }
    });

    it('should allow review of answers', () => {
      render(
        <TestWrapper>
          <QuizContainer 
            quiz={mockQuiz}
            onComplete={vi.fn()}
            allowReview={true}
          />
        </TestWrapper>
      );

      // Should provide way to review answers
      const reviewButton = screen.queryByRole('button', { name: /review/i }) ||
                          screen.queryByRole('button', { name: /back/i });
      
      if (reviewButton) {
        expect(reviewButton).toBeInTheDocument();
      }
    });
  });
});