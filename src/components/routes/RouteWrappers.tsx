/**
 * Route wrapper components that handle data loading and prop injection
 * Decouples routing from component props for better lazy loading
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { FlashcardPage } from '../templates/FlashcardPage';
import { QuizPage } from '../templates/QuizPage';
import { HomePage } from '../templates/HomePage';
import { AnnotationPage } from '../templates/AnnotationPage';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { libraryService } from '../../services/libraryService';
import type { TextSegment, Quiz } from '../../types';
import type { LessonQuizQuestion } from '../../types/enhancedQuiz';

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
          
          // Load lesson data and generate quiz questions using libraryService
          const preparedLesson = await libraryService.prepareLessonForLearning(lessonId, {
            includeQuizzes: true,
            includeFlashcards: false,
            cacheResult: true
          });
          
          // Convert LessonQuizQuestion[] to Quiz format
          const convertedQuiz: Quiz = {
            id: `quiz-${lessonId}`,
            sourceAnnotationId: lessonId,
            questions: preparedLesson.quizQuestions.map((lessonQuestion: LessonQuizQuestion) => ({
              id: lessonQuestion.id,
              type: 'multiple-choice',
              prompt: lessonQuestion.question,
              options: lessonQuestion.options || [],
              correctAnswer: lessonQuestion.correctAnswer,
              explanation: `Question about: ${lessonQuestion.metadata.sourceWord || 'vocabulary'}`,
              points: 10
            })),
            type: 'auto-generated',
            createdAt: new Date(),
            metadata: {
              estimatedTime: Math.ceil(preparedLesson.quizQuestions.length * 0.5), // 30 seconds per question
              totalPoints: preparedLesson.quizQuestions.length * 10
            }
          };
          
          console.log('🎯 Generated quiz with', convertedQuiz.questions.length, 'questions');
          setQuiz(convertedQuiz);
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

/**
 * Route wrapper for HomePage that provides navigation callbacks
 */
export const HomePageRoute = () => {
  const navigate = useNavigate();

  return (
    <HomePage
      onStartAnnotation={() => navigate('/annotate')}
      onStartQuiz={() => navigate('/quiz')}
      onStartFlashcards={() => navigate('/flashcards')}
      onViewLibrary={() => navigate('/library')}
    />
  );
};

/**
 * Route wrapper for AnnotationPage that provides navigation callbacks
 */
export const AnnotationPageRoute = () => {
  const navigate = useNavigate();

  return (
    <AnnotationPage
      onBack={() => navigate(-1)}
      onHome={() => navigate('/')}
      onAnnotationComplete={(result) => {
        // Handle annotation completion - could navigate to results or home
        console.log('Annotation completed:', result);
        navigate('/');
      }}
      onSegmentsSelected={(segments) => {
        // Handle segment selection - could navigate to flashcards or quiz
        console.log('Segments selected:', segments);
        navigate('/flashcards');
      }}
      onSave={(result) => {
        // Handle save - show success message and stay on page
        console.log('Annotation saved:', result);
      }}
      onShare={(result) => {
        // Handle share - could open share dialog or copy to clipboard
        console.log('Annotation shared:', result);
      }}
    />
  );
};