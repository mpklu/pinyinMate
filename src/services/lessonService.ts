/**
 * LessonService implementation for lesson content processing and enhancement
 * Handles content preparation, text segmentation, vocabulary enhancement
 */

import type {
  LessonService,
  LessonProcessingConfig,
  LessonProcessingResult,
  FlashcardGenerationOptions,
  QuizGenerationOptions
} from '../types/lessonService';
import type {
  Lesson,
  PreparedLesson,
  TextSegment,
  VocabularyEntry,
  VocabularyEntryWithPinyin
} from '../types/lesson';
import type { LessonFlashcard } from '../types/enhancedFlashcard';
import type { LessonQuizQuestion } from '../types/enhancedQuiz';

// Import existing services
import { validatePinyinInput, generateBasicPinyin } from './pinyinService';

export class LessonServiceImpl implements LessonService {
  /**
   * Process raw lesson data into enhanced, learnable content
   */
  async processLesson(lesson: Lesson, config: LessonProcessingConfig): Promise<LessonProcessingResult> {
    const processingStart = Date.now();
    const warnings: string[] = [];

    try {
      // Segment the lesson text
      const segments = await this.segmentLessonText(lesson.content, config.segmentationMode);
      
      // Limit segments if specified
      const limitedSegments = config.maxSegments ? segments.slice(0, config.maxSegments) : segments;
      
      // Enhance vocabulary if present
      let enhancedVocabulary: VocabularyEntryWithPinyin[] = [];
      if (lesson.vocabulary && lesson.vocabulary.length > 0 && config.enhanceVocabulary) {
        enhancedVocabulary = await this.enhanceVocabulary(lesson.vocabulary, lesson.content);
      }

      // Create prepared lesson
      const processedLesson: PreparedLesson = {
        ...lesson,
        segmentedContent: {
          segments: limitedSegments,
          fullText: lesson.content
        },
        pinyinContent: config.generatePinyin ? await this.generatePinyinForContent(lesson.content) : '',
        flashcards: [], // Will be populated by generateFlashcards
        quizQuestions: [] // Will be populated by generateQuizQuestions
      };

      const processingTime = Date.now() - processingStart;

      return {
        processedLesson,
        segmentedContent: processedLesson.segmentedContent,
        enhancedVocabulary,
        processingStats: {
          segmentCount: limitedSegments.length,
          vocabularyCount: lesson.vocabulary?.length || 0,
          processingTime,
          warnings
        }
      };
    } catch (error) {
      throw new Error(`Failed to process lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Segment lesson text for audio playback and study
   */
  async segmentLessonText(content: string, mode: 'sentence' | 'paragraph' | 'section'): Promise<TextSegment[]> {
    if (!content || content.trim().length === 0) {
      return [];
    }
    
    try {
      switch (mode) {
        case 'sentence':
          return this.segmentBySentence(content);
        case 'paragraph':
          return this.segmentByParagraph(content);
        case 'section':
          return this.segmentBySection(content);
        default:
          return this.segmentBySentence(content);
      }
    } catch (error) {
      console.error('Error segmenting text:', error);
      // Fallback: treat entire content as one segment
      return [{
        id: 'fallback-1',
        text: content.trim(),
        startIndex: 0,
        endIndex: content.length
      }];
    }
  }

  /**
   * Enhance vocabulary entries with pinyin and additional metadata
   */
  async enhanceVocabulary(vocabulary: VocabularyEntry[], sourceText?: string): Promise<VocabularyEntryWithPinyin[]> {
    if (!vocabulary || vocabulary.length === 0) {
      return [];
    }

    const enhanced: VocabularyEntryWithPinyin[] = [];

    for (const entry of vocabulary) {
      try {
        // Generate pinyin for the word
        const pinyin = await this.generatePinyinForWord(entry.word);
        
        // Find context usage if source text provided
        let contextUsage: string | undefined;
        if (sourceText) {
          contextUsage = this.findContextUsage(entry.word, sourceText);
        }

        enhanced.push({
          ...entry,
          pinyin,
          contextUsage
        });
      } catch (error) {
        console.error(`Error enhancing vocabulary entry "${entry.word}":`, error);
        // Add entry with basic pinyin fallback
        enhanced.push({
          ...entry,
          pinyin: entry.word, // Fallback to original text
          contextUsage: sourceText ? this.findContextUsage(entry.word, sourceText) : undefined
        });
      }
    }

    return enhanced;
  }

  /**
   * Generate flashcards from lesson content and vocabulary
   */
  async generateFlashcards(lesson: PreparedLesson, options: FlashcardGenerationOptions): Promise<LessonFlashcard[]> {
    const flashcards: LessonFlashcard[] = [];
    let cardCount = 0;

    try {
      // Generate from vocabulary
      if ((options.source === 'vocabulary' || options.source === 'both') && lesson.vocabulary) {
        for (const vocabEntry of lesson.vocabulary) {
          if (cardCount >= options.maxCards) break;

          const pinyin = await this.generatePinyinForWord(vocabEntry.word);
          
          const flashcard: LessonFlashcard = {
            id: `${lesson.id}-flashcard-${cardCount + 1}`,
            lessonId: lesson.id,
            front: {
              content: vocabEntry.word,
              audioContent: options.includeAudio ? vocabEntry.word : undefined
            },
            back: {
              content: vocabEntry.translation,
              auxiliaryText: pinyin,
              audioContent: options.includeAudio ? vocabEntry.word : undefined
            },
            metadata: {
              sourceWord: vocabEntry.word,
              partOfSpeech: vocabEntry.partOfSpeech,
              createdAt: new Date()
            }
          };

          flashcards.push(flashcard);
          cardCount++;
        }
      }

      // Generate from content (extract key phrases)
      if ((options.source === 'content' || options.source === 'both') && cardCount < options.maxCards) {
        const contentWords = await this.extractKeyWordsFromContent(lesson.content);
        
        for (const word of contentWords) {
          if (cardCount >= options.maxCards) break;

          const pinyin = await this.generatePinyinForWord(word);
          
          const flashcard: LessonFlashcard = {
            id: `${lesson.id}-flashcard-${cardCount + 1}`,
            lessonId: lesson.id,
            front: {
              content: word,
              audioContent: options.includeAudio ? word : undefined
            },
            back: {
              content: `[From content: ${word}]`, // Simple fallback
              auxiliaryText: pinyin,
              audioContent: options.includeAudio ? word : undefined
            },
            metadata: {
              sourceWord: word,
              createdAt: new Date()
            }
          };

          flashcards.push(flashcard);
          cardCount++;
        }
      }

      return flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return [];
    }
  }

  /**
   * Generate quiz questions from lesson content and vocabulary
   */
  async generateQuizQuestions(lesson: PreparedLesson, options: QuizGenerationOptions): Promise<LessonQuizQuestion[]> {
    const questions: LessonQuizQuestion[] = [];

    try {
      for (const questionType of options.questionTypes) {
        for (let i = 0; i < options.questionsPerType; i++) {
          const question = await this.generateQuestionOfType(
            lesson,
            questionType,
            options.includeVocabulary,
            options.includeContent
          );
          
          if (question) {
            questions.push(question);
          }
        }
      }

      return questions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return [];
    }
  }

  /**
   * Validate lesson content structure and completeness
   */
  async validateLessonContent(lesson: Lesson): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check required fields
    if (!lesson.id) errors.push('Lesson ID is required');
    if (!lesson.title) errors.push('Lesson title is required');
    if (!lesson.content || lesson.content.trim().length === 0) {
      errors.push('Lesson content is required and cannot be empty');
    }
    if (!lesson.description) warnings.push('Lesson description is missing');

    // Check metadata
    if (!lesson.metadata) {
      errors.push('Lesson metadata is required');
    } else {
      if (!lesson.metadata.category) warnings.push('Category not specified');
      if (!lesson.metadata.difficulty) warnings.push('Difficulty level not specified');
      if (!lesson.metadata.estimatedTime || lesson.metadata.estimatedTime <= 0) {
        warnings.push('Estimated time should be a positive number');
      }
    }

    // Check vocabulary
    if (!lesson.vocabulary || lesson.vocabulary.length === 0) {
      suggestions.push('Consider adding vocabulary entries to enhance learning');
    } else {
      // Validate vocabulary entries
      lesson.vocabulary.forEach((entry, index) => {
        if (!entry.word) errors.push(`Vocabulary entry ${index + 1}: word is required`);
        if (!entry.translation) warnings.push(`Vocabulary entry ${index + 1}: translation is missing`);
      });
    }

    // Content analysis suggestions
    if (lesson.content) {
      const contentLength = lesson.content.length;
      if (contentLength < 50) {
        suggestions.push('Content seems quite short - consider adding more material');
      } else if (contentLength > 2000) {
        suggestions.push('Content is quite long - consider breaking into multiple lessons');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Extract vocabulary from lesson text content automatically
   */
  async extractVocabularyFromContent(content: string, existingVocabulary?: string[]): Promise<string[]> {
    if (!content || content.trim().length === 0) {
      return [];
    }

    try {
      // Extract unique words directly from content
      const extractedWords = new Set<string>();
      const chineseWords = this.extractChineseWords(content);
      chineseWords.forEach(word => extractedWords.add(word));

      // Combine with existing vocabulary
      const result = Array.from(extractedWords);
      if (existingVocabulary) {
        existingVocabulary.forEach(word => {
          if (!result.includes(word)) {
            result.push(word);
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Error extracting vocabulary from content:', error);
      return existingVocabulary || [];
    }
  }

  /**
   * Get content statistics and complexity metrics
   */
  async analyzeLessonComplexity(lesson: Lesson): Promise<{
    characterCount: number;
    vocabularyComplexity: number;
    estimatedReadingTime: number;
    difficultyScore: number;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    
    // Character count
    const characterCount = lesson.content.length;
    
    // Vocabulary complexity (0 if no vocabulary)
    const vocabularyComplexity = lesson.vocabulary ? lesson.vocabulary.length : 0;
    
    // Estimated reading time (rough calculation: ~200 chars per minute for Chinese)
    const estimatedReadingTime = Math.max(1, Math.round(characterCount / 200));
    
    // Simple difficulty score based on content length and vocabulary count
    let difficultyScore = 0;
    if (characterCount > 0) {
      difficultyScore = Math.min(10, (characterCount / 100) + (vocabularyComplexity / 10));
    }

    // Generate recommendations
    if (vocabularyComplexity === 0) {
      recommendations.push('Add vocabulary entries to improve learning outcomes');
    }
    
    if (characterCount < 100) {
      recommendations.push('Content is quite brief - consider expanding');
    } else if (characterCount > 1500) {
      recommendations.push('Content is lengthy - consider breaking into sections');
    }
    
    if (difficultyScore < 2) {
      recommendations.push('Consider adding more challenging content');
    } else if (difficultyScore > 8) {
      recommendations.push('Content may be too challenging - consider simplifying');
    }

    return {
      characterCount,
      vocabularyComplexity,
      estimatedReadingTime,
      difficultyScore,
      recommendations
    };
  }

  // Private helper methods

  private async generatePinyinForContent(content: string): Promise<string> {
    try {
      if (!validatePinyinInput(content)) {
        return '';
      }
      return await generateBasicPinyin(content);
    } catch (error) {
      console.error('Error generating pinyin for content:', error);
      return '';
    }
  }

  private async generatePinyinForWord(word: string): Promise<string> {
    try {
      if (!validatePinyinInput(word)) {
        return word; // Fallback to original word
      }
      return await generateBasicPinyin(word);
    } catch (error) {
      console.error(`Error generating pinyin for word "${word}":`, error);
      return word; // Fallback to original word
    }
  }

  private findContextUsage(word: string, sourceText: string): string | undefined {
    // Find the first sentence containing the word
    const sentences = sourceText.split(/[！。？!?]/);
    
    for (const sentence of sentences) {
      if (sentence.includes(word)) {
        const punctuationRegex = /[！。？!?]/;
        return sentence.trim() + (punctuationRegex.exec(sentence) ? '' : '。');
      }
    }
    
    return undefined;
  }

  private segmentBySentence(content: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const sentences = content.split(/([！。？!?])/);
    let currentIndex = 0;

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';
      const fullSentence = (sentence + punctuation).trim();
      
      if (fullSentence.length > 0) {
        segments.push({
          id: `sentence-${segments.length + 1}`,
          text: fullSentence,
          startIndex: currentIndex,
          endIndex: currentIndex + fullSentence.length
        });
      }
      currentIndex += fullSentence.length;
    }

    return segments;
  }

  private segmentByParagraph(content: string): TextSegment[] {
    const paragraphs = content.split(/\n\s*\n/);
    const segments: TextSegment[] = [];
    let currentIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed.length > 0) {
        segments.push({
          id: `paragraph-${segments.length + 1}`,
          text: trimmed,
          startIndex: currentIndex,
          endIndex: currentIndex + trimmed.length
        });
      }
      currentIndex += paragraph.length + 2; // Account for newlines
    }

    return segments;
  }

  private segmentBySection(content: string): TextSegment[] {
    // For simplicity, treat the entire content as one section
    // In a real implementation, this might look for section headers, etc.
    return [{
      id: 'section-1',
      text: content.trim(),
      startIndex: 0,
      endIndex: content.length
    }];
  }

  private async extractKeyWordsFromContent(content: string): Promise<string[]> {
    // Simple extraction - in practice this would use more sophisticated NLP
    const chineseWords = this.extractChineseWords(content);
    return chineseWords.slice(0, 10); // Limit to top 10 words
  }

  private extractChineseWords(text: string): string[] {
    const words: string[] = [];
    const chineseRegex = /[\u4e00-\u9fff]+/g;
    let match;
    
    while ((match = chineseRegex.exec(text)) !== null) {
      // For simplicity, treat each character as a word
      // In practice, this would use proper Chinese word segmentation
      for (const char of match[0]) {
        const chineseRegex = /[\u4e00-\u9fff]/;
        if (chineseRegex.exec(char)) {
          words.push(char);
        }
      }
    }
    
    return [...new Set(words)]; // Remove duplicates
  }

  private async generateQuestionOfType(
    lesson: PreparedLesson,
    type: 'multiple-choice' | 'fill-blank' | 'audio-recognition',
    includeVocabulary: boolean,
    includeContent: boolean
  ): Promise<LessonQuizQuestion | null> {
    
    try {
      // Get source material
      const sources: string[] = [];
      if (includeVocabulary && lesson.vocabulary) {
        sources.push(...lesson.vocabulary.map(v => v.word));
      }
      if (includeContent) {
        sources.push(...this.extractChineseWords(lesson.content));
      }

      if (sources.length === 0) return null;

      const randomWord = sources[Math.floor(Math.random() * sources.length)];
      const vocabEntry = lesson.vocabulary?.find(v => v.word === randomWord);
      
      const question: LessonQuizQuestion = {
        id: `${lesson.id}-quiz-${Date.now()}`,
        lessonId: lesson.id,
        type,
        question: '',
        correctAnswer: '',
        metadata: {
          sourceWord: randomWord,
          difficulty: 1,
          createdAt: new Date(),
          tags: [type]
        }
      };

      switch (type) {
        case 'multiple-choice':
          question.question = `What does "${randomWord}" mean?`;
          question.correctAnswer = vocabEntry?.translation || 'Unknown';
          question.options = [
            question.correctAnswer,
            'Option 2',
            'Option 3',
            'Option 4'
          ];
          break;

        case 'fill-blank':
          question.question = `Fill in the blank: ${lesson.content.replace(randomWord, '___')}`;
          question.correctAnswer = randomWord;
          break;

        case 'audio-recognition':
          question.question = `Listen and select the correct word`;
          question.correctAnswer = randomWord;
          question.options = [randomWord, '选项2', '选项3', '选项4'];
          break;
      }

      return question;
    } catch (error) {
      console.error(`Error generating ${type} question:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const lessonService = new LessonServiceImpl();