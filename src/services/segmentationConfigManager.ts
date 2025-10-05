/**
 * Configuration helper for toggling jieba-js segmentation
 */

import segmentationConfig from '../config/segmentation.config.json';
import type { SegmentationConfig } from '../types/segmentation';

class SegmentationConfigManager {
  private readonly config: SegmentationConfig;

  constructor() {
    this.config = segmentationConfig as SegmentationConfig;
  }

  /**
   * Check if jieba-js is enabled
   */
  isJiebaEnabled(): boolean {
    return this.config.textSegmentation.useJiebaJs;
  }

  /**
   * Check if fallback is enabled
   */
  isFallbackEnabled(): boolean {
    return this.config.textSegmentation.fallbackEnabled;
  }

  /**
   * Get performance settings
   */
  getPerformanceConfig() {
    return this.config.performance;
  }

  /**
   * Get full configuration
   */
  getConfig(): SegmentationConfig {
    return this.config;
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.config.textSegmentation.enableLogging;
  }

  /**
   * Get current performance mode
   */
  getPerformanceMode(): 'fast' | 'balanced' | 'accurate' {
    return this.config.textSegmentation.performanceMode;
  }
}

export const segmentationConfigManager = new SegmentationConfigManager();
export { SegmentationConfigManager };