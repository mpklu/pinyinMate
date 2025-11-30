import type { Lesson, VocabularyEntry, DifficultyLevel } from './lesson';

// Lesson source information
export interface LessonSource {
  type: 'local' | 'remote';
  sourceId: string;
  sourceName: string;
  path: string;
  url?: string;
}

// Builder-specific types
export interface LessonBuilderState {
  // Basic lesson info
  id: string;
  title: string;
  description: string;
  content: string;
  
  // Metadata
  difficulty: DifficultyLevel;
  lscsLevel: string;
  tags: string[];
  source: string;
  book: string | null;
  estimatedTime: number;
  
  // Processing state
  vocabulary: VocabularyEntry[];
  suggestedVocabulary: SuggestedVocabEntry[];
  validation: ValidationResult;
  
  // UI state
  isProcessing: boolean;
  isDirty: boolean;
  publishStatus: PublishStatus;
  
  // Edit mode state
  mode: 'create' | 'edit';
  originalLesson?: Lesson;
  lessonSource?: LessonSource;
  originalSha?: string;
  
  // Browser state
  browserOpen: boolean;
  availableLessons: any[]; // LessonListItem[] from githubFetchService
  lessonSearchQuery: string;
  isLoadingLessons: boolean;
}

export interface SuggestedVocabEntry extends VocabularyEntry {
  frequency: number;
  confidence: number;
  isSelected: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

export interface PublishStatus {
  isPublishing: boolean;
  lastPublishSuccess: boolean;
  lastPublishError?: string;
}

// Chinese text processing types
export interface TextAnalysisResult {
  characterCount: number;
  suggestedVocabulary: SuggestedVocabEntry[];
  estimatedDifficulty?: DifficultyLevel;
}

// GitHub API types
export interface GitHubCommitRequest {
  message: string;
  content: string;
  branch: string;
  path: string;
}

export interface GitHubCommitResponse {
  success: boolean;
  sha?: string;
  error?: string;
}