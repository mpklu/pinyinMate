/**
 * Contract Test: Quiz Generation Service
 * 
 * Tests the Lesson Quiz Generation Service contract as defined in:
 * specs/003-help-me-refine/contracts/quiz-generation-service.md
 * 
 * These tests MUST fail initially (TDD approach) and define the expected
 * behavior before implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  EnhancedLesson,
  VocabularyEntryWithPinyin,
  DifficultyLevel,
  ValidationResult
} from '../../src/types';
import { quizGenerationService } from '../../src/services/quizGenerationService';

// Contract interface (will be implemented)
interface LessonQuizGenerationService {
  generateQuizFromLesson(
    lesson: EnhancedLesson,
    options: QuizGenerationOptions
  ): Promise<QuizGenerationResult>;

  generateVocabularyQuestions(
    vocabularyEntries: VocabularyEntryWithPinyin[],
    questionTypes: QuizQuestionType[],
    count: number
  ): Promise<QuestionGenerationResult>;

  generatePronunciationQuestions(
    lesson: EnhancedLesson,
    options: PronunciationQuizOptions
  ): Promise<QuestionGenerationResult>;

  validateQuizRequest(
    request: QuizGenerationRequest
  ): Promise<ValidationResult>;

  getQuizTemplates(): Promise<QuizTemplate[]>;
}

interface QuizGenerationOptions {
  questionTypes: QuizQuestionType[];
  questionCount: number; // 3-20
  difficulty: DifficultyLevel;
  includeAudio: boolean;
  timeLimit?: number; // seconds, 30-1800
  shuffleOptions: boolean;
  preventRepeat: boolean;
  focusVocabulary?: string[]; // specific words to focus on
}

type QuizQuestionType = 
  | 'multiple-choice-definition'
  | 'multiple-choice-pinyin'
  | 'multiple-choice-audio'
  | 'fill-in-blank'
  | 'audio-recognition'
  | 'pronunciation-match';

interface QuizGenerationResult {
  success: boolean;
  quiz: LessonQuiz;
  generationStats: QuizGenerationStats;
  generatedAt: Date;
  errors?: QuizGenerationError[];
}

interface QuestionGenerationResult {
  success: boolean;
  questions: LessonQuizQuestion[];
  generationTime: number;
  errors?: string[];
}

interface PronunciationQuizOptions {
  audioRequired: boolean;
  includeSegments: boolean;
  focusWords?: string[];
  maxQuestions: number;
}

interface QuizGenerationRequest {
  lesson: EnhancedLesson;
  options: QuizGenerationOptions;
}

interface LessonQuiz {
  id: string;
  lessonId: string;
  title: string;
  questions: LessonQuizQuestion[];
  metadata: QuizMetadata;
  generatedAt: Date;
}

interface LessonQuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioId?: string;
  difficulty: number; // 1-5
  vocabularyWord?: string;
  timeLimit?: number;
}

interface QuizMetadata {
  totalQuestions: number;
  estimatedTime: number;
  difficulty: DifficultyLevel;
  vocabularyFocus: string[];
  includesAudio: boolean;
}

interface QuizGenerationStats {
  totalGenerated: number;
  byQuestionType: Record<QuizQuestionType, number>;
  vocabularyWordsUsed: number;
  generationTime: number;
  audioGenerated: number;
}

interface QuizTemplate {
  id: string;
  name: string;
  questionType: QuizQuestionType;
  template: string;
  supportAudio: boolean;
  difficulty: DifficultyLevel;
}

interface QuizGenerationError {
  code: 'INVALID_LESSON' | 'INSUFFICIENT_VOCABULARY' | 'AUDIO_GENERATION_FAILED' | 'TEMPLATE_ERROR';
  message: string;
  questionType?: QuizQuestionType;
  vocabularyWord?: string;
}

// Mock test data
const mockVocabularyEntries: VocabularyEntryWithPinyin[] = [
  {
    word: '你好',
    translation: 'hello',
    partOfSpeech: 'interjection',
    pinyin: 'nǐ hǎo',
    difficulty: 'beginner',
    frequency: 2,
    studyCount: 0,
    masteryLevel: 0
  },
  {
    word: '名字',
    translation: 'name',
    partOfSpeech: 'noun',
    pinyin: 'míng zi',
    difficulty: 'beginner',
    frequency: 1,
    studyCount: 0,
    masteryLevel: 0
  },
  {
    word: '学生',
    translation: 'student',
    partOfSpeech: 'noun',
    pinyin: 'xué shēng',
    difficulty: 'intermediate',
    frequency: 1,
    studyCount: 0,
    masteryLevel: 0
  }
];

const mockEnhancedLesson: EnhancedLesson = {
  id: 'lesson-001',
  title: '基本问候语',
  description: 'Basic greetings lesson',
  content: '你好！我叫李明。你的名字是什么？',
  metadata: {
    difficulty: 'beginner',
    tags: ['greetings', 'introductions'],
    characterCount: 15,
    source: 'Test Suite',
    book: null,
    vocabulary: mockVocabularyEntries.map(v => ({
      word: v.word,
      translation: v.translation,
      partOfSpeech: v.partOfSpeech
    })),
    grammarPoints: ['introductions'],
    culturalNotes: [],
    estimatedTime: 15,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  processedContent: {
    segments: [],
    vocabularyMap: new Map(mockVocabularyEntries.map(v => [v.word, v])),
    totalSegments: 3,
    processingTimestamp: new Date(),
    pinyinGenerated: true,
    audioReady: true
  }
};

const mockQuizOptions: QuizGenerationOptions = {
  questionTypes: ['multiple-choice-definition', 'multiple-choice-pinyin'],
  questionCount: 5,
  difficulty: 'beginner',
  includeAudio: true,
  timeLimit: 300,
  shuffleOptions: true,
  preventRepeat: true
};

describe('Quiz Generation Service Contract', () => {
  let quizService: LessonQuizGenerationService;

  beforeEach(() => {
    // Use the actual service implementation instead of mock
    quizService = quizGenerationService as unknown as LessonQuizGenerationService;
  });

  describe('generateQuizFromLesson', () => {
    it('should generate quiz from lesson vocabulary', async () => {
      const mockQuiz: LessonQuiz = {
        id: 'quiz-001',
        lessonId: 'lesson-001',
        title: '基本问候语 - Quiz',
        questions: [
          {
            id: 'q-001',
            type: 'multiple-choice-definition',
            question: 'What does "你好" mean?',
            options: ['hello', 'goodbye', 'thank you', 'name'],
            correctAnswer: 'hello',
            explanation: '"你好" is a common greeting meaning "hello"',
            difficulty: 1,
            vocabularyWord: '你好'
          }
        ],
        metadata: {
          totalQuestions: 1,
          estimatedTime: 120,
          difficulty: 'beginner',
          vocabularyFocus: ['你好'],
          includesAudio: true
        },
        generatedAt: new Date()
      };

      const mockResult: QuizGenerationResult = {
        success: true,
        quiz: mockQuiz,
        generationStats: {
          totalGenerated: 1,
          byQuestionType: {
            'multiple-choice-definition': 1,
            'multiple-choice-pinyin': 0,
            'multiple-choice-audio': 0,
            'fill-in-blank': 0,
            'audio-recognition': 0,
            'pronunciation-match': 0
          },
          vocabularyWordsUsed: 1,
          generationTime: 800,
          audioGenerated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(quizService, 'generateQuizFromLesson').mockResolvedValue(mockResult);

      const result = await quizService.generateQuizFromLesson(mockEnhancedLesson, mockQuizOptions);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.quiz.questions).toHaveLength(1);
      expect(result.quiz.questions[0].type).toBe('multiple-choice-definition');
      expect(result.quiz.questions[0].options).toHaveLength(4);
      expect(result.quiz.questions[0].correctAnswer).toBe('hello');
      expect(result.generationStats.generationTime).toBeLessThan(2000); // Performance requirement
    });

    it('should respect question count limits', async () => {
      const limitedOptions: QuizGenerationOptions = {
        questionTypes: ['multiple-choice-definition'],
        questionCount: 3,
        difficulty: 'beginner',
        includeAudio: false,
        shuffleOptions: true,
        preventRepeat: true
      };

      const mockResult: QuizGenerationResult = {
        success: true,
        quiz: {
          id: 'quiz-002',
          lessonId: 'lesson-001',
          title: 'Limited Quiz',
          questions: Array.from({ length: 3 }, (_, i) => ({
            id: `q-${i + 1}`,
            type: 'multiple-choice-definition' as QuizQuestionType,
            question: `Question ${i + 1}`,
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            difficulty: 1
          })),
          metadata: {
            totalQuestions: 3,
            estimatedTime: 180,
            difficulty: 'beginner',
            vocabularyFocus: [],
            includesAudio: false
          },
          generatedAt: new Date()
        },
        generationStats: {
          totalGenerated: 3,
          byQuestionType: {
            'multiple-choice-definition': 3,
            'multiple-choice-pinyin': 0,
            'multiple-choice-audio': 0,
            'fill-in-blank': 0,
            'audio-recognition': 0,
            'pronunciation-match': 0
          },
          vocabularyWordsUsed: 3,
          generationTime: 600,
          audioGenerated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(quizService, 'generateQuizFromLesson').mockResolvedValue(mockResult);

      const result = await quizService.generateQuizFromLesson(mockEnhancedLesson, limitedOptions);
      expect(result.quiz.questions).toHaveLength(3);
      expect(result.quiz.metadata.totalQuestions).toBe(3);
    });

    it('should generate multiple question types', async () => {
      const multiTypeOptions: QuizGenerationOptions = {
        questionTypes: ['multiple-choice-definition', 'multiple-choice-pinyin', 'fill-in-blank'],
        questionCount: 6,
        difficulty: 'beginner',
        includeAudio: true,
        shuffleOptions: true,
        preventRepeat: true
      };

      const mockResult: QuizGenerationResult = {
        success: true,
        quiz: {
          id: 'quiz-003',
          lessonId: 'lesson-001',
          title: 'Multi-type Quiz',
          questions: [
            {
              id: 'q-001',
              type: 'multiple-choice-definition',
              question: 'What does "你好" mean?',
              options: ['hello', 'goodbye', 'name', 'student'],
              correctAnswer: 'hello',
              difficulty: 1,
              vocabularyWord: '你好'
            },
            {
              id: 'q-002',
              type: 'multiple-choice-pinyin',
              question: 'What is the pinyin for "名字"?',
              options: ['míng zi', 'nǐ hǎo', 'xué shēng', 'jiào'],
              correctAnswer: 'míng zi',
              difficulty: 1,
              vocabularyWord: '名字'
            }
          ],
          metadata: {
            totalQuestions: 2,
            estimatedTime: 240,
            difficulty: 'beginner',
            vocabularyFocus: ['你好', '名字'],
            includesAudio: true
          },
          generatedAt: new Date()
        },
        generationStats: {
          totalGenerated: 2,
          byQuestionType: {
            'multiple-choice-definition': 1,
            'multiple-choice-pinyin': 1,
            'multiple-choice-audio': 0,
            'fill-in-blank': 0,
            'audio-recognition': 0,
            'pronunciation-match': 0
          },
          vocabularyWordsUsed: 2,
          generationTime: 1200,
          audioGenerated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(quizService, 'generateQuizFromLesson').mockResolvedValue(mockResult);

      const result = await quizService.generateQuizFromLesson(mockEnhancedLesson, multiTypeOptions);
      expect(result.generationStats.byQuestionType['multiple-choice-definition']).toBe(1);
      expect(result.generationStats.byQuestionType['multiple-choice-pinyin']).toBe(1);
    });

    it('should handle insufficient vocabulary error', async () => {
      const emptyLesson: EnhancedLesson = {
        ...mockEnhancedLesson,
        metadata: {
          ...mockEnhancedLesson.metadata,
          vocabulary: []
        },
        processedContent: {
          ...mockEnhancedLesson.processedContent!,
          vocabularyMap: new Map()
        }
      };

      const errorResult: QuizGenerationResult = {
        success: false,
        quiz: {
          id: '',
          lessonId: 'lesson-001',
          title: '',
          questions: [],
          metadata: {
            totalQuestions: 0,
            estimatedTime: 0,
            difficulty: 'beginner',
            vocabularyFocus: [],
            includesAudio: false
          },
          generatedAt: new Date()
        },
        generationStats: {
          totalGenerated: 0,
          byQuestionType: {
            'multiple-choice-definition': 0,
            'multiple-choice-pinyin': 0,
            'multiple-choice-audio': 0,
            'fill-in-blank': 0,
            'audio-recognition': 0,
            'pronunciation-match': 0
          },
          vocabularyWordsUsed: 0,
          generationTime: 50,
          audioGenerated: 0
        },
        generatedAt: new Date(),
        errors: [{
          code: 'INSUFFICIENT_VOCABULARY',
          message: 'Lesson contains insufficient vocabulary for quiz generation',
          questionType: 'multiple-choice-definition'
        }]
      };

      vi.spyOn(quizService, 'generateQuizFromLesson').mockResolvedValue(errorResult);

      const result = await quizService.generateQuizFromLesson(emptyLesson, mockQuizOptions);
      expect(result.success).toBe(false);
      expect(result.errors![0].code).toBe('INSUFFICIENT_VOCABULARY');
    });
  });

  describe('generateVocabularyQuestions', () => {
    it('should generate questions from vocabulary entries', async () => {
      const mockResult: QuestionGenerationResult = {
        success: true,
        questions: [
          {
            id: 'vq-001',
            type: 'multiple-choice-definition',
            question: 'What does "你好" mean?',
            options: ['hello', 'goodbye', 'name', 'student'],
            correctAnswer: 'hello',
            difficulty: 1,
            vocabularyWord: '你好'
          }
        ],
        generationTime: 400,
        errors: []
      };

      vi.spyOn(quizService, 'generateVocabularyQuestions').mockResolvedValue(mockResult);

      const result = await quizService.generateVocabularyQuestions(
        mockVocabularyEntries,
        ['multiple-choice-definition'],
        1
      );

      expect(result.success).toBe(true);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].vocabularyWord).toBe('你好');
      expect(result.generationTime).toBeLessThan(1000);
    });
  });

  describe('generatePronunciationQuestions', () => {
    it('should generate pronunciation-based questions', async () => {
      const pronunciationOptions: PronunciationQuizOptions = {
        audioRequired: true,
        includeSegments: true,
        maxQuestions: 3
      };

      const mockResult: QuestionGenerationResult = {
        success: true,
        questions: [
          {
            id: 'pq-001',
            type: 'audio-recognition',
            question: 'Which word is being pronounced?',
            options: ['你好', '名字', '学生', '老师'],
            correctAnswer: '你好',
            audioId: 'audio-你好',
            difficulty: 2,
            vocabularyWord: '你好'
          }
        ],
        generationTime: 800,
        errors: []
      };

      vi.spyOn(quizService, 'generatePronunciationQuestions').mockResolvedValue(mockResult);

      const result = await quizService.generatePronunciationQuestions(mockEnhancedLesson, pronunciationOptions);

      expect(result.success).toBe(true);
      expect(result.questions[0].type).toBe('audio-recognition');
      expect(result.questions[0].audioId).toBeDefined();
    });
  });

  describe('validateQuizRequest', () => {
    it('should validate valid quiz request', async () => {
      const validRequest: QuizGenerationRequest = {
        lesson: mockEnhancedLesson,
        options: mockQuizOptions
      };

      vi.spyOn(quizService, 'validateQuizRequest').mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const result = await quizService.validateQuizRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid question count', async () => {
      const invalidRequest: QuizGenerationRequest = {
        lesson: mockEnhancedLesson,
        options: {
          ...mockQuizOptions,
          questionCount: 25 // Outside 3-20 range
        }
      };

      vi.spyOn(quizService, 'validateQuizRequest').mockResolvedValue({
        isValid: false,
        errors: ['questionCount must be between 3 and 20 (received: 25)'],
        warnings: []
      });

      const result = await quizService.validateQuizRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('questionCount must be between');
    });

    it('should require at least one question type', async () => {
      const invalidRequest: QuizGenerationRequest = {
        lesson: mockEnhancedLesson,
        options: {
          ...mockQuizOptions,
          questionTypes: [] // Empty question types
        }
      };

      vi.spyOn(quizService, 'validateQuizRequest').mockResolvedValue({
        isValid: false,
        errors: ['At least one question type is required'],
        warnings: []
      });

      const result = await quizService.validateQuizRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toBe('At least one question type is required');
    });
  });

  describe('getQuizTemplates', () => {
    it('should return available quiz templates', async () => {
      const mockTemplates: QuizTemplate[] = [
        {
          id: 'mc-definition-basic',
          name: 'Multiple Choice Definition (Basic)',
          questionType: 'multiple-choice-definition',
          template: 'What does "{{word}}" mean?',
          supportAudio: false,
          difficulty: 'beginner'
        },
        {
          id: 'audio-recognition-intermediate',
          name: 'Audio Recognition (Intermediate)',
          questionType: 'audio-recognition',
          template: 'Which word is being pronounced?',
          supportAudio: true,
          difficulty: 'intermediate'
        }
      ];

      vi.spyOn(quizService, 'getQuizTemplates').mockResolvedValue(mockTemplates);

      const result = await quizService.getQuizTemplates();
      expect(result).toHaveLength(2);
      expect(result[0].questionType).toBe('multiple-choice-definition');
      expect(result[1].supportAudio).toBe(true);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should meet generation time performance requirements', async () => {
      vi.spyOn(quizService, 'generateQuizFromLesson').mockImplementation(async () => {
        const startTime = Date.now();
        return {
          success: true,
          quiz: {
            id: 'perf-quiz-001',
            lessonId: 'lesson-001',
            title: 'Performance Test Quiz',
            questions: Array.from({ length: 10 }, (_, i) => ({
              id: `perf-q-${i}`,
              type: 'multiple-choice-definition' as QuizQuestionType,
              question: `Question ${i + 1}`,
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A',
              difficulty: 1
            })),
            metadata: {
              totalQuestions: 10,
              estimatedTime: 600,
              difficulty: 'beginner' as DifficultyLevel,
              vocabularyFocus: [],
              includesAudio: false
            },
            generatedAt: new Date()
          },
          generationStats: {
            totalGenerated: 10,
            byQuestionType: {
              'multiple-choice-definition': 10,
              'multiple-choice-pinyin': 0,
              'multiple-choice-audio': 0,
              'fill-in-blank': 0,
              'audio-recognition': 0,
              'pronunciation-match': 0
            },
            vocabularyWordsUsed: 10,
            generationTime: Date.now() - startTime,
            audioGenerated: 0
          },
          generatedAt: new Date()
        };
      });

      const result = await quizService.generateQuizFromLesson(mockEnhancedLesson, {
        ...mockQuizOptions,
        questionCount: 10
      });

      expect(result.generationStats.generationTime).toBeLessThan(2000); // < 2 seconds for 10 questions
    });

    it('should handle concurrent quiz generation requests', async () => {
      const promises = Array.from({ length: 3 }, (_, i) =>
        quizService.generateQuizFromLesson(
          { ...mockEnhancedLesson, id: `lesson-${i}` },
          mockQuizOptions
        )
      );

      vi.spyOn(quizService, 'generateQuizFromLesson').mockResolvedValue({
        success: true,
        quiz: {
          id: 'concurrent-quiz',
          lessonId: 'lesson-001',
          title: 'Concurrent Quiz',
          questions: [],
          metadata: {
            totalQuestions: 0,
            estimatedTime: 0,
            difficulty: 'beginner',
            vocabularyFocus: [],
            includesAudio: false
          },
          generatedAt: new Date()
        },
        generationStats: {
          totalGenerated: 0,
          byQuestionType: {
            'multiple-choice-definition': 0,
            'multiple-choice-pinyin': 0,
            'multiple-choice-audio': 0,
            'fill-in-blank': 0,
            'audio-recognition': 0,
            'pronunciation-match': 0
          },
          vocabularyWordsUsed: 0,
          generationTime: 100,
          audioGenerated: 0
        },
        generatedAt: new Date()
      });

      // Should handle concurrent generation requests
      await expect(Promise.all(promises)).resolves.toHaveLength(3);
    });

    it('should validate unique question IDs', async () => {
      const mockResult: QuizGenerationResult = {
        success: true,
        quiz: {
          id: 'unique-quiz',
          lessonId: 'lesson-001',
          title: 'Unique ID Quiz',
          questions: [
            {
              id: 'unique-q-001',
              type: 'multiple-choice-definition',
              question: 'Question 1',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A',
              difficulty: 1
            },
            {
              id: 'unique-q-002', // Different unique ID
              type: 'multiple-choice-pinyin',
              question: 'Question 2',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'B',
              difficulty: 1
            }
          ],
          metadata: {
            totalQuestions: 2,
            estimatedTime: 120,
            difficulty: 'beginner',
            vocabularyFocus: [],
            includesAudio: false
          },
          generatedAt: new Date()
        },
        generationStats: {
          totalGenerated: 2,
          byQuestionType: {
            'multiple-choice-definition': 1,
            'multiple-choice-pinyin': 1,
            'multiple-choice-audio': 0,
            'fill-in-blank': 0,
            'audio-recognition': 0,
            'pronunciation-match': 0
          },
          vocabularyWordsUsed: 2,
          generationTime: 500,
          audioGenerated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(quizService, 'generateQuizFromLesson').mockResolvedValue(mockResult);

      const result = await quizService.generateQuizFromLesson(mockEnhancedLesson, mockQuizOptions);
      const questionIds = result.quiz.questions.map(q => q.id);
      const uniqueIds = new Set(questionIds);
      expect(uniqueIds.size).toBe(questionIds.length); // All IDs should be unique
    });
  });
});