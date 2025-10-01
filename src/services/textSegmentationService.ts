/**
 * Chinese text segmentation service using jieba-js
 * Provides word segmentation and basic linguistic processing for Chinese text
 */

import type {
  TextAnnotation,
  TextSegment,
  AnnotateRequest,
  AnnotateResponse,
  AnnotationValidationResult,
} from '../types/annotation';
import { ANNOTATION_CONSTANTS } from '../types/annotation';
import type { PerformanceMetrics } from '../types/common';

/**
 * Proper sentence-based segmentation for Chinese text
 * Segments text by punctuation marks that end sentences/clauses
 * Each segment contains a complete thought with its punctuation
 */
const simpleChineseSegmentation = (text: string): string[] => {
  // For the text: '你好！我叫李明。你叫什么名字？'
  // Proper sentence segmentation should be: ['你好！', '我叫李明。', '你叫什么名字？']
  
  const segments: string[] = [];
  let currentSegment = '';
  
  for (const char of text) {
    currentSegment += char;
    
    // Segment after sentence-ending punctuation marks
    if (/[！？；：。]/.test(char)) {
      segments.push(currentSegment.trim());
      currentSegment = '';
    }
  }
  
  // Add any remaining text as the final segment
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim());
  }
  
  return segments.filter(seg => seg.length > 0);
};

/**
 * Validates Chinese text input according to annotation rules
 */
export const validateTextInput = (text: string): AnnotationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if text is empty
  if (!text || text.trim().length === 0) {
    errors.push('Text cannot be empty');
  }

  // Check text length
  if (text.length > ANNOTATION_CONSTANTS.MAX_TEXT_LENGTH) {
    errors.push(`Text too long (maximum ${ANNOTATION_CONSTANTS.MAX_TEXT_LENGTH} characters)`);
  }

  // Check for Chinese characters (CJK Unicode ranges)
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const chineseChars = (text.match(chineseRegex) || []).length;
  
  if (chineseChars < ANNOTATION_CONSTANTS.MIN_CHINESE_CHARS) {
    errors.push('Text must contain at least one Chinese character');
  }

  // Warnings for mixed content
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasNumbers = /\d/.test(text);
  
  if (hasLatin && chineseChars < text.length * 0.5) {
    warnings.push('Text contains significant non-Chinese content');
  }

  if (hasNumbers) {
    warnings.push('Text contains numbers which may not segment properly');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Segments Chinese text into individual words/phrases
 */
export const segmentText = async (text: string): Promise<string[]> => {
  try {
    // Use simple character-based segmentation as a working implementation
    // This provides basic functionality while we can improve the algorithm later
    const segments = simpleChineseSegmentation(text);
    
    return segments;
  } catch (error) {
    console.error('Text segmentation failed:', error);
    // Fallback: character-by-character segmentation
    return text.split('').filter(char => char.trim().length > 0);
  }
};

/**
 * Creates TextSegment objects from segmented text
 */
export const createTextSegments = (originalText: string, segments: string[]): TextSegment[] => {
  const textSegments: TextSegment[] = [];
  let currentPosition = 0;

  segments.forEach((segmentText, index) => {
    const startPos = originalText.indexOf(segmentText, currentPosition);
    
    if (startPos !== -1) {
      const endPos = startPos + segmentText.length;
      
      const segment: TextSegment = {
        id: `seg_${index + 1}`,
        text: segmentText,
        pinyin: '', // Will be filled by pinyin service
        toneMarks: '', // Will be filled by pinyin service
        position: {
          start: startPos,
          end: endPos,
        },
      };
      
      textSegments.push(segment);
      currentPosition = endPos;
    }
  });

  return textSegments;
};

/**
 * Generates a unique annotation ID
 */
const generateAnnotationId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ann_${timestamp}_${random}`;
};

/**
 * Measures performance of annotation processing
 */
const measurePerformance = (startTime: number, operationType: string): PerformanceMetrics => {
  const endTime = performance.now();
  return {
    startTime,
    endTime,
    duration: endTime - startTime,
    operationType,
  };
};

/**
 * Main text annotation service function
 * Processes Chinese text and returns annotated segments
 */
export const annotateText = async (request: AnnotateRequest): Promise<AnnotateResponse> => {
  const startTime = performance.now();
  
  try {
    // Validate input
    const validation = validateTextInput(request.text);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Segment the text
    const segments = await segmentText(request.text);
    
    if (segments.length === 0) {
      return {
        success: false,
        error: 'Text segmentation produced no results',
      };
    }

    // Create text segments
    const textSegments = createTextSegments(request.text, segments);
    
    // Estimate difficulty based on text characteristics
    let difficulty: 'beginner' | 'intermediate' | 'advanced';
    if (textSegments.length <= 5) {
      difficulty = 'beginner';
    } else if (textSegments.length <= 15) {
      difficulty = 'intermediate';
    } else {
      difficulty = 'advanced';
    }

    // Create annotation object
    const annotation: TextAnnotation = {
      id: generateAnnotationId(),
      originalText: request.text,
      segments: textSegments,
      createdAt: new Date(),
      metadata: {
        difficulty,
      },
    };

    // Measure performance
    const performanceMetrics = measurePerformance(startTime, 'text_annotation');
    
    // Check performance thresholds
    const threshold = request.text.length <= 1000 
      ? ANNOTATION_CONSTANTS.PERFORMANCE_THRESHOLDS.SHORT_TEXT
      : ANNOTATION_CONSTANTS.PERFORMANCE_THRESHOLDS.LONG_TEXT;
      
    if (performanceMetrics.duration > threshold) {
      console.warn(`Annotation performance exceeded threshold: ${performanceMetrics.duration}ms > ${threshold}ms`);
    }

    return {
      success: true,
      data: {
        annotation,
        processingTime: Math.round(performanceMetrics.duration),
      },
    };
    
  } catch (error) {
    console.error('Text annotation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown annotation error',
    };
  }
};

/**
 * Service interface for text segmentation
 */
export const textSegmentationService = {
  annotate: annotateText,
  validate: validateTextInput,
  segment: segmentText,
  createSegments: createTextSegments,
};

export default textSegmentationService;