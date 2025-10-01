/**
 * Enhanced Service Coordinator
 * Integrates all lesson processing services with comprehensive error handling,
 * performance optimization, and centralized service management.
 */

import type {
  EnhancedLesson,
  LessonStudyProgress,
  LessonStudyMaterials,
  ProcessedLessonContent
} from '../types/lesson';
import type {
  FlashcardGenerationOptions,
  FlashcardGenerationResult
} from '../types/enhancedFlashcard';
import type {
  QuizGenerationOptions,
  QuizGenerationResult
} from '../types/enhancedQuiz';

// Service imports
import { lessonService } from './lessonService';
import { audioSynthesisService } from './audioSynthesisService';
import { flashcardGenerationService } from './flashcardGenerationService';
import { quizGenerationService } from './quizGenerationService';
import { performanceOptimizationService } from './performanceOptimizationService';
import { errorHandler } from './errorHandler';

// Enhanced service coordinator interface
export interface EnhancedServiceCoordinator {
  // Lesson processing
  processLessonForStudy(lessonId: string, options?: LessonProcessingOptions): Promise<EnhancedLesson>;
  
  // Study material generation
  generateStudyMaterials(lesson: EnhancedLesson, options?: StudyMaterialOptions): Promise<LessonStudyMaterials>;
  
  // Audio processing
  prepareAudioForLesson(lesson: EnhancedLesson, options?: AudioOptions): Promise<ProcessedLessonContent>;
  
  // Progress management
  initializeLessonProgress(lessonId: string, userId?: string): Promise<LessonStudyProgress>;
  updateLessonProgress(progress: LessonStudyProgress): Promise<LessonStudyProgress>;
  
  // Service health
  getServiceStatus(): Promise<ServiceStatus>;
  warmupServices(): Promise<void>;
  clearServiceCache(): Promise<void>;
}

// Configuration interfaces
export interface LessonProcessingOptions {
  generatePinyin?: boolean;
  segmentText?: boolean;
  extractVocabulary?: boolean;
  performanceMode?: 'fast' | 'balanced' | 'comprehensive';
}

export interface StudyMaterialOptions {
  flashcards?: FlashcardGenerationOptions;
  quiz?: QuizGenerationOptions;
  priority?: 'flashcards' | 'quiz' | 'both';
}

export interface AudioOptions {
  preloadAudio?: boolean;
  audioQuality?: 'low' | 'standard' | 'high';
  voicePreference?: string;
}

export interface ServiceStatus {
  lessonService: ServiceHealth;
  audioService: ServiceHealth;
  flashcardService: ServiceHealth;
  quizService: ServiceHealth;
  overall: 'healthy' | 'degraded' | 'offline';
}

export interface ServiceHealth {
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  errorCount?: number;
  lastCheck: Date;
}

// Service implementation
class EnhancedServiceCoordinatorImpl implements EnhancedServiceCoordinator {
  private serviceCache = new Map<string, unknown>();
  private performanceMetrics = new Map<string, number[]>();

  /**
   * Process a lesson for study with comprehensive enhancement
   */
  async processLessonForStudy(
    lessonId: string, 
    options: LessonProcessingOptions = {}
  ): Promise<EnhancedLesson> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cacheKey = `lesson-processed-${lessonId}-${JSON.stringify(options)}`;
      const cached = this.serviceCache.get(cacheKey) as EnhancedLesson;
      if (cached) {
        this.recordMetric('processLessonForStudy', performance.now() - startTime);
        return cached;
      }

      // Load base lesson
      const lesson = await lessonService.processLesson(lessonId, {
        generatePinyin: options.generatePinyin ?? true,
        segmentText: options.segmentText ?? true,
        extractVocabulary: options.extractVocabulary ?? true
      });

      // Apply performance optimizations
      const optimizedLesson = await performanceOptimizationService.optimizeLesson(lesson, {
        mode: options.performanceMode ?? 'balanced'
      });

      // Cache the result
      this.serviceCache.set(cacheKey, optimizedLesson);
      this.recordMetric('processLessonForStudy', performance.now() - startTime);

      return optimizedLesson;
    } catch (error) {
      await errorHandler.handleServiceError('processLessonForStudy', error as Error, {
        lessonId,
        options
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive study materials from lesson
   */
  async generateStudyMaterials(
    lesson: EnhancedLesson,
    options: StudyMaterialOptions = {}
  ): Promise<LessonStudyMaterials> {
    const startTime = performance.now();
    
    try {
      const cacheKey = `study-materials-${lesson.id}-${JSON.stringify(options)}`;
      const cached = this.serviceCache.get(cacheKey) as LessonStudyMaterials;
      if (cached) {
        this.recordMetric('generateStudyMaterials', performance.now() - startTime);
        return cached;
      }

      const materials: LessonStudyMaterials = {
        lessonId: lesson.id,
        generatedAt: new Date()
      };

      // Generate materials based on priority
      const shouldGenerateFlashcards = 
        options.priority === 'flashcards' || 
        options.priority === 'both' || 
        (!options.priority && options.flashcards);
      
      const shouldGenerateQuiz = 
        options.priority === 'quiz' || 
        options.priority === 'both' || 
        (!options.priority && options.quiz);

      // Parallel generation for better performance
      const promises: Promise<unknown>[] = [];

      if (shouldGenerateFlashcards) {
        promises.push(
          flashcardGenerationService.generateFlashcardsFromLesson(
            lesson,
            options.flashcards ?? {}
          ).then(result => {
            materials.flashcards = Array.isArray(result) ? result : result.flashcards;
          })
        );
      }

      if (shouldGenerateQuiz) {
        promises.push(
          quizGenerationService.generateQuizFromLesson(
            lesson,
            options.quiz ?? {}
          ).then(result => {
            materials.quizzes = Array.isArray(result) ? result : result.questions;
          })
        );
      }

      await Promise.all(promises);

      // Cache and return
      this.serviceCache.set(cacheKey, materials);
      this.recordMetric('generateStudyMaterials', performance.now() - startTime);

      return materials;
    } catch (error) {
      await errorHandler.handleServiceError('generateStudyMaterials', error as Error, {
        lessonId: lesson.id,
        options
      });
      throw error;
    }
  }

  /**
   * Prepare audio content for lesson with optimization
   */
  async prepareAudioForLesson(
    lesson: EnhancedLesson,
    options: AudioOptions = {}
  ): Promise<ProcessedLessonContent> {
    const startTime = performance.now();
    
    try {
      const cacheKey = `audio-prepared-${lesson.id}-${JSON.stringify(options)}`;
      const cached = this.serviceCache.get(cacheKey) as ProcessedLessonContent;
      if (cached) {
        this.recordMetric('prepareAudioForLesson', performance.now() - startTime);
        return cached;
      }

      // Prepare audio synthesis
      const audioOptions = {
        quality: options.audioQuality ?? 'standard',
        voice: options.voicePreference,
        preload: options.preloadAudio ?? false
      };

      const processedContent = await audioSynthesisService.prepareAudioForLesson(
        lesson,
        audioOptions
      );

      // Cache the result
      this.serviceCache.set(cacheKey, processedContent);
      this.recordMetric('prepareAudioForLesson', performance.now() - startTime);

      return processedContent;
    } catch (error) {
      await errorHandler.handleServiceError('prepareAudioForLesson', error as Error, {
        lessonId: lesson.id,
        options
      });
      throw error;
    }
  }

  /**
   * Initialize lesson progress tracking
   */
  async initializeLessonProgress(
    lessonId: string,
    userId?: string
  ): Promise<LessonStudyProgress> {
    const startTime = performance.now();
    
    try {
      const progress: LessonStudyProgress = {
        lessonId,
        userId,
        status: 'not-started',
        timeSpent: 0,
        segmentsViewed: new Set(),
        vocabularyStudied: new Set(),
        audioPlayed: new Set(),
        sessionCount: 0,
        lastSessionAt: new Date()
      };

      this.recordMetric('initializeLessonProgress', performance.now() - startTime);
      return progress;
    } catch (error) {
      await errorHandler.handleServiceError('initializeLessonProgress', error as Error, {
        lessonId,
        userId
      });
      throw error;
    }
  }

  /**
   * Update lesson progress with validation
   */
  async updateLessonProgress(
    progress: LessonStudyProgress
  ): Promise<LessonStudyProgress> {
    const startTime = performance.now();
    
    try {
      // Validate progress data
      if (!progress.lessonId) {
        throw new Error('Progress must have a lesson ID');
      }

      // Update session information
      const updatedProgress = {
        ...progress,
        lastSessionAt: new Date()
      };

      // Determine completion status
      if (progress.status !== 'completed' && this.isLessonCompleted(progress)) {
        updatedProgress.status = 'completed';
        updatedProgress.completedAt = new Date();
      }

      this.recordMetric('updateLessonProgress', performance.now() - startTime);
      return updatedProgress;
    } catch (error) {
      await errorHandler.handleServiceError('updateLessonProgress', error as Error, {
        progressId: progress.lessonId
      });
      throw error;
    }
  }

  /**
   * Get comprehensive service status
   */
  async getServiceStatus(): Promise<ServiceStatus> {
    const checks = await Promise.allSettled([
      this.checkServiceHealth('lessonService', () => lessonService.getServiceInfo()),
      this.checkServiceHealth('audioService', () => audioSynthesisService.getServiceInfo()),
      this.checkServiceHealth('flashcardService', () => flashcardGenerationService.getServiceInfo()),
      this.checkServiceHealth('quizService', () => quizGenerationService.getServiceInfo())
    ]);

    const services = checks.map(result => 
      result.status === 'fulfilled' ? result.value : { status: 'error', lastCheck: new Date() }
    );

    const overall = services.every(s => s.status === 'online') ? 'healthy' :
                   services.some(s => s.status === 'online') ? 'degraded' : 'offline';

    return {
      lessonService: services[0],
      audioService: services[1],
      flashcardService: services[2],
      quizService: services[3],
      overall
    };
  }

  /**
   * Warm up all services for better initial performance
   */
  async warmupServices(): Promise<void> {
    const warmupPromises = [
      this.warmupService('lessonService', () => lessonService.initialize?.()),
      this.warmupService('audioService', () => audioSynthesisService.initialize?.()),
      this.warmupService('flashcardService', () => flashcardGenerationService.initialize?.()),
      this.warmupService('quizService', () => quizGenerationService.initialize?.())
    ];

    await Promise.allSettled(warmupPromises);
  }

  /**
   * Clear all service caches
   */
  async clearServiceCache(): Promise<void> {
    this.serviceCache.clear();
    this.performanceMetrics.clear();
    
    // Clear individual service caches if available
    await Promise.allSettled([
      lessonService.clearCache?.(),
      audioSynthesisService.clearCache?.(),
      flashcardGenerationService.clearCache?.(),
      quizGenerationService.clearCache?.()
    ]);
  }

  // Private helper methods
  private recordMetric(operation: string, duration: number): void {
    const metrics = this.performanceMetrics.get(operation) ?? [];
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    this.performanceMetrics.set(operation, metrics);
  }

  private async checkServiceHealth(
    serviceName: string, 
    healthCheck: () => Promise<unknown> | unknown
  ): Promise<ServiceHealth> {
    const startTime = performance.now();
    
    try {
      await healthCheck();
      return {
        status: 'online',
        responseTime: performance.now() - startTime,
        errorCount: 0,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        responseTime: performance.now() - startTime,
        errorCount: 1,
        lastCheck: new Date()
      };
    }
  }

  private async warmupService(
    serviceName: string,
    warmupFn?: () => Promise<void> | void
  ): Promise<void> {
    try {
      await warmupFn?.();
    } catch (error) {
      console.warn(`Failed to warm up ${serviceName}:`, error);
    }
  }

  private isLessonCompleted(progress: LessonStudyProgress): boolean {
    // Simple completion logic - can be enhanced based on requirements
    return progress.segmentsViewed.size > 0 && progress.timeSpent > 60; // 1 minute minimum
  }
}

// Export singleton instance
export const enhancedServiceCoordinator = new EnhancedServiceCoordinatorImpl();
export default enhancedServiceCoordinator;