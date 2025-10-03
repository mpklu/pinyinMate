import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import { theme } from './theme/theme';
import { SessionProvider } from './context/SessionContext';
import { pinyinService } from './services/pinyinService';
import { 
  HomePage, 
  AnnotationPage, 
  QuizPage, 
  FlashcardPage, 
  LibraryPage,
  LessonPage 
} from './components/templates';
import type { LibraryItem } from './components/templates';
import type { Quiz, QuestionType } from './types/quiz';

// Demo data for development
const demoSegments = [
  {
    id: 'seg_1',
    text: '你好',
    pinyin: 'nǐ hǎo',
    toneMarks: 'nǐ hǎo',
    definition: 'hello',
    position: { start: 0, end: 2 },
  },
  {
    id: 'seg_2',
    text: '世界',
    pinyin: 'shì jiè',
    toneMarks: 'shì jiè',
    definition: 'world',
    position: { start: 2, end: 4 },
  },
];

const demoQuiz = {
  id: 'quiz_1',
  sourceAnnotationId: 'ann_1',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice' as const,
      prompt: 'What does "你好" mean?',
      options: ['hello', 'goodbye', 'thank you', 'sorry'],
      correctAnswer: 'hello',
    },
  ],
  type: 'auto-generated' as const,
  createdAt: new Date(),
  metadata: {
    difficulty: 'beginner' as const,
    estimatedTime: 5,
  },
};

const demoLibraryItems = [
  {
    id: 'item_1',
    type: 'annotation' as const,
    title: 'Hello World - Basic Greeting',
    description: 'Learn basic Chinese greetings and common phrases',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    tags: ['greetings', 'beginner'],
    difficulty: 'beginner' as const,
    itemCount: 2,
    data: {
      id: 'ann_1',
      originalText: '你好世界',
      segments: demoSegments,
      createdAt: new Date(),
      metadata: {},
    },
  },
];

// Route wrapper components that use React Router hooks
const HomePageWrapper = () => {
  const navigate = useNavigate();
  
  return (
    <HomePage
      onStartAnnotation={() => navigate('/annotate')}
      onViewLibrary={() => navigate('/library')}
      onStartQuiz={() => navigate('/quiz')}
      onStartFlashcards={() => navigate('/flashcards')}
    />
  );
};

const AnnotationPageWrapper = () => {
  const navigate = useNavigate();
  
  return (
    <AnnotationPage
      onBack={() => navigate(-1)}
      onHome={() => navigate('/')}
      onAnnotationComplete={async (result) => {
        console.log('Annotation completed:', result);
        
        try {
          // Process the annotation result with text segmentation service
          const { textSegmentationService } = await import('./services/textSegmentationService');
          
          const annotationRequest = {
            text: result.originalText,
            options: {
              includeDefinitions: true,
              includeToneMarks: true,
              includeAudio: false,
            },
          };
          
          const processedResult = await textSegmentationService.annotate(annotationRequest);
          console.log('Processed annotation:', processedResult);
          
          // In a real app, this would update session context and save to library
          if (processedResult.success && processedResult.data?.annotation) {
            // Could save to LibraryService here
            console.log('Saving annotation to library:', processedResult.data.annotation);
          }
        } catch (error) {
          console.error('Failed to process annotation:', error);
        }
      }}
      onSave={async (result) => {
        console.log('Annotation saved:', result);
        
        try {
          // Save annotation using the text segmentation service
          const { textSegmentationService } = await import('./services/textSegmentationService');
          
          const annotationRequest = {
            text: result.originalText,
            options: {
              includeDefinitions: true,
              includeToneMarks: true,
              includeAudio: false,
            },
          };
          
          const processedResult = await textSegmentationService.annotate(annotationRequest);
          
          if (processedResult.success && processedResult.data?.annotation) {
            // Integrate with LibraryService to save the annotation
            console.log('Saving annotation:', processedResult.data.annotation);
            // Future: Save to library via libraryService
          }
        } catch (error) {
          console.error('Failed to save annotation:', error);
        }
      }}
    />
  );
};

const QuizPageWrapper = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLessonAndGenerateQuiz = async () => {
      if (!lessonId) {
        // Use demo quiz if no lesson ID
        setQuiz(demoQuiz);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load lesson from library service
        const { libraryService } = await import('./services/libraryService');
        await libraryService.initialize();
        const lesson = await libraryService.getLessonById(lessonId);
        
        if (!lesson) {
          throw new Error(`Lesson ${lessonId} not found`);
        }

        // Generate quiz questions from lesson vocabulary
        const preparedLesson = await libraryService.prepareLessonForLearning(lessonId, {
          includeQuizzes: true,
          includeFlashcards: false,
          cacheResult: true
        });

        // Convert to Quiz format expected by QuizPage
        const generatedQuiz: Quiz = {
          id: `quiz-${lessonId}`,
          sourceAnnotationId: lessonId,
          questions: preparedLesson.quizQuestions.map(q => ({
            id: q.id,
            type: q.type === 'fill-blank' ? 'fill-in-blank' : q.type as QuestionType,
            prompt: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
          type: 'auto-generated',
          createdAt: new Date(),
          metadata: {
            difficulty: lesson.metadata.difficulty,
            estimatedTime: lesson.metadata.estimatedTime,
            tags: lesson.metadata.tags,
            totalPoints: preparedLesson.quizQuestions.length * 10
          }
        };

        setQuiz(generatedQuiz);
      } catch (err) {
        console.error('Failed to generate quiz:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        // Fallback to demo quiz
        setQuiz(demoQuiz);
      } finally {
        setLoading(false);
      }
    };

    loadLessonAndGenerateQuiz();
  }, [lessonId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading quiz...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <button onClick={() => navigate(-1)}>Back</button>
      </Box>  
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No quiz available</Typography>
        <button onClick={() => navigate(-1)}>Back</button>
      </Box>
    );
  }
  
  return (
    <QuizPage
      quiz={quiz}
      category={lessonId ? `Lesson ${lessonId}` : "Demo Quiz"}
      difficulty={quiz.metadata?.difficulty || "beginner"}
      onQuizComplete={(score, total) => {
        console.log(`Quiz completed: ${score}/${total}`);
      }}
      onNavigateBack={() => navigate(-1)}
      onNavigateHome={() => navigate('/')}
      onOpenSettings={() => console.log('Quiz settings opened')}
    />
  );
};

const FlashcardPageWrapper = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [segments, setSegments] = React.useState<typeof demoSegments>([]);
  const [deckTitle, setDeckTitle] = React.useState<string>("Loading...");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLessonAndGenerateFlashcards = async () => {
      if (!lessonId) {
        // Use demo segments if no lesson ID
        setSegments(demoSegments);
        setDeckTitle("Hello World Flashcards");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load lesson from library service
        const { libraryService } = await import('./services/libraryService');
        await libraryService.initialize();
        const lesson = await libraryService.getLessonById(lessonId);
        
        if (!lesson) {
          throw new Error(`Lesson ${lessonId} not found`);
        }

        // Convert lesson content to segments for flashcards with real pinyin
        const lessonSegments = await Promise.all(
          lesson.content.split(/[。！？]/).filter(s => s.trim()).map(async (text, index) => {
            const trimmedText = text.trim();
            let generatedPinyin = '';
            
            try {
              generatedPinyin = await pinyinService.generateToneMarks(trimmedText);
            } catch (error) {
              console.warn(`Failed to generate pinyin for "${trimmedText}":`, error);
              generatedPinyin = trimmedText; // Fallback to original text
            }
            
            // Try to get translation for the sentence
            let translation = `Sentence ${index + 1} from lesson`;
            try {
              const { translationService } = await import('./services/translationService');
              const translationResult = await translationService.translate({ text: trimmedText });
              if (translationResult.success && translationResult.data) {
                translation = translationResult.data.translatedText;
              }
            } catch (error) {
              console.warn(`Failed to translate "${trimmedText}":`, error);
              // Keep fallback translation
            }

            return {
              id: `seg_${lesson.id}_${index}`,
              text: trimmedText,
              pinyin: generatedPinyin,
              toneMarks: generatedPinyin,
              definition: translation,
              position: { start: 0, end: trimmedText.length },
            };
          })
        );

        // Add vocabulary-based segments with real pinyin
        const vocabularySegments = await Promise.all(
          lesson.metadata.vocabulary.map(async (vocab, index) => {
            let generatedPinyin = '';
            
            try {
              generatedPinyin = await pinyinService.generateToneMarks(vocab.word);
            } catch (error) {
              console.warn(`Failed to generate pinyin for "${vocab.word}":`, error);
              generatedPinyin = vocab.word; // Fallback to original text
            }
            
            return {
              id: `vocab_${lesson.id}_${index}`,
              text: vocab.word,
              pinyin: generatedPinyin,
              toneMarks: generatedPinyin,
              definition: vocab.translation,
              position: { start: 0, end: vocab.word.length },
            };
          })
        );

        const allSegments = [...lessonSegments, ...vocabularySegments];
        
        setSegments(allSegments);
        setDeckTitle(`${lesson.title} - Flashcards`);
      } catch (err) {
        console.error('Failed to generate flashcards:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flashcards');
        // Fallback to demo segments
        setSegments(demoSegments);
        setDeckTitle("Demo Flashcards");
      } finally {
        setLoading(false);
      }
    };

    loadLessonAndGenerateFlashcards();
  }, [lessonId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading flashcards...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <button onClick={() => navigate(-1)}>Back</button>
      </Box>  
    );
  }
  
  return (
    <FlashcardPage
      segments={segments}
      deckTitle={deckTitle}
      sessionType="mixed"
      onCardAnswer={(cardId, difficulty) => {
        console.log(`Card ${cardId} answered with difficulty: ${difficulty}`);
      }}
      onSessionComplete={(stats) => {
        console.log('Flashcard session completed:', stats);
      }}
      onNavigateBack={() => navigate(-1)}
      onNavigateHome={() => navigate('/')}
      onOpenSettings={() => console.log('Flashcard settings opened')}
    />
  );
};

const LessonPageWrapper = () => {
  // LessonPage handles its own routing internally using useParams
  return <LessonPage />;
};

const LibraryPageWrapper = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = React.useState<LibraryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load lessons from LibraryService on component mount
  React.useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Import LibraryService
        const { libraryService } = await import('./services/libraryService');
        
        // Initialize libraries (loads local and remote sources)
        await libraryService.initialize();
        
        // Get all lessons
        const allLessons = await libraryService.getLessons();
        console.log(`LibraryPageWrapper: Got ${allLessons.length} lessons from library service`);
        allLessons.forEach((lesson, index) => {
          console.log(`  ${index + 1}. ${lesson.id}: ${lesson.title} (${lesson.metadata.difficulty})`);
        });
        
        // Convert lessons to LibraryItem format expected by LibraryPage
        const libraryItems: LibraryItem[] = allLessons.map(lesson => ({
          id: lesson.id,
          type: 'annotation' as const,
          title: lesson.title,
          description: lesson.description,
          createdAt: lesson.metadata?.createdAt || new Date(),
          tags: lesson.metadata?.tags || [],
          difficulty: lesson.metadata?.difficulty || 'beginner' as const,
          itemCount: lesson.metadata?.vocabulary?.length || 0,
          data: {
            id: lesson.id,
            originalText: lesson.content,
            segments: [], // Will be filled by text segmentation service
            createdAt: lesson.metadata?.createdAt || new Date(),
            metadata: lesson.metadata || {},
          },
        }));
        
        console.log(`LibraryPageWrapper: Converted to ${libraryItems.length} library items`);
        setLessons(libraryItems);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        setError('Failed to load lessons. Using demo data.');
        setLessons(demoLibraryItems); // Fallback to demo data
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  // Convert LibraryItems back to lessons for the lessons prop (must be above early returns)
  const actualLessons = React.useMemo(() => {
    // For now, we need to convert the lessons back from library items
    // In the future, the library service should provide both formats
    return lessons.map(item => {
      if (item.data && typeof item.data === 'object' && 'originalText' in item.data) {
        return {
          id: item.id,
          title: item.title,
          description: item.description || '',
          content: item.data.originalText || '',
          metadata: {
            difficulty: item.difficulty || 'beginner',
            tags: item.tags || [],
            characterCount: item.data.originalText?.length || 0,
            source: 'Library',
            book: null,
            vocabulary: [],
            estimatedTime: 30,
            createdAt: item.createdAt,
            updatedAt: item.createdAt
          }
        };
      }
      // Fallback for items without proper data structure
      return {
        id: item.id,
        title: item.title,
        description: item.description || '',
        content: `Mock content for ${item.title}`,
        metadata: {
          difficulty: item.difficulty || 'beginner',
          tags: item.tags || [],
          characterCount: 50,
          source: 'Library',
          book: null,
          vocabulary: [],
          estimatedTime: 30,
          createdAt: item.createdAt,
          updatedAt: item.createdAt
        }
      };
    });
  }, [lessons]);

  // Show loading state with empty lessons until real data loads
  if (loading) {
    return (
      <LibraryPage
        lessons={[]} // Empty array during loading
        onLessonStart={(lessonId) => {
          console.log('Starting lesson (loading):', lessonId);
          navigate(`/lesson/${lessonId}`);
        }}
        onNavigateBack={() => navigate(-1)}
        onNavigateHome={() => navigate('/')}
        onOpenSettings={() => console.log('Library settings opened')}
      />
    );
  }

  if (error) {
    console.warn(error);
  }

  return (
    <LibraryPage
      lessons={actualLessons}
      onLessonStart={(lessonId) => {
        console.log('Starting lesson:', lessonId);
        // Navigate to the enhanced lesson page as per spec requirements
        navigate(`/lesson/${lessonId}`);
      }}
      onNavigateBack={() => navigate(-1)}
      onNavigateHome={() => navigate('/')}
      onOpenSettings={() => console.log('Library settings opened')}
    />
  );
};

/**
 * Main App Component
 * 
 * Root component that sets up routing, theming, and global state management
 * for the Chinese learning application. Provides navigation between all
 * page templates and manages session state across the application.
 * 
 * Features:
 * - React Router for SPA navigation with proper useNavigate hooks
 * - Material-UI theming with mobile-first design
 * - Session context for state management
 * - Route-based page template rendering with URL parameters
 * - Demo data for development and testing
 * - Lesson-specific routes for flashcards and quizzes
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <Router>
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<HomePageWrapper />} />

            {/* Text Annotation Route */}
            <Route path="/annotate" element={<AnnotationPageWrapper />} />

            {/* Quiz Routes - with optional lesson parameter */}
            <Route path="/quiz" element={<QuizPageWrapper />} />
            <Route path="/quiz/:lessonId" element={<QuizPageWrapper />} />

            {/* Flashcards Routes - with optional lesson parameter */}
            <Route path="/flashcards" element={<FlashcardPageWrapper />} />
            <Route path="/flashcards/:lessonId" element={<FlashcardPageWrapper />} />

            {/* Library Route */}
            <Route path="/library" element={<LibraryPageWrapper />} />

            {/* Individual Lesson Route */}
            <Route path="/lesson/:lessonId" element={<LessonPageWrapper />} />

            {/* Default redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
