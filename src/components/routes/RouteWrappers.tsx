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
import { librarySourceService } from '../../services/librarySourceService';
import { segmentText } from '../../services/textSegmentationService';
import { pinyinService } from '../../services/pinyinService';
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
  const { lessonId, sourceId } = useParams<{ lessonId: string; sourceId?: string }>();
  const navigate = useNavigate();
  const [segments, setSegments] = useState<TextSegment[]>(DEFAULT_SEGMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlashcardData = async () => {
      performanceMonitor.startTiming('flashcard-route-load');
      
      try {
        if (lessonId) {
          // Determine which source to load from
          const targetSourceId = sourceId || 'local-custom'; // Default to local if no sourceId
          
          // Load lesson from the specified source
          try {
            console.log(`Loading lesson ${lessonId} from source ${targetSourceId}`);
            const lesson = await librarySourceService.loadLesson(targetSourceId, lessonId);
            
            // Segment the lesson content
            const textSegments = await segmentText(lesson.content);
            
            // Create TextSegment objects with pinyin
            const segments: TextSegment[] = await Promise.all(
              textSegments.map(async (text, index) => {
                const pinyin = await pinyinService.generateBasic(text);
                const toneMarks = await pinyinService.generateToneMarks(text);
                return {
                  id: `seg_${index}`,
                  text: text,
                  pinyin: pinyin,
                  toneMarks: toneMarks,
                  definition: '', // Will be empty for now
                  position: { start: 0, end: text.length } // Simplified position
                };
              })
            );
            
            setSegments(segments);
          } catch (lessonError) {
            console.warn(`Failed to load lesson ${lessonId} from source ${targetSourceId}, trying alternative approach:`, lessonError);
            
            // Fallback: try to load from libraryService which searches all sources
            try {
              const { libraryService } = await import('../../services/libraryService');
              await libraryService.initialize();
              const allLessons = await libraryService.getLessons();
              const foundLesson = allLessons.find(lesson => lesson.id === lessonId);
              
              if (foundLesson) {
                console.log(`Found lesson ${lessonId} in libraryService, generating flashcard segments`);
                const textSegments = await segmentText(foundLesson.content);
                
                const segments: TextSegment[] = await Promise.all(
                  textSegments.map(async (text, index) => {
                    const pinyin = await pinyinService.generateBasic(text);
                    const toneMarks = await pinyinService.generateToneMarks(text);
                    return {
                      id: `seg_${index}`,
                      text: text,
                      pinyin: pinyin,
                      toneMarks: toneMarks,
                      definition: '',
                      position: { start: 0, end: text.length }
                    };
                  })
                );
                
                console.log(`Successfully loaded lesson from libraryService: ${segments.length} segments`);
                setSegments(segments);
              } else {
                console.warn(`Lesson ${lessonId} not found in any source, using sample data`);
                setSegments(await createSampleSegments());
              }
            } catch (libraryError) {
              console.error(`Failed to load lesson from libraryService:`, libraryError);
              setSegments(await createSampleSegments());
            }
          }
        } else {
          // No lesson specified, provide sample segments
          setSegments(await createSampleSegments());
        }
      } catch (error) {
        console.error('Failed to load flashcard data:', error);
        setSegments(await createSampleSegments());
      } finally {
        setLoading(false);
        performanceMonitor.endTiming('flashcard-route-load');
      }
    };

    // Helper function to create sample segments
    const createSampleSegments = async (): Promise<TextSegment[]> => {
      const sampleText = "你好！我叫李明。很高兴认识你。你叫什么名字？";
      const textSegments = await segmentText(sampleText);
      
      return Promise.all(
        textSegments.map(async (text, index) => {
          const pinyin = await pinyinService.generateBasic(text);
          const toneMarks = await pinyinService.generateToneMarks(text);
          return {
            id: `sample_${index}`,
            text: text,
            pinyin: pinyin,
            toneMarks: toneMarks,
            definition: getSampleDefinition(text),
            position: { start: 0, end: text.length }
          };
        })
      );
    };

    // Helper function for sample definitions
    const getSampleDefinition = (text: string): string => {
      const definitions: Record<string, string> = {
        '你好！': 'Hello!',
        '我叫李明。': 'My name is Li Ming.',
        '很高兴认识你。': 'Nice to meet you.',
        '你叫什么名字？': 'What is your name?'
      };
      return definitions[text] || 'Sample Chinese text';
    };

    loadFlashcardData();
  }, [lessonId, sourceId]);

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

  return (
    <FlashcardPage 
      segments={segments} 
      onNavigateBack={() => navigate(-1)}
      onNavigateHome={() => navigate('/')}
    />
  );
};

/**
 * Route wrapper for QuizPage that handles data loading
 * Note: Quiz generation is handled by libraryService.ts with Chinese↔Pinyin questions
 */
export const QuizPageRoute = () => {
  const { lessonId, sourceId } = useParams<{ lessonId: string; sourceId?: string }>();
  const navigate = useNavigate();
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
  }, [lessonId, sourceId]);  if (loading) {
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

  return (
    <QuizPage 
      quiz={quiz} 
      onNavigateBack={() => navigate(-1)}
      onNavigateHome={() => navigate('/')}
    />
  );
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