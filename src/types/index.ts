/**
 * Central export for all TypeScript types
 * Provides a single import point for all application types
 */

// Common types
export * from './common';

// Feature-specific types
export * from './annotation';
export * from './quiz';
export * from './flashcard';
export * from './library';
export * from './reader';

// Re-export commonly used types for convenience
export type {
  DifficultyLevel,
  LanguageCode,
  ApiResponse,
  ValidationResult,
  UserPreferences,
  AppError,
} from './common';

export type {
  TextAnnotation,
  TextSegment,
  AnnotateRequest,
  AnnotateResponse,
} from './annotation';

export type {
  Quiz,
  QuizQuestion,
  QuestionType,
  QuizGenerateRequest,
  QuizSubmitRequest,
} from './quiz';

export type {
  Flashcard,
  FlashcardDeck,
  SRSData,
  FlashcardGenerateRequest,
  FlashcardReviewRequest,
} from './flashcard';

export type {
  LibraryItem,
  ExportFormat,
  PDFExportRequest,
  AnkiExportRequest,
  QuizletExportRequest,
  AudioSynthesizeRequest,
} from './library';

// Enhanced lesson types for Interactive Lesson Learning Experience
export type {
  EnhancedLesson,
  ProcessedLessonContent,
  TextSegmentWithAudio,
  VocabularyEntryWithPinyin,
  LessonStudyProgress,
  LessonStudyMaterials,
  VocabularyReference,
} from './lesson';