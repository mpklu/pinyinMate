import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { SessionProvider } from './context/SessionContext';
import { 
  HomePage, 
  AnnotationPage, 
  QuizPage, 
  FlashcardPage, 
  LibraryPage 
} from './components/templates';
import type { LibraryItem } from './components/templates';

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
  
  return (
    <QuizPage
      quiz={demoQuiz}
      category={lessonId ? `Lesson ${lessonId}` : "Greetings"}
      difficulty="beginner"
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
  
  return (
    <FlashcardPage
      segments={demoSegments}
      deckTitle={lessonId ? `Lesson ${lessonId} Flashcards` : "Hello World Flashcards"}
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
        
        // Convert lessons to LibraryItem format expected by LibraryPage
        const libraryItems: LibraryItem[] = allLessons.map(lesson => ({
          id: lesson.id,
          type: 'annotation' as const,
          title: lesson.title,
          description: lesson.description,
          createdAt: lesson.metadata?.createdAt || new Date(),
          tags: lesson.metadata?.tags || [],
          difficulty: lesson.metadata?.difficulty || 'beginner' as const,
          itemCount: lesson.vocabulary?.length || 0,
          data: {
            id: lesson.id,
            originalText: lesson.content,
            segments: [], // Will be filled by text segmentation service
            createdAt: lesson.metadata?.createdAt || new Date(),
            metadata: lesson.metadata || {},
          },
        }));
        
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

  // Show loading state with demo data until real data loads
  if (loading) {
    return (
      <LibraryPage
        items={demoLibraryItems}
        onItemSelect={() => {}}
        onItemOpen={() => {}}
        onCreateNew={() => {}}
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
      items={lessons}
      onItemSelect={(itemId) => console.log('Item selected:', itemId)}
      onItemOpen={(item) => {
        console.log('Item opened:', item);
        // Navigate to appropriate page based on item type
        if (item.type === 'annotation') {
          navigate('/annotate');
        } else if (item.type === 'quiz') {
          navigate(`/quiz/${item.id}`);
        } else if (item.type === 'flashcard-deck') {
          navigate(`/flashcards/${item.id}`);
        }
      }}
      onCreateNew={(type) => {
        console.log('Creating new:', type);
        if (type === 'annotation') {
          navigate('/annotate');
        }
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

            {/* Default redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
