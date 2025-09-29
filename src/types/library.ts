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

// Static content types
export interface StaticLesson {
  id: string;
  title: string;
  content: string; // Chinese text
  difficulty: DifficultyLevel;
  vocabulary: string[]; // key words
  grammarPoints?: string[];
  culturalNotes?: string[];
  audioUrl?: string;
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
