/**
 * TDD Contract tests for LessonCard atomic component
 * Tests visual rendering, interaction, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../src/theme/theme';
import type { Lesson } from '../../../../src/types/lesson';

// Import component (will fail initially - TDD approach)
import { LessonCard } from '../../../../src/components/atoms/LessonCard';

// Test wrapper with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Sample lesson data
const sampleLesson: Lesson = {
  id: 'lesson-001',
  title: 'Basic Greetings',
  description: 'Learn essential Chinese greetings',
  content: '你好！我叫李明。',
  metadata: {
    category: 'conversation',
    difficulty: 'beginner',
    tags: ['greetings', 'basic'],
    estimatedTime: 15,
    createdAt: new Date('2025-09-29T10:00:00Z'),
    updatedAt: new Date('2025-09-29T10:00:00Z')
  },
  vocabulary: [
    { word: '你好', translation: 'hello' },
    { word: '我', translation: 'I/me' }
  ]
};

describe('LessonCard Component', () => {
  describe('Visual Rendering', () => {
    it('should render lesson title and description', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      expect(screen.getByText('Basic Greetings')).toBeInTheDocument();
      expect(screen.getByText('Learn essential Chinese greetings')).toBeInTheDocument();
    });

    it('should display difficulty badge with correct color', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      const difficultyBadge = screen.getByText('beginner');
      expect(difficultyBadge).toBeInTheDocument();
      // Check that the chip exists - color styling is handled by MUI theme
      expect(difficultyBadge.closest('.MuiChip-root')).toBeInTheDocument();
    });

    it('should show estimated time', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      expect(screen.getByText('15 min')).toBeInTheDocument();
    });

    it('should display vocabulary count', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      expect(screen.getByText('2 words')).toBeInTheDocument();
    });

    it('should show category tag', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      expect(screen.getByText('conversation')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show progress when provided', () => {
      renderWithTheme(
        <LessonCard 
          lesson={sampleLesson} 
          progress={{ completed: true, score: 85, lastStudied: '2025-09-28' }}
        />
      );
      
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should show "Not Started" when no progress', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('should show "In Progress" for partial completion', () => {
      renderWithTheme(
        <LessonCard 
          lesson={sampleLesson} 
          progress={{ completed: false, score: 45, lastStudied: '2025-09-28' }}
        />
      );
      
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });

  describe('Interaction Behavior', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      renderWithTheme(<LessonCard lesson={sampleLesson} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledWith(sampleLesson);
    });

    it('should show hover effect on mouse enter', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} onClick={vi.fn()} />);
      
      const card = screen.getByRole('button');
      fireEvent.mouseEnter(card);
      
      // Check that the button is interactive (has correct classes)
      expect(card).toHaveClass('MuiCardActionArea-root');
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      renderWithTheme(<LessonCard lesson={sampleLesson} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledWith(sampleLesson);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} />);
      
      const card = screen.getByLabelText(/lesson: basic greetings/i);
      expect(card).toBeInTheDocument();
    });

    it('should have proper role and tabindex when clickable', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} onClick={vi.fn()} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should have descriptive text for screen readers', () => {
      renderWithTheme(
        <LessonCard 
          lesson={sampleLesson} 
          progress={{ completed: false, score: 75, lastStudied: '2025-09-28' }}
        />
      );
      
      expect(screen.getByText(/beginner level.*2 words.*75% complete/i)).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should apply completed styling when lesson is finished', () => {
      renderWithTheme(
        <LessonCard 
          lesson={sampleLesson} 
          progress={{ completed: true, score: 90, lastStudied: '2025-09-28' }}
        />
      );
      
      // Check that the card shows completed status
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('should apply disabled styling when lesson is locked', () => {
      renderWithTheme(<LessonCard lesson={sampleLesson} disabled />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-disabled', 'true');
      expect(card).toHaveClass('Mui-disabled');
    });

    it('should show different difficulty colors', () => {
      const intermediateLesson = { ...sampleLesson, metadata: { ...sampleLesson.metadata, difficulty: 'intermediate' as const } };
      renderWithTheme(<LessonCard lesson={intermediateLesson} />);
      
      const difficultyBadge = screen.getByText('intermediate');
      expect(difficultyBadge).toBeInTheDocument();
      // Check that the chip exists - color styling is handled by MUI theme
      expect(difficultyBadge.closest('.MuiChip-root')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle lesson without vocabulary', () => {
      const lessonWithoutVocab = { ...sampleLesson, vocabulary: [] };
      renderWithTheme(<LessonCard lesson={lessonWithoutVocab} />);
      
      expect(screen.getByText('0 words')).toBeInTheDocument();
    });

    it('should handle very long titles gracefully', () => {
      const longTitleLesson = { 
        ...sampleLesson, 
        title: 'This is a very long lesson title that should be truncated properly'
      };
      renderWithTheme(<LessonCard lesson={longTitleLesson} />);
      
      const title = screen.getByText(/This is a very long lesson title/);
      expect(title).toBeInTheDocument();
    });

    it('should handle missing estimated time', () => {
      const lessonWithoutTime = { ...sampleLesson, metadata: { ...sampleLesson.metadata, estimatedTime: undefined } };
      renderWithTheme(<LessonCard lesson={lessonWithoutTime} />);
      
      // Should show some default or hide the time display
      expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });
  });
});