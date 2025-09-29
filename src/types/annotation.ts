/**
 * Types for text annotation and segmentation functionality
 * Defines the core data structures for Chinese text processing
 */

import type { DifficultyLevel } from './common';

export interface TextSegment {
  id: string;
  text: string;
  pinyin: string;
  toneMarks: string;
  definition?: string;
  audioUrl?: string;
  position: {
    start: number;
    end: number;
  };
}

export interface TextAnnotation {
  id: string;
  originalText: string;
  segments: TextSegment[];
  createdAt: Date;
  metadata: {
    title?: string;
    source?: string;
    difficulty?: DifficultyLevel;
  };
}

export interface AnnotateRequest {
  text: string;
  options?: {
    includeDefinitions?: boolean;
    includeToneMarks?: boolean;
    includeAudio?: boolean;
  };
}

export interface AnnotateResponse {
  success: boolean;
  data?: {
    annotation: TextAnnotation;
    processingTime: number;
  };
  error?: string;
}

// Validation types
export interface AnnotationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Pinyin types
export interface PinyinRequest {
  text: string;
  format?: 'basic' | 'numbered' | 'tone-marks';
}

export interface PinyinResponse {
  success: boolean;
  data?: {
    originalText: string;
    pinyin: string;
    format: string;
    processingTime: number;
  };
  error?: string;
}

// Processing options
export interface TextProcessingOptions {
  maxLength: number;
  minChineseChars: number;
  includePositions: boolean;
  filterInvalidChars: boolean;
}

// Constants
export const ANNOTATION_CONSTANTS = {
  MAX_TEXT_LENGTH: 10000,
  MIN_CHINESE_CHARS: 1,
  PERFORMANCE_THRESHOLDS: {
    SHORT_TEXT: 500, // ms for <1000 chars
    LONG_TEXT: 2000, // ms for <10000 chars
  },
} as const;
