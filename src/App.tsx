import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

/**
 * Main App Component
 * 
 * Root component that sets up routing, theming, and global state management
 * for the Chinese learning application. Provides navigation between all
 * page templates and manages session state across the application.
 * 
 * Features:
 * - React Router for SPA navigation
 * - Material-UI theming with mobile-first design
 * - Session context for state management
 * - Route-based page template rendering
 * - Demo data for development and testing
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <Router>
          <Routes>
            {/* Home Route */}
            <Route 
              path="/" 
              element={
                <HomePage
                  onStartAnnotation={() => window.location.href = '/annotate'}
                  onViewLibrary={() => window.location.href = '/library'}
                  onStartQuiz={() => window.location.href = '/quiz'}
                  onStartFlashcards={() => window.location.href = '/flashcards'}
                />
              } 
            />

            {/* Text Annotation Route */}
            <Route 
              path="/annotate" 
              element={
                <AnnotationPage
                  onBack={() => window.history.back()}
                  onHome={() => window.location.href = '/'}
                  onAnnotationComplete={(result) => {
                    console.log('Annotation completed:', result);
                    // In a real app, this would update session context
                  }}
                  onSave={(result) => {
                    console.log('Annotation saved:', result);
                  }}
                />
              } 
            />

            {/* Quiz Route */}
            <Route 
              path="/quiz" 
              element={
                <QuizPage
                  quiz={demoQuiz}
                  category="Greetings"
                  difficulty="beginner"
                  onQuizComplete={(score, total) => {
                    console.log(`Quiz completed: ${score}/${total}`);
                  }}
                  onNavigateBack={() => { window.history.back(); }}
                  onNavigateHome={() => { window.location.href = '/'; }}
                  onOpenSettings={() => console.log('Quiz settings opened')}
                />
              } 
            />

            {/* Flashcards Route */}
            <Route 
              path="/flashcards" 
              element={
                <FlashcardPage
                  segments={demoSegments}
                  deckTitle="Hello World Flashcards"
                  sessionType="mixed"
                  onCardAnswer={(cardId, difficulty) => {
                    console.log(`Card ${cardId} answered with difficulty: ${difficulty}`);
                  }}
                  onSessionComplete={(stats) => {
                    console.log('Flashcard session completed:', stats);
                  }}
                  onNavigateBack={() => { window.history.back(); }}
                  onNavigateHome={() => { window.location.href = '/'; }}
                  onOpenSettings={() => console.log('Flashcard settings opened')}
                />
              } 
            />

            {/* Library Route */}
            <Route 
              path="/library" 
              element={
                <LibraryPage
                  items={demoLibraryItems}
                  onItemSelect={(itemId) => console.log('Item selected:', itemId)}
                  onItemOpen={(item) => {
                    console.log('Item opened:', item);
                    // Navigate to appropriate page based on item type
                    if (item.type === 'annotation') {
                      window.location.href = '/annotate';
                    } else if (item.type === 'quiz') {
                      window.location.href = '/quiz';
                    } else if (item.type === 'flashcard-deck') {
                      window.location.href = '/flashcards';
                    }
                  }}

                  onCreateNew={(type) => {
                    console.log('Creating new:', type);
                    if (type === 'annotation') {
                      window.location.href = '/annotate';
                    }
                  }}
                  onNavigateBack={() => { window.history.back(); }}
                  onNavigateHome={() => { window.location.href = '/'; }}
                  onOpenSettings={() => console.log('Library settings opened')}
                />
              } 
            />

            {/* Default redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
