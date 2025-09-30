/**
 * Enhanced Error Handling Service
 * Provides centralized error handling for remote sources and audio API failures
 */

export enum ErrorCode {
  // Network errors
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_RATE_LIMITED = 'NETWORK_RATE_LIMITED',
  
  // Remote source errors
  REMOTE_SOURCE_UNAVAILABLE = 'REMOTE_SOURCE_UNAVAILABLE',
  REMOTE_SOURCE_UNAUTHORIZED = 'REMOTE_SOURCE_UNAUTHORIZED',
  REMOTE_SOURCE_NOT_FOUND = 'REMOTE_SOURCE_NOT_FOUND',
  REMOTE_SOURCE_INVALID_FORMAT = 'REMOTE_SOURCE_INVALID_FORMAT',
  REMOTE_SOURCE_TOO_LARGE = 'REMOTE_SOURCE_TOO_LARGE',
  
  // Audio errors
  AUDIO_API_UNAVAILABLE = 'AUDIO_API_UNAVAILABLE',
  AUDIO_SYNTHESIS_FAILED = 'AUDIO_SYNTHESIS_FAILED',
  AUDIO_UNSUPPORTED_FORMAT = 'AUDIO_UNSUPPORTED_FORMAT',
  AUDIO_PERMISSION_DENIED = 'AUDIO_PERMISSION_DENIED',
  AUDIO_DEVICE_BUSY = 'AUDIO_DEVICE_BUSY',
  
  // Cache errors
  CACHE_QUOTA_EXCEEDED = 'CACHE_QUOTA_EXCEEDED',
  CACHE_CORRUPT = 'CACHE_CORRUPT',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CONTENT_TOO_LARGE = 'CONTENT_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT'
}

export interface ErrorContext {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
  fallbackAvailable: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorCode[];
}

export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private errorHistory: Map<string, ErrorContext[]> = new Map();
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      ErrorCode.NETWORK_TIMEOUT,
      ErrorCode.NETWORK_UNAVAILABLE,
      ErrorCode.REMOTE_SOURCE_UNAVAILABLE,
      ErrorCode.AUDIO_DEVICE_BUSY
    ]
  };

  static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler();
    }
    return EnhancedErrorHandler.instance;
  }

  /**
   * Handle errors with context and recovery options
   */
  handleError(error: Error | ErrorContext, context?: Record<string, any>): ErrorContext {
    const errorContext: ErrorContext = this.normalizeError(error, context);
    
    // Log error with context
    this.logError(errorContext);
    
    // Store error history for pattern analysis
    this.storeErrorHistory(errorContext);
    
    // Determine recovery options
    this.analyzeRecoveryOptions(errorContext);
    
    return errorContext;
  }

  /**
   * Execute operation with retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    errorSource: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    let lastError: ErrorContext | null = null;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.handleError(error, { 
          attempt, 
          maxAttempts: config.maxAttempts,
          source: errorSource 
        });

        // Don't retry on non-retryable errors
        if (!config.retryableErrors.includes(lastError.code)) {
          throw lastError;
        }

        // Don't retry on last attempt
        if (attempt === config.maxAttempts) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Handle remote source failures with fallback strategies
   */
  async handleRemoteSourceFailure(
    error: Error,
    sourceUrl: string,
    fallbackSources?: string[]
  ): Promise<{ success: boolean; data?: any; error?: string; fallbackUsed?: boolean }> {
    const errorContext = this.handleError(error, { sourceUrl, type: 'remote_source' });

    // Try fallback sources
    if (fallbackSources && fallbackSources.length > 0) {
      for (const fallbackUrl of fallbackSources) {
        try {
          const response = await fetch(fallbackUrl, {
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'LearnChinese/1.0'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // Log successful fallback
            console.info(`Successfully used fallback source: ${fallbackUrl}`);
            
            return {
              success: true,
              data,
              fallbackUsed: true
            };
          }
        } catch (fallbackError) {
          console.warn(`Fallback source failed: ${fallbackUrl}`, fallbackError);
        }
      }
    }

    // Check if offline cache is available
    if (this.isOfflineCacheAvailable()) {
      try {
        const cachedData = await this.getCachedData(sourceUrl);
        if (cachedData) {
          console.info('Using offline cached data');
          return {
            success: true,
            data: cachedData,
            fallbackUsed: true
          };
        }
      } catch (cacheError) {
        console.warn('Offline cache access failed', cacheError);
      }
    }

    // Return structured error response
    return {
      success: false,
      error: this.getUserFriendlyMessage(errorContext),
      fallackUsed: false
    };
  }

  /**
   * Handle audio API failures with graceful degradation
   */
  async handleAudioFailure(
    error: Error,
    text: string,
    options?: any
  ): Promise<{ success: boolean; data?: any; error?: string; fallbackUsed?: boolean }> {
    const errorContext = this.handleError(error, { text, options, type: 'audio' });

    // Try Web Speech API fallback
    if (this.isWebSpeechAvailable()) {
      try {
        const fallbackResult = await this.synthesizeWithWebSpeech(text, options);
        
        console.info('Successfully used Web Speech API fallback');
        
        return {
          success: true,
          data: fallbackResult,
          fallbackUsed: true
        };
      } catch (fallbackError) {
        console.warn('Web Speech API fallback failed', fallbackError);
      }
    }

    // Try silent/placeholder audio
    if (this.isAudioContextAvailable()) {
      try {
        const silentAudio = this.createSilentAudio(text.length);
        
        return {
          success: true,
          data: {
            audioUrl: silentAudio,
            duration: text.length * 0.1, // Estimate
            format: 'silent',
            fallback: true
          },
          fallbackUsed: true
        };
      } catch (silentError) {
        console.warn('Silent audio fallback failed', silentError);
      }
    }

    // Provide text-only fallback
    return {
      success: false,
      error: this.getAudioFallbackMessage(errorContext),
      fallbackUsed: false
    };
  }

  private normalizeError(error: Error | ErrorContext, context?: Record<string, any>): ErrorContext {
    if ('code' in error && 'message' in error) {
      return error as ErrorContext;
    }

    const originalError = error as Error;
    let code: ErrorCode;
    let recoverable = false;
    let retryable = false;
    let fallbackAvailable = false;

    // Categorize error based on message and type
    if (originalError.name === 'TypeError' && originalError.message.includes('fetch')) {
      code = ErrorCode.NETWORK_UNAVAILABLE;
      recoverable = true;
      retryable = true;
      fallbackAvailable = true;
    } else if (originalError.name === 'AbortError' || originalError.message.includes('timeout')) {
      code = ErrorCode.NETWORK_TIMEOUT;
      recoverable = true;
      retryable = true;
      fallbackAvailable = true;
    } else if (originalError.message.includes('404')) {
      code = ErrorCode.REMOTE_SOURCE_NOT_FOUND;
      recoverable = false;
      retryable = false;
      fallbackAvailable = true;
    } else if (originalError.message.includes('401') || originalError.message.includes('403')) {
      code = ErrorCode.REMOTE_SOURCE_UNAUTHORIZED;
      recoverable = false;
      retryable = false;
      fallbackAvailable = false;
    } else if (originalError.message.includes('audio') && originalError.message.includes('not supported')) {
      code = ErrorCode.AUDIO_API_UNAVAILABLE;
      recoverable = true;
      retryable = false;
      fallbackAvailable = true;
    } else if (originalError.message.includes('synthesis')) {
      code = ErrorCode.AUDIO_SYNTHESIS_FAILED;
      recoverable = true;
      retryable = true;
      fallbackAvailable = true;
    } else {
      code = ErrorCode.VALIDATION_FAILED;
      recoverable = false;
      retryable = false;
      fallbackAvailable = false;
    }

    return {
      code,
      message: originalError.message,
      details: {
        ...context,
        stack: originalError.stack,
        name: originalError.name
      },
      timestamp: new Date(),
      recoverable,
      retryable,
      fallbackAvailable
    };
  }

  private logError(errorContext: ErrorContext): void {
    const logData = {
      code: errorContext.code,
      message: errorContext.message,
      timestamp: errorContext.timestamp.toISOString(),
      recoverable: errorContext.recoverable,
      retryable: errorContext.retryable,
      details: errorContext.details
    };

    if (errorContext.recoverable) {
      console.warn('Recoverable error occurred:', logData);
    } else {
      console.error('Non-recoverable error occurred:', logData);
    }
  }

  private storeErrorHistory(errorContext: ErrorContext): void {
    const key = errorContext.code;
    const history = this.errorHistory.get(key) || [];
    
    history.push(errorContext);
    
    // Keep only last 10 errors per type
    if (history.length > 10) {
      history.shift();
    }
    
    this.errorHistory.set(key, history);
  }

  private analyzeRecoveryOptions(errorContext: ErrorContext): void {
    const history = this.errorHistory.get(errorContext.code) || [];
    
    // If this error has occurred frequently, consider it a persistent issue
    if (history.length >= 5) {
      const recentErrors = history.slice(-5);
      const timeSpan = recentErrors[recentErrors.length - 1].timestamp.getTime() - 
                      recentErrors[0].timestamp.getTime();
      
      // If 5 errors in last 5 minutes, mark as persistent
      if (timeSpan < 5 * 60 * 1000) {
        errorContext.retryable = false;
        console.warn(`Persistent error detected for ${errorContext.code}, disabling retries`);
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isOfflineCacheAvailable(): boolean {
    return 'caches' in window && 'serviceWorker' in navigator;
  }

  private async getCachedData(url: string): Promise<any> {
    if (!this.isOfflineCacheAvailable()) {
      return null;
    }

    try {
      const cache = await caches.open('learn-chinese-lessons');
      const response = await cache.match(url);
      
      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Cache access failed:', error);
    }
    
    return null;
  }

  private isWebSpeechAvailable(): boolean {
    return typeof window !== 'undefined' && 
           'speechSynthesis' in window && 
           'SpeechSynthesisUtterance' in window;
  }

  private async synthesizeWithWebSpeech(text: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isWebSpeechAvailable()) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.lang = 'zh-CN';
      utterance.rate = options?.speed || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        resolve({
          audioUrl: 'web-speech-synthesis',
          duration: text.length * 0.1,
          format: 'speech-synthesis',
          fallback: true
        });
      };

      utterance.onerror = (event) => {
        reject(new Error(`Web Speech synthesis failed: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  private isAudioContextAvailable(): boolean {
    return typeof window !== 'undefined' && 
           (window.AudioContext || (window as any).webkitAudioContext);
  }

  private createSilentAudio(textLength: number): string {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Create a short silent audio buffer
      const duration = Math.max(0.1, textLength * 0.05); // Minimum 100ms
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      
      // Buffer is already silent (zeros)
      
      // Create blob URL (placeholder)
      return `data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUgCCeO1O7RgCs`;
    } catch (error) {
      console.warn('Silent audio creation failed:', error);
      return 'silent-audio-unavailable';
    }
  }

  private getUserFriendlyMessage(errorContext: ErrorContext): string {
    const messages = {
      [ErrorCode.NETWORK_UNAVAILABLE]: 'Unable to connect to the server. Please check your internet connection and try again.',
      [ErrorCode.NETWORK_TIMEOUT]: 'The request took too long to complete. Please try again.',
      [ErrorCode.REMOTE_SOURCE_UNAVAILABLE]: 'The lesson source is temporarily unavailable. Trying offline content.',
      [ErrorCode.REMOTE_SOURCE_NOT_FOUND]: 'The requested lesson was not found. It may have been moved or deleted.',
      [ErrorCode.REMOTE_SOURCE_UNAUTHORIZED]: 'Access to this lesson requires authentication. Please check your permissions.',
      [ErrorCode.AUDIO_API_UNAVAILABLE]: 'Audio features are not available in your browser. Try using a different browser or enable audio permissions.',
      [ErrorCode.AUDIO_SYNTHESIS_FAILED]: 'Unable to generate audio. The lesson text will be displayed without sound.',
      [ErrorCode.CACHE_QUOTA_EXCEEDED]: 'Storage space is full. Some offline content may not be available.',
      [ErrorCode.VALIDATION_FAILED]: 'The content format is invalid. Please try refreshing the page.'
    };

    return messages[errorContext.code] || 'An unexpected error occurred. Please try again.';
  }

  private getAudioFallbackMessage(errorContext: ErrorContext): string {
    return 'Audio is not available for this content. You can still read the text and continue learning.';
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): Record<string, { count: number; lastOccurred: Date; recoverable: boolean }> {
    const stats: Record<string, { count: number; lastOccurred: Date; recoverable: boolean }> = {};
    
    for (const [code, history] of this.errorHistory.entries()) {
      if (history.length > 0) {
        stats[code] = {
          count: history.length,
          lastOccurred: history[history.length - 1].timestamp,
          recoverable: history[history.length - 1].recoverable
        };
      }
    }
    
    return stats;
  }

  /**
   * Clear error history (for testing or cleanup)
   */
  clearErrorHistory(): void {
    this.errorHistory.clear();
  }
}

// Export singleton instance
export const errorHandler = EnhancedErrorHandler.getInstance();