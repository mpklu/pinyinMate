/**
 * Lazy-loaded route components for optimal code splitting
 * Enables loading page components only when needed
 */

import { lazy } from 'react';

// Template components - lazy loaded for route-based code splitting
export const HomePage = lazy(() => 
  import('../components/templates/HomePage').then(module => ({ 
    default: module.HomePage 
  }))
);

export const LibraryPage = lazy(() => 
  import('../components/templates/LibraryPage').then(module => ({ 
    default: module.LibraryPage 
  }))
);

export const AnnotationPage = lazy(() => 
  import('../components/templates/AnnotationPage').then(module => ({ 
    default: module.AnnotationPage 
  }))
);

export const FlashcardPage = lazy(() => 
  import('../components/routes/RouteWrappers').then(module => ({ 
    default: module.FlashcardPageRoute 
  }))
);

export const QuizPage = lazy(() => 
  import('../components/routes/RouteWrappers').then(module => ({ 
    default: module.QuizPageRoute 
  }))
);

export const LessonPage = lazy(() => 
  import('../components/templates/LessonPage').then(module => ({ 
    default: module.LessonPage 
  }))
);

// Service preloading functions for improved UX
export const preloadServices = {
  library: () => import('../services/lessonLibraryService'),
  textSegmentation: () => import('../services/textSegmentationService'),
  srs: () => import('../services/srsService'),
  quiz: () => import('../services/quizService'),
  pinyin: () => import('../services/pinyinService'),
  audio: () => import('../services/audioService'),
};

// Component library preloading for critical components
export const preloadComponents = {
  atoms: () => import('../components/atoms'),
  molecules: () => import('../components/molecules'),
  organisms: () => import('../components/organisms'),
};