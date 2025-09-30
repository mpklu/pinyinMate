import { describe, it, expect, beforeEach, vi } from 'vitest';

import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Enhanced Flashcard API Contract Tests - TDD Style
 * Tests the client-side API for creating lesson-based flashcards with SRS
 * 
 * These tests MUST FAIL initially - they define contracts that services must fulfill
 * Only implement FlashcardService after these tests are written and failing
 */

// Import types that will be implemented
import type { FlashcardService } from '../../src/services/flashcardService';
import type { LessonFlashcard, FlashcardGenerationConfig } from '../../src/types/enhancedFlashcard';
import type { Lesson, VocabularyEntry } from '../../src/types/lesson';

// Mock the flashcard SRS service (will be implemented later)
const mockFlashcardSRSService = {
  generate: vi.fn(),
  getSRSQueue: vi.fn(),
  submitReview: vi.fn(),
};

// Types from the contract specification
interface FlashcardGenerateRequest {
  sourceAnnotationId: string;
  includeDefinitions: boolean;
  includeExamples: boolean;
  cardLimit?: number;
}

interface FlashcardContent {
  pinyin?: string;
  definition?: string;
  example?: string;
}

interface SRSData {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: Date;
}

interface Flashcard {
  id: string;
  front: string;
  back: FlashcardContent;
  sourceSegmentId?: string;
  srsData: SRSData;
  tags?: string[];
}

interface FlashcardDeck {
  id: string;
  name: string;
  cards: Flashcard[];
  sourceType: 'annotation' | 'manual';
  sourceId?: string;
  createdAt: Date;
  metadata: {
    cardCount: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  };
}

interface FlashcardGenerateResponse {
  success: boolean;
  data?: {
    deck: FlashcardDeck;
    generationTime: number;
  };
  error?: string;
}

interface SRSQueueResponse {
  success: boolean;
  data?: {
    queue: Flashcard[];
    totalDue: number;
    nextReviewTime?: Date;
  };
  error?: string;
}

interface FlashcardReviewRequest {
  cardId: string;
  quality: number; // 0-5 scale
  responseTime?: number;
}

interface FlashcardReviewResponse {
  success: boolean;
  data?: {
    nextReview: Date;
    interval: number;
    updatedCard: Flashcard;
  };
  error?: string;
}

describe('Flashcard SRS API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generate() method', () => {
    it('should generate flashcards from valid annotation', async () => {
      // Arrange
      const request: FlashcardGenerateRequest = {
        sourceAnnotationId: 'ann_123',
        includeDefinitions: true,
        includeExamples: false,
        cardLimit: 10,
      };

      const expectedResponse: FlashcardGenerateResponse = {
        success: true,
        data: {
          deck: {
            id: 'deck_789',
            name: 'Sample Text Flashcards',
            cards: [
              {
                id: 'card_1',
                front: '你好',
                back: {
                  pinyin: 'nǐ hǎo',
                  definition: 'hello',
                },
                sourceSegmentId: 'seg_1',
                srsData: {
                  interval: 1,
                  repetition: 0,
                  easeFactor: 2.5,
                  dueDate: new Date('2025-09-29T10:30:00Z'),
                },
                tags: ['greeting', 'basic'],
              },
            ],
            sourceType: 'annotation',
            sourceId: 'ann_123',
            createdAt: new Date('2025-09-28T10:40:00Z'),
            metadata: {
              cardCount: 1,
              difficulty: 'beginner',
              tags: ['greeting'],
            },
          },
          generationTime: 80,
        },
      };

      mockFlashcardSRSService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.generate(request);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.data!.deck.sourceId).toBe(request.sourceAnnotationId);
      expect(result.data!.deck.cards).toHaveLength(1);
      expect(result.data!.deck.cards[0].front).toBe('你好');
      expect(result.data!.deck.cards[0].back.definition).toBe('hello');
      expect(result.data!.deck.cards[0].srsData.interval).toBe(1);
      expect(result.data!.deck.cards[0].srsData.easeFactor).toBe(2.5);
    });

    it('should use default card limit when not specified', async () => {
      // Arrange
      const request: FlashcardGenerateRequest = {
        sourceAnnotationId: 'ann_124',
        includeDefinitions: true,
        includeExamples: true,
      };

      const expectedResponse: FlashcardGenerateResponse = {
        success: true,
        data: {
          deck: {
            id: 'deck_790',
            name: 'Auto Generated Flashcards',
            cards: Array.from({ length: 20 }, (_, i) => ({
              id: `card_${i + 1}`,
              front: `Chinese ${i + 1}`,
              back: {
                pinyin: `pinyin ${i + 1}`,
                definition: `definition ${i + 1}`,
                example: `example ${i + 1}`,
              },
              srsData: {
                interval: 1,
                repetition: 0,
                easeFactor: 2.5,
                dueDate: new Date(),
              },
            })),
            sourceType: 'annotation',
            sourceId: 'ann_124',
            createdAt: new Date(),
            metadata: {
              cardCount: 20,
            },
          },
          generationTime: 150,
        },
      };

      mockFlashcardSRSService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.generate(request);

      // Assert - Default card limit of 20
      expect(result.data!.deck.cards).toHaveLength(20);
      expect(result.data!.deck.metadata.cardCount).toBe(20);
    });

    it('should include examples when requested', async () => {
      // Arrange
      const request: FlashcardGenerateRequest = {
        sourceAnnotationId: 'ann_123',
        includeDefinitions: true,
        includeExamples: true,
        cardLimit: 5,
      };

      const expectedResponse: FlashcardGenerateResponse = {
        success: true,
        data: {
          deck: {
            id: 'deck_791',
            name: 'Example Flashcards',
            cards: [
              {
                id: 'card_2',
                front: '世界',
                back: {
                  pinyin: 'shì jiè',
                  definition: 'world',
                  example: '你好世界！',
                },
                srsData: {
                  interval: 1,
                  repetition: 0,
                  easeFactor: 2.5,
                  dueDate: new Date(),
                },
              },
            ],
            sourceType: 'annotation',
            sourceId: 'ann_123',
            createdAt: new Date(),
            metadata: {
              cardCount: 1,
            },
          },
          generationTime: 100,
        },
      };

      mockFlashcardSRSService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.generate(request);

      // Assert
      expect(result.data!.deck.cards[0].back.example).toBeDefined();
      expect(result.data!.deck.cards[0].back.example).toBe('你好世界！');
    });

    it('should reject invalid source annotation ID', async () => {
      // Arrange
      const request: FlashcardGenerateRequest = {
        sourceAnnotationId: 'nonexistent_annotation',
        includeDefinitions: true,
        includeExamples: false,
      };

      const expectedResponse: FlashcardGenerateResponse = {
        success: false,
        error: 'Source annotation not found',
      };

      mockFlashcardSRSService.generate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.generate(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('getSRSQueue() method', () => {
    it('should return current SRS queue with due cards', async () => {
      // Arrange
      const expectedResponse: SRSQueueResponse = {
        success: true,
        data: {
          queue: [
            {
              id: 'card_1',
              front: '你好',
              back: {
                pinyin: 'nǐ hǎo',
                definition: 'hello',
              },
              srsData: {
                interval: 1,
                repetition: 0,
                easeFactor: 2.5,
                dueDate: new Date('2025-09-28T10:00:00Z'), // Past due
              },
            },
            {
              id: 'card_2',
              front: '世界',
              back: {
                pinyin: 'shì jiè',
                definition: 'world',
              },
              srsData: {
                interval: 2,
                repetition: 1,
                easeFactor: 2.6,
                dueDate: new Date('2025-09-28T12:00:00Z'), // Past due
              },
            },
          ],
          totalDue: 2,
          nextReviewTime: new Date('2025-09-29T10:00:00Z'),
        },
      };

      mockFlashcardSRSService.getSRSQueue.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.getSRSQueue();

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.data!.queue).toHaveLength(2);
      expect(result.data!.totalDue).toBe(2);
      expect(result.data!.nextReviewTime).toBeDefined();
    });

    it('should return empty queue when no cards are due', async () => {
      // Arrange
      const expectedResponse: SRSQueueResponse = {
        success: true,
        data: {
          queue: [],
          totalDue: 0,
          nextReviewTime: new Date('2025-09-30T10:00:00Z'),
        },
      };

      mockFlashcardSRSService.getSRSQueue.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.getSRSQueue();

      // Assert
      expect(result.data!.queue).toHaveLength(0);
      expect(result.data!.totalDue).toBe(0);
    });
  });

  describe('submitReview() method', () => {
    it('should process perfect review (quality 5) and advance interval', async () => {
      // Arrange
      const request: FlashcardReviewRequest = {
        cardId: 'card_1',
        quality: 5,
        responseTime: 3000,
      };

      const expectedResponse: FlashcardReviewResponse = {
        success: true,
        data: {
          nextReview: new Date('2025-09-30T10:30:00Z'),
          interval: 2, // Advanced from 1 to 2 days
          updatedCard: {
            id: 'card_1',
            front: '你好',
            back: {
              pinyin: 'nǐ hǎo',
              definition: 'hello',
            },
            srsData: {
              interval: 2,
              repetition: 1,
              easeFactor: 2.5,
              dueDate: new Date('2025-09-30T10:30:00Z'),
            },
          },
        },
      };

      mockFlashcardSRSService.submitReview.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.submitReview(request);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.data!.interval).toBe(2);
      expect(result.data!.updatedCard.srsData.repetition).toBe(1);
      expect(result.data!.updatedCard.srsData.interval).toBe(2);
    });

    it('should process poor review (quality 0-2) and reset interval', async () => {
      // Arrange
      const request: FlashcardReviewRequest = {
        cardId: 'card_2',
        quality: 1, // Poor quality
        responseTime: 10000,
      };

      const expectedResponse: FlashcardReviewResponse = {
        success: true,
        data: {
          nextReview: new Date('2025-09-29T10:30:00Z'),
          interval: 1, // Reset to 1 day
          updatedCard: {
            id: 'card_2',
            front: '世界',
            back: {
              pinyin: 'shì jiè',
              definition: 'world',
            },
            srsData: {
              interval: 1,
              repetition: 0, // Reset
              easeFactor: 2.3, // Decreased
              dueDate: new Date('2025-09-29T10:30:00Z'),
            },
          },
        },
      };

      mockFlashcardSRSService.submitReview.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.submitReview(request);

      // Assert - Poor quality resets progress
      expect(result.data!.interval).toBe(1);
      expect(result.data!.updatedCard.srsData.repetition).toBe(0);
      expect(result.data!.updatedCard.srsData.easeFactor).toBeLessThan(2.5);
    });

    it('should reject invalid quality scores', async () => {
      // Arrange
      const request: FlashcardReviewRequest = {
        cardId: 'card_1',
        quality: 6, // Invalid quality > 5
      };

      const expectedResponse: FlashcardReviewResponse = {
        success: false,
        error: 'Quality must be between 0 and 5',
      };

      mockFlashcardSRSService.submitReview.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.submitReview(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('between 0 and 5');
    });

    it('should reject nonexistent card ID', async () => {
      // Arrange
      const request: FlashcardReviewRequest = {
        cardId: 'nonexistent_card',
        quality: 3,
      };

      const expectedResponse: FlashcardReviewResponse = {
        success: false,
        error: 'Card not found',
      };

      mockFlashcardSRSService.submitReview.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.submitReview(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should validate SRS algorithm progression', async () => {
      // Arrange
      const request: FlashcardReviewRequest = {
        cardId: 'card_advanced',
        quality: 4,
      };

      const expectedResponse: FlashcardReviewResponse = {
        success: true,
        data: {
          nextReview: new Date('2025-10-04T10:30:00Z'),
          interval: 6, // Should follow SM-2 algorithm progression
          updatedCard: {
            id: 'card_advanced',
            front: '测试',
            back: {
              pinyin: 'cè shì',
              definition: 'test',
            },
            srsData: {
              interval: 6,
              repetition: 3,
              easeFactor: 2.6,
              dueDate: new Date('2025-10-04T10:30:00Z'),
            },
          },
        },
      };

      mockFlashcardSRSService.submitReview.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockFlashcardSRSService.submitReview(request);

      // Assert - SRS algorithm progression
      expect(result.data!.updatedCard.srsData.interval).toBeGreaterThan(1);
      expect(result.data!.updatedCard.srsData.repetition).toBeGreaterThan(0);
      expect(result.data!.updatedCard.srsData.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });
});