/**
 * Simplified Enhanced Service Integration
 * Demonstrates service integration without complex error handling
 */

import { serviceCoordinator } from './serviceCoordinator';
import type { EnhancedLesson, LessonStudyProgress } from '../types/lesson';

/**
 * Simple Enhanced Lesson Service
 */
export class SimpleEnhancedLessonService {
  private static instance: SimpleEnhancedLessonService;

  static getInstance(): SimpleEnhancedLessonService {
    if (!SimpleEnhancedLessonService.instance) {
      SimpleEnhancedLessonService.instance = new SimpleEnhancedLessonService();
    }
    return SimpleEnhancedLessonService.instance;
  }

  /**
   * Load and process lesson for study
   */
  async loadLessonForStudy(lessonId: string): Promise<EnhancedLesson | null> {
    try {
      const lesson = await serviceCoordinator.processLessonForStudy(lessonId);
      
      if (!lesson) {
        console.warn(`Lesson ${lessonId} not found`);
        return null;
      }

      return lesson;
    } catch (error) {
      console.error(`Failed to process lesson ${lessonId}:`, error);
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
      console.error(`Failed to initialize lesson progress:`, error);
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
      console.error(`Failed to update lesson progress:`, error);
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
      console.error('Failed to clear service cache:', error);
    }
  }
}

/**
 * Simple Study Session Manager
 */
export class SimpleStudySessionManager {
  private readonly activeSessions = new Map<string, StudySession>();

  /**
   * Start a new study session
   */
  async startSession(lessonId: string, userId?: string): Promise<StudySession | null> {
    try {
      const lessonService = SimpleEnhancedLessonService.getInstance();
      
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
      console.error('Failed to start study session:', error);
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

      const lessonService = SimpleEnhancedLessonService.getInstance();
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
      console.error('Failed to update study session:', error);
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
      const lessonService = SimpleEnhancedLessonService.getInstance();
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
      console.error('Failed to end study session:', error);
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
export const enhancedLessonService = SimpleEnhancedLessonService.getInstance();
export const studySessionManager = new SimpleStudySessionManager();