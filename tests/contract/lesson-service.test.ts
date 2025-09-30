/**
 * Contract tests for LessonService - TDD approach
 * These tests define the expected behavior before implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { LessonProcessingConfig, FlashcardGenerationOptions, QuizGenerationOptions } from '../../src/types/lessonService';
import type { Lesson } from '../../src/types/lesson';
import { lessonService } from '../../src/services/lessonService';

// Sample test data
const sampleLesson: Lesson = {
  id: 'test-lesson-001',
  title: 'Basic Greetings',
  description: 'Learn basic Chinese greetings',
  content: '你好！我叫李明。你叫什么名字？很高兴认识你。再见！',
  vocabulary: [
    { word: '你好', translation: 'hello' },
    { word: '我', translation: 'I/me' },
    { word: '叫', translation: 'to be called' },
    { word: '什么', translation: 'what' },
    { word: '名字', translation: 'name' },
    { word: '高兴', translation: 'happy' },
    { word: '认识', translation: 'to know/meet' },
    { word: '再见', translation: 'goodbye' }
  ],
  metadata: {
    category: 'greetings',
    difficulty: 'beginner',
    estimatedTime: 15,
    tags: ['basic', 'conversation'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

const defaultProcessingConfig: LessonProcessingConfig = {
  generatePinyin: true,
  segmentText: true,
  segmentationMode: 'sentence',
  enhanceVocabulary: true,
  maxSegments: 10
};

describe('LessonService Contract Tests', () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  describe('processLesson', () => {
    it('should process lesson with default configuration', async () => {
      const result = await lessonService.processLesson(sampleLesson, defaultProcessingConfig);
      
      expect(result).toBeDefined();
      expect(result.processedLesson).toBeDefined();
      expect(result.processedLesson.id).toBe(sampleLesson.id);
      expect(result.segmentedContent).toBeDefined();
      expect(result.segmentedContent.segments).toBeInstanceOf(Array);
      expect(result.enhancedVocabulary).toBeInstanceOf(Array);
      expect(result.processingStats).toBeDefined();
      expect(result.processingStats.segmentCount).toBeGreaterThan(0);
      expect(result.processingStats.vocabularyCount).toBe(sampleLesson.vocabulary?.length || 0);
    });

    it('should respect segmentation mode configuration', async () => {
      const sentenceConfig = { ...defaultProcessingConfig, segmentationMode: 'sentence' as const };
      const paragraphConfig = { ...defaultProcessingConfig, segmentationMode: 'paragraph' as const };
      
      const sentenceResult = await lessonService.processLesson(sampleLesson, sentenceConfig);
      const paragraphResult = await lessonService.processLesson(sampleLesson, paragraphConfig);
      
      // Sentence mode should produce more segments than paragraph mode
      expect(sentenceResult.segmentedContent.segments.length).toBeGreaterThanOrEqual(paragraphResult.segmentedContent.segments.length);
    });

    it('should handle lessons without vocabulary', async () => {
      const lessonWithoutVocab = { ...sampleLesson, vocabulary: [] };
      const result = await lessonService.processLesson(lessonWithoutVocab, defaultProcessingConfig);
      
      expect(result.enhancedVocabulary).toBeInstanceOf(Array);
      expect(result.processingStats.vocabularyCount).toBe(0);
    });

    it('should respect maxSegments limit', async () => {
      const limitedConfig = { ...defaultProcessingConfig, maxSegments: 3 };
      const result = await lessonService.processLesson(sampleLesson, limitedConfig);
      
      expect(result.segmentedContent.segments.length).toBeLessThanOrEqual(3);
    });
  });

  describe('segmentLessonText', () => {
    it('should segment text into sentences', async () => {
      const segments = await lessonService.segmentLessonText(sampleLesson.content, 'sentence');
      
      expect(segments).toBeInstanceOf(Array);
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach(segment => {
        expect(segment.text).toBeDefined();
        expect(segment.startIndex).toBeGreaterThanOrEqual(0);
        expect(segment.endIndex).toBeGreaterThan(segment.startIndex);
      });
    });

    it('should handle empty text', async () => {
      const segments = await lessonService.segmentLessonText('', 'sentence');
      expect(segments).toBeInstanceOf(Array);
      expect(segments.length).toBe(0);
    });

    it('should maintain text continuity in segments', async () => {
      const segments = await lessonService.segmentLessonText(sampleLesson.content, 'sentence');
      
      // Verify segments cover the entire text without gaps
      const reconstructed = segments.map(s => s.text).join('');
      const originalNoSpaces = sampleLesson.content.replace(/\s+/g, '');
      const reconstructedNoSpaces = reconstructed.replace(/\s+/g, '');
      
      expect(reconstructedNoSpaces).toContain(originalNoSpaces.substring(0, Math.min(originalNoSpaces.length, reconstructedNoSpaces.length)));
    });
  });

  describe('enhanceVocabulary', () => {
    it('should add pinyin to vocabulary entries', async () => {
      const enhanced = await lessonService.enhanceVocabulary(sampleLesson.vocabulary!);
      
      expect(enhanced).toBeInstanceOf(Array);
      expect(enhanced.length).toBe(sampleLesson.vocabulary!.length);
      
      enhanced.forEach((entry, index) => {
        expect(entry.word).toBe(sampleLesson.vocabulary![index].word);
        expect(entry.pinyin).toBeDefined();
        expect(entry.pinyin.length).toBeGreaterThan(0);
      });
    });

    it('should handle vocabulary with source text context', async () => {
      const enhanced = await lessonService.enhanceVocabulary(sampleLesson.vocabulary!, sampleLesson.content);
      
      expect(enhanced).toBeInstanceOf(Array);
      enhanced.forEach(entry => {
        expect(entry.contextUsage).toBeDefined();
      });
    });

    it('should handle empty vocabulary', async () => {
      const enhanced = await lessonService.enhanceVocabulary([]);
      expect(enhanced).toBeInstanceOf(Array);
      expect(enhanced.length).toBe(0);
    });
  });

  describe('generateFlashcards', () => {
    it('should generate flashcards from vocabulary', async () => {
      // First process the lesson to get a PreparedLesson
      const processedResult = await lessonService.processLesson(sampleLesson, defaultProcessingConfig);
      
      const options: FlashcardGenerationOptions = {
        source: 'vocabulary',
        maxCards: 5,
        includeAudio: true
      };
      
      const flashcards = await lessonService.generateFlashcards(processedResult.processedLesson, options);
      
      expect(flashcards).toBeInstanceOf(Array);
      expect(flashcards.length).toBeLessThanOrEqual(5);
      expect(flashcards.length).toBeGreaterThan(0);
      
      flashcards.forEach(card => {
        expect(card.front).toBeDefined();
        expect(card.back).toBeDefined();
        expect(card.front.content).toBeDefined();
        expect(card.back.content).toBeDefined();
        expect(card.back.auxiliaryText).toBeDefined(); // For pinyin
      });
    });

    it('should respect maxCards limit', async () => {
      const processedResult = await lessonService.processLesson(sampleLesson, defaultProcessingConfig);
      
      const options: FlashcardGenerationOptions = {
        source: 'vocabulary',
        maxCards: 3,
        includeAudio: false
      };
      
      const flashcards = await lessonService.generateFlashcards(processedResult.processedLesson, options);
      expect(flashcards.length).toBeLessThanOrEqual(3);
    });

    it('should generate flashcards from both vocabulary and content', async () => {
      const processedResult = await lessonService.processLesson(sampleLesson, defaultProcessingConfig);
      
      const options: FlashcardGenerationOptions = {
        source: 'both',
        maxCards: 10,
        includeAudio: true
      };
      
      const flashcards = await lessonService.generateFlashcards(processedResult.processedLesson, options);
      expect(flashcards.length).toBeGreaterThan(0);
    });
  });

  describe('generateQuizQuestions', () => {
    it('should generate multiple choice questions', async () => {
      const processedResult = await lessonService.processLesson(sampleLesson, defaultProcessingConfig);
      
      const options: QuizGenerationOptions = {
        questionTypes: ['multiple-choice'],
        questionsPerType: 3,
        includeContent: true,
        includeVocabulary: true
      };
      
      const questions = await lessonService.generateQuizQuestions(processedResult.processedLesson, options);
      
      expect(questions).toBeInstanceOf(Array);
      expect(questions.length).toBe(3);
      
      questions.forEach(question => {
        expect(question.type).toBe('multiple-choice');
        expect(question.question).toBeDefined();
        expect(question.options).toBeInstanceOf(Array);
        expect(question.options?.length || 0).toBeGreaterThanOrEqual(2);
        expect(question.correctAnswer).toBeDefined();
      });
    });

    it('should generate multiple question types', async () => {
      const processedResult = await lessonService.processLesson(sampleLesson, defaultProcessingConfig);
      
      const options: QuizGenerationOptions = {
        questionTypes: ['multiple-choice', 'fill-blank'],
        questionsPerType: 2,
        includeContent: true,
        includeVocabulary: true
      };
      
      const questions = await lessonService.generateQuizQuestions(processedResult.processedLesson, options);
      
      expect(questions.length).toBe(4); // 2 per type
      const questionTypes = questions.map(q => q.type);
      expect(questionTypes).toContain('multiple-choice');
      expect(questionTypes).toContain('fill-blank');
    });
  });

  describe('validateLessonContent', () => {
    it('should validate well-formed lesson', async () => {
      const validation = await lessonService.validateLessonContent(sampleLesson);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toBeInstanceOf(Array);
      expect(validation.warnings).toBeInstanceOf(Array);
      expect(validation.suggestions).toBeInstanceOf(Array);
    });

    it('should detect missing required fields', async () => {
      const invalidLesson = { ...sampleLesson, content: '' };
      const validation = await lessonService.validateLessonContent(invalidLesson);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(error => error.includes('content'))).toBe(true);
    });

    it('should provide helpful suggestions', async () => {
      const sparseLesson = { ...sampleLesson, vocabulary: [] };
      const validation = await lessonService.validateLessonContent(sparseLesson);
      
      expect(validation.suggestions).toBeInstanceOf(Array);
      expect(validation.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('extractVocabularyFromContent', () => {
    it('should extract vocabulary from Chinese text', async () => {
      const extracted = await lessonService.extractVocabularyFromContent(sampleLesson.content);
      
      expect(extracted).toBeInstanceOf(Array);
      expect(extracted.length).toBeGreaterThan(0);
      
      // Should extract some words that are in the original vocabulary
      const vocabularyWords = sampleLesson.vocabulary?.map(v => v.word) || [];
      const overlap = extracted.filter(word => vocabularyWords.includes(word));
      expect(overlap.length).toBeGreaterThan(0);
    });

    it('should merge with existing vocabulary', async () => {
      const existingVocab = ['测试', '词汇'];
      const extracted = await lessonService.extractVocabularyFromContent(sampleLesson.content, existingVocab);
      
      expect(extracted).toBeInstanceOf(Array);
      // Should include existing vocabulary
      existingVocab.forEach(word => {
        expect(extracted).toContain(word);
      });
    });

    it('should handle empty content', async () => {
      const extracted = await lessonService.extractVocabularyFromContent('');
      expect(extracted).toBeInstanceOf(Array);
      expect(extracted.length).toBe(0);
    });
  });

  describe('analyzeLessonComplexity', () => {
    it('should provide complexity analysis', async () => {
      const analysis = await lessonService.analyzeLessonComplexity(sampleLesson);
      
      expect(analysis.characterCount).toBeGreaterThan(0);
      expect(analysis.vocabularyComplexity).toBeGreaterThanOrEqual(0);
      expect(analysis.estimatedReadingTime).toBeGreaterThan(0);
      expect(analysis.difficultyScore).toBeGreaterThanOrEqual(0);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should handle lessons without vocabulary', async () => {
      const lessonWithoutVocab = { ...sampleLesson, vocabulary: [] };
      const analysis = await lessonService.analyzeLessonComplexity(lessonWithoutVocab);
      
      expect(analysis.vocabularyComplexity).toBe(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });
});