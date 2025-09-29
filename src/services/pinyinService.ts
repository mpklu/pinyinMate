/**
 * Pinyin generation service using pinyin-pro
 * Provides pinyin romanization and tone marks for Chinese text
 */

import type {
  TextSegment,
  PinyinRequest,
  PinyinResponse,
} from '../types/annotation';
import type { PerformanceMetrics } from '../types/common';

// Define pinyin-pro interface to avoid any type
interface PinyinProInstance {
  pinyin: {
    (word: string, options?: { toneType?: 'none'; type?: 'string'; nonZh?: 'consecutive' }): string;
    (word: string, options?: { toneType?: 'num'; type?: 'string'; nonZh?: 'consecutive' }): string;  
    (word: string, options?: { toneType?: 'symbol'; type?: 'string'; nonZh?: 'consecutive' }): string;
  };
}

// Dynamic import for pinyin-pro (browser compatibility)
let pinyinPro: PinyinProInstance | null = null;

const loadPinyinPro = async () => {
  if (!pinyinPro) {
    try {
      // Dynamic import to avoid SSR issues
      const pinyinModule = await import('pinyin-pro');
      pinyinPro = pinyinModule;
    } catch (error) {
      console.error('Failed to load pinyin-pro:', error);
      throw new Error('Pinyin generation library not available');
    }
  }
  
  if (!pinyinPro) {
    throw new Error('Failed to initialize pinyin library');
  }
  
  return pinyinPro;
};

/**
 * Validates Chinese text for pinyin generation
 */
export const validatePinyinInput = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    return false;
  }
  
  // Check if text contains Chinese characters
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
};

/**
 * Generates pinyin without tone marks
 */
export const generateBasicPinyin = async (text: string): Promise<string> => {
  const pinyin = await loadPinyinPro();
  
  try {
    // Use pinyin function with tone style 'none'
    return pinyin.pinyin(text, {
      toneType: 'none',
      type: 'string',
      nonZh: 'consecutive'
    });
  } catch (error) {
    console.error('Basic pinyin generation failed:', error);
    return text; // Fallback to original text
  }
};

/**
 * Generates pinyin with tone numbers (ma1, ma2, ma3, ma4, ma5)
 */
export const generateNumberedPinyin = async (text: string): Promise<string> => {
  const pinyin = await loadPinyinPro();
  
  try {
    // Use pinyin function with tone style 'num'
    return pinyin.pinyin(text, {
      toneType: 'num',
      type: 'string',
      nonZh: 'consecutive'
    });
  } catch (error) {
    console.error('Numbered pinyin generation failed:', error);
    return text; // Fallback to original text
  }
};

/**
 * Generates pinyin with tone marks (mā, má, mǎ, mà, ma)
 */
export const generateToneMarkedPinyin = async (text: string): Promise<string> => {
  const pinyin = await loadPinyinPro();
  
  try {
    // Use pinyin function with tone style 'symbol'
    return pinyin.pinyin(text, {
      toneType: 'symbol',
      type: 'string',
      nonZh: 'consecutive'
    });
  } catch (error) {
    console.error('Tone marked pinyin generation failed:', error);
    return text; // Fallback to original text
  }
};

/**
 * Enriches text segments with pinyin data
 */
export const enrichSegmentsWithPinyin = async (segments: TextSegment[]): Promise<TextSegment[]> => {
  const enrichedSegments: TextSegment[] = [];
  
  for (const segment of segments) {
    try {
      // Generate both basic pinyin and tone marks
      const [basicPinyin, toneMarks] = await Promise.all([
        generateBasicPinyin(segment.text),
        generateToneMarkedPinyin(segment.text)
      ]);
      
      // Create enriched segment
      const enrichedSegment: TextSegment = {
        ...segment,
        pinyin: basicPinyin,
        toneMarks: toneMarks,
      };
      
      enrichedSegments.push(enrichedSegment);
    } catch (error) {
      console.error(`Failed to enrich segment "${segment.text}" with pinyin:`, error);
      // Keep original segment without pinyin enrichment
      enrichedSegments.push(segment);
    }
  }
  
  return enrichedSegments;
};

/**
 * Measures performance of pinyin processing
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
 * Main pinyin generation service function
 * Processes Chinese text and returns pinyin romanization
 */
export const generatePinyin = async (request: PinyinRequest): Promise<PinyinResponse> => {
  const startTime = performance.now();
  
  try {
    // Validate input
    if (!validatePinyinInput(request.text)) {
      return {
        success: false,
        error: 'Invalid input: text must contain Chinese characters',
      };
    }

    // Generate pinyin based on requested format
    let result: string;
    
    switch (request.format) {
      case 'basic':
        result = await generateBasicPinyin(request.text);
        break;
      case 'numbered':
        result = await generateNumberedPinyin(request.text);
        break;
      case 'tone-marks':
        result = await generateToneMarkedPinyin(request.text);
        break;
      default:
        result = await generateBasicPinyin(request.text);
    }

    // Measure performance
    const performanceMetrics = measurePerformance(startTime, 'pinyin_generation');
    
    return {
      success: true,
      data: {
        originalText: request.text,
        pinyin: result,
        format: request.format || 'basic',
        processingTime: Math.round(performanceMetrics.duration),
      },
    };
    
  } catch (error) {
    console.error('Pinyin generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown pinyin generation error',
    };
  }
};

/**
 * Service interface for pinyin generation
 */
export const pinyinService = {
  generate: generatePinyin,
  validate: validatePinyinInput,
  enrichSegments: enrichSegmentsWithPinyin,
  generateBasic: generateBasicPinyin,
  generateNumbered: generateNumberedPinyin,
  generateToneMarks: generateToneMarkedPinyin,
};

export default pinyinService;