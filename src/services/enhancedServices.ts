/**
 * Enhanced Services Integration
 * Integrates service coordinator with existing services for comprehensive functionality
 */

import { errorHandler, ErrorCode } from './errorHandler';
import { serviceCoordinator } from './serviceCoordinator';
import type { AudioSynthesizeRequest, AudioSynthesizeResponse } from '../types/library';
import type { EnhancedLesson, LessonStudyProgress } from '../types/lesson';

// Define lesson data type for better type safety
interface LessonData {
  id: string;
  title: string;
  content: string;
  level?: string;
  category?: string;
  vocabulary?: Array<{ word: string; pinyin: string; translation: string }>;
  audio?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Enhanced Audio Service with robust error handling
 */
export class EnhancedAudioService {
  private static instance: EnhancedAudioService;
  private readonly audioCache = new Map<string, { url: string; timestamp: number }>();
  private readonly CACHE_TTL = 3600000; // 1 hour

  static getInstance(): EnhancedAudioService {
    if (!EnhancedAudioService.instance) {
      EnhancedAudioService.instance = new EnhancedAudioService();
    }
    return EnhancedAudioService.instance;
  }

  /**
   * Synthesize audio with comprehensive error handling and fallbacks
   */
  async synthesizeAudio(request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> {
    try {
      // Check cache first
      const cached = this.getCachedAudio(request.text);
      if (cached) {
        return {
          success: true,
          data: {
            audioUrl: cached.url,
            duration: this.estimateDuration(request.text),
            format: 'cached',
            size: 0
          }
        };
      }

      // Try primary audio synthesis with retry logic
      return await errorHandler.withRetry(
        () => this.attemptAudioSynthesis(request),
        'audio-synthesis',
        {
          maxAttempts: 2,
          baseDelay: 500,
          retryableErrors: [ErrorCode.AUDIO_DEVICE_BUSY, ErrorCode.NETWORK_TIMEOUT]
        }
      );

    } catch (error) {
      // Handle error with fallback strategies
      const result = await errorHandler.handleAudioFailure(
        error as Error,
        request.text,
        request.options
      );

      if (result.success) {
        return {
          success: true,
          data: result.data,
          fallbackUsed: result.fallbackUsed
        };
      }

      return {
        success: false,
        error: result.error || 'Audio synthesis failed'
      };
    }
  }

  private async attemptAudioSynthesis(request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> {
    // Validate input
    if (!request.text || request.text.trim().length === 0) {
      throw new Error('Text is required for audio synthesis');
    }

    if (request.text.length > 1000) {
      throw new Error('Text too long for audio synthesis');
    }

    // Try MeloTTS first (if available)
    if (this.isMeloTTSAvailable()) {
      try {
        const result = await this.synthesizeWithMeloTTS();
        this.cacheAudio(request.text, result.data.audioUrl);
        return result;
      } catch (meloError) {
        console.warn('MeloTTS failed, falling back to Web Speech API:', meloError);
      }
    }

    // Try Web Speech API
    if (this.isWebSpeechAvailable()) {
      try {
        const result = await this.synthesizeWithWebSpeech(request);
        this.cacheAudio(request.text, result.data.audioUrl);
        return result;
      } catch (webSpeechError) {
        console.warn('Web Speech API failed:', webSpeechError);
        throw new Error(`Audio synthesis failed: ${webSpeechError.message}`);
      }
    }

    throw new Error('No audio synthesis methods available');
  }

  private isMeloTTSAvailable(): boolean {
    // Check if MeloTTS server is reachable
    // This would typically involve a health check endpoint
    return false; // Placeholder - MeloTTS not implemented yet
  }

  private async synthesizeWithMeloTTS(): Promise<AudioSynthesizeResponse> {
    // Placeholder for MeloTTS implementation
    throw new Error('MeloTTS not implemented');
  }

  private isWebSpeechAvailable(): boolean {
    return typeof window !== 'undefined' && 
           'speechSynthesis' in window && 
           'SpeechSynthesisUtterance' in window;
  }

  private async synthesizeWithWebSpeech(request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(request.text);
      
      // Configure utterance
      utterance.lang = 'zh-CN';
      utterance.rate = request.options?.speed || 1.0;
      utterance.pitch = request.options?.pitch || 1.0;
      utterance.volume = 1.0;

      // Set up event handlers
      utterance.onend = () => {
        resolve({
          success: true,
          data: {
            audioUrl: 'web-speech-synthesis',
            duration: this.estimateDuration(request.text),
            format: 'web-speech',
            size: 0
          }
        });
      };

      utterance.onerror = (event) => {
        reject(new Error(`Web Speech synthesis failed: ${event.error}`));
      };

      // Start synthesis
      speechSynthesis.speak(utterance);
    });
  }

  private getCachedAudio(text: string): { url: string; timestamp: number } | null {
    const cached = this.audioCache.get(text);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached;
    }
    
    if (cached) {
      this.audioCache.delete(text);
    }
    
    return null;
  }

  private cacheAudio(text: string, url: string): void {
    this.audioCache.set(text, {
      url,
      timestamp: Date.now()
    });
  }

  private estimateDuration(text: string): number {
    // Rough estimate: ~0.1 seconds per character for Chinese
    return Math.max(0.5, text.length * 0.1);
  }
}

/**
 * Enhanced Library Service with robust error handling
 */
export class EnhancedLibraryService {
  private static instance: EnhancedLibraryService;
  private readonly offlineCache = new Map<string, { data: LessonData; timestamp: number }>();
  private readonly CACHE_TTL = 3600000; // 1 hour

  static getInstance(): EnhancedLibraryService {
    if (!EnhancedLibraryService.instance) {
      EnhancedLibraryService.instance = new EnhancedLibraryService();
    }
    return EnhancedLibraryService.instance;
  }

  /**
   * Load lesson content with comprehensive error handling
   */
  async loadLessonContent(lessonId: string, sources: string[] = []): Promise<{
    success: boolean;
    data?: LessonData;
    error?: string;
    source?: string;
    fallbackUsed?: boolean;
  }> {
    // Try local storage first
    try {
      const localData = await this.loadFromLocal(lessonId);
      if (localData) {
        return {
          success: true,
          data: localData,
          source: 'local'
        };
      }
    } catch (localError) {
      console.warn('Local storage access failed:', localError);
    }

    // Try remote sources with error handling
    for (const source of sources) {
      try {
        const result = await errorHandler.withRetry(
          () => this.loadFromRemote(lessonId, source),
          'remote-lesson-load',
          {
            maxAttempts: 3,
            baseDelay: 1000,
            retryableErrors: [
              ErrorCode.NETWORK_TIMEOUT,
              ErrorCode.NETWORK_UNAVAILABLE,
              ErrorCode.REMOTE_SOURCE_UNAVAILABLE
            ]
          }
        );

        // Cache successful result
        this.cacheOffline(lessonId, result);

        return {
          success: true,
          data: result,
          source
        };

      } catch (error) {
        console.warn(`Failed to load from source ${source}:`, error);
        
        // Handle specific remote source failure
        const fallbackResult = await errorHandler.handleRemoteSourceFailure(
          error as Error,
          source,
          sources.slice(sources.indexOf(source) + 1) // Remaining sources as fallbacks
        );

        if (fallbackResult.success) {
          return {
            success: true,
            data: fallbackResult.data,
            source: 'fallback',
            fallbackUsed: true
          };
        }
      }
    }

    // Try offline cache as last resort
    const cachedData = this.getCachedOffline(lessonId);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        source: 'offline-cache',
        fallbackUsed: true
      };
    }

    return {
      success: false,
      error: 'Unable to load lesson content from any source',
      fallbackUsed: false
    };
  }

  /**
   * Validate remote source with health checks
   */
  async validateRemoteSource(sourceUrl: string): Promise<{
    available: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${sourceUrl}/health`, {
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'LearnChinese/1.0'
        }
      });

      const responseTime = Date.now() - startTime;

      return {
        available: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        available: false,
        responseTime,
        error: (error as Error).message
      };
    }
  }

  private async loadFromLocal(lessonId: string): Promise<LessonData | null> {
    try {
      // Try localStorage first
      const localData = localStorage.getItem(`lesson-${lessonId}`);
      if (localData) {
        return JSON.parse(localData);
      }

      // Try IndexedDB if available
      if ('indexedDB' in window) {
        return await this.loadFromIndexedDB(lessonId);
      }

      return null;
    } catch (error) {
      console.warn('Local storage access failed:', error);
      return null;
    }
  }

  private async loadFromIndexedDB(lessonId: string): Promise<LessonData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LearnChineseDB', 1);

      request.onerror = () => reject(new Error(request.error ? `IndexedDB request failed: ${request.error.name || 'unknown error'}` : 'IndexedDB request failed'));
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['lessons'], 'readonly');
        const store = transaction.objectStore('lessons');
        const getRequest = store.get(lessonId);

        getRequest.onsuccess = () => resolve(getRequest.result?.data || null);
        getRequest.onerror = () => reject(new Error(getRequest.error ? `IndexedDB get request failed: ${getRequest.error.name || 'unknown error'}` : 'IndexedDB get request failed'));
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
      };
    });
  }

  private async loadFromRemote(lessonId: string, sourceUrl: string): Promise<LessonData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${sourceUrl}/lessons/${lessonId}.json`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'LearnChinese/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid content type: expected JSON');
      }

      const data = await response.json();
      
      // Validate lesson data structure
      if (!this.validateLessonData(data)) {
        throw new Error('Invalid lesson data format');
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  private validateLessonData(data: unknown): data is LessonData {
    return data !== null &&
           typeof data === 'object' &&
           'id' in data &&
           'title' in data &&
           'content' in data &&
           typeof (data as Record<string, unknown>).id === 'string' &&
           typeof (data as Record<string, unknown>).title === 'string' &&
           typeof (data as Record<string, unknown>).content === 'string';
  }

  private cacheOffline(lessonId: string, data: LessonData): void {
    this.offlineCache.set(lessonId, {
      data,
      timestamp: Date.now()
    });

    // Also try to persist in localStorage
    try {
      localStorage.setItem(`lesson-${lessonId}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist to localStorage:', error);
    }
  }

  private getCachedOffline(lessonId: string): LessonData | null {
    const cached = this.offlineCache.get(lessonId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    if (cached) {
      this.offlineCache.delete(lessonId);
    }

    // Try localStorage as backup
    try {
      const localData = localStorage.getItem(`lesson-${lessonId}`);
      if (localData) {
        const data = JSON.parse(localData);
        this.offlineCache.set(lessonId, {
          data,
          timestamp: Date.now()
        });
        return data;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    return null;
  }
}

// Export service instances
export const enhancedAudioService = EnhancedAudioService.getInstance();
export const enhancedLibraryService = EnhancedLibraryService.getInstance();