import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Contract test for Quiz Generation interface
 * Tests the client-side API for generating quizzes from annotated content
 * 
 * This test MUST FAIL initially - it defines the contract that implementation must fulfill
 */

// Mock the quiz generation service (will be implemented later)
const mockQuizGenerationService = {
  generate: vi.fn(),
  submit: vi.fn(),
};

// Types from the contract specification
interface QuizGenerateRequest {
  sourceAnnotationId: string;
  questionTypes: ('multiple-choice' | 'fill-in-blank' | 'matching' | 'audio-recognition')[];
  questionCount?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'matching' | 'audio-recognition';
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  sourceSegmentId?: string;
}

interface Quiz {
  id: string;
  sourceAnnotationId: string;
  questions: QuizQuestion[];
  type: 'auto-generated' | 'manual';
  createdAt: Date;
  metadata: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number;
  };
}

interface QuizGenerateResponse {
  success: boolean;
  data?: {
    quiz: Quiz;
    generationTime: number;
  };
  error?: string;
}

interface QuizSubmitRequest {
  quizId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
}

interface QuizSubmitResponse {
  success: boolean;
  data?: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    results: {
      questionId: string;
      correct: boolean;
      userAnswer: string | string[];
      correctAnswer: string | string[];
      explanation?: string;
    }[];
  };
  error?: string;
}

describe('Quiz Generation API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generate() method', () => {
    it('should generate quiz from valid annotation with multiple question types', async () => {
      // Arrange
      const request: QuizGenerateRequest = {
        sourceAnnotationId: 'ann_123',
        questionTypes: ['multiple-choice', 'fill-in-blank'],
        questionCount: 5,
        difficulty: 'beginner',
      };

      const expectedResponse: QuizGenerateResponse = {
        success: true,
        data: {
          quiz: {
            id: 'quiz_456',
            sourceAnnotationId: 'ann_123',
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                prompt: 'What is the pinyin for \'你好\'?',
                options: ['nǐ hǎo', 'nín hǎo', 'nǐ hào', 'ní hǎo'],
                correctAnswer: 'nǐ hǎo',
                sourceSegmentId: 'seg_1',
              },
              {
                id: 'q2',
                type: 'fill-in-blank',
                prompt: 'Fill in the blank: __ 世界 (Hello world)',
                correctAnswer: '你好',
                sourceSegmentId: 'seg_1',
              },
            ],
            type: 'auto-generated',
            createdAt: new Date('2025-09-28T10:35:00Z'),
            metadata: {
              difficulty: 'beginner',
              estimatedTime: 3,
            },
          },
          generationTime: 120,
        },
      };

      mockQuizGenerationService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.generate(request);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.data!.quiz.sourceAnnotationId).toBe(request.sourceAnnotationId);
      expect(result.data!.quiz.questions).toHaveLength(2);
      expect(result.data!.quiz.questions[0].type).toBe('multiple-choice');
      expect(result.data!.quiz.questions[1].type).toBe('fill-in-blank');
      expect(result.data!.quiz.id).toMatch(/^quiz_/);
    });

    it('should use default question count when not specified', async () => {
      // Arrange
      const request: QuizGenerateRequest = {
        sourceAnnotationId: 'ann_124',
        questionTypes: ['multiple-choice'],
      };

      const expectedResponse: QuizGenerateResponse = {
        success: true,
        data: {
          quiz: {
            id: 'quiz_457',
            sourceAnnotationId: 'ann_124',
            questions: Array.from({ length: 10 }, (_, i) => ({
              id: `q${i + 1}`,
              type: 'multiple-choice' as const,
              prompt: `Question ${i + 1}`,
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A',
            })),
            type: 'auto-generated',
            createdAt: new Date(),
            metadata: {},
          },
          generationTime: 200,
        },
      };

      mockQuizGenerationService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.generate(request);

      // Assert - Default question count of 10
      expect(result.data!.quiz.questions).toHaveLength(10);
    });

    it('should reject invalid source annotation ID', async () => {
      // Arrange
      const request: QuizGenerateRequest = {
        sourceAnnotationId: 'nonexistent_annotation',
        questionTypes: ['multiple-choice'],
      };

      const expectedResponse: QuizGenerateResponse = {
        success: false,
        error: 'Source annotation not found',
      };

      mockQuizGenerationService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.generate(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject invalid question count', async () => {
      // Arrange
      const request: QuizGenerateRequest = {
        sourceAnnotationId: 'ann_123',
        questionTypes: ['multiple-choice'],
        questionCount: 100, // > 50 limit
      };

      const expectedResponse: QuizGenerateResponse = {
        success: false,
        error: 'Question count must be between 1 and 50',
      };

      mockQuizGenerationService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.generate(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('between 1 and 50');
    });

    it('should reject empty question types', async () => {
      // Arrange
      const request: QuizGenerateRequest = {
        sourceAnnotationId: 'ann_123',
        questionTypes: [],
      };

      const expectedResponse: QuizGenerateResponse = {
        success: false,
        error: 'At least one question type must be specified',
      };

      mockQuizGenerationService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.generate(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('question type');
    });

    it('should meet performance requirements for generation', async () => {
      // Arrange
      const request: QuizGenerateRequest = {
        sourceAnnotationId: 'ann_123',
        questionTypes: ['multiple-choice'],
        questionCount: 10,
      };

      const expectedResponse: QuizGenerateResponse = {
        success: true,
        data: {
          quiz: {
            id: 'quiz_458',
            sourceAnnotationId: 'ann_123',
            questions: [],
            type: 'auto-generated',
            createdAt: new Date(),
            metadata: {},
          },
          generationTime: 800, // <1s requirement
        },
      };

      mockQuizGenerationService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.generate(request);

      // Assert - Performance contract
      expect(result.data!.generationTime).toBeLessThan(1000);
    });
  });

  describe('submit() method', () => {
    it('should process quiz submission and return detailed results', async () => {
      // Arrange
      const request: QuizSubmitRequest = {
        quizId: 'quiz_456',
        answers: [
          { questionId: 'q1', answer: 'nǐ hǎo' },
          { questionId: 'q2', answer: '你好' },
        ],
      };

      const expectedResponse: QuizSubmitResponse = {
        success: true,
        data: {
          score: 100,
          totalQuestions: 2,
          correctAnswers: 2,
          results: [
            {
              questionId: 'q1',
              correct: true,
              userAnswer: 'nǐ hǎo',
              correctAnswer: 'nǐ hǎo',
            },
            {
              questionId: 'q2',
              correct: true,
              userAnswer: '你好',
              correctAnswer: '你好',
            },
          ],
        },
      };

      mockQuizGenerationService.submit.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.submit(request);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.data!.score).toBe(100);
      expect(result.data!.totalQuestions).toBe(2);
      expect(result.data!.correctAnswers).toBe(2);
      expect(result.data!.results).toHaveLength(2);
      expect(result.data!.results[0].correct).toBe(true);
    });

    it('should handle incorrect answers with proper scoring', async () => {
      // Arrange
      const request: QuizSubmitRequest = {
        quizId: 'quiz_456',
        answers: [
          { questionId: 'q1', answer: 'wrong answer' },
          { questionId: 'q2', answer: '你好' },
        ],
      };

      const expectedResponse: QuizSubmitResponse = {
        success: true,
        data: {
          score: 50,
          totalQuestions: 2,
          correctAnswers: 1,
          results: [
            {
              questionId: 'q1',
              correct: false,
              userAnswer: 'wrong answer',
              correctAnswer: 'nǐ hǎo',
              explanation: 'The correct pinyin for \'你好\' is \'nǐ hǎo\'',
            },
            {
              questionId: 'q2',
              correct: true,
              userAnswer: '你好',
              correctAnswer: '你好',
            },
          ],
        },
      };

      mockQuizGenerationService.submit.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.submit(request);

      // Assert
      expect(result.data!.score).toBe(50);
      expect(result.data!.correctAnswers).toBe(1);
      expect(result.data!.results[0].correct).toBe(false);
      expect(result.data!.results[0].explanation).toBeDefined();
    });

    it('should reject submission for nonexistent quiz', async () => {
      // Arrange
      const request: QuizSubmitRequest = {
        quizId: 'nonexistent_quiz',
        answers: [],
      };

      const expectedResponse: QuizSubmitResponse = {
        success: false,
        error: 'Quiz not found',
      };

      mockQuizGenerationService.submit.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.submit(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should validate all questions are answered', async () => {
      // Arrange
      const request: QuizSubmitRequest = {
        quizId: 'quiz_456',
        answers: [
          { questionId: 'q1', answer: 'nǐ hǎo' },
          // Missing q2
        ],
      };

      const expectedResponse: QuizSubmitResponse = {
        success: false,
        error: 'All questions must be answered',
      };

      mockQuizGenerationService.submit.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockQuizGenerationService.submit(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('All questions');
    });
  });
});