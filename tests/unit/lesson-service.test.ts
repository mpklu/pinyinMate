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
      segments.forEach(segment => {
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
      segments.forEach(segment => {
        expect(segment.text).toBeDefined();
      });
    });

    it('should handle paragraph mode with various separators', async () => {
      const paragraphContent = '第一段内容。\n\n第二段内容。\r\n\r\n第三段内容。\n\r\n\r第四段内容。';
      const segments = await lessonService.segmentLessonText(paragraphContent, 'paragraph');
      
      expect(segments.length).toBeGreaterThanOrEqual(2);
      segments.forEach(segment => {
        expect(segment.text.trim()).not.toBe('');
      });
    });

    it('should handle section mode with markdown-style headers', async () => {
      const sectionContent = '# 第一章\n内容1\n## 第二章\n内容2\n### 第三章\n内容3';
      const segments = await lessonService.segmentLessonText(sectionContent, 'section');
      
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach(segment => {
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
      enhanced.forEach(entry => {
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
      enhanced.forEach(entry => {
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
      const helloEntries = enhanced.filter(entry => entry.word === '你好');
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

  describe('segmentLessonText edge cases', () => {
    it('should handle empty content', async () => {
      const segments = await lessonService.segmentLessonText('', 'sentence');
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
      segments.forEach(segment => {
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
      segments.forEach(segment => {
        expect(segment.text).toBeDefined();
      });
    });

    it('should handle paragraph mode with various separators', async () => {
      const paragraphContent = '第一段内容。\n\n第二段内容。\r\n\r\n第三段内容。\n\r\n\r第四段内容。';
      const segments = await lessonService.segmentLessonText(paragraphContent, 'paragraph');
      
      expect(segments.length).toBeGreaterThanOrEqual(2);
      segments.forEach(segment => {
        expect(segment.text.trim()).not.toBe('');
      });
    });

    it('should handle section mode with markdown-style headers', async () => {
      const sectionContent = '# 第一章\n内容1\n## 第二章\n内容2\n### 第三章\n内容3';
      const segments = await lessonService.segmentLessonText(sectionContent, 'section');
      
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach(segment => {
        expect(segment.id).toMatch(/^section-\d+$/);
      });
    });
  });

  describe('enhanceVocabulary edge cases', () => {
    it('should handle empty vocabulary array', async () => {
      const content = '你好世界';
      const vocabulary: VocabularyEntry[] = [];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      expect(enhanced).toHaveLength(0);
    });

    it('should handle vocabulary entries not found in content', async () => {
      const content = '你好世界';
      const vocabulary: VocabularyEntry[] = [
        { word: '再见', translation: 'goodbye' },
        { word: '谢谢', translation: 'thank you' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      // Should still enhance vocabulary even if not found in content
      expect(enhanced.length).toBe(vocabulary.length);
      enhanced.forEach(entry => {
        expect(entry.pinyin).toBeDefined();
        expect(entry.confidence).toBeDefined();
      });
    });

    it('should handle vocabulary with special characters', async () => {
      const content = '这是@测试#内容$';
      const vocabulary: VocabularyEntry[] = [
        { word: '测试', translation: 'test' },
        { word: '@', translation: 'at symbol' },
        { word: '#$', translation: 'symbols' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      expect(enhanced.length).toBe(vocabulary.length);
      enhanced.forEach(entry => {
        expect(entry.word).toBeDefined();
        expect(entry.translation).toBeDefined();
      });
    });

    it('should handle duplicate vocabulary entries', async () => {
      const content = '你好你好世界世界';
      const vocabulary: VocabularyEntry[] = [
        { word: '你好', translation: 'hello' },
        { word: '你好', translation: 'hi' }, // Duplicate with different translation
        { word: '世界', translation: 'world' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      expect(enhanced.length).toBe(vocabulary.length);
      // Should preserve all entries, including duplicates
      const helloEntries = enhanced.filter(entry => entry.word === '你好');
      expect(helloEntries).toHaveLength(2);
    });

    it('should handle vocabulary with very long words', async () => {
      const longWord = '非常非常非常非常长的词汇';
      const content = `这里有一个${longWord}需要处理。`;
      const vocabulary: VocabularyEntry[] = [
        { word: longWord, translation: 'very very very very long word' }
      ];
      
      const enhanced = await lessonService.enhanceVocabulary(vocabulary, content);
      
      expect(enhanced).toHaveLength(1);
      expect(enhanced[0].word).toBe(longWord);
      expect(enhanced[0].pinyin).toBeDefined();
    });
  });

  describe('generateFlashcards edge cases', () => {
    it('should handle lesson without vocabulary', async () => {
      const lesson: Lesson = {
        id: 'test-flashcard-1',
        title: 'No Vocab Lesson',
        content: '你好世界',
        difficulty: 'beginner',
        category: 'greetings'
        // No vocabulary property
      };

      const options = {
        maxCards: 10,
        includeAudio: true,
        difficultyLevel: 'beginner' as const
      };

      const flashcards = await lessonService.generateFlashcards(lesson, options);
      
      // Should generate flashcards from content even without explicit vocabulary
      expect(Array.isArray(flashcards)).toBe(true);
    });

    it('should respect maxCards limit', async () => {
      const lesson: Lesson = {
        id: 'test-flashcard-2',
        title: 'Large Vocab Lesson',
        content: '这是一个包含很多词汇的课程',
        difficulty: 'intermediate',
        category: 'vocabulary',
        vocabulary: Array.from({ length: 50 }, (_, i) => ({
          word: `词汇${i}`,
          translation: `word ${i}`
        }))
      };

      const options = {
        maxCards: 5,
        includeAudio: false,
        difficultyLevel: 'intermediate' as const
      };

      const flashcards = await lessonService.generateFlashcards(lesson, options);
      
      expect(flashcards.length).toBeLessThanOrEqual(5);
    });

    it('should handle invalid difficulty level', async () => {
      const lesson: Lesson = {
        id: 'test-flashcard-3',
        title: 'Test Lesson',
        content: '测试内容',
        difficulty: 'beginner',
        category: 'test',
        vocabulary: [{ word: '测试', translation: 'test' }]
      };

      const options = {
        maxCards: 10,
        includeAudio: true,
        // @ts-expect-error Testing invalid difficulty
        difficultyLevel: 'invalid-level'
      };

      // Should not throw an error, fallback to default behavior
      const flashcards = await lessonService.generateFlashcards(lesson, options);
      expect(Array.isArray(flashcards)).toBe(true);
    });
  });

  describe('generateQuizQuestions edge cases', () => {
    it('should handle lesson with minimal content', async () => {
      const lesson: Lesson = {
        id: 'test-quiz-1',
        title: 'Minimal Lesson',
        content: '你好',
        difficulty: 'beginner',
        category: 'greetings'
      };

      const options = {
        questionCount: 5,
        questionTypes: ['multiple-choice', 'fill-blank'] as const,
        difficultyLevel: 'beginner' as const
      };

      const questions = await lessonService.generateQuizQuestions(lesson, options);
      
      // Should generate fewer questions if content is insufficient
      expect(questions.length).toBeLessThanOrEqual(5);
      expect(Array.isArray(questions)).toBe(true);
    });

    it('should handle empty question types array', async () => {
      const lesson: Lesson = {
        id: 'test-quiz-2',
        title: 'Test Lesson',
        content: '这是测试内容，包含多个句子。我们需要生成问题。',
        difficulty: 'intermediate',
        category: 'test'
      };

      const options = {
        questionCount: 3,
        questionTypes: [] as const,
        difficultyLevel: 'intermediate' as const
      };

      const questions = await lessonService.generateQuizQuestions(lesson, options);
      
      // Should fallback to default question types
      expect(Array.isArray(questions)).toBe(true);
    });

    it('should handle unrealistic question count', async () => {
      const lesson: Lesson = {
        id: 'test-quiz-3',
        title: 'Short Lesson',
        content: '简短内容。',
        difficulty: 'beginner',
        category: 'test'
      };

      const options = {
        questionCount: 100, // Unrealistically high
        questionTypes: ['multiple-choice'] as const,
        difficultyLevel: 'beginner' as const
      };

      const questions = await lessonService.generateQuizQuestions(lesson, options);
      
      // Should generate reasonable number based on content
      expect(questions.length).toBeLessThan(100);
      expect(questions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error handling and recovery', () => {
    it('should handle service initialization errors', () => {
      // Should not throw during construction
      expect(() => new LessonServiceImpl()).not.toThrow();
    });

    it('should handle processing errors gracefully', async () => {
      const problematicLesson: Lesson = {
        id: 'error-test',
        title: 'Error Test',
        content: null as any, // Intentionally problematic
        difficulty: 'beginner',
        category: 'test'
      };

      const config: LessonProcessingConfig = {
        segmentationMode: 'sentence',
        enhanceVocabulary: true,
        generatePinyin: true
      };

      await expect(lessonService.processLesson(problematicLesson, config))
        .rejects.toThrow('Failed to process lesson');
    });

    it('should handle async operation timeouts', async () => {
      // Mock a slow operation
      const originalSegment = lessonService.segmentLessonText;
      lessonService.segmentLessonText = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      const lesson: Lesson = {
        id: 'timeout-test',
        title: 'Timeout Test',
        content: '测试超时处理',
        difficulty: 'beginner',
        category: 'test'
      };

      const config: LessonProcessingConfig = {
        segmentationMode: 'sentence',
        enhanceVocabulary: false,
        generatePinyin: false
      };

      // Should have reasonable timeout behavior
      const startTime = Date.now();
      try {
        await Promise.race([
          lessonService.processLesson(lesson, config),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          )
        ]);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(2000); // Should timeout within reasonable time
      }

      // Restore original method
      lessonService.segmentLessonText = originalSegment;
    });

    it('should handle memory pressure gracefully', async () => {
      // Create many large lessons to simulate memory pressure
      const largeLessons = Array.from({ length: 10 }, (_, i) => ({
        id: `large-${i}`,
        title: `Large Lesson ${i}`,
        content: '很长的内容。'.repeat(1000),
        difficulty: 'intermediate' as const,
        category: 'stress-test',
        vocabulary: Array.from({ length: 100 }, (_, j) => ({
          word: `词${j}`,
          translation: `word ${j}`
        }))
      }));

      const config: LessonProcessingConfig = {
        segmentationMode: 'sentence',
        enhanceVocabulary: true,
        generatePinyin: true,
        maxSegments: 50
      };

      // Process multiple lessons simultaneously
      const promises = largeLessons.map(lesson => 
        lessonService.processLesson(lesson, config)
      );

      // Should handle concurrent processing without crashing
      const results = await Promise.allSettled(promises);
      
      // At least some should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('performance and optimization', () => {
    it('should complete processing within reasonable time', async () => {
      const lesson: Lesson = {
        id: 'perf-test',
        title: 'Performance Test',
        content: '这是一个性能测试课程。'.repeat(100),
        difficulty: 'intermediate',
        category: 'performance',
        vocabulary: Array.from({ length: 20 }, (_, i) => ({
          word: `词汇${i}`,
          translation: `vocabulary ${i}`
        }))
      };

      const config: LessonProcessingConfig = {
        segmentationMode: 'sentence',
        enhanceVocabulary: true,
        generatePinyin: true
      };

      const startTime = Date.now();
      const result = await lessonService.processLesson(lesson, config);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.processingStats.processingTime).toBeGreaterThan(0);
      expect(result.processingStats.processingTime).toBeLessThan(elapsed + 100); // Allow some margin
    });

    it('should handle concurrent processing efficiently', async () => {
      const lessons = Array.from({ length: 5 }, (_, i) => ({
        id: `concurrent-${i}`,
        title: `Concurrent Lesson ${i}`,
        content: `这是第${i + 1}个并发测试课程。包含多个句子和词汇。`,
        difficulty: 'beginner' as const,
        category: 'concurrent'
      }));

      const config: LessonProcessingConfig = {
        segmentationMode: 'sentence',
        enhanceVocabulary: false,
        generatePinyin: false
      };

      const startTime = Date.now();
      const results = await Promise.all(
        lessons.map(lesson => lessonService.processLesson(lesson, config))
      );
      const elapsed = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(elapsed).toBeLessThan(3000); // Should process all within 3 seconds
      
      results.forEach(result => {
        expect(result.processedLesson).toBeDefined();
        expect(result.processingStats).toBeDefined();
      });
    });
  });
});