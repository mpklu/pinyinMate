// Lesson types for the Enhanced Library and Lesson System
// Core learning unit containing Chinese text content and optional vocabulary

import type { LessonFlashcard } from './enhancedFlashcard';
import type { LessonQuizQuestion } from './enhancedQuiz';

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
  metadata: LessonMetadata;     // Lesson metadata
  vocabulary?: VocabularyEntry[]; // Optional vocabulary list
}

export interface LessonMetadata {
  category: string;             // e.g., "beginner", "intermediate"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;        // Minutes to complete
  tags: string[];              // Searchable tags
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