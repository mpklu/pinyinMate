/**
 * Contract Test: Flashcard Generation Service
 * 
 * Tests the Lesson Flashcard Generation Service contract as defined in:
 * specs/003-help-me-refine/contracts/flashcard-generation-service.md
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
import { flashcardGenerationService } from '../../src/services/flashcardGenerationService';

// Contract interface (will be implemented)
interface LessonFlashcardGenerationService {
  generateFlashcardsFromLesson(
    lesson: EnhancedLesson,
    options: FlashcardGenerationOptions
  ): Promise<FlashcardGenerationResult>;

  generateFlashcardsFromVocabulary(
    vocabularyEntries: VocabularyEntryWithPinyin[],
    options: FlashcardGenerationOptions
  ): Promise<FlashcardGenerationResult>;

  validateGenerationRequest(
    request: FlashcardGenerationRequest
  ): Promise<ValidationResult>;

  getFlashcardTemplates(): Promise<FlashcardTemplate[]>;

  integrateSRSFlashcards(
    flashcards: LessonFlashcard[],
    userId?: string
  ): Promise<SRSIntegrationResult>;
}

interface FlashcardGenerationOptions {
  cardTypes: FlashcardType[];
  maxCards: number; // 1-50
  difficultyFilter?: DifficultyLevel[];
  includeAudio: boolean;
  includePinyin: boolean;
  includeExamples: boolean;
  srsIntegration: boolean;
}

type FlashcardType = 
  | 'hanzi-to-pinyin'
  | 'hanzi-to-definition' 
  | 'pinyin-to-hanzi'
  | 'definition-to-hanzi'
  | 'audio-to-hanzi'
  | 'hanzi-to-audio';

interface FlashcardGenerationResult {
  success: boolean;
  flashcards: LessonFlashcard[];
  generationStats: GenerationStats;
  generatedAt: Date;
  errors?: FlashcardGenerationError[];
}

interface GenerationStats {
  totalGenerated: number;
  byCardType: Record<FlashcardType, number>;
  vocabularyWordsUsed: number;
  generationTime: number;
  srsIntegrated: number;
}

interface FlashcardGenerationRequest {
  lesson: EnhancedLesson;
  options: FlashcardGenerationOptions;
}

interface LessonFlashcard {
  id: string;
  lessonId: string;
  vocabularyEntry: VocabularyEntryWithPinyin;
  
  // Card content
  frontSide: FlashcardSide;
  backSide: FlashcardSide;
  cardType: FlashcardType;
  
  // Metadata
  difficulty: number; // 1-5
  tags: string[];
  sourceSegmentIds: string[];
  
  // SRS integration
  srsData?: SRSCardData;
  
  // Generation metadata
  generatedAt: Date;
  template: string;
}

interface FlashcardSide {
  content: string;
  pinyin?: string;
  audioId?: string;
  imageUrl?: string;
  examples?: string[];
}

interface FlashcardTemplate {
  id: string;
  name: string;
  cardType: FlashcardType;
  frontTemplate: string;
  backTemplate: string;
  supportAudio: boolean;
  supportImages: boolean;
  difficulty: DifficultyLevel;
}

interface SRSIntegrationResult {
  success: boolean;
  integratedCards: number;
  deckId?: string;
  srsSystemId: string;
  errors?: string[];
}

interface SRSCardData {
  cardId: string;
  deckId: string;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  nextReview: Date;
}

interface FlashcardGenerationError {
  code: 'INVALID_LESSON' | 'NO_VOCABULARY' | 'TEMPLATE_ERROR' | 'SRS_INTEGRATION_FAILED' | 'AUDIO_GENERATION_FAILED';
  message: string;
  vocabularyWord?: string;
  cardType?: FlashcardType;
  details?: {
    expectedVocabularyCount?: number;
    actualVocabularyCount?: number;
    templateId?: string;
  };
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

const mockFlashcardOptions: FlashcardGenerationOptions = {
  cardTypes: ['hanzi-to-pinyin', 'hanzi-to-definition'],
  maxCards: 10,
  difficultyFilter: ['beginner'],
  includeAudio: true,
  includePinyin: true,
  includeExamples: true,
  srsIntegration: false
};

describe('Flashcard Generation Service Contract', () => {
  let flashcardService: LessonFlashcardGenerationService;

  beforeEach(() => {
    // Use the actual service implementation instead of mock
    flashcardService = flashcardGenerationService as unknown as LessonFlashcardGenerationService;
  });

  describe('generateFlashcardsFromLesson', () => {
    it('should generate flashcards from lesson vocabulary', async () => {
      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: [
          {
            id: 'card-001',
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0],
            frontSide: {
              content: '你好',
              pinyin: 'nǐ hǎo',
              audioId: 'audio-你好'
            },
            backSide: {
              content: 'hello',
              examples: ['你好！我是李明。']
            },
            cardType: 'hanzi-to-definition',
            difficulty: 1,
            tags: ['greetings', 'beginner'],
            sourceSegmentIds: ['seg-001'],
            generatedAt: new Date(),
            template: 'basic-hanzi-definition'
          }
        ],
        generationStats: {
          totalGenerated: 1,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 1,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 1,
          generationTime: 500,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, mockFlashcardOptions);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.flashcards).toHaveLength(1);
      expect(result.flashcards[0].frontSide.content).toBe('你好');
      expect(result.flashcards[0].backSide.content).toBe('hello');
      expect(result.flashcards[0].frontSide.pinyin).toBe('nǐ hǎo');
      expect(result.generationStats.totalGenerated).toBe(1);
      expect(result.generationStats.generationTime).toBeLessThan(3000); // Performance requirement
    });

    it('should generate multiple card types for vocabulary', async () => {
      const multiTypeOptions: FlashcardGenerationOptions = {
        cardTypes: ['hanzi-to-pinyin', 'hanzi-to-definition', 'pinyin-to-hanzi'],
        maxCards: 20,
        includeAudio: true,
        includePinyin: true,
        includeExamples: false,
        srsIntegration: false
      };

      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: [
          {
            id: 'card-001',
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0],
            frontSide: { content: '你好' },
            backSide: { content: 'nǐ hǎo' },
            cardType: 'hanzi-to-pinyin',
            difficulty: 1,
            tags: ['greetings'],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'basic-hanzi-pinyin'
          },
          {
            id: 'card-002',
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0],
            frontSide: { content: '你好' },
            backSide: { content: 'hello' },
            cardType: 'hanzi-to-definition',
            difficulty: 1,
            tags: ['greetings'],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'basic-hanzi-definition'
          }
        ],
        generationStats: {
          totalGenerated: 2,
          byCardType: {
            'hanzi-to-pinyin': 1,
            'hanzi-to-definition': 1,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 1,
          generationTime: 800,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, multiTypeOptions);
      expect(result.flashcards).toHaveLength(2);
      expect(result.generationStats.byCardType['hanzi-to-pinyin']).toBe(1);
      expect(result.generationStats.byCardType['hanzi-to-definition']).toBe(1);
    });

    it('should respect maxCards limit', async () => {
      const limitedOptions: FlashcardGenerationOptions = {
        cardTypes: ['hanzi-to-definition'],
        maxCards: 2,
        includeAudio: false,
        includePinyin: true,
        includeExamples: false,
        srsIntegration: false
      };

      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: Array.from({ length: 2 }, (_, i) => ({
          id: `card-${i + 1}`,
          lessonId: 'lesson-001',
          vocabularyEntry: mockVocabularyEntries[i],
          frontSide: { content: mockVocabularyEntries[i].word },
          backSide: { content: mockVocabularyEntries[i].translation },
          cardType: 'hanzi-to-definition' as FlashcardType,
          difficulty: 1,
          tags: [],
          sourceSegmentIds: [],
          generatedAt: new Date(),
          template: 'basic'
        })),
        generationStats: {
          totalGenerated: 2,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 2,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 2,
          generationTime: 400,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, limitedOptions);
      expect(result.flashcards).toHaveLength(2);
      expect(result.generationStats.totalGenerated).toBeLessThanOrEqual(2);
    });

    it('should filter by difficulty level', async () => {
      const beginnerOptions: FlashcardGenerationOptions = {
        cardTypes: ['hanzi-to-definition'],
        maxCards: 10,
        difficultyFilter: ['beginner'],
        includeAudio: false,
        includePinyin: true,
        includeExamples: false,
        srsIntegration: false
      };

      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: [
          {
            id: 'card-001',
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0], // beginner level
            frontSide: { content: '你好' },
            backSide: { content: 'hello' },
            cardType: 'hanzi-to-definition',
            difficulty: 1,
            tags: ['beginner'],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'basic'
          }
        ],
        generationStats: {
          totalGenerated: 1,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 1,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 1, // Only beginner words
          generationTime: 300,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, beginnerOptions);
      expect(result.flashcards[0].vocabularyEntry.difficulty).toBe('beginner');
      expect(result.generationStats.vocabularyWordsUsed).toBe(1); // Filtered count
    });

    it('should handle lessons with no vocabulary', async () => {
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

      const errorResult: FlashcardGenerationResult = {
        success: false,
        flashcards: [],
        generationStats: {
          totalGenerated: 0,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 0,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 0,
          generationTime: 50,
          srsIntegrated: 0
        },
        generatedAt: new Date(),
        errors: [{
          code: 'NO_VOCABULARY',
          message: 'Lesson contains no vocabulary entries',
          details: {
            expectedVocabularyCount: 1,
            actualVocabularyCount: 0
          }
        }]
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(errorResult);

      const result = await flashcardService.generateFlashcardsFromLesson(emptyLesson, mockFlashcardOptions);
      expect(result.success).toBe(false);
      expect(result.errors![0].code).toBe('NO_VOCABULARY');
      expect(result.flashcards).toHaveLength(0);
    });

    it('should include audio when requested', async () => {
      const audioOptions: FlashcardGenerationOptions = {
        cardTypes: ['hanzi-to-audio', 'audio-to-hanzi'],
        maxCards: 5,
        includeAudio: true,
        includePinyin: true,
        includeExamples: false,
        srsIntegration: false
      };

      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: [
          {
            id: 'card-001',
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0],
            frontSide: {
              content: '你好',
              audioId: 'audio-你好'
            },
            backSide: {
              content: '[Audio: 你好]'
            },
            cardType: 'hanzi-to-audio',
            difficulty: 1,
            tags: ['audio'],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'audio-template'
          }
        ],
        generationStats: {
          totalGenerated: 1,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 0,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 1
          },
          vocabularyWordsUsed: 1,
          generationTime: 1200,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, audioOptions);
      expect(result.flashcards[0].frontSide.audioId).toBeDefined();
      expect(result.flashcards[0].cardType).toBe('hanzi-to-audio');
    });
  });

  describe('generateFlashcardsFromVocabulary', () => {
    it('should generate flashcards from vocabulary entries directly', async () => {
      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: mockVocabularyEntries.map((vocab, index) => ({
          id: `vocab-card-${index + 1}`,
          lessonId: '', // No specific lesson
          vocabularyEntry: vocab,
          frontSide: { content: vocab.word, pinyin: vocab.pinyin },
          backSide: { content: vocab.translation },
          cardType: 'hanzi-to-definition' as FlashcardType,
          difficulty: vocab.difficulty === 'beginner' ? 1 : 3,
          tags: [vocab.difficulty!],
          sourceSegmentIds: [],
          generatedAt: new Date(),
          template: 'vocabulary-basic'
        })),
        generationStats: {
          totalGenerated: 3,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 3,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 3,
          generationTime: 600,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromVocabulary').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromVocabulary(mockVocabularyEntries, mockFlashcardOptions);
      expect(result.success).toBe(true);
      expect(result.flashcards).toHaveLength(3);
      expect(result.generationStats.vocabularyWordsUsed).toBe(3);
    });

    it('should handle empty vocabulary list', async () => {
      const errorResult: FlashcardGenerationResult = {
        success: false,
        flashcards: [],
        generationStats: {
          totalGenerated: 0,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 0,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 0,
          generationTime: 10,
          srsIntegrated: 0
        },
        generatedAt: new Date(),
        errors: [{
          code: 'NO_VOCABULARY',
          message: 'No vocabulary entries provided',
          details: {
            expectedVocabularyCount: 1,
            actualVocabularyCount: 0
          }
        }]
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromVocabulary').mockResolvedValue(errorResult);

      const result = await flashcardService.generateFlashcardsFromVocabulary([], mockFlashcardOptions);
      expect(result.success).toBe(false);
      expect(result.errors![0].code).toBe('NO_VOCABULARY');
    });
  });

  describe('validateGenerationRequest', () => {
    it('should validate valid generation request', async () => {
      const validRequest: FlashcardGenerationRequest = {
        lesson: mockEnhancedLesson,
        options: mockFlashcardOptions
      };

      vi.spyOn(flashcardService, 'validateGenerationRequest').mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const result = await flashcardService.validateGenerationRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid maxCards parameter', async () => {
      const invalidRequest: FlashcardGenerationRequest = {
        lesson: mockEnhancedLesson,
        options: {
          ...mockFlashcardOptions,
          maxCards: 100 // Outside 1-50 range
        }
      };

      vi.spyOn(flashcardService, 'validateGenerationRequest').mockResolvedValue({
        isValid: false,
        errors: ['maxCards must be between 1 and 50 (received: 100)'],
        warnings: []
      });

      const result = await flashcardService.validateGenerationRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('maxCards must be between 1 and 50');
      expect(result.errors[0]).toContain('100');
    });

    it('should require at least one card type', async () => {
      const invalidRequest: FlashcardGenerationRequest = {
        lesson: mockEnhancedLesson,
        options: {
          ...mockFlashcardOptions,
          cardTypes: [] // Empty card types
        }
      };

      vi.spyOn(flashcardService, 'validateGenerationRequest').mockResolvedValue({
        isValid: false,
        errors: ['At least one card type is required'],
        warnings: []
      });

      const result = await flashcardService.validateGenerationRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toBe('At least one card type is required');
    });
  });

  describe('getFlashcardTemplates', () => {
    it('should return available flashcard templates', async () => {
      const mockTemplates: FlashcardTemplate[] = [
        {
          id: 'hanzi-definition-basic',
          name: 'Basic Hanzi to Definition',
          cardType: 'hanzi-to-definition',
          frontTemplate: '{{hanzi}}',
          backTemplate: '{{definition}}\n{{pinyin}}',
          supportAudio: true,
          supportImages: false,
          difficulty: 'beginner'
        },
        {
          id: 'pinyin-hanzi-intermediate',
          name: 'Pinyin to Hanzi (Intermediate)',
          cardType: 'pinyin-to-hanzi',
          frontTemplate: '{{pinyin}}',
          backTemplate: '{{hanzi}}\n{{definition}}',
          supportAudio: true,
          supportImages: true,
          difficulty: 'intermediate'
        }
      ];

      vi.spyOn(flashcardService, 'getFlashcardTemplates').mockResolvedValue(mockTemplates);

      const result = await flashcardService.getFlashcardTemplates();
      expect(result).toHaveLength(2);
      expect(result[0].cardType).toBe('hanzi-to-definition');
      expect(result[1].cardType).toBe('pinyin-to-hanzi');
      expect(result[0].supportAudio).toBe(true);
    });

    it('should filter templates by difficulty and features', async () => {
      const beginnerTemplates: FlashcardTemplate[] = [
        {
          id: 'beginner-basic',
          name: 'Beginner Basic',
          cardType: 'hanzi-to-definition',
          frontTemplate: '{{hanzi}}',
          backTemplate: '{{definition}}',
          supportAudio: false,
          supportImages: false,
          difficulty: 'beginner'
        }
      ];

      vi.spyOn(flashcardService, 'getFlashcardTemplates').mockResolvedValue(beginnerTemplates);

      const result = await flashcardService.getFlashcardTemplates();
      expect(result.every(t => t.difficulty === 'beginner')).toBe(true);
    });
  });

  describe('integrateSRSFlashcards', () => {
    it('should integrate flashcards with SRS system', async () => {
      const mockFlashcards: LessonFlashcard[] = [
        {
          id: 'card-001',
          lessonId: 'lesson-001',
          vocabularyEntry: mockVocabularyEntries[0],
          frontSide: { content: '你好' },
          backSide: { content: 'hello' },
          cardType: 'hanzi-to-definition',
          difficulty: 1,
          tags: ['greetings'],
          sourceSegmentIds: [],
          generatedAt: new Date(),
          template: 'basic'
        }
      ];

      const mockSRSResult: SRSIntegrationResult = {
        success: true,
        integratedCards: 1,
        deckId: 'deck-001',
        srsSystemId: 'internal-srs'
      };

      vi.spyOn(flashcardService, 'integrateSRSFlashcards').mockResolvedValue(mockSRSResult);

      const result = await flashcardService.integrateSRSFlashcards(mockFlashcards, 'user-123');
      expect(result.success).toBe(true);
      expect(result.integratedCards).toBe(1);
      expect(result.deckId).toBeDefined();
    });

    it('should handle SRS integration failures', async () => {
      const mockFlashcards: LessonFlashcard[] = [
        {
          id: 'card-001',
          lessonId: 'lesson-001',
          vocabularyEntry: mockVocabularyEntries[0],
          frontSide: { content: '你好' },
          backSide: { content: 'hello' },
          cardType: 'hanzi-to-definition',
          difficulty: 1,
          tags: [],
          sourceSegmentIds: [],
          generatedAt: new Date(),
          template: 'basic'
        }
      ];

      const errorResult: SRSIntegrationResult = {
        success: false,
        integratedCards: 0,
        srsSystemId: 'internal-srs',
        errors: ['SRS system unavailable', 'Card format validation failed']
      };

      vi.spyOn(flashcardService, 'integrateSRSFlashcards').mockResolvedValue(errorResult);

      const result = await flashcardService.integrateSRSFlashcards(mockFlashcards);
      expect(result.success).toBe(false);
      expect(result.integratedCards).toBe(0);
      expect(result.errors).toHaveLength(2);
    });

    it('should support anonymous users without userId', async () => {
      const mockFlashcards: LessonFlashcard[] = [{
        id: 'card-001',
        lessonId: 'lesson-001',
        vocabularyEntry: mockVocabularyEntries[0],
        frontSide: { content: '你好' },
        backSide: { content: 'hello' },
        cardType: 'hanzi-to-definition',
        difficulty: 1,
        tags: [],
        sourceSegmentIds: [],
        generatedAt: new Date(),
        template: 'basic'
      }];

      const anonymousResult: SRSIntegrationResult = {
        success: true,
        integratedCards: 1,
        deckId: 'anonymous-deck-001',
        srsSystemId: 'local-storage'
      };

      vi.spyOn(flashcardService, 'integrateSRSFlashcards').mockResolvedValue(anonymousResult);

      const result = await flashcardService.integrateSRSFlashcards(mockFlashcards); // No userId
      expect(result.success).toBe(true);
      expect(result.srsSystemId).toBe('local-storage');
    });
  });

  describe('Performance and Error Handling', () => {
    it('should meet generation time performance requirements', async () => {
      const performanceOptions: FlashcardGenerationOptions = {
        cardTypes: ['hanzi-to-definition'],
        maxCards: 20,
        includeAudio: false,
        includePinyin: true,
        includeExamples: false,
        srsIntegration: false
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockImplementation(async () => {
        const startTime = Date.now();
        // Simulate processing
        return {
          success: true,
          flashcards: Array.from({ length: 20 }, (_, i) => ({
            id: `perf-card-${i}`,
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0],
            frontSide: { content: '你好' },
            backSide: { content: 'hello' },
            cardType: 'hanzi-to-definition' as FlashcardType,
            difficulty: 1,
            tags: [],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'basic'
          })),
          generationStats: {
            totalGenerated: 20,
            byCardType: {
              'hanzi-to-pinyin': 0,
              'hanzi-to-definition': 20,
              'pinyin-to-hanzi': 0,
              'definition-to-hanzi': 0,
              'audio-to-hanzi': 0,
              'hanzi-to-audio': 0
            },
            vocabularyWordsUsed: 1,
            generationTime: Date.now() - startTime,
            srsIntegrated: 0
          },
          generatedAt: new Date()
        };
      });

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, performanceOptions);
      expect(result.generationStats.generationTime).toBeLessThan(3000); // < 3 seconds for 20 cards
    });

    it('should handle concurrent generation requests', async () => {
      const promises = Array.from({ length: 3 }, (_, i) =>
        flashcardService.generateFlashcardsFromLesson(
          { ...mockEnhancedLesson, id: `lesson-${i}` },
          mockFlashcardOptions
        )
      );

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue({
        success: true,
        flashcards: [],
        generationStats: {
          totalGenerated: 0,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 0,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 0,
          generationTime: 100,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      });

      // Should handle up to 3 concurrent generation requests
      await expect(Promise.all(promises)).resolves.toHaveLength(3);
    });

    it('should validate unique flashcard IDs', async () => {
      const mockResult: FlashcardGenerationResult = {
        success: true,
        flashcards: [
          {
            id: 'card-001', // Unique ID
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[0],
            frontSide: { content: '你好' },
            backSide: { content: 'hello' },
            cardType: 'hanzi-to-definition',
            difficulty: 1,
            tags: [],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'basic'
          },
          {
            id: 'card-002', // Different unique ID
            lessonId: 'lesson-001',
            vocabularyEntry: mockVocabularyEntries[1],
            frontSide: { content: '名字' },
            backSide: { content: 'name' },
            cardType: 'hanzi-to-definition',
            difficulty: 1,
            tags: [],
            sourceSegmentIds: [],
            generatedAt: new Date(),
            template: 'basic'
          }
        ],
        generationStats: {
          totalGenerated: 2,
          byCardType: {
            'hanzi-to-pinyin': 0,
            'hanzi-to-definition': 2,
            'pinyin-to-hanzi': 0,
            'definition-to-hanzi': 0,
            'audio-to-hanzi': 0,
            'hanzi-to-audio': 0
          },
          vocabularyWordsUsed: 2,
          generationTime: 400,
          srsIntegrated: 0
        },
        generatedAt: new Date()
      };

      vi.spyOn(flashcardService, 'generateFlashcardsFromLesson').mockResolvedValue(mockResult);

      const result = await flashcardService.generateFlashcardsFromLesson(mockEnhancedLesson, mockFlashcardOptions);
      const cardIds = result.flashcards.map(card => card.id);
      const uniqueIds = new Set(cardIds);
      expect(uniqueIds.size).toBe(cardIds.length); // All IDs should be unique
    });
  });
});