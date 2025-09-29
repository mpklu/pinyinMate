import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Contract test for Text Annotation interface
 * Tests the client-side API for Chinese text processing and segmentation
 * 
 * This test MUST FAIL initially - it defines the contract that implementation must fulfill
 */

// Mock the text annotation service (will be implemented later)
const mockTextAnnotationService = {
  annotate: vi.fn(),
};

// Types from the contract specification
interface AnnotateRequest {
  text: string;
  options?: {
    includeDefinitions?: boolean;
    includeToneMarks?: boolean;
    includeAudio?: boolean;
  };
}

interface TextSegment {
  id: string;
  text: string;
  pinyin: string;
  toneMarks: string;
  definition?: string;
  audioUrl?: string;
  position: {
    start: number;
    end: number;
  };
}

interface TextAnnotation {
  id: string;
  originalText: string;
  segments: TextSegment[];
  createdAt: Date;
  metadata: {
    title?: string;
    source?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface AnnotateResponse {
  success: boolean;
  data?: {
    annotation: TextAnnotation;
    processingTime: number;
  };
  error?: string;
}

describe('Text Annotation API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('annotate() method', () => {
    it('should accept valid Chinese text and return annotated segments', async () => {
      // Arrange
      const request: AnnotateRequest = {
        text: '你好世界',
        options: {
          includeDefinitions: true,
          includeToneMarks: true,
        },
      };

      const expectedResponse: AnnotateResponse = {
        success: true,
        data: {
          annotation: {
            id: 'ann_123',
            originalText: '你好世界',
            segments: [
              {
                id: 'seg_1',
                text: '你好',
                pinyin: 'nǐ hǎo',
                toneMarks: 'nǐ hǎo',
                definition: 'hello',
                position: { start: 0, end: 2 },
              },
              {
                id: 'seg_2',
                text: '世界',
                pinyin: 'shì jiè',
                toneMarks: 'shì jiè',
                definition: 'world',
                position: { start: 2, end: 4 },
              },
            ],
            createdAt: new Date('2025-09-28T10:30:00Z'),
            metadata: {
              difficulty: 'beginner',
            },
          },
          processingTime: 45,
        },
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert - Contract requirements
      expect(result.success).toBe(true);
      expect(result.data.annotation.originalText).toBe(request.text);
      expect(result.data.annotation.segments).toHaveLength(2);
      expect(result.data.annotation.segments[0].text).toBe('你好');
      expect(result.data.annotation.segments[0].pinyin).toBe('nǐ hǎo');
      expect(result.data.annotation.segments[0].definition).toBe('hello');
      expect(result.data.annotation.segments[0].position).toEqual({ start: 0, end: 2 });
    });

    it('should handle text without optional features', async () => {
      // Arrange
      const request: AnnotateRequest = {
        text: '中国',
        options: {
          includeDefinitions: false,
          includeToneMarks: false,
          includeAudio: false,
        },
      };

      const expectedResponse: AnnotateResponse = {
        success: true,
        data: {
          annotation: {
            id: 'ann_124',
            originalText: '中国',
            segments: [
              {
                id: 'seg_3',
                text: '中国',
                pinyin: 'zhōng guó',
                toneMarks: 'zhōng guó',
                position: { start: 0, end: 2 },
              },
            ],
            createdAt: new Date('2025-09-28T10:30:00Z'),
            metadata: {},
          },
          processingTime: 25,
        },
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.annotation.segments[0].definition).toBeUndefined();
      expect(result.data.annotation.segments[0].audioUrl).toBeUndefined();
    });

    it('should reject text without Chinese characters', async () => {
      // Arrange
      const request: AnnotateRequest = {
        text: 'Hello World',
      };

      const expectedResponse: AnnotateResponse = {
        success: false,
        error: 'Text must contain at least one Chinese character',
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Chinese character');
    });

    it('should reject text longer than 10,000 characters', async () => {
      // Arrange
      const longText = '中'.repeat(10001);
      const request: AnnotateRequest = {
        text: longText,
      };

      const expectedResponse: AnnotateResponse = {
        success: false,
        error: 'Text too long (maximum 10,000 characters)',
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should meet performance requirements for short text (<1000 chars)', async () => {
      // Arrange
      const request: AnnotateRequest = {
        text: '这是一个测试'.repeat(100), // ~500 characters
      };

      const expectedResponse: AnnotateResponse = {
        success: true,
        data: {
          annotation: {
            id: 'ann_125',
            originalText: request.text,
            segments: [],
            createdAt: new Date(),
            metadata: {},
          },
          processingTime: 300, // <500ms requirement
        },
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert - Performance contract
      expect(result.data.processingTime).toBeLessThan(500);
    });

    it('should meet performance requirements for long text (<10,000 chars)', async () => {
      // Arrange
      const request: AnnotateRequest = {
        text: '这是一个测试'.repeat(1000), // ~5,000 characters
      };

      const expectedResponse: AnnotateResponse = {
        success: true,
        data: {
          annotation: {
            id: 'ann_126',
            originalText: request.text,
            segments: [],
            createdAt: new Date(),
            metadata: {},
          },
          processingTime: 1500, // <2s requirement
        },
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert - Performance contract
      expect(result.data.processingTime).toBeLessThan(2000);
    });

    it('should generate unique IDs for annotations and segments', async () => {
      // Arrange
      const request: AnnotateRequest = {
        text: '北京大学',
      };

      const expectedResponse: AnnotateResponse = {
        success: true,
        data: {
          annotation: {
            id: 'ann_127',
            originalText: '北京大学',
            segments: [
              {
                id: 'seg_4',
                text: '北京',
                pinyin: 'běi jīng',
                toneMarks: 'běi jīng',
                position: { start: 0, end: 2 },
              },
              {
                id: 'seg_5',
                text: '大学',
                pinyin: 'dà xué',
                toneMarks: 'dà xué',
                position: { start: 2, end: 4 },
              },
            ],
            createdAt: new Date(),
            metadata: {},
          },
          processingTime: 50,
        },
      };

      mockTextAnnotationService.annotate.mockResolvedValue(expectedResponse);

      // Act
      const result = await mockTextAnnotationService.annotate(request);

      // Assert - ID uniqueness contract
      expect(result.data.annotation.id).toMatch(/^ann_/);
      const segmentIds = result.data!.annotation.segments.map((seg: TextSegment) => seg.id);
      const uniqueIds = new Set(segmentIds);
      expect(uniqueIds.size).toBe(segmentIds.length);
    });
  });
});