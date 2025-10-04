/**
 * Router configuration with lazy loading and Suspense boundaries
 */

import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { 
  HomePage, 
  LibraryPage, 
  SourceLessonsPage,
  AnnotationPage, 
  FlashcardPage, 
  QuizPage,
  LessonPage,
  preloadServices 
} from '../utils/lazyLoading';

// Loading fallback component
const PageLoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="50vh"
    component="output"
    aria-label="Loading page content"
  >
    <CircularProgress size={40} />
  </Box>
);

// Root layout with Suspense boundary
const RootLayout = () => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Outlet />
  </Suspense>
);

// Route configurations with preloading
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: async () => {
          // Preload library service for immediate navigation
          preloadServices.library();
          return null;
        }
      },
      {
        path: "library",
        element: <LibraryPage />,
        loader: async () => {
          // Preload services likely to be used from library
          await Promise.all([
            preloadServices.library(),
            preloadServices.textSegmentation(),
          ]);
          return null;
        }
      },
      {
        path: "library/:sourceId",
        element: <SourceLessonsPage />,
        loader: async () => {
          // Preload library source service and lesson processing
          await Promise.all([
            preloadServices.library(),
            preloadServices.textSegmentation(),
            preloadServices.pinyin(),
          ]);
          return null;
        }
      },
      {
        path: "library/:sourceId/lesson/:lessonId",
        element: <LessonPage />,
        loader: async () => {
          // Preload all enhanced lesson services for library lessons
          await Promise.all([
            preloadServices.library(),
            preloadServices.textSegmentation(),
            preloadServices.pinyin(),
            preloadServices.audio(),
            preloadServices.srs(),
          ]);
          return null;
        }
      },
      {
        path: "annotate",
        element: <AnnotationPage />,
        loader: async () => {
          // Preload text processing services
          await Promise.all([
            preloadServices.textSegmentation(),
            preloadServices.pinyin(),
            preloadServices.audio(),
          ]);
          return null;
        }
      },
      {
        path: "flashcards/:lessonId?",
        element: <FlashcardPage />,
        loader: async () => {
          // Preload core services for flashcard experience
          preloadServices.srs();
          preloadServices.audio();
          return null;
        }
      },
      {
        path: "library/:sourceId/flashcards/:lessonId",
        element: <FlashcardPage />,
        loader: async () => {
          // Preload core services for flashcard experience
          preloadServices.srs();
          preloadServices.audio();
          return null;
        }
      },
      {
        path: "quiz/:lessonId?",
        element: <QuizPage />,
        loader: async () => {
          // Preload quiz and related services
          // Quiz generation now handled by libraryService.ts
          preloadServices.library();
          preloadServices.audio();
          return null;
        }
      },
      {
        path: "library/:sourceId/quiz/:lessonId",
        element: <QuizPage />,
        loader: async () => {
          // Preload quiz and related services for source-specific route
          preloadServices.library();
          preloadServices.audio();
          return null;
        }
      },
      {
        path: "lesson/:id",
        element: <LessonPage />,
        loader: async () => {
          // Preload all enhanced lesson services
          await Promise.all([
            preloadServices.library(),
            preloadServices.textSegmentation(),
            preloadServices.pinyin(),
            preloadServices.audio(),
            preloadServices.srs(),
          ]);
          return null;
        }
      }
    ]
  }
]);

export default router;