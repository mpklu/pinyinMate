/**
 * Enhanced Service Integration
 * Demonstrates integration of all services with proper error handling and performance monitoring
 */

import { serviceCoordinator } from './serviceCoordinator';
import { errorHandler } from './errorHandler';
import type { EnhancedLesson, LessonStudyProgress } from '../types/lesson';

/**
 * Enhanced Lesson Service
 * Integrates lesson processing with the service coordinator
 */
export class EnhancedLessonService {
  private static instance: EnhancedLessonService;

  static getInstance(): EnhancedLessonService {
    if (!EnhancedLessonService.instance) {
      EnhancedLessonService.instance = new EnhancedLessonService();
    }
    return EnhancedLessonService.instance;
  }

  /**
   * Load and process lesson for study
   */
  async loadLessonForStudy(lessonId: string): Promise<EnhancedLesson | null> {
    try {
      const lesson = await serviceCoordinator.processLessonForStudy(lessonId);
      
      if (!lesson) {
        await errorHandler.logError({
          code: 'LESSON_NOT_FOUND',
          message: `Lesson ${lessonId} not found`,
          severity: 'medium',
          context: { lessonId }
        });
        return null;
      }

      return lesson;
    } catch (error) {
      await errorHandler.logError({
        code: 'LESSON_PROCESSING_ERROR',
        message: `Failed to process lesson ${lessonId}`,
        severity: 'high',
        context: { lessonId, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Initialize lesson study session
   */
  async startLessonStudy(lessonId: string, userId?: string): Promise<LessonStudyProgress | null> {
    try {
      const progress = await serviceCoordinator.initializeLessonProgress(lessonId, userId);
      
      // Mark as started
      progress.status = 'in-progress';
      progress.startedAt = new Date();
      progress.sessionCount = 1;
      
      return await serviceCoordinator.updateLessonProgress(progress);
    } catch (error) {
      await errorHandler.logError({
        code: 'PROGRESS_INIT_ERROR',
        message: `Failed to initialize lesson progress`,
        severity: 'medium',
        context: { lessonId, userId, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Update lesson study progress
   */
  async updateStudyProgress(
    progress: LessonStudyProgress,
    updates: Partial<LessonStudyProgress>
  ): Promise<LessonStudyProgress | null> {
    try {
      const updatedProgress = {
        ...progress,
        ...updates,
        timeSpent: progress.timeSpent + (updates.timeSpent || 0),
        lastSessionAt: new Date()
      };

      return await serviceCoordinator.updateLessonProgress(updatedProgress);
    } catch (error) {
      await errorHandler.logError({
        code: 'PROGRESS_UPDATE_ERROR',
        message: `Failed to update lesson progress`,
        severity: 'medium',
        context: { lessonId: progress.lessonId, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    try {
      const status = await serviceCoordinator.getServiceStatus();
      return {
        healthy: status.overall === 'healthy',
        status: status.overall,
        lastCheck: status.lastCheck,
        errors: status.errors
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'offline' as const,
        lastCheck: new Date(),
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Clear service cache
   */
  async clearCache(): Promise<void> {
    try {
      await serviceCoordinator.clearCache();
    } catch (error) {
      await errorHandler.logError({
        code: 'CACHE_CLEAR_ERROR',
        message: 'Failed to clear service cache',
        severity: 'low',
        context: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }
}

/**
 * Enhanced Study Session Manager
 * Manages complete study sessions with progress tracking
 */
export class StudySessionManager {
  private activeSessions = new Map<string, StudySession>();

  /**
   * Start a new study session
   */
  async startSession(lessonId: string, userId?: string): Promise<StudySession | null> {
    try {
      const lessonService = EnhancedLessonService.getInstance();
      
      // Load lesson
      const lesson = await lessonService.loadLessonForStudy(lessonId);
      if (!lesson) {
        return null;
      }

      // Initialize progress
      const progress = await lessonService.startLessonStudy(lessonId, userId);
      if (!progress) {
        return null;
      }

      // Create session
      const session: StudySession = {
        id: `session-${Date.now()}-${lessonId}`,
        lessonId,
        userId,
        lesson,
        progress,
        startTime: new Date(),
        isActive: true
      };

      this.activeSessions.set(session.id, session);
      return session;
    } catch (error) {
      await errorHandler.logError({
        code: 'SESSION_START_ERROR',
        message: 'Failed to start study session',
        severity: 'high',
        context: { lessonId, userId, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Update session progress
   */
  async updateSession(
    sessionId: string,
    progressUpdates: Partial<LessonStudyProgress>
  ): Promise<StudySession | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return null;
      }

      const lessonService = EnhancedLessonService.getInstance();
      const updatedProgress = await lessonService.updateStudyProgress(
        session.progress,
        progressUpdates
      );

      if (!updatedProgress) {
        return null;
      }

      session.progress = updatedProgress;
      session.lastUpdate = new Date();
      
      this.activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      await errorHandler.logError({
        code: 'SESSION_UPDATE_ERROR',
        message: 'Failed to update study session',
        severity: 'medium',
        context: { sessionId, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * End study session
   */
  async endSession(sessionId: string): Promise<StudySession | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return null;
      }

      // Mark session as completed
      session.isActive = false;
      session.endTime = new Date();

      // Update final progress
      const lessonService = EnhancedLessonService.getInstance();
      const finalProgress = await lessonService.updateStudyProgress(session.progress, {
        timeSpent: session.progress.timeSpent + this.calculateSessionDuration(session)
      });

      if (finalProgress) {
        session.progress = finalProgress;
      }

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      
      return session;
    } catch (error) {
      await errorHandler.logError({
        code: 'SESSION_END_ERROR',
        message: 'Failed to end study session',
        severity: 'medium',
        context: { sessionId, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): StudySession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): StudySession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.isActive);
  }

  private calculateSessionDuration(session: StudySession): number {
    const endTime = session.endTime || new Date();
    return Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
  }
}

/**
 * Study session interface
 */
export interface StudySession {
  id: string;
  lessonId: string;
  userId?: string;
  lesson: EnhancedLesson;
  progress: LessonStudyProgress;
  startTime: Date;
  endTime?: Date;
  lastUpdate?: Date;
  isActive: boolean;
}

// Export singleton instances
export const enhancedLessonService = EnhancedLessonService.getInstance();
export const studySessionManager = new StudySessionManager();