/**
 * Types for quiz generation and submission functionality
 * Defines data structures for auto-generated quizzes from annotated content
 */

import type { DifficultyLevel } from './common';

export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'matching' | 'audio-recognition';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  sourceSegmentId?: string;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  sourceAnnotationId: string;
  questions: QuizQuestion[];
  type: 'auto-generated' | 'manual';
  createdAt: Date;
  metadata: {
    difficulty?: DifficultyLevel;
    estimatedTime?: number; // minutes
    tags?: string[];
    totalPoints?: number;
  };
}

export interface QuizGenerateRequest {
  sourceAnnotationId: string;
  questionTypes: QuestionType[];
  questionCount?: number;
  difficulty?: DifficultyLevel;
}

export interface QuizGenerateResponse {
  success: boolean;
  data?: {
    quiz: Quiz;
    generationTime: number;
  };
  error?: string;
}

export interface QuizSubmitRequest {
  quizId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  timeSpent?: number; // milliseconds
}

export interface QuizSubmitResponse {
  success: boolean;
  data?: {
    score: number; // percentage 0-100
    totalQuestions: number;
    correctAnswers: number;
    totalPoints: number;
    earnedPoints: number;
    results: QuizResult[];
  };
  error?: string;
}

// Quiz generation options
export interface QuizGenerationOptions {
  prioritizeNewWords: boolean;
  includeExplanations: boolean;
  randomizeOptions: boolean;
  balanceQuestionTypes: boolean;
}

// Constants
export const QUIZ_CONSTANTS = {
  DEFAULT_QUESTION_COUNT: 10,
  MAX_QUESTION_COUNT: 50,
  MIN_QUESTION_COUNT: 1,
  GENERATION_TIMEOUT: 1000, // ms
  VALIDATION_TIMEOUT: 100, // ms
  QUESTION_TYPES: {
    'multiple-choice': { minOptions: 3, maxOptions: 6 },
    'fill-in-blank': { minLength: 1, maxLength: 50 },
    'matching': { minPairs: 2, maxPairs: 10 },
    'audio-recognition': { maxDuration: 10 }, // seconds
  },
} as const;
