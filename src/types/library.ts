/**
 * Types for content library and export functionality
 * Defines data structures for static content and various export formats
 */

import type { DifficultyLevel } from './common';

// Content types
export type ContentType = 'flashcards' | 'quiz' | 'annotation' | 'deck';
export type ExportFormat = 'pdf' | 'anki' | 'quizlet' | 'csv' | 'json';
export type PageSize = 'A4' | 'Letter' | 'A5';
export type LayoutType = 'cards' | 'list' | 'booklet';

// Library content structure
export interface LibraryItem {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  difficulty: DifficultyLevel;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    itemCount: number;
    language: 'zh-CN' | 'zh-TW';
    author?: string;
    version?: string;
  };
}

export interface LibraryCollection {
  id: string;
  name: string;
  description?: string;
  items: LibraryItem[];
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

// Export request types
export interface PDFExportRequest {
  contentType: ContentType;
  contentId: string;
  options: {
    includeAudio?: boolean;
    includeAnswers?: boolean; // for quizzes
    layout?: LayoutType;
    pageSize?: PageSize;
    fontSize?: number;
    margin?: number;
  };
}

export interface PDFExportResponse {
  success: boolean;
  data?: {
    filename: string;
    blob: Blob;
    size: number; // bytes
    pageCount?: number;
  };
  error?: string;
}

export interface AnkiExportRequest {
  deckId: string;
  options: {
    includeAudio?: boolean;
    includeTags?: boolean;
    deckName?: string;
    noteType?: string;
  };
}

export interface AnkiExportResponse {
  success: boolean;
  data?: {
    filename: string;
    blob: Blob;
    cardCount: number;
    mediaFiles?: string[];
  };
  error?: string;
}

export interface QuizletExportRequest {
  deckId: string;
  options: {
    includeDefinitions?: boolean;
    includeExamples?: boolean;
    delimiter?: string;
    encoding?: string;
  };
}

export interface QuizletExportResponse {
  success: boolean;
  data?: {
    filename: string;
    csvContent: string;
    cardCount: number;
  };
  error?: string;
}

// Audio export types
export interface AudioSynthesizeRequest {
  text: string;
  options?: {
    voice?: 'male' | 'female';
    speed?: number; // 0.5-2.0
    pitch?: number; // 0.5-2.0
    format?: 'mp3' | 'wav' | 'ogg';
  };
}

export interface AudioSynthesizeResponse {
  success: boolean;
  data?: {
    audioUrl: string; // blob URL or data URL
    duration: number; // seconds
    format: 'mp3' | 'wav' | 'ogg';
    size?: number; // bytes
  };
  error?: string;
}

export interface AudioResponse {
  success: boolean;
  data?: {
    audioUrl: string;
    text: string;
    pinyin: string;
    duration: number;
  };
  error?: string;
}

// Lesson library system types
export interface LessonVocabulary {
  word: string;
  pinyin: string;
  definition: string;
  partOfSpeech?: string;
}

export interface AudioSegment {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

export interface LessonAudio {
  url: string;
  segments?: AudioSegment[];
  duration?: number; // seconds
}

export interface LessonMetadata {
  difficulty: DifficultyLevel;
  tags: string[];
  characterCount: number;
  vocabulary: LessonVocabulary[];
  grammarPoints?: string[];
  culturalNotes?: string[];
  estimatedTime: number; // minutes
  prerequisites?: string[];
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonContent {
  id: string;
  title: string;
  description?: string;
  content: string; // Chinese text
  metadata: LessonMetadata;
  audio?: LessonAudio;
}

export interface LessonSource {
  type: 'local' | 'remote';
  path?: string; // for local files
  url?: string; // for remote sources
  headers?: Record<string, string>; // for remote authentication
  cacheDuration?: number; // milliseconds
}

export interface LessonReference {
  id: string;
  title: string;
  description?: string;
  source: LessonSource;
  metadata: Omit<LessonMetadata, 'vocabulary' | 'grammarPoints' | 'culturalNotes'>;
}

export interface LessonCategory {
  id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  lessons: LessonReference[];
  totalLessons: number;
  estimatedTime: number; // total minutes for all lessons
  prerequisites?: string[];
}

export interface RemoteSource {
  id: string;
  name: string;
  baseUrl: string;
  authRequired: boolean;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}

export interface ContentManifest {
  version: string;
  lastUpdated: Date;
  categories: LessonCategory[];
  remoteSources?: RemoteSource[];
  settings?: {
    cacheDuration: number;
    maxCacheSize: number;
    prefetchEnabled: boolean;
  };
}

// Search and filtering
export interface SearchQuery {
  text?: string;
  difficulty?: DifficultyLevel[];
  tags?: string[];
  category?: string;
  minCharacterCount?: number;
  maxCharacterCount?: number;
  hasAudio?: boolean;
}

export interface LessonSearchResult {
  lesson: LessonReference;
  category: string;
  relevanceScore: number;
  matchedFields: string[];
}

// Cache management
export interface CachedLesson {
  content: LessonContent;
  cachedAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheStats {
  totalItems: number;
  totalSize: number; // bytes
  hitRate: number; // percentage
  oldestItem: Date;
  newestItem: Date;
}

// Loading and validation
export interface LoadingState {
  isLoading: boolean;
  progress?: number; // 0-100
  stage?: 'fetching' | 'parsing' | 'validating' | 'caching';
  error?: string;
}

export interface LessonValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Static content types (legacy - keep for backwards compatibility)
export interface StaticLesson extends LessonContent {
  vocabulary: string[]; // simplified version
}

export interface LessonCollection {
  id: string;
  name: string;
  lessons: StaticLesson[];
  totalLessons: number;
  estimatedTime: number; // minutes
  prerequisites?: string[];
}

// Export utilities
export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number; // seconds
}

// Constants
export const LIBRARY_CONSTANTS = {
  SUPPORTED_FORMATS: ['pdf', 'anki', 'quizlet', 'csv'] as const,
  EXPORT_LIMITS: {
    PDF_MAX_ITEMS: 200,
    ANKI_MAX_CARDS: 1000,
    CSV_MAX_ROWS: 5000,
  },
  PERFORMANCE_TARGETS: {
    PDF_GENERATION: 3000, // ms for up to 100 items
    ANKI_EXPORT: 2000, // ms for up to 500 cards
    CSV_EXPORT: 1000, // ms for any size
  },
  FILE_SIZE_LIMITS: {
    PDF_MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ANKI_MAX_SIZE: 100 * 1024 * 1024, // 100MB
    AUDIO_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  },
} as const;
