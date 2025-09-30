// Enhanced flashcard types for the Library and Lesson System
// Extends existing flashcard system for lesson-based learning

export interface LessonFlashcard {
  id: string;                   // Generated unique ID
  lessonId: string;            // Parent lesson reference
  front: FlashcardSide;        // Chinese word side
  back: FlashcardSide;         // Translation + pinyin side
  metadata: LessonFlashcardMetadata; // Card metadata
}

export interface FlashcardSide {
  content: string;             // Main text content
  audioContent?: string;       // Audio text (for TTS)
  auxiliaryText?: string;      // Additional text (pinyin, etc.)
}

export interface LessonFlashcardMetadata {
  sourceWord: string;          // Original vocabulary word
  partOfSpeech?: string;       // Grammatical category
  createdAt: Date;            // Generation timestamp
}

export interface FlashcardDeckState {
  cards: LessonFlashcard[];
  currentIndex: number;
  totalCards: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

// Navigation state for linear flashcard progression
export interface FlashcardNavigation {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Re-export existing flashcard types for convenience
export type { Flashcard, FlashcardContent, SRSData } from './flashcard';