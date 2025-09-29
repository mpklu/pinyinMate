/**
 * Shared types used across the application
 * Common type aliases and enums to avoid duplication
 */

// Common difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Common language codes
export type LanguageCode = 'zh-CN' | 'zh-TW' | 'en';

// Common response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: Date;
}

// Performance metrics
export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  operationType: string;
}

// Common validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// User preferences (session-only)
export interface UserPreferences {
  showPinyin: boolean;
  showDefinitions: boolean;
  showToneMarks: boolean;
  audioEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  language: LanguageCode;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUDIO_SYNTHESIS_FAILED: 'AUDIO_SYNTHESIS_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];