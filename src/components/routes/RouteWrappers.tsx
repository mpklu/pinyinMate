/**
 * Route wrapper components that handle data loading and prop injection
 * Decouples routing from component props for better lazy loading
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { FlashcardPage } from '../templates/FlashcardPage';
import { QuizPage } from '../templates/QuizPage';
import { performanceMonitor } from '../../utils/performanceMonitor';
import type { TextSegment, Quiz } from '../../types';

// Default empty data for components
const DEFAULT_SEGMENTS: TextSegment[] = [];
const DEFAULT_QUIZ: Quiz = {
  id: 'default',
  sourceAnnotationId: 'loading',
  questions: [],
  type: 'auto-generated',
  createdAt: new Date(),
  metadata: {
    estimatedTime: 0,
    totalPoints: 0
  }
};

/**
 * Route wrapper for FlashcardPage that handles data loading
 */
export const FlashcardPageRoute = () => {
  const { lessonId } = useParams();
  const [segments, setSegments] = useState<TextSegment[]>(DEFAULT_SEGMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlashcardData = async () => {
      performanceMonitor.startTiming('flashcard-route-load');
      
      try {
        if (lessonId) {
          // In a real implementation, load lesson data here
          // const lesson = await lessonLibraryService.getLessonById(lessonId);
          // const segments = await textSegmentationService.segmentText(lesson.content);
          
          // For now, set empty segments as placeholder
          setSegments(DEFAULT_SEGMENTS);
        }
      } catch (error) {
        console.error('Failed to load flashcard data:', error);
        setSegments(DEFAULT_SEGMENTS);
      } finally {
        setLoading(false);
        performanceMonitor.endTiming('flashcard-route-load');
      }
    };

    loadFlashcardData();
  }, [lessonId]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        component="output"
        aria-label="Loading flashcards"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return <FlashcardPage segments={segments} />;
};

/**
 * Route wrapper for QuizPage that handles data loading
 * Note: Quiz generation is handled by libraryService.ts with Chinese↔Pinyin questions
 */
export const QuizPageRoute = () => {
  const { lessonId } = useParams();
  const [quiz, setQuiz] = useState<Quiz>(DEFAULT_QUIZ);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizData = async () => {
      performanceMonitor.startTiming('quiz-route-load');
      
      try {
        if (lessonId) {
          console.log('🎯 QuizPageRoute: Loading quiz for lesson:', lessonId);
          
          // The main quiz generation is handled by libraryService.ts
          // This route just provides the default quiz structure
          // Real quiz data comes from the libraryService when the app loads lessons
          
          setQuiz({
            ...DEFAULT_QUIZ,
            id: `quiz-${lessonId}`,
            sourceAnnotationId: lessonId,
            metadata: {
              ...DEFAULT_QUIZ.metadata,
              estimatedTime: 5, // 5 minutes
              totalPoints: 100
            }
          });
        }
      } catch (error) {
        console.error('Failed to load quiz data:', error);
        setQuiz(DEFAULT_QUIZ);
      } finally {
        setLoading(false);
        performanceMonitor.endTiming('quiz-route-load');
      }
    };

    loadQuizData();
  }, [lessonId]);  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        component="output"
        aria-label="Loading quiz"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return <QuizPage quiz={quiz} />;
};