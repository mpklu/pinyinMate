// Lesson types for the Enhanced Library and Lesson System
// Core learning unit containing Chinese text content and optional vocabulary

import type { LessonFlashcard } from './enhancedFlashcard';
import type { LessonQuizQuestion } from './enhancedQuiz';
import type { DifficultyLevel } from './common';

// Base vocabulary entry (should be defined in common.ts or imported from existing types)
export interface VocabularyEntry {
  word: string;
  translation: string;
  partOfSpeech?: string;
}

export interface VocabularyEntryWithPinyin extends VocabularyEntry {
  pinyin: string;
  contextUsage?: string;       // Example usage in context
}

export interface Lesson {
  id: string;                   // Unique within library (e.g., "greetings")
  title: string;                // Display title
  description: string;          // Lesson description
  content: string;              // Chinese text content
  metadata: LessonMetadata;     // Lesson metadata (includes vocabulary)
  audio?: AudioData;            // Optional audio data
}

export interface LessonMetadata {
  difficulty: DifficultyLevel;
  tags: string[];              // Searchable tags
  characterCount: number;      // Number of Chinese characters in content
  source: string;              // Content source attribution (publisher, URL, etc.)
  book: string | null;         // Textbook reference if applicable
  vocabulary: VocabularyEntry[]; // Vocabulary entries for the lesson
  grammarPoints: string[];     // Key grammar concepts covered
  culturalNotes: string[];     // Cultural context information
  estimatedTime: number;       // Minutes to complete
  createdAt: Date;             // Creation timestamp
  updatedAt: Date;             // Last update timestamp
}

// Enhanced lesson that can generate interactive content
export interface PreparedLesson extends Lesson {
  segmentedContent: SegmentedText; // Text broken into teachable segments
  pinyinContent: string;           // Full text with pinyin
  flashcards: LessonFlashcard[];   // Generated flashcards
  quizQuestions: LessonQuizQuestion[]; // Generated quiz questions
}

export interface SegmentedText {
  segments: TextSegment[];      // Individual text segments
  fullText: string;            // Original complete text
}

export interface TextSegment {
  id: string;                  // Unique segment identifier
  text: string;                // Chinese text segment
  pinyin?: string;             // Pinyin pronunciation
  translation?: string;        // English translation
  vocabulary?: VocabularyEntry[]; // Related vocabulary
  startIndex: number;          // Position in original text
  endIndex: number;            // End position in original text
}

// Audio data types
export interface AudioData {
  url: string;                 // Audio file URL or path
  segments: AudioSegment[];    // Timed audio segments
  duration: number;           // Total audio duration in seconds
}

export interface AudioSegment {
  start: number;              // Start time in seconds
  end: number;                // End time in seconds
  text: string;               // Text corresponding to this audio segment
}

// Library management types
export interface LessonLibrary {
  id: string;                  // Library identifier
  name: string;                // Display name
  description: string;         // Library description
  type: 'local' | 'remote';   // Storage type
  lessons: Lesson[];           // Available lessons
  metadata: LibraryMetadata;   // Library metadata
}

export interface LibraryMetadata {
  version: string;             // Library version
  lastUpdated: Date;           // Last update timestamp
  totalLessons: number;        // Count of lessons
  categories: string[];        // Available categories
  supportedFeatures: LibraryFeature[]; // Feature support
}

export type LibraryFeature = 
  | 'flashcards'
  | 'quizzes' 
  | 'audio'
  | 'segmentation'
  | 'pinyin'
  | 'vocabulary';

// Remote library configuration
export interface RemoteLibrary extends LessonLibrary {
  type: 'remote';
  url: string;                 // Remote endpoint URL
  authentication?: AuthConfig; // Optional auth configuration
  syncInterval?: number;       // Auto-sync interval (minutes)
  lastSync?: Date;            // Last successful sync
}

export interface AuthConfig {
  type: 'bearer' | 'apikey' | 'basic';
  credentials: Record<string, string>;
}

// Local library configuration  
export interface LocalLibrary extends LessonLibrary {
  type: 'local';
  manifestPath: string;        // Path to local manifest file
}

// Library source configuration
export interface LibrarySource {
  id: string;                  // Source identifier
  name: string;                // Display name
  type: 'local' | 'remote';   // Source type
  config: LocalLibrary | RemoteLibrary; // Type-specific config
  enabled: boolean;            // Whether source is active
  priority: number;            // Loading priority (lower = higher priority)
}

// Lesson loading and caching
export interface LessonCache {
  lessonId: string;           // Cached lesson ID
  library: string;            // Source library ID
  lesson: PreparedLesson;     // Cached prepared lesson
  cachedAt: Date;            // Cache timestamp
  expiresAt?: Date;          // Optional expiration
}

export interface LessonLoadOptions {
  includeFlashcards?: boolean; // Generate flashcards
  includeQuizzes?: boolean;    // Generate quizzes
  includePinyin?: boolean;     // Add pinyin annotations
  segmentText?: boolean;       // Perform text segmentation
  cacheResult?: boolean;       // Cache the result
}

// Enhanced lesson interfaces for Interactive Lesson Learning Experience

/**
 * Enhanced lesson entity with processing and study capabilities
 * Extends existing Lesson interface while maintaining backward compatibility
 */
export interface EnhancedLesson extends Lesson {
  // Enhanced processing results
  processedContent?: ProcessedLessonContent;
  studyProgress?: LessonStudyProgress;
  studyMaterials?: LessonStudyMaterials;
}

/**
 * Lesson content enhanced with segmentation, pinyin, and audio preparation
 */
export interface ProcessedLessonContent {
  segments: TextSegmentWithAudio[];
  vocabularyMap: Map<string, VocabularyEntryWithPinyin>;
  totalSegments: number;
  processingTimestamp: Date;
  pinyinGenerated: boolean;
  audioReady: boolean;
}

/**
 * Individual text segment with pinyin and audio capabilities
 * Enhanced from existing TextSegment interface
 */
export interface TextSegmentWithAudio extends TextSegment {
  segmentType: 'sentence' | 'vocabulary' | 'punctuation';
  
  // Audio integration
  audioId?: string;
  audioReady: boolean;
  audioError?: string;
  
  // Vocabulary highlighting
  vocabularyWords: VocabularyReference[];
  clickable: boolean;
}

/**
 * Enhanced vocabulary entry with pinyin and study metadata
 */
export interface VocabularyEntryWithPinyin extends VocabularyEntry {
  // Enhanced fields
  pinyin: string;
  difficulty?: DifficultyLevel;
  frequency: number; // frequency in lesson content
  
  // Study integration
  studyCount: number;
  lastStudied?: Date;
  masteryLevel: number; // 0-100
}

/**
 * Track user progress through lesson study session
 */
export interface LessonStudyProgress {
  lessonId: string;
  userId?: string; // Optional for anonymous users
  
  // Progress tracking
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // seconds
  
  // Content progress
  segmentsViewed: Set<string>;
  vocabularyStudied: Set<string>;
  audioPlayed: Set<string>;
  
  // Study session data
  sessionCount: number;
  lastSessionAt: Date;
}

/**
 * Generated study materials (flashcards and quizzes) from lesson content
 */
export interface LessonStudyMaterials {
  lessonId: string;
  generatedAt: Date;
  
  // Flashcard generation
  flashcards?: LessonFlashcard[];
  flashcardCount: number;
  
  // Quiz generation  
  quizzes?: LessonQuizQuestion[];
  quizCount: number;
  
  // Generation metadata
  vocabularyFlashcards: number;
  sentenceFlashcards: number;
  multipleChoiceQuiz: number;
  fillInBlankQuiz: number;
}

/**
 * Vocabulary reference within text segments
 */
export interface VocabularyReference {
  word: string;
  startIndex: number;
  endIndex: number;
  difficulty?: DifficultyLevel;
}