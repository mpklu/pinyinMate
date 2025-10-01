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
          // Load the lesson and generate quiz using our enhanced service
          console.log('🎯 ROUTE WRAPPER: Loading lesson and generating enhanced quiz for:', lessonId);
          const { lessonLibraryService } = await import('../../services/lessonLibraryService');
          const { quizGenerationService } = await import('../../services/quizGenerationService');
          
          // Load lesson data from library
          const lesson = await lessonLibraryService.loadLesson(lessonId);
          
          // Convert to enhanced lesson format with vocabulary
          const enhancedLesson = {
            ...lesson,
            description: lesson.description || '',
            vocabulary: lesson.metadata?.vocabulary?.map(v => ({
              word: v.word,
              translation: v.definition, // Map definition to translation
              pinyin: v.pinyin || '',
              partOfSpeech: v.partOfSpeech,
              frequency: 1,
              studyCount: 0,
              masteryLevel: 0
            })) || []
          } as unknown as import('../../types/lesson').EnhancedLesson;
          
          // Generate quiz with Chinese↔Pinyin questions
          const result = await quizGenerationService.generateMixedTypeQuiz(enhancedLesson, {
            questionTypes: ['chinese-to-pinyin', 'pinyin-to-chinese', 'multiple-choice-definition'],
            questionCount: 10,
            difficulty: 'intermediate',
            includeAudio: false,
            shuffleOptions: true,
            preventRepeat: true
          });
          
          if (result.success && result.quiz) {
            // Convert enhanced quiz to standard quiz format
            const enhancedQuiz: Quiz = {
              id: result.quiz.id,
              sourceAnnotationId: lesson.id,
              questions: result.quiz.questions.map(q => {
                // Convert question type to standard format
                let questionType: 'multiple-choice' | 'fill-in-blank' | 'true-false';
                if (q.type === 'chinese-to-pinyin' || q.type === 'pinyin-to-chinese' || 
                    q.type === 'multiple-choice-definition' || q.type === 'multiple-choice-pinyin') {
                  questionType = 'multiple-choice';
                } else if (q.type === 'fill-in-blank') {
                  questionType = 'fill-in-blank';
                } else {
                  questionType = 'multiple-choice'; // default
                }
                
                return {
                  id: q.id,
                  type: questionType,
                  prompt: q.question,
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
                  difficulty: q.difficulty || 3,
                  points: 10
                };
              }),
              type: 'auto-generated',
              createdAt: new Date(),
              metadata: {
                estimatedTime: result.quiz.questions.length * 30, // 30 seconds per question
                totalPoints: result.quiz.questions.length * 10
              }
            };
            setQuiz(enhancedQuiz);
          } else {
            console.error('Quiz generation failed:', result.errors);
            setQuiz(DEFAULT_QUIZ);
          }
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
  }, [lessonId]);

  if (loading) {
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