// Enhanced quiz types for the Library and Lesson System
// Extends existing quiz system for lesson-based learning

// Enhanced quiz question type supporting our three modes
export type LessonQuestionType = 'multiple-choice' | 'fill-blank' | 'audio-recognition';

export interface LessonQuizQuestion {
  id: string;                           // Generated unique ID
  lessonId: string;                    // Parent lesson reference
  type: LessonQuestionType;            // Question format
  question: string;                    // Question prompt
  correctAnswer: string;               // Correct response
  options?: string[];                  // Multiple choice options
  audioPrompt?: string;                // Audio recognition prompt
  metadata: LessonQuizQuestionMetadata; // Question metadata
}

export interface LessonQuizQuestionMetadata {
  sourceWord?: string;         // Vocabulary word source (if applicable)
  difficulty: number;          // Difficulty rating (1-5)
  createdAt: Date;            // Generation timestamp
  tags: string[];             // Question categories
}

export interface QuizGenerationConfig {
  multipleChoiceRatio: number;    // 0.5 = 50%
  fillBlankRatio: number;         // 0.3 = 30%
  audioRecognitionRatio: number;  // 0.2 = 20%
  minQuestions: number;           // 5
  maxQuestions: number;           // 20
}

export interface QuizSession {
  id: string;
  lessonId: string;
  questions: LessonQuizQuestion[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: Date;
  endTime?: Date;
  score?: number;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
  timestamp: Date;
}

// Re-export existing quiz types for convenience
export type { QuizQuestion, QuestionType, Quiz } from './quiz';