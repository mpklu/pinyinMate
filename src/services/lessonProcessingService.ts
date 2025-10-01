/**
 * Enhanced Lesson Processing Service
 * 
 * Provides advanced text segmentation, vocabulary enhancement, and lesson processing
 * capabilities for Chinese language learning content.
 * 
 * This service implements the contract defined in:
 * tests/contract/lesson-processing-service.test.ts
 */

import type {
  ProcessedLessonContent,
  TextSegmentWithAudio,
  VocabularyEntryWithPinyin,
  VocabularyReference,
  DifficultyLevel,
  ValidationResult,
  TextSegment
} from '../types';
import type { Lesson } from '../types/lesson';
import { textSegmentationService } from './textSegmentationService';
import { pinyinService } from './pinyinService';

/**
 * Lesson processing configuration options
 */
export interface LessonProcessingOptions {
  segmentationMode: 'sentence' | 'phrase' | 'character';
  generatePinyin: boolean;
  prepareAudio: boolean;
  maxSegments?: number;
  vocabularyEnhancement: boolean;
}

/**
 * Processing status tracking
 */
export interface ProcessingStatus {
  lessonId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  processingTime?: number;
  errors?: string[];
}

/**
 * Enhanced Lesson Processing Service
 * 
 * Handles the complex processing of Chinese lessons including:
 * - Text segmentation (sentence, phrase, character levels)
 * - Pinyin generation for all text segments
 * - Vocabulary enhancement with frequency analysis
 * - Audio preparation and integration
 * - Content validation and quality assurance
 */
class EnhancedLessonProcessingService {
  private readonly processingCache = new Map<string, ProcessedLessonContent>();
  private readonly processingStatus = new Map<string, ProcessingStatus>();

  /**
   * Process a lesson with comprehensive text analysis and enhancement
   * 
   * @param lesson - The lesson to process
   * @param options - Processing configuration options
   * @returns Promise<ProcessedLessonContent> - Enhanced lesson content
   */
  async processLesson(
    lesson: Lesson,
    options: LessonProcessingOptions
  ): Promise<ProcessedLessonContent> {
    const startTime = Date.now();
    
    // Validate input
    if (!lesson.content || lesson.content.trim().length === 0) {
      throw new Error('INVALID_LESSON: Content cannot be empty');
    }

    // Update processing status
    this.updateProcessingStatus(lesson.id, 'processing', 0);

    try {
      // Step 1: Text segmentation (20% progress)
      const segments = await this.segmentLessonText(lesson, options);
      this.updateProcessingStatus(lesson.id, 'processing', 20);

      // Step 2: Generate pinyin for segments (40% progress)
      const segmentsWithPinyin = options.generatePinyin 
        ? await this.addPinyinToSegments(segments)
        : segments;
      this.updateProcessingStatus(lesson.id, 'processing', 40);

      // Step 3: Vocabulary mapping and enhancement (60% progress)
      const vocabularyMap = options.vocabularyEnhancement
        ? await this.buildVocabularyMap(lesson)
        : new Map<string, VocabularyEntryWithPinyin>();
      this.updateProcessingStatus(lesson.id, 'processing', 60);

      // Step 4: Add vocabulary references to segments (80% progress)
      const enhancedSegments = await this.addVocabularyReferences(segmentsWithPinyin, vocabularyMap);
      this.updateProcessingStatus(lesson.id, 'processing', 80);

      // Step 5: Prepare audio if requested (100% progress)
      const finalSegments = options.prepareAudio
        ? await this.prepareAudioForSegments(enhancedSegments)
        : enhancedSegments.map(s => ({ ...s, audioReady: false }));

      const processedContent: ProcessedLessonContent = {
        segments: finalSegments,
        vocabularyMap,
        totalSegments: finalSegments.length,
        processingTimestamp: new Date(),
        pinyinGenerated: options.generatePinyin,
        audioReady: options.prepareAudio
      };

      // Cache the result
      this.processingCache.set(lesson.id, processedContent);
      
      // Update final status
      const processingTime = Date.now() - startTime;
      this.updateProcessingStatus(lesson.id, 'completed', 100, processingTime);

      return processedContent;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      this.updateProcessingStatus(lesson.id, 'failed', 0, processingTime, [errorMessage]);
      throw error;
    }
  }

  /**
   * Process vocabulary entries with pinyin and frequency analysis
   * 
   * @param lesson - Source lesson
   * @param content - Processed lesson content
   * @returns Promise<VocabularyEntryWithPinyin[]> - Enhanced vocabulary entries
   */
  async processVocabulary(
    lesson: Lesson,
    _content: ProcessedLessonContent
  ): Promise<VocabularyEntryWithPinyin[]> {
    const vocabularyEntries: VocabularyEntryWithPinyin[] = [];
    
    // Process lesson vocabulary if available
    if (lesson.metadata.vocabulary) {
      for (const vocabEntry of lesson.metadata.vocabulary) {
        const pinyin = await pinyinService.generateBasic(vocabEntry.word);
        const frequency = this.calculateWordFrequency(vocabEntry.word, lesson.content);
        
        const enhancedEntry: VocabularyEntryWithPinyin = {
          ...vocabEntry,
          pinyin,
          difficulty: this.determineDifficulty(vocabEntry.word, frequency),
          frequency,
          studyCount: 0,
          lastStudied: undefined,
          masteryLevel: 0
        };
        
        vocabularyEntries.push(enhancedEntry);
      }
    }

    // Extract additional vocabulary from content
    const contentWords = this.extractVocabularyFromContent(lesson.content);
    for (const word of contentWords) {
      // Skip if already processed
      if (vocabularyEntries.some(v => v.word === word)) continue;
      
      const pinyin = await pinyinService.generateBasic(word);
      const frequency = this.calculateWordFrequency(word, lesson.content);
      
      const enhancedEntry: VocabularyEntryWithPinyin = {
        word,
        translation: '', // Would need translation service
        partOfSpeech: 'unknown',
        pinyin,
        difficulty: this.determineDifficulty(word, frequency),
        frequency,
        studyCount: 0,
        lastStudied: undefined,
        masteryLevel: 0
      };
      
      vocabularyEntries.push(enhancedEntry);
    }

    return vocabularyEntries;
  }

  /**
   * Validate processed lesson content structure and quality
   * 
   * @param content - Processed content to validate
   * @returns Promise<ValidationResult> - Validation results
   */
  async validateProcessedContent(
    content: ProcessedLessonContent
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Validate basic structure
    if (!content.segments || content.segments.length === 0) {
      errors.push('Content must have at least one segment');
    }
    
    if (content.totalSegments !== content.segments.length) {
      errors.push(`Total segments mismatch: expected ${content.totalSegments}, got ${content.segments.length}`);
    }

    // Validate segments
    for (const segment of content.segments) {
      // Check pinyin format if generated
      if (content.pinyinGenerated && segment.pinyin) {
        if (!this.isValidPinyin(segment.pinyin)) {
          errors.push(`Invalid pinyin format: ${segment.pinyin}`);
        }
      }
      
      // Check segment structure
      if (!segment.id || !segment.text) {
        errors.push('All segments must have id and text');
      }
      
      if (segment.startIndex < 0 || segment.endIndex <= segment.startIndex) {
        errors.push(`Invalid segment indices: ${segment.startIndex}-${segment.endIndex}`);
      }
    }

    // Validate vocabulary map
    if (content.vocabularyMap.size > 0) {
      for (const [word, entry] of content.vocabularyMap) {
        if (word !== entry.word) {
          errors.push(`Vocabulary map key mismatch: ${word} !== ${entry.word}`);
        }
        
        if (!entry.pinyin && content.pinyinGenerated) {
          errors.push(`Missing pinyin for vocabulary word: ${word}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Get processing status for a lesson
   * 
   * @param lessonId - ID of the lesson
   * @returns Promise<ProcessingStatus> - Current processing status
   */
  async getProcessingStatus(lessonId: string): Promise<ProcessingStatus> {
    const status = this.processingStatus.get(lessonId);
    
    if (!status) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }
    
    return status;
  }

  // Private helper methods

  private async segmentLessonText(
    lesson: Lesson,
    options: LessonProcessingOptions
  ): Promise<TextSegmentWithAudio[]> {
    const segmentStrings = await textSegmentationService.segment(lesson.content);
    const textSegments = textSegmentationService.createSegments(lesson.content, segmentStrings);

    return textSegments.slice(0, options.maxSegments).map((segment: TextSegment, index: number) => ({
      ...segment,
      id: `seg-${String(index + 1).padStart(3, '0')}`,
      startIndex: segment.position.start,
      endIndex: segment.position.end,
      segmentType: options.segmentationMode === 'sentence' ? 'sentence' : 'vocabulary',
      audioId: undefined,
      audioReady: false,
      audioError: undefined,
      vocabularyWords: [],
      clickable: true
    }));
  }

  private async addPinyinToSegments(
    segments: TextSegmentWithAudio[]
  ): Promise<TextSegmentWithAudio[]> {
    const enhancedSegments: TextSegmentWithAudio[] = [];
    
    for (const segment of segments) {
      const pinyin = await pinyinService.generateToneMarks(segment.text);
      enhancedSegments.push({
        ...segment,
        pinyin
      });
    }
    
    return enhancedSegments;
  }

  private async buildVocabularyMap(
    lesson: Lesson
  ): Promise<Map<string, VocabularyEntryWithPinyin>> {
    const vocabularyMap = new Map<string, VocabularyEntryWithPinyin>();
    
    // Process lesson vocabulary
    if (lesson.metadata.vocabulary) {
      for (const vocabEntry of lesson.metadata.vocabulary) {
        const pinyin = await pinyinService.generateBasic(vocabEntry.word);
        const frequency = this.calculateWordFrequency(vocabEntry.word, lesson.content);
        
        vocabularyMap.set(vocabEntry.word, {
          ...vocabEntry,
          pinyin,
          difficulty: this.determineDifficulty(vocabEntry.word, frequency),
          frequency,
          studyCount: 0,
          lastStudied: undefined,
          masteryLevel: 0
        });
      }
    }
    
    return vocabularyMap;
  }

  private async addVocabularyReferences(
    segments: TextSegmentWithAudio[],
    vocabularyMap: Map<string, VocabularyEntryWithPinyin>
  ): Promise<TextSegmentWithAudio[]> {
    return segments.map(segment => {
      const vocabularyWords: VocabularyReference[] = [];
      
      // Find vocabulary words in segment
      for (const [word] of vocabularyMap) {
        if (segment.text.includes(word)) {
          const startIndex = segment.text.indexOf(word);
          vocabularyWords.push({
            word,
            startIndex,
            endIndex: startIndex + word.length,
            difficulty: vocabularyMap.get(word)?.difficulty
          });
        }
      }
      
      return {
        ...segment,
        vocabularyWords
      };
    });
  }

  private async prepareAudioForSegments(
    segments: TextSegmentWithAudio[]
  ): Promise<TextSegmentWithAudio[]> {
    return segments.map((segment, index) => ({
      ...segment,
      audioId: `audio-${String(index + 1).padStart(3, '0')}`,
      audioReady: true, // In real implementation, would prepare audio
      audioError: undefined
    }));
  }

  private calculateWordFrequency(word: string, content: string): number {
    const regex = new RegExp(word, 'g');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  private determineDifficulty(word: string, frequency: number): DifficultyLevel {
    // Simple heuristic based on word length and frequency
    if (word.length === 1 && frequency > 2) return 'beginner';
    if (word.length <= 2 && frequency > 1) return 'beginner';
    if (word.length <= 3) return 'intermediate';
    return 'advanced';
  }

  private extractVocabularyFromContent(content: string): string[] {
    // Simple Chinese word extraction (in real implementation, would use proper segmentation)
    const words: string[] = [];
    const chineseRegex = /[\u4e00-\u9fff]+/g;
    const matches = content.match(chineseRegex);
    
    if (matches) {
      matches.forEach(match => {
        // Split into individual characters and 2-character combinations
        for (let i = 0; i < match.length; i++) {
          words.push(match[i]);
          if (i < match.length - 1) {
            words.push(match.slice(i, i + 2));
          }
        }
      });
    }
    
    return [...new Set(words)]; // Remove duplicates
  }

  private isValidPinyin(pinyin: string): boolean {
    // Basic pinyin validation (tones, valid syllables)
    const pinyinRegex = /^[a-zA-ZüĀāÁáǍǎÀàōóǒòēéěèīíǐìūúǔùǖǘǚǜńǹ\s\u2019]*$/;
    return pinyinRegex.test(pinyin);
  }

  private updateProcessingStatus(
    lessonId: string,
    status: ProcessingStatus['status'],
    progress: number,
    processingTime?: number,
    errors?: string[]
  ): void {
    this.processingStatus.set(lessonId, {
      lessonId,
      status,
      progress,
      processingTime,
      errors
    });
  }
}

// Export singleton instance
export const lessonProcessingService = new EnhancedLessonProcessingService();