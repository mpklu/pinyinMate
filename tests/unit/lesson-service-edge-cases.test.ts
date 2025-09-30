/**
 * Unit tests for LessonService edge cases
 * Tests lesson processing, text segmentation, vocabulary enhancement, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LessonServiceImpl } from '../../src/services/lessonService';

// Mock dependencies
vi.mock('../../src/services/pinyinService', () => ({
  validatePinyinInput: vi.fn(),
  generateBasicPinyin: vi.fn().mockResolvedValue('mock-pinyin')
}));

describe('LessonService Edge Cases', () => {
  let lessonService: LessonServiceImpl;
  
  beforeEach(() => {
    lessonService = new LessonServiceImpl();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('segmentLessonText edge cases', () => {
    it('should handle empty content', async () => {
      const segments = await lessonService.segmentLessonText('', 'sentence');
      expect(segments).toHaveLength(0);
    });

    it('should handle whitespace-only content', async () => {
      const segments = await lessonService.segmentLessonText('   \n\t  \r\n   ', 'sentence');
      expect(segments).toHaveLength(0);
    });

    it('should handle content with only punctuation', async () => {
      const segments = await lessonService.segmentLessonText('。！？，；：', 'sentence');
      expect(segments).toHaveLength(0);
    });

    it('should handle mixed language content', async () => {
      const mixedContent = '你好 Hello 世界 World! 测试 Test.';
      const segments = await lessonService.segmentLessonText(mixedContent, 'sentence');
      
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach((segment: any) => {
        expect(segment.id).toBeDefined();
        expect(segment.text).toBeDefined();
        expect(segment.startIndex).toBeGreaterThanOrEqual(0);
        expect(segment.endIndex).toBeGreaterThan(segment.startIndex);
      });
    });

    it('should handle invalid segmentation mode', async () => {
      const content = '这是测试内容。';
      // @ts-expect-error Testing invalid mode
      const segments = await lessonService.segmentLessonText(content, 'invalid-mode');
      
      // Should fallback to sentence mode
      expect(segments.length).toBeGreaterThan(0);
      expect(segments[0].text).toContain('这是测试内容');
    });

    it('should handle extremely long sentences', async () => {
      const longSentence = '这是一个非常非常非常长的句子'.repeat(100) + '。';
      const segments = await lessonService.segmentLessonText(longSentence, 'sentence');
      
      expect(segments).toHaveLength(1);
      expect(segments[0].text.length).toBeGreaterThan(1000);
    });

    it('should handle content with special characters', async () => {
      const specialContent = '你好@#$%^&*()世界！测试<>?";:{}[]+=_-';
      const segments = await lessonService.segmentLessonText(specialContent, 'sentence');
      
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach((segment: any) => {
        expect(segment.text).toBeDefined();
      });
    });

    it('should handle paragraph mode with various separators', async () => {
      const paragraphContent = '第一段内容。\n\n第二段内容。\r\n\r\n第三段内容。\n\r\n\r第四段内容。';
      const segments = await lessonService.segmentLessonText(paragraphContent, 'paragraph');
      
      expect(segments.length).toBeGreaterThanOrEqual(2);
      segments.forEach((segment: any) => {
        expect(segment.text.trim()).not.toBe('');
      });
    });

    it('should handle section mode with markdown-style headers', async () => {
      const sectionContent = '# 第一章\n内容1\n## 第二章\n内容2\n### 第三章\n内容3';
      const segments = await lessonService.segmentLessonText(sectionContent, 'section');
      
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach((segment: any) => {
        expect(segment.id).toMatch(/^section-\d+$/);
      });
    });
  });

  describe('enhanceVocabulary edge cases', () => {
    it('should handle empty vocabulary array', async () => {
      const content = '你好世界';
      const vocabulary: any[] = [];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      expect(enhanced).toHaveLength(0);
    });

    it('should handle vocabulary entries not found in content', async () => {
      const content = '你好世界';
      const vocabulary = [
        { word: '再见', translation: 'goodbye' },
        { word: '谢谢', translation: 'thank you' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      // Should still enhance vocabulary even if not found in content
      expect(enhanced.length).toBe(vocabulary.length);
      enhanced.forEach((entry: any) => {
        expect(entry.pinyin).toBeDefined();
      });
    });

    it('should handle vocabulary with special characters', async () => {
      const content = '这是@测试#内容$';
      const vocabulary = [
        { word: '测试', translation: 'test' },
        { word: '@', translation: 'at symbol' },
        { word: '#$', translation: 'symbols' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      expect(enhanced.length).toBe(vocabulary.length);
      enhanced.forEach((entry: any) => {
        expect(entry.word).toBeDefined();
        expect(entry.translation).toBeDefined();
      });
    });

    it('should handle duplicate vocabulary entries', async () => {
      const content = '你好你好世界世界';
      const vocabulary = [
        { word: '你好', translation: 'hello' },
        { word: '你好', translation: 'hi' }, // Duplicate with different translation
        { word: '世界', translation: 'world' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      expect(enhanced.length).toBe(vocabulary.length);
      // Should preserve all entries, including duplicates
      const helloEntries = enhanced.filter((entry: any) => entry.word === '你好');
      expect(helloEntries).toHaveLength(2);
    });

    it('should handle vocabulary with very long words', async () => {
      const longWord = '非常非常非常非常长的词汇';
      const content = `这里有一个${longWord}需要处理。`;
      const vocabulary = [
        { word: longWord, translation: 'very very very very long word' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      expect(enhanced).toHaveLength(1);
      expect(enhanced[0].word).toBe(longWord);
      expect(enhanced[0].pinyin).toBeDefined();
    });
  });

  describe('error handling and recovery', () => {
    it('should handle service initialization errors', () => {
      // Should not throw during construction
      expect(() => new LessonServiceImpl()).not.toThrow();
    });

    it('should handle malformed Chinese characters', async () => {
      const malformedContent = '你好\uFFFD世界\uD800\uDFFF测试';
      
      // Should not throw an error
      const segments = await lessonService.segmentLessonText(malformedContent, 'sentence');
      
      expect(Array.isArray(segments)).toBe(true);
    });

    it('should handle null or undefined input gracefully', async () => {
      // @ts-expect-error Testing invalid input
      const segments1 = await lessonService.segmentLessonText(null, 'sentence');
      expect(segments1).toHaveLength(0);

      // @ts-expect-error Testing invalid input  
      const segments2 = await lessonService.segmentLessonText(undefined, 'sentence');
      expect(segments2).toHaveLength(0);
    });
  });

  describe('performance and optimization', () => {
    it('should handle concurrent segmentation efficiently', async () => {
      const contents = Array.from({ length: 5 }, (_, i) => 
        `这是第${i + 1}个并发测试内容。包含多个句子和词汇。`
      );

      const startTime = Date.now();
      const results = await Promise.all(
        contents.map(content => lessonService.segmentLessonText(content, 'sentence'))
      );
      const elapsed = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(elapsed).toBeLessThan(3000); // Should process all within 3 seconds
      
      results.forEach(segments => {
        expect(Array.isArray(segments)).toBe(true);
        expect(segments.length).toBeGreaterThan(0);
      });
    });

    it('should complete segmentation within reasonable time', async () => {
      const content = '这是一个性能测试内容。'.repeat(100);

      const startTime = Date.now();
      const segments = await lessonService.segmentLessonText(content, 'sentence');
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(2000); // Should complete within 2 seconds
      expect(segments.length).toBeGreaterThan(0);
    });
  });
});