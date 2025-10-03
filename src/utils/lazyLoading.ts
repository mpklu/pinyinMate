/**
 * Lazy-loaded route components for optimal code splitting
 * Enables loading page components only when needed
 */

import { lazy } from 'react';

// Template components - lazy loaded for route-based code splitting
export const HomePage = lazy(() => 
  import('../components/routes/RouteWrappers').then(module => ({ 
    default: module.HomePageRoute 
  }))
);

export const LibraryPage = lazy(() => 
  import('../components/routes/LibrarySourcesPage').then(module => ({ 
    default: module.LibrarySourcesPage 
  }))
);

export const SourceLessonsPage = lazy(() => 
  import('../components/routes/SourceLessonsPage').then(module => ({ 
    default: module.SourceLessonsPage 
  }))
);

export const AnnotationPage = lazy(() => 
  import('../components/routes/RouteWrappers').then(module => ({ 
    default: module.AnnotationPageRoute 
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
  // quiz service removed - quiz generation now handled by libraryService
  pinyin: () => import('../services/pinyinService'),
  audio: () => import('../services/audioService'),
};

// Component library preloading for critical components
export const preloadComponents = {
  atoms: () => import('../components/atoms'),
  molecules: () => import('../components/molecules'),
  organisms: () => import('../components/organisms'),
};