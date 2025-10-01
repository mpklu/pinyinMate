/**
 * Lesson Flashcard Generation Service
 * 
 * Provides comprehensive flashcard generation from Chinese lesson content
 * with SRS (Spaced Repetition System) integration and multi-format support.
 * 
 * This service implements the contract defined in:
 * tests/contract/flashcard-generation-service.test.ts
 */

import type {
  EnhancedLesson,
  VocabularyEntryWithPinyin,
  DifficultyLevel,
  ValidationResult
} from '../types';

/**
 * Flashcard generation configuration options
 */
export interface FlashcardGenerationOptions {
  cardTypes: FlashcardType[];
  maxCards: number; // 1-50
  difficultyFilter?: DifficultyLevel[];
  includeAudio: boolean;
  includePinyin: boolean;
  includeExamples: boolean;
  srsIntegration: boolean;
}

/**
 * Supported flashcard types
 */
export type FlashcardType = 
  | 'hanzi-to-pinyin'
  | 'hanzi-to-definition' 
  | 'pinyin-to-hanzi'
  | 'definition-to-hanzi'
  | 'audio-to-hanzi'
  | 'hanzi-to-audio';

/**
 * Flashcard generation result
 */
export interface FlashcardGenerationResult {
  success: boolean;
  flashcards: LessonFlashcard[];
  generationStats: GenerationStats;
  generatedAt: Date;
  errors?: FlashcardGenerationError[];
}

/**
 * Generation statistics
 */
export interface GenerationStats {
  totalGenerated: number;
  byCardType: Record<FlashcardType, number>;
  vocabularyWordsUsed: number;
  generationTime: number;
  srsIntegrated: number;
}

/**
 * Flashcard generation request
 */
export interface FlashcardGenerationRequest {
  lesson: EnhancedLesson;
  options: FlashcardGenerationOptions;
}

/**
 * Generated lesson flashcard
 */
export interface LessonFlashcard {
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

/**
 * Flashcard side content
 */
export interface FlashcardSide {
  content: string;
  pinyin?: string;
  audioId?: string;
  imageUrl?: string;
  examples?: string[];
}

/**
 * Flashcard template
 */
export interface FlashcardTemplate {
  id: string;
  name: string;
  cardType: FlashcardType;
  frontTemplate: string;
  backTemplate: string;
  supportAudio: boolean;
  supportImages: boolean;
  difficulty: DifficultyLevel;
}

/**
 * SRS integration result
 */
export interface SRSIntegrationResult {
  success: boolean;
  integratedCards: number;
  deckId?: string;
  srsSystemId: string;
  errors?: string[];
}

/**
 * SRS card data
 */
export interface SRSCardData {
  cardId: string;
  deckId: string;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  nextReview: Date;
}

/**
 * Flashcard generation error
 */
export interface FlashcardGenerationError {
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

/**
 * Lesson Flashcard Generation Service
 * 
 * Handles comprehensive flashcard generation from Chinese lessons including:
 * - Multiple flashcard types (hanzi-to-pinyin, definition-to-hanzi, etc.)
 * - Intelligent difficulty filtering and card selection
 * - Audio integration for pronunciation practice
 * - SRS (Spaced Repetition System) integration
 * - Template-based card generation for consistency
 */
class LessonFlashcardGenerationService {
  private readonly cardTemplates = new Map<FlashcardType, FlashcardTemplate>();
  private readonly srsCardCache = new Map<string, SRSCardData>();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Generate flashcards from a lesson
   * 
   * @param lesson - Enhanced lesson with vocabulary
   * @param options - Generation configuration options
   * @returns Promise<FlashcardGenerationResult> - Generation results
   */
  async generateFlashcardsFromLesson(
    lesson: EnhancedLesson,
    options: FlashcardGenerationOptions
  ): Promise<FlashcardGenerationResult> {
    const startTime = Date.now();
    const generatedAt = new Date();

    // Validate lesson vocabulary
    const vocabularyValidation = this.validateLessonVocabulary(lesson);
    if (!vocabularyValidation.isValid) {
      return this.createFailureResult(startTime, generatedAt, vocabularyValidation.errors);
    }

    const vocabularyToUse = this.prepareVocabularyForGeneration(lesson, options);
    const { flashcards, errors } = await this.generateFlashcardsFromVocabularyList(
      lesson, vocabularyToUse, options, generatedAt
    );

    // Handle SRS integration
    const srsIntegrated = await this.handleSRSIntegration(flashcards, options, errors);

    return this.createSuccessResult(
      flashcards, vocabularyToUse, srsIntegrated, 
      startTime, generatedAt, errors
    );
  }

  /**
   * Generate flashcards directly from vocabulary entries
   * 
   * @param vocabularyEntries - Vocabulary entries to generate flashcards from
   * @param options - Generation configuration options
   * @returns Promise<FlashcardGenerationResult> - Generation results
   */
  async generateFlashcardsFromVocabulary(
    vocabularyEntries: VocabularyEntryWithPinyin[],
    options: FlashcardGenerationOptions
  ): Promise<FlashcardGenerationResult> {
    const startTime = Date.now();
    const generatedAt = new Date();

    if (vocabularyEntries.length === 0) {
      return {
        success: false,
        flashcards: [],
        generationStats: this.createEmptyStats(startTime),
        generatedAt,
        errors: [{
          code: 'NO_VOCABULARY',
          message: 'Must provide vocabulary entries to generate flashcards',
          details: {
            expectedVocabularyCount: 1,
            actualVocabularyCount: 0
          }
        }]
      };
    }

    // Create a mock lesson for the generation process
    const mockLesson: EnhancedLesson = {
      id: `vocab-lesson-${Date.now()}`,
      title: 'Vocabulary Flashcards',
      description: 'Generated from vocabulary entries',
      content: vocabularyEntries.map(entry => entry.word).join('，'),
      metadata: {
        difficulty: 'intermediate' as DifficultyLevel,
        tags: ['vocabulary'],
        characterCount: vocabularyEntries.reduce((acc, entry) => acc + entry.word.length, 0),
        source: 'Vocabulary Generation',
        book: null,
        vocabulary: vocabularyEntries.map(entry => ({
          word: entry.word,
          translation: entry.translation,
          partOfSpeech: entry.partOfSpeech
        })),
        grammarPoints: [],
        culturalNotes: [],
        estimatedTime: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return this.generateFlashcardsFromLesson(mockLesson, options);
  }

  /**
   * Validate flashcard generation request
   * 
   * @param request - Generation request to validate
   * @returns Promise<ValidationResult> - Validation results
   */
  async validateGenerationRequest(
    request: FlashcardGenerationRequest
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    this.validateLessonInRequest(request, errors);
    this.validateOptionsInRequest(request, errors);

    return { isValid: errors.length === 0, errors, warnings: [] };
  }

  private validateLessonInRequest(request: FlashcardGenerationRequest, errors: string[]): void {
    if (!request.lesson) {
      errors.push('Lesson is required');
      return;
    }
    
    if (!request.lesson.metadata.vocabulary || request.lesson.metadata.vocabulary.length === 0) {
      errors.push('Lesson must contain vocabulary entries');
    }
  }

  private validateOptionsInRequest(request: FlashcardGenerationRequest, errors: string[]): void {
    if (!request.options) {
      errors.push('Generation options are required');
      return;
    }

    const { options } = request;
    this.validateMaxCards(options, errors);
    this.validateCardTypes(options, errors);
    this.validateDifficultyFilter(options, errors);
  }

  private validateMaxCards(options: FlashcardGenerationOptions, errors: string[]): void {
    if (options.maxCards < 1 || options.maxCards > 50) {
      errors.push(`maxCards must be between 1 and 50 (received: ${options.maxCards})`);
    }
  }

  private validateCardTypes(options: FlashcardGenerationOptions, errors: string[]): void {
    if (!options.cardTypes || options.cardTypes.length === 0) {
      errors.push('At least one card type is required');
      return;
    }

    const validCardTypes: FlashcardType[] = [
      'hanzi-to-pinyin', 'hanzi-to-definition', 'pinyin-to-hanzi',
      'definition-to-hanzi', 'audio-to-hanzi', 'hanzi-to-audio'
    ];

    const invalidCardTypes = options.cardTypes.filter(
      cardType => !validCardTypes.includes(cardType)
    );

    if (invalidCardTypes.length > 0) {
      errors.push(`Invalid card types: ${invalidCardTypes.join(', ')}`);
    }
  }

  private validateDifficultyFilter(options: FlashcardGenerationOptions, errors: string[]): void {
    if (!options.difficultyFilter) return;

    const validDifficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
    const invalidDifficulties = options.difficultyFilter.filter(
      difficulty => !validDifficulties.includes(difficulty)
    );

    if (invalidDifficulties.length > 0) {
      errors.push(`Invalid difficulty levels: ${invalidDifficulties.join(', ')}`);
    }
  }

  /**
   * Get available flashcard templates
   * 
   * @returns Promise<FlashcardTemplate[]> - Available templates
   */
  async getFlashcardTemplates(): Promise<FlashcardTemplate[]> {
    return Array.from(this.cardTemplates.values());
  }

  /**
   * Integrate flashcards with SRS system
   * 
   * @param flashcards - Flashcards to integrate
   * @param userId - Optional user ID for personalization
   * @returns Promise<SRSIntegrationResult> - Integration results
   */
  async integrateSRSFlashcards(
    flashcards: LessonFlashcard[],
    userId?: string
  ): Promise<SRSIntegrationResult> {
    const srsSystemId = 'local-srs-v1';
    const deckId = userId ? `user-deck-${userId}` : 'anonymous-deck';
    const errors: string[] = [];
    let integratedCards = 0;

    for (const flashcard of flashcards) {
      try {
        const srsData: SRSCardData = {
          cardId: flashcard.id,
          deckId,
          interval: 1, // Initial interval of 1 day
          easeFactor: 2.5, // Default ease factor
          reviewCount: 0,
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
        };

        // Cache the SRS data
        this.srsCardCache.set(flashcard.id, srsData);
        
        // Add SRS data to flashcard
        flashcard.srsData = srsData;
        
        integratedCards++;
      } catch (error) {
        errors.push(`Failed to integrate flashcard ${flashcard.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      integratedCards,
      deckId: integratedCards > 0 ? deckId : undefined,
      srsSystemId,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Private helper methods

  private validateLessonVocabulary(lesson: EnhancedLesson): { isValid: boolean; errors: FlashcardGenerationError[] } {
    const errors: FlashcardGenerationError[] = [];
    
    if (!lesson.metadata.vocabulary || lesson.metadata.vocabulary.length === 0) {
      errors.push({
        code: 'NO_VOCABULARY',
        message: 'Lesson must contain vocabulary entries to generate flashcards',
        details: {
          expectedVocabularyCount: 1,
          actualVocabularyCount: 0
        }
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }

  private createFailureResult(
    startTime: number, 
    generatedAt: Date, 
    errors: FlashcardGenerationError[]
  ): FlashcardGenerationResult {
    return {
      success: false,
      flashcards: [],
      generationStats: this.createEmptyStats(startTime),
      generatedAt,
      errors
    };
  }

  private prepareVocabularyForGeneration(
    lesson: EnhancedLesson, 
    options: FlashcardGenerationOptions
  ): VocabularyEntryWithPinyin[] {
    let vocabularyToUse: VocabularyEntryWithPinyin[] = lesson.metadata.vocabulary.map(entry => ({
      ...entry,
      pinyin: entry.word, // Placeholder - would be enhanced with actual pinyin
      frequency: 1,
      studyCount: 0,
      masteryLevel: 0
    }));

    // Filter by difficulty if specified
    if (options.difficultyFilter && options.difficultyFilter.length > 0) {
      vocabularyToUse = vocabularyToUse.filter(() => 
        options.difficultyFilter!.includes(lesson.metadata.difficulty)
      );
    }

    // Limit vocabulary count
    const maxVocabWords = Math.min(vocabularyToUse.length, Math.floor(options.maxCards / options.cardTypes.length));
    return vocabularyToUse.slice(0, maxVocabWords);
  }

  private async generateFlashcardsFromVocabularyList(
    lesson: EnhancedLesson,
    vocabularyToUse: VocabularyEntryWithPinyin[],
    options: FlashcardGenerationOptions,
    generatedAt: Date
  ): Promise<{ flashcards: LessonFlashcard[]; errors: FlashcardGenerationError[] }> {
    const flashcards: LessonFlashcard[] = [];
    const errors: FlashcardGenerationError[] = [];

    for (const vocabularyEntry of vocabularyToUse) {
      for (const cardType of options.cardTypes) {
        try {
          const flashcard = await this.generateFlashcard(
            lesson, vocabularyEntry, cardType, options, generatedAt
          );
          if (flashcard) {
            flashcards.push(flashcard);
          }
        } catch (error) {
          errors.push({
            code: 'TEMPLATE_ERROR',
            message: error instanceof Error ? error.message : 'Flashcard generation failed',
            vocabularyWord: vocabularyEntry.word,
            cardType
          });
        }
      }
    }

    return { flashcards, errors };
  }

  private async handleSRSIntegration(
    flashcards: LessonFlashcard[],
    options: FlashcardGenerationOptions,
    errors: FlashcardGenerationError[]
  ): Promise<number> {
    if (!options.srsIntegration || flashcards.length === 0) {
      return 0;
    }

    try {
      const srsResult = await this.integrateSRSFlashcards(flashcards);
      
      if (!srsResult.success && srsResult.errors) {
        srsResult.errors.forEach(error => {
          errors.push({
            code: 'SRS_INTEGRATION_FAILED',
            message: error
          });
        });
      }
      
      return srsResult.integratedCards;
    } catch (error) {
      errors.push({
        code: 'SRS_INTEGRATION_FAILED',
        message: error instanceof Error ? error.message : 'SRS integration failed'
      });
      return 0;
    }
  }

  private createSuccessResult(
    flashcards: LessonFlashcard[],
    vocabularyToUse: VocabularyEntryWithPinyin[],
    srsIntegrated: number,
    startTime: number,
    generatedAt: Date,
    errors: FlashcardGenerationError[]
  ): FlashcardGenerationResult {
    const statsByCardType: Record<FlashcardType, number> = {} as Record<FlashcardType, number>;
    
    // Count cards by type
    flashcards.forEach(card => {
      statsByCardType[card.cardType] = (statsByCardType[card.cardType] || 0) + 1;
    });

    return {
      success: errors.length === 0,
      flashcards,
      generationStats: {
        totalGenerated: flashcards.length,
        byCardType: statsByCardType,
        vocabularyWordsUsed: vocabularyToUse.length,
        generationTime: Date.now() - startTime,
        srsIntegrated
      },
      generatedAt,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private initializeTemplates(): void {
    const templates: FlashcardTemplate[] = [
      {
        id: 'hanzi-to-pinyin-basic',
        name: 'Chinese to Pinyin',
        cardType: 'hanzi-to-pinyin',
        frontTemplate: '{{hanzi}}',
        backTemplate: '{{pinyin}}<br/>{{definition}}',
        supportAudio: true,
        supportImages: false,
        difficulty: 'beginner'
      },
      {
        id: 'hanzi-to-definition-basic',
        name: 'Chinese to Definition',
        cardType: 'hanzi-to-definition',
        frontTemplate: '{{hanzi}}<br/>{{pinyin}}',
        backTemplate: '{{definition}}',
        supportAudio: true,
        supportImages: true,
        difficulty: 'beginner'
      },
      {
        id: 'pinyin-to-hanzi-basic',
        name: 'Pinyin to Chinese',
        cardType: 'pinyin-to-hanzi',
        frontTemplate: '{{pinyin}}<br/>{{definition}}',
        backTemplate: '{{hanzi}}',
        supportAudio: true,
        supportImages: false,
        difficulty: 'intermediate'
      },
      {
        id: 'definition-to-hanzi-basic',
        name: 'Definition to Chinese',
        cardType: 'definition-to-hanzi',
        frontTemplate: '{{definition}}',
        backTemplate: '{{hanzi}}<br/>{{pinyin}}',
        supportAudio: true,
        supportImages: false,
        difficulty: 'intermediate'
      },
      {
        id: 'audio-to-hanzi-basic',
        name: 'Audio to Chinese',
        cardType: 'audio-to-hanzi',
        frontTemplate: '{{audio}}<br/>(Listen and write)',
        backTemplate: '{{hanzi}}<br/>{{pinyin}}<br/>{{definition}}',
        supportAudio: true,
        supportImages: false,
        difficulty: 'advanced'
      },
      {
        id: 'hanzi-to-audio-basic',
        name: 'Chinese to Audio',
        cardType: 'hanzi-to-audio',
        frontTemplate: '{{hanzi}}<br/>(Read aloud)',
        backTemplate: '{{audio}}<br/>{{pinyin}}<br/>{{definition}}',
        supportAudio: true,
        supportImages: false,
        difficulty: 'intermediate'
      }
    ];

    templates.forEach(template => {
      this.cardTemplates.set(template.cardType, template);
    });
  }

  private async generateFlashcard(
    lesson: EnhancedLesson,
    vocabularyEntry: VocabularyEntryWithPinyin,
    cardType: FlashcardType,
    options: FlashcardGenerationOptions,
    generatedAt: Date
  ): Promise<LessonFlashcard | null> {
    const template = this.cardTemplates.get(cardType);
    if (!template) {
      throw new Error(`Template not found for card type: ${cardType}`);
    }

    const flashcardId = this.generateFlashcardId(lesson.id, vocabularyEntry.word, cardType);
    
    const { frontSide, backSide } = this.generateCardContent(
      vocabularyEntry,
      template,
      options
    );

    const difficulty = this.calculateCardDifficulty(vocabularyEntry, cardType);
    const tags = this.generateCardTags(lesson, vocabularyEntry, cardType);

    return {
      id: flashcardId,
      lessonId: lesson.id,
      vocabularyEntry,
      frontSide,
      backSide,
      cardType,
      difficulty,
      tags,
      sourceSegmentIds: [], // Would be populated from lesson segments
      generatedAt,
      template: template.id
    };
  }

  private generateCardContent(
    vocabularyEntry: VocabularyEntryWithPinyin,
    template: FlashcardTemplate,
    options: FlashcardGenerationOptions
  ): { frontSide: FlashcardSide; backSide: FlashcardSide } {
    const audioId = options.includeAudio ? `audio-${vocabularyEntry.word}` : undefined;
    const generators: Record<FlashcardType, () => { frontSide: FlashcardSide; backSide: FlashcardSide }> = {
      'hanzi-to-pinyin': () => this.createHanziToPinyinCard(vocabularyEntry, options, audioId),
      'hanzi-to-definition': () => this.createHanziToDefinitionCard(vocabularyEntry, options, audioId),
      'pinyin-to-hanzi': () => this.createPinyinToHanziCard(vocabularyEntry, options, audioId),
      'definition-to-hanzi': () => this.createDefinitionToHanziCard(vocabularyEntry, options, audioId),
      'audio-to-hanzi': () => this.createAudioToHanziCard(vocabularyEntry, options, audioId),
      'hanzi-to-audio': () => this.createHanziToAudioCard(vocabularyEntry, options, audioId)
    };

    const generator = generators[template.cardType];
    if (!generator) {
      throw new Error(`Unsupported card type: ${template.cardType}`);
    }

    return generator();
  }

  private createHanziToPinyinCard(
    entry: VocabularyEntryWithPinyin, 
    options: FlashcardGenerationOptions, 
    audioId?: string
  ) {
    return {
      frontSide: { content: entry.word, audioId: options.includeAudio ? audioId : undefined },
      backSide: { content: entry.translation, pinyin: options.includePinyin ? entry.pinyin : undefined }
    };
  }

  private createHanziToDefinitionCard(
    entry: VocabularyEntryWithPinyin, 
    options: FlashcardGenerationOptions, 
    audioId?: string
  ) {
    return {
      frontSide: { 
        content: entry.word, 
        pinyin: options.includePinyin ? entry.pinyin : undefined,
        audioId: options.includeAudio ? audioId : undefined 
      },
      backSide: { content: entry.translation }
    };
  }

  private createPinyinToHanziCard(
    entry: VocabularyEntryWithPinyin, 
    options: FlashcardGenerationOptions, 
    audioId?: string
  ) {
    return {
      frontSide: { content: entry.translation, pinyin: entry.pinyin },
      backSide: { content: entry.word, audioId: options.includeAudio ? audioId : undefined }
    };
  }

  private createDefinitionToHanziCard(
    entry: VocabularyEntryWithPinyin, 
    options: FlashcardGenerationOptions, 
    audioId?: string
  ) {
    return {
      frontSide: { content: entry.translation },
      backSide: { 
        content: entry.word, 
        pinyin: options.includePinyin ? entry.pinyin : undefined,
        audioId: options.includeAudio ? audioId : undefined 
      }
    };
  }

  private createAudioToHanziCard(
    entry: VocabularyEntryWithPinyin, 
    options: FlashcardGenerationOptions, 
    audioId?: string
  ) {
    return {
      frontSide: { content: '(Listen and write)', audioId },
      backSide: { 
        content: entry.word, 
        pinyin: options.includePinyin ? entry.pinyin : undefined 
      }
    };
  }

  private createHanziToAudioCard(
    entry: VocabularyEntryWithPinyin, 
    options: FlashcardGenerationOptions, 
    audioId?: string
  ) {
    return {
      frontSide: { content: `${entry.word} (Read aloud)` },
      backSide: { 
        content: entry.translation, 
        pinyin: options.includePinyin ? entry.pinyin : undefined,
        audioId 
      }
    };
  }

  private calculateCardDifficulty(
    vocabularyEntry: VocabularyEntryWithPinyin,
    cardType: FlashcardType
  ): number {
    let baseDifficulty = 3; // Default to medium

    // Adjust based on vocabulary difficulty
    if (vocabularyEntry.difficulty) {
      switch (vocabularyEntry.difficulty) {
        case 'beginner':
          baseDifficulty = 2;
          break;
        case 'intermediate':
          // baseDifficulty already 3
          break;
        case 'advanced':
          baseDifficulty = 4;
          break;
      }
    }

    // Adjust based on card type complexity
    switch (cardType) {
      case 'hanzi-to-pinyin':
      case 'hanzi-to-definition':
        // No adjustment - base difficulty
        break;
      case 'pinyin-to-hanzi':
      case 'definition-to-hanzi':
        baseDifficulty += 1; // Slightly harder
        break;
      case 'audio-to-hanzi':
        baseDifficulty += 2; // Much harder
        break;
      case 'hanzi-to-audio':
        baseDifficulty += 1; // Slightly harder
        break;
    }

    return Math.min(5, Math.max(1, baseDifficulty));
  }

  private generateCardTags(
    lesson: EnhancedLesson,
    vocabularyEntry: VocabularyEntryWithPinyin,
    cardType: FlashcardType
  ): string[] {
    const tags: string[] = [];

    // Add lesson tags
    if (lesson.metadata.tags) {
      tags.push(...lesson.metadata.tags);
    }

    // Add difficulty tag
    if (vocabularyEntry.difficulty) {
      tags.push(vocabularyEntry.difficulty);
    }

    // Add part of speech tag
    if (vocabularyEntry.partOfSpeech) {
      tags.push(vocabularyEntry.partOfSpeech);
    }

    // Add card type tag
    tags.push(cardType);

    return [...new Set(tags)]; // Remove duplicates
  }

  private generateFlashcardId(lessonId: string, word: string, cardType: FlashcardType): string {
    const wordHash = btoa(word).replace(/[+/=]/g, '').substring(0, 8);
    return `flashcard-${lessonId}-${wordHash}-${cardType}`;
  }

  private createEmptyStats(startTime: number): GenerationStats {
    return {
      totalGenerated: 0,
      byCardType: {} as Record<FlashcardType, number>,
      vocabularyWordsUsed: 0,
      generationTime: Date.now() - startTime,
      srsIntegrated: 0
    };
  }
}

// Export singleton instance
export const flashcardGenerationService = new LessonFlashcardGenerationService();