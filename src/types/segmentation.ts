/**
 * Configuration types for text segmentation service
 */

export interface SegmentationConfig {
  textSegmentation: {
    useJiebaJs: boolean;
    fallbackEnabled: boolean;
    performanceMode: 'fast' | 'balanced' | 'accurate';
    maxTextLength: number;
    enableLogging: boolean;
  };
  performance: {
    jiebaTimeout: number;
    fallbackTimeout: number;
    enablePerformanceMetrics: boolean;
  };
  experimental: {
    enableContextAwareGrouping: boolean;
    enableSemanticSegmentation: boolean;
  };
}

export interface SegmentationMethod {
  name: string;
  enabled: boolean;
  priority: number;
  timeout?: number;
}

export interface SegmentationResult {
  segments: string[];
  method: 'jieba-js' | 'simple' | 'character-based';
  processingTime: number;
  success: boolean;
  error?: string;
  warnings?: string[];
}

export interface SegmentationPerformanceMetrics {
  jiebaTime?: number;
  fallbackTime?: number;
  totalTime: number;
  method: string;
  textLength: number;
  segmentCount: number;
}