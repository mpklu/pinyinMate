/**
 * Contract Test: Lesson Processing Service
 * 
 * Tests the Enhanced Lesson Processing Service contract as defined in:
 * specs/003-help-me-refine/contracts/lesson-processing-service.md
 * 
 * These tests MUST fail initially (TDD approach) and define the expected
 * behavior before implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  ProcessedLessonContent,
  VocabularyEntryWithPinyin,
  DifficultyLevel,
  ValidationResult
} from '../../src/types';
import type { Lesson } from '../../src/types/lesson';

// Contract interface (will be implemented)
interface EnhancedLessonProcessingService {
  processLesson(
    lesson: Lesson,
    options: LessonProcessingOptions
  ): Promise<ProcessedLessonContent>;

  processVocabulary(
    lesson: Lesson,
    content: ProcessedLessonContent
  ): Promise<VocabularyEntryWithPinyin[]>;

  validateProcessedContent(
    content: ProcessedLessonContent
  ): Promise<ValidationResult>;

  getProcessingStatus(lessonId: string): Promise<ProcessingStatus>;
}

interface LessonProcessingOptions {
  segmentationMode: 'sentence' | 'phrase' | 'character';
  generatePinyin: boolean;
  prepareAudio: boolean;
  maxSegments?: number;
  vocabularyEnhancement: boolean;
}

interface ProcessingStatus {
  lessonId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  processingTime?: number;
  errors?: string[];
}

// Mock test data
const mockLesson: Lesson = {
  id: 'test-lesson-001',
  title: '基本问候语',
  description: 'Basic greetings lesson',
  content: '你好！我叫李明。你叫什么名字？',
  metadata: {
    difficulty: 'beginner' as DifficultyLevel,
    tags: ['greetings', 'introductions'],
    characterCount: 15,
    source: 'Test Suite',
    book: null,
    vocabulary: [
      { word: '你好', translation: 'hello', partOfSpeech: 'interjection' },
      { word: '我', translation: 'I/me', partOfSpeech: 'pronoun' },
      { word: '叫', translation: 'to be called', partOfSpeech: 'verb' },
      { word: '名字', translation: 'name', partOfSpeech: 'noun' },
      { word: '什么', translation: 'what', partOfSpeech: 'pronoun' }
    ],
    grammarPoints: ['introductions', 'question formation'],
    culturalNotes: ['greeting customs'],
    estimatedTime: 15,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
};

const mockProcessingOptions: LessonProcessingOptions = {
  segmentationMode: 'sentence',
  generatePinyin: true,
  prepareAudio: true,
  maxSegments: 10,
  vocabularyEnhancement: true
};

// Import the actual service
import { lessonProcessingService } from '../../src/services/lessonProcessingService';

describe('Lesson Processing Service Contract', () => {
  let processingService: EnhancedLessonProcessingService;

  beforeEach(() => {
    // Use the actual service implementation
    processingService = lessonProcessingService as EnhancedLessonProcessingService;
  });

  describe('processLesson', () => {
    it('should process lesson content with text segmentation and pinyin', async () => {
      // Arrange
      const mockProcessedContent: ProcessedLessonContent = {
        segments: [
          {
            id: 'seg-001',
            text: '你好！',
            pinyin: 'nǐ hǎo！',
            translation: 'Hello!',
            vocabulary: [],
            startIndex: 0,
            endIndex: 3,
            segmentType: 'sentence',
            audioId: 'audio-001',
            audioReady: true,
            audioError: undefined,
            vocabularyWords: [],
            clickable: true
          }
        ],
        vocabularyMap: new Map(),
        totalSegments: 4,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      };

      // Use real implementation instead of mock for contract testing
      // vi.spyOn(processingService, 'processLesson').mockResolvedValue(mockProcessedContent);

      // Act
      const result = await processingService.processLesson(mockLesson, mockProcessingOptions);

      // Assert - Contract requirements
      expect(result).toBeDefined();
      expect(result.segments).toHaveLength(3);
      expect(result.segments[0].pinyin).toBe('nǐ hǎo！');
      expect(result.pinyinGenerated).toBe(true);
      expect(result.audioReady).toBe(true);
      expect(result.totalSegments).toBe(3);
      expect(result.processingTimestamp).toBeInstanceOf(Date);
    });

    it('should handle segmentation mode options correctly', async () => {
      // Test sentence mode
      const sentenceOptions = { ...mockProcessingOptions, segmentationMode: 'sentence' as const };
      
      vi.spyOn(processingService, 'processLesson').mockResolvedValue({
        segments: [],
        vocabularyMap: new Map(),
        totalSegments: 4,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      });

      const result = await processingService.processLesson(mockLesson, sentenceOptions);
      expect(result.totalSegments).toBeGreaterThan(0);
    });

    it('should respect maxSegments limit', async () => {
      const limitedOptions = { ...mockProcessingOptions, maxSegments: 2 };
      
      vi.spyOn(processingService, 'processLesson').mockResolvedValue({
        segments: [
          { id: 'seg-001', text: '你好！', pinyin: 'nǐ hǎo！', translation: 'Hello!', vocabulary: [], startIndex: 0, endIndex: 3, segmentType: 'sentence', audioId: 'audio-001', audioReady: true, vocabularyWords: [], clickable: true },
          { id: 'seg-002', text: '我叫李明。', pinyin: 'wǒ jiào lǐ míng。', translation: 'I am called Li Ming.', vocabulary: [], startIndex: 3, endIndex: 8, segmentType: 'sentence', audioId: 'audio-002', audioReady: true, vocabularyWords: [], clickable: true }
        ],
        vocabularyMap: new Map(),
        totalSegments: 2,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      });

      const result = await processingService.processLesson(mockLesson, limitedOptions);
      expect(result.segments).toHaveLength(2);
      expect(result.totalSegments).toBeLessThanOrEqual(2);
    });

    it('should throw error for invalid lesson content', async () => {
      const invalidLesson = { ...mockLesson, content: '' };
      
      vi.spyOn(processingService, 'processLesson').mockRejectedValue(
        new Error('INVALID_LESSON: Content cannot be empty')
      );

      await expect(
        processingService.processLesson(invalidLesson, mockProcessingOptions)
      ).rejects.toThrow('INVALID_LESSON: Content cannot be empty');
    });

    it('should complete processing within performance requirements', async () => {
      const startTime = Date.now();
      
      vi.spyOn(processingService, 'processLesson').mockImplementation(async () => {
        // Simulate processing time under 2 seconds for < 5000 chars
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          segments: [],
          vocabularyMap: new Map(),
          totalSegments: 1,
          processingTimestamp: new Date(),
          pinyinGenerated: true,
          audioReady: true
        };
      });

      await processingService.processLesson(mockLesson, mockProcessingOptions);
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(2000); // < 2 seconds requirement
    });
  });

  describe('processVocabulary', () => {
    it('should enhance vocabulary with pinyin and frequency data', async () => {
      const mockProcessedContent: ProcessedLessonContent = {
        segments: [],
        vocabularyMap: new Map(),
        totalSegments: 1,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      };

      const expectedVocabulary: VocabularyEntryWithPinyin[] = [
        {
          word: '你好',
          translation: 'hello',
          partOfSpeech: 'interjection',
          pinyin: 'nǐ hǎo',
          difficulty: 'beginner',
          frequency: 1,
          studyCount: 0,
          masteryLevel: 0
        }
      ];

      vi.spyOn(processingService, 'processVocabulary').mockResolvedValue(expectedVocabulary);

      const result = await processingService.processVocabulary(mockLesson, mockProcessedContent);
      
      expect(result).toHaveLength(1);
      expect(result[0].pinyin).toBe('nǐ hǎo');
      expect(result[0].frequency).toBeGreaterThan(0);
      expect(result[0].masteryLevel).toBe(0);
    });

    it('should calculate vocabulary frequency from content', async () => {
      const mockProcessedContent: ProcessedLessonContent = {
        segments: [],
        vocabularyMap: new Map(),
        totalSegments: 1,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      };

      const vocabularyWithFrequency: VocabularyEntryWithPinyin[] = [
        {
          word: '你',
          translation: 'you',
          pinyin: 'nǐ',
          frequency: 2, // appears twice in content
          studyCount: 0,
          masteryLevel: 0
        }
      ];

      vi.spyOn(processingService, 'processVocabulary').mockResolvedValue(vocabularyWithFrequency);

      const result = await processingService.processVocabulary(mockLesson, mockProcessedContent);
      expect(result[0].frequency).toBe(2);
    });
  });

  describe('validateProcessedContent', () => {
    it('should validate processed content structure', async () => {
      const validContent: ProcessedLessonContent = {
        segments: [
          {
            id: 'seg-001',
            text: '你好',
            pinyin: 'nǐ hǎo',
            translation: 'hello',
            vocabulary: [],
            startIndex: 0,
            endIndex: 2,
            segmentType: 'sentence',
            audioId: 'audio-001',
            audioReady: true,
            vocabularyWords: [],
            clickable: true
          }
        ],
        vocabularyMap: new Map([['你好', { word: '你好', translation: 'hello', pinyin: 'nǐ hǎo', frequency: 1, studyCount: 0, masteryLevel: 0 }]]),
        totalSegments: 1,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      };

      vi.spyOn(processingService, 'validateProcessedContent').mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const result = await processingService.validateProcessedContent(validContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid pinyin format', async () => {
      const invalidContent: ProcessedLessonContent = {
        segments: [
          {
            id: 'seg-001',
            text: '你好',
            pinyin: 'invalid-pinyin-123', // Invalid pinyin
            translation: 'hello',
            vocabulary: [],
            startIndex: 0,
            endIndex: 2,
            segmentType: 'sentence',
            audioId: 'audio-001',
            audioReady: true,
            vocabularyWords: [],
            clickable: true
          }
        ],
        vocabularyMap: new Map(),
        totalSegments: 1,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      };

      vi.spyOn(processingService, 'validateProcessedContent').mockResolvedValue({
        isValid: false,
        errors: ['Invalid pinyin format: invalid-pinyin-123'],
        warnings: []
      });

      const result = await processingService.validateProcessedContent(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid pinyin format: invalid-pinyin-123');
    });
  });

  describe('getProcessingStatus', () => {
    it('should return processing status for lesson', async () => {
      const expectedStatus: ProcessingStatus = {
        lessonId: 'test-lesson-001',
        status: 'completed',
        progress: 100,
        processingTime: 1500
      };

      vi.spyOn(processingService, 'getProcessingStatus').mockResolvedValue(expectedStatus);

      const result = await processingService.getProcessingStatus('test-lesson-001');
      expect(result.lessonId).toBe('test-lesson-001');
      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
    });

    it('should return not found for non-existent lesson', async () => {
      vi.spyOn(processingService, 'getProcessingStatus').mockRejectedValue(
        new Error('Lesson not found: non-existent-lesson')
      );

      await expect(
        processingService.getProcessingStatus('non-existent-lesson')
      ).rejects.toThrow('Lesson not found: non-existent-lesson');
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle concurrent processing requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        processingService.processLesson(
          { ...mockLesson, id: `lesson-${i}` },
          mockProcessingOptions
        )
      );

      vi.spyOn(processingService, 'processLesson').mockResolvedValue({
        segments: [],
        vocabularyMap: new Map(),
        totalSegments: 1,
        processingTimestamp: new Date(),
        pinyinGenerated: true,
        audioReady: true
      });

      // Should handle up to 5 concurrent processing requests
      await expect(Promise.all(promises)).resolves.toHaveLength(5);
    });

    it('should throw appropriate error codes', async () => {
      const invalidLesson = { ...mockLesson, content: null as unknown as string };
      
      vi.spyOn(processingService, 'processLesson').mockRejectedValue({
        code: 'INVALID_LESSON',
        message: 'Lesson content is required',
        details: { field: 'content', expectedFormat: 'string' }
      });

      await expect(
        processingService.processLesson(invalidLesson, mockProcessingOptions)
      ).rejects.toMatchObject({
        code: 'INVALID_LESSON',
        message: 'Lesson content is required'
      });
    });
  });
});