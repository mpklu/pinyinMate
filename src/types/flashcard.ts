/**
 * Types for flashcard generation and SRS (Spaced Repetition System) functionality
 * Implements SuperMemo SM-2 algorithm for session-based learning
 */

import type { DifficultyLevel } from './common';

export interface FlashcardContent {
  pinyin?: string;
  definition?: string;
  example?: string;
  audioUrl?: string;
}

export interface SRSData {
  interval: number; // days
  repetition: number; // number of successful reviews
  easeFactor: number; // 1.3 to 2.5+
  dueDate: Date;
  lastReviewed?: Date;
  totalReviews?: number;
}

export interface Flashcard {
  id: string;
  front: string; // Chinese text
  back: FlashcardContent;
  sourceSegmentId?: string;
  srsData: SRSData;
  tags?: string[];
  createdAt: Date;
  difficulty?: DifficultyLevel;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  cards: Flashcard[];
  sourceType: 'annotation' | 'manual';
  sourceId?: string;
  createdAt: Date;
  metadata: {
    cardCount: number;
    difficulty?: DifficultyLevel;
    tags?: string[];
    description?: string;
  };
}

export interface FlashcardGenerateRequest {
  sourceAnnotationId: string;
  includeDefinitions: boolean;
  includeExamples: boolean;
  cardLimit?: number;
  difficulty?: DifficultyLevel;
  tags?: string[];
}

export interface FlashcardGenerateResponse {
  success: boolean;
  data?: {
    deck: FlashcardDeck;
    generationTime: number;
  };
  error?: string;
}

export interface SRSQueueResponse {
  success: boolean;
  data?: {
    queue: Flashcard[];
    totalDue: number;
    nextReviewTime?: Date;
    studyStreak?: number;
  };
  error?: string;
}

export interface FlashcardReviewRequest {
  cardId: string;
  quality: number; // 0-5 scale (SM-2 algorithm)
  responseTime?: number; // milliseconds
  studySessionId?: string;
}

export interface FlashcardReviewResponse {
  success: boolean;
  data?: {
    nextReview: Date;
    interval: number; // days
    updatedCard: Flashcard;
    studyStreak?: number;
  };
  error?: string;
}

// SRS Quality ratings (SuperMemo SM-2)
export const SRSQuality = {
  BLACKOUT: 0, // Complete blackout
  INCORRECT_HARD: 1, // Incorrect, remembered
  INCORRECT_EASY: 2, // Incorrect, seemed easy
  CORRECT_HARD: 3, // Correct, difficult
  CORRECT: 4, // Correct, hesitated
  PERFECT: 5, // Perfect response
} as const;

export type SRSQualityValue = typeof SRSQuality[keyof typeof SRSQuality];

// Study session tracking
export interface StudySession {
  id: string;
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  averageResponseTime: number;
  streak: number;
}

// Constants
export const FLASHCARD_CONSTANTS = {
  DEFAULT_CARD_LIMIT: 20,
  MAX_CARD_LIMIT: 100,
  SRS_ALGORITHM: {
    INITIAL_INTERVAL: 1, // days
    INITIAL_EASE_FACTOR: 2.5,
    MIN_EASE_FACTOR: 1.3,
    EASE_BONUS: 0.1,
    EASE_PENALTY: 0.2,
    FAILURE_THRESHOLD: 3, // quality < 3 resets interval
  },
  PERFORMANCE_TARGETS: {
    GENERATION_TIME: 200, // ms
    REVIEW_PROCESSING: 50, // ms
  },
} as const;
