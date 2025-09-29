/**
 * Spaced Repetition System (SRS) Service
 * Implements SuperMemo SM-2 algorithm for flashcard scheduling and performance tracking
 */

import type {
  Flashcard,
  FlashcardDeck,
  SRSData,
  FlashcardGenerateRequest,
  FlashcardGenerateResponse,
  FlashcardReviewRequest,
  FlashcardReviewResponse,
  SRSQueueResponse,
  SRSQualityValue,
} from '../types/flashcard';
import type {
  TextAnnotation,
  TextSegment,
} from '../types/annotation';

// Import constants and enum
import { FLASHCARD_CONSTANTS, SRSQuality } from '../types/flashcard';

/**
 * Validates flashcard generation request
 */
export const validateFlashcardRequest = (request: FlashcardGenerateRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.sourceAnnotationId) {
    errors.push('Source annotation ID is required');
  }

  if (request.cardLimit && 
      (request.cardLimit < 1 || request.cardLimit > FLASHCARD_CONSTANTS.MAX_CARD_LIMIT)) {
    errors.push(`Card limit must be between 1 and ${FLASHCARD_CONSTANTS.MAX_CARD_LIMIT}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generates a unique flashcard ID
 */
const generateFlashcardId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `card_${timestamp}_${random}`;
};

/**
 * Generates a unique deck ID
 */
const generateDeckId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `deck_${timestamp}_${random}`;
};

/**
 * Creates initial SRS data for a new card
 */
const createInitialSRSData = (): SRSData => {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(now.getDate() + FLASHCARD_CONSTANTS.SRS_ALGORITHM.INITIAL_INTERVAL);

  return {
    interval: FLASHCARD_CONSTANTS.SRS_ALGORITHM.INITIAL_INTERVAL,
    repetition: 0,
    easeFactor: FLASHCARD_CONSTANTS.SRS_ALGORITHM.INITIAL_EASE_FACTOR,
    dueDate,
    totalReviews: 0,
  };
};

/**
 * Creates a flashcard from a text segment
 */
const createFlashcardFromSegment = (segment: TextSegment, includeDefinitions: boolean, includeExamples: boolean): Flashcard => {
  return {
    id: generateFlashcardId(),
    front: segment.text,
    back: {
      pinyin: segment.toneMarks || segment.pinyin,
      definition: includeDefinitions ? segment.definition : undefined,
      example: includeExamples ? `Example usage of ${segment.text}` : undefined,
      audioUrl: segment.audioUrl,
    },
    sourceSegmentId: segment.id,
    srsData: createInitialSRSData(),
    tags: ['vocabulary', 'auto-generated'],
    createdAt: new Date(),
  };
};

/**
 * Implements SuperMemo SM-2 algorithm for interval calculation
 */
export const calculateNextReview = (srsData: SRSData, quality: SRSQualityValue): SRSData => {
  const updatedData = { ...srsData };
  updatedData.lastReviewed = new Date();
  updatedData.totalReviews = (updatedData.totalReviews || 0) + 1;

  // Update ease factor based on quality
  if (quality >= SRSQuality.CORRECT_HARD) {
    updatedData.easeFactor = Math.max(
      FLASHCARD_CONSTANTS.SRS_ALGORITHM.MIN_EASE_FACTOR,
      updatedData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  } else {
    // Failed review - reduce ease factor
    updatedData.easeFactor = Math.max(
      FLASHCARD_CONSTANTS.SRS_ALGORITHM.MIN_EASE_FACTOR,
      updatedData.easeFactor - FLASHCARD_CONSTANTS.SRS_ALGORITHM.EASE_PENALTY
    );
  }

  // Calculate new interval
  if (quality < FLASHCARD_CONSTANTS.SRS_ALGORITHM.FAILURE_THRESHOLD) {
    // Failed review - reset to beginning
    updatedData.repetition = 0;
    updatedData.interval = 1;
  } else {
    // Successful review
    updatedData.repetition += 1;
    
    if (updatedData.repetition === 1) {
      updatedData.interval = 1;
    } else if (updatedData.repetition === 2) {
      updatedData.interval = 6;
    } else {
      updatedData.interval = Math.round(updatedData.interval * updatedData.easeFactor);
    }
  }

  // Set due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + updatedData.interval);
  updatedData.dueDate = dueDate;

  return updatedData;
};

/**
 * Generates flashcards from annotated text
 */
export const generateFlashcards = async (
  request: FlashcardGenerateRequest,
  annotation: TextAnnotation
): Promise<FlashcardGenerateResponse> => {
  const startTime = performance.now();

  try {
    // Validate request
    const validation = validateFlashcardRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Filter segments that have valid content
    const validSegments = annotation.segments.filter(segment => 
      segment.text && segment.text.trim().length > 0 && 
      (segment.pinyin || segment.toneMarks)
    );

    if (validSegments.length === 0) {
      return {
        success: false,
        error: 'No valid segments found for flashcard generation',
      };
    }

    // Limit cards based on request
    const cardLimit = request.cardLimit || Math.min(validSegments.length, FLASHCARD_CONSTANTS.DEFAULT_CARD_LIMIT);
    const selectedSegments = validSegments.slice(0, cardLimit);

    // Generate flashcards
    const cards = selectedSegments.map(segment => 
      createFlashcardFromSegment(segment, request.includeDefinitions, request.includeExamples)
    );

    // Create deck
    const deck: FlashcardDeck = {
      id: generateDeckId(),
      name: `Flashcards from ${annotation.originalText.substring(0, 50)}...`,
      cards,
      sourceType: 'annotation',
      sourceId: request.sourceAnnotationId,
      createdAt: new Date(),
      metadata: {
        cardCount: cards.length,
        difficulty: request.difficulty || annotation.metadata.difficulty,
        tags: request.tags || ['vocabulary', 'auto-generated'],
        description: `Generated from text annotation: ${annotation.originalText.substring(0, 100)}...`,
      },
    };

    // Measure performance
    const endTime = performance.now();
    const generationTime = Math.round(endTime - startTime);

    return {
      success: true,
      data: {
        deck,
        generationTime,
      },
    };

  } catch (error) {
    console.error('Flashcard generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown flashcard generation error',
    };
  }
};

/**
 * Gets cards due for review
 */
export const getDueCards = (deck: FlashcardDeck): SRSQueueResponse => {
  try {
    const now = new Date();
    
    // Find cards due for review
    const dueCards = deck.cards.filter(card => 
      card.srsData.dueDate <= now
    );

    // Sort by due date (oldest first)
    dueCards.sort((a, b) => 
      a.srsData.dueDate.getTime() - b.srsData.dueDate.getTime()
    );

    // Find next review time for remaining cards
    const futureDue = deck.cards
      .filter(card => card.srsData.dueDate > now)
      .sort((a, b) => a.srsData.dueDate.getTime() - b.srsData.dueDate.getTime());

    const nextReviewTime = futureDue.length > 0 ? futureDue[0].srsData.dueDate : undefined;

    // Calculate study streak (placeholder - would need session tracking)
    const studyStreak = 0;

    return {
      success: true,
      data: {
        queue: dueCards,
        totalDue: dueCards.length,
        nextReviewTime,
        studyStreak,
      },
    };

  } catch (error) {
    console.error('Failed to get due cards:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting due cards',
    };
  }
};

/**
 * Processes a flashcard review
 */
export const reviewFlashcard = (
  card: Flashcard,
  request: FlashcardReviewRequest
): FlashcardReviewResponse => {
  const startTime = performance.now();

  try {
    // Validate quality rating
    if (request.quality < 0 || request.quality > 5) {
      return {
        success: false,
        error: 'Quality rating must be between 0 and 5',
      };
    }

    // Calculate new SRS data
    const updatedSRSData = calculateNextReview(card.srsData, request.quality as SRSQualityValue);

    // Create updated card
    const updatedCard: Flashcard = {
      ...card,
      srsData: updatedSRSData,
    };

    // Calculate study streak (placeholder)
    const studyStreak = request.quality >= SRSQuality.CORRECT_HARD ? 1 : 0;

    // Measure performance
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    if (processingTime > FLASHCARD_CONSTANTS.PERFORMANCE_TARGETS.REVIEW_PROCESSING) {
      console.warn(`Review processing exceeded target: ${processingTime}ms`);
    }

    return {
      success: true,
      data: {
        nextReview: updatedSRSData.dueDate,
        interval: updatedSRSData.interval,
        updatedCard,
        studyStreak,
      },
    };

  } catch (error) {
    console.error('Flashcard review failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown review error',
    };
  }
};

/**
 * Calculates deck statistics
 */
export const getDeckStatistics = (deck: FlashcardDeck) => {
  const now = new Date();
  const totalCards = deck.cards.length;
  const dueCards = deck.cards.filter(card => card.srsData.dueDate <= now).length;
  const reviewedCards = deck.cards.filter(card => card.srsData.totalReviews && card.srsData.totalReviews > 0).length;
  
  const averageEaseFactor = deck.cards.reduce((sum, card) => sum + card.srsData.easeFactor, 0) / totalCards;
  const averageInterval = deck.cards.reduce((sum, card) => sum + card.srsData.interval, 0) / totalCards;

  return {
    totalCards,
    dueCards,
    reviewedCards,
    newCards: totalCards - reviewedCards,
    averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
    averageInterval: Math.round(averageInterval * 10) / 10,
  };
};

/**
 * Service interface for SRS functionality
 */
export const srsService = {
  generateFlashcards,
  getDueCards,
  reviewFlashcard,
  calculateNextReview,
  getDeckStatistics,
  validate: validateFlashcardRequest,
};

export default srsService;