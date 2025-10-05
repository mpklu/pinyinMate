/**
 * Jieba-js enhancement for Chinese text segmentation
 * Optional enhancement that can be toggled on/off via configuration
 */

import type { SegmentationConfig, SegmentationResult } from '../types/segmentation';
import segmentationConfig from '../config/segmentation.config.json';

// Type definition for jieba-js module
interface JiebaInstance {
  cut: (text: string, hmm?: boolean) => string[];
}

// Lazy load jieba-js to avoid bundle size impact when not used
let jiebaInstance: JiebaInstance | null = null;

/**
 * Load jieba-js dynamically
 */
const loadJieba = async (): Promise<JiebaInstance | null> => {
  if (!jiebaInstance) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jiebaModule = await import('jieba-js') as any;
      // jieba-js exports a default instance that has the cut method
      const jieba = jiebaModule.default || jiebaModule;
      jiebaInstance = jieba;
      return jieba;
    } catch (error) {
      console.warn('Failed to load jieba-js:', error);
      return null;
    }
  }
  return jiebaInstance;
};

/**
 * Enhanced segmentation using jieba-js with fallback to simple segmentation
 */
export const enhancedSegmentText = async (text: string, fallbackSegmentFunction: (text: string) => string[]): Promise<SegmentationResult> => {
  const config = segmentationConfig as SegmentationConfig;
  const startTime = performance.now();
  
  // If jieba is not enabled, use fallback immediately
  if (!config.textSegmentation.useJiebaJs) {
    const segments = fallbackSegmentFunction(text);
    const processingTime = performance.now() - startTime;
    
    return {
      segments,
      method: 'simple',
      processingTime,
      success: true,
    };
  }
  
  try {
    // Try jieba-js segmentation
    const jieba = await Promise.race([
      loadJieba(),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Jieba load timeout')), config.performance.jiebaTimeout)
      )
    ]);
    
    if (!jieba) {
      throw new Error('Jieba not available');
    }
    
    const segments = jieba.cut(text, true); // Use HMM for better accuracy
    const processingTime = performance.now() - startTime;
    
    if (config.textSegmentation.enableLogging) {
      console.log(`Jieba segmentation completed in ${processingTime.toFixed(2)}ms`);
    }
    
    return {
      segments: Array.isArray(segments) ? segments.filter(s => s.trim().length > 0) : [text],
      method: 'jieba-js',
      processingTime,
      success: true,
    };
    
  } catch (error) {
    const processingTime = performance.now() - startTime;
    
    if (config.textSegmentation.enableLogging) {
      console.warn('Jieba segmentation failed, using fallback:', error);
    }
    
    // Use fallback if enabled
    if (config.textSegmentation.fallbackEnabled) {
      const segments = fallbackSegmentFunction(text);
      
      return {
        segments,
        method: 'simple',
        processingTime,
        success: true,
        warnings: ['Jieba-js failed, used simple segmentation fallback']
      };
    } else {
      return {
        segments: [],
        method: 'jieba-js',
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Jieba segmentation failed'
      };
    }
  }
};

/**
 * Check if jieba-js is available and working
 */
export const isJiebaAvailable = async (): Promise<boolean> => {
  try {
    const jieba = await loadJieba();
    return jieba !== null;
  } catch {
    return false;
  }
};

/**
 * Get current segmentation configuration
 */
export const getSegmentationConfig = (): SegmentationConfig => {
  return segmentationConfig as SegmentationConfig;
};

export const jiebaEnhancement = {
  enhancedSegmentText,
  isJiebaAvailable,
  getConfig: getSegmentationConfig,
};