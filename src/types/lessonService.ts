/**
 * LessonService interface for lesson content processing and enhancement
 * Handles content preparation, text segmentation, vocabulary enhancement
 */

import type { Lesson, PreparedLesson, SegmentedText, TextSegment, VocabularyEntry, VocabularyEntryWithPinyin } from './lesson';
import type { LessonFlashcard } from './enhancedFlashcard';
import type { LessonQuizQuestion } from './enhancedQuiz';

/**
 * Configuration for lesson processing
 */
export interface LessonProcessingConfig {
  /** Whether to generate pinyin for vocabulary */
  generatePinyin: boolean;
  /** Whether to segment text into teachable chunks */
  segmentText: boolean;
  /** Preferred segmentation granularity */
  segmentationMode: 'sentence' | 'paragraph' | 'section';
  /** Whether to enhance vocabulary with frequency data */
  enhanceVocabulary: boolean;
  /** Maximum number of segments per lesson */
  maxSegments?: number;
}

/**
 * Result of lesson content processing
 */
export interface LessonProcessingResult {
  /** The processed lesson with enhanced content */
  processedLesson: PreparedLesson;
  /** Segmented text for audio and study */
  segmentedContent: SegmentedText;
  /** Enhanced vocabulary with pinyin */
  enhancedVocabulary: VocabularyEntryWithPinyin[];
  /** Processing metadata */
  processingStats: {
    segmentCount: number;
    vocabularyCount: number;
    processingTime: number;
    warnings: string[];
  };
}

/**
 * Options for generating flashcards from lesson content
 */
export interface FlashcardGenerationOptions {
  /** Source for flashcard content */
  source: 'vocabulary' | 'content' | 'both';
  /** Maximum number of flashcards to generate */
  maxCards: number;
  /** Include audio cues */
  includeAudio: boolean;
  /** Difficulty filter */
  difficultyRange?: [number, number];
}

/**
 * Options for generating quiz questions from lesson content  
 */
export interface QuizGenerationOptions {
  /** Types of questions to generate */
  questionTypes: ('multiple-choice' | 'fill-blank' | 'audio-recognition')[];
  /** Number of questions per type */
  questionsPerType: number;
  /** Include questions from lesson content */
  includeContent: boolean;
  /** Include questions from vocabulary */
  includeVocabulary: boolean;
}

/**
 * Service for processing and enhancing lesson content
 */
export interface LessonService {
  /**
   * Process raw lesson data into enhanced, learnable content
   */
  processLesson(lesson: Lesson, config: LessonProcessingConfig): Promise<LessonProcessingResult>;

  /**
   * Segment lesson text for audio playback and study
   */
  segmentLessonText(content: string, mode: 'sentence' | 'paragraph' | 'section'): Promise<TextSegment[]>;

  /**
   * Enhance vocabulary entries with pinyin and additional metadata
   */
  enhanceVocabulary(vocabulary: VocabularyEntry[], sourceText?: string): Promise<VocabularyEntryWithPinyin[]>;

  /**
   * Generate flashcards from lesson content and vocabulary
   */
  generateFlashcards(lesson: PreparedLesson, options: FlashcardGenerationOptions): Promise<LessonFlashcard[]>;

  /**
   * Generate quiz questions from lesson content and vocabulary
   */
  generateQuizQuestions(lesson: PreparedLesson, options: QuizGenerationOptions): Promise<LessonQuizQuestion[]>;

  /**
   * Validate lesson content structure and completeness
   */
  validateLessonContent(lesson: Lesson): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>;

  /**
   * Extract vocabulary from lesson text content automatically
   */
  extractVocabularyFromContent(content: string, existingVocabulary?: string[]): Promise<string[]>;

  /**
   * Get content statistics and complexity metrics
   */
  analyzeLessonComplexity(lesson: Lesson): Promise<{
    characterCount: number;
    vocabularyComplexity: number;
    estimatedReadingTime: number;
    difficultyScore: number;
    recommendations: string[];
  }>;
}