/**
 * Runtime configuration for text segmentation
 * Can be toggled by developers to test jieba-js vs simple segmentation
 */

// Simple runtime config that developers can modify
export const SEGMENTATION_CONFIG = {
  // Set to true to enable jieba-js segmentation (requires jieba-js package)
  // Set to false to use the current simple segmentation approach
  USE_JIEBA_JS: true,
  
  // Fallback behavior when jieba-js fails or is disabled
  FALLBACK_ENABLED: true,
  
  // Enable console logging for debugging segmentation
  ENABLE_LOGGING: false,
  
  // Performance settings
  JIEBA_TIMEOUT: 3000, // ms
  SIMPLE_TIMEOUT: 1000, // ms
};

// Function to check if jieba-js should be used
export const shouldUseJieba = (): boolean => {
  return SEGMENTATION_CONFIG.USE_JIEBA_JS;
};

// Function to enable/disable jieba-js at runtime
export const toggleJieba = (enabled: boolean): void => {
  SEGMENTATION_CONFIG.USE_JIEBA_JS = enabled;
  if (SEGMENTATION_CONFIG.ENABLE_LOGGING) {
    console.log(`Jieba-js segmentation ${enabled ? 'enabled' : 'disabled'}`);
  }
};

// Function to enable/disable logging
export const toggleLogging = (enabled: boolean): void => {
  SEGMENTATION_CONFIG.ENABLE_LOGGING = enabled;
};

export default SEGMENTATION_CONFIG;