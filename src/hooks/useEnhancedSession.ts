/**
 * Enhanced Session Hook
 * Custom hook for accessing lesson-enhanced session context
 */

import { useContext } from 'react';
import { SessionContext, type SessionContextType } from '../context/SessionContext';

// Custom hook to use session context
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  
  return context;
};

// Hook for lesson-specific session data
export const useLessonSession = () => {
  const session = useSession();
  
  return {
    // Lesson data
    currentLesson: session.state.currentLesson,
    lessonProgress: session.state.lessonProgress,
    activeSessionId: session.state.activeSessionId,
    
    // Lesson actions
    setCurrentLesson: session.setCurrentLesson,
    setLessonProgress: session.setLessonProgress,
    updateLessonProgress: session.updateLessonProgress,
    setActiveSession: session.setActiveSession,
    startLessonStudy: session.startLessonStudy,
    
    // UI preferences
    showPinyin: session.state.showPinyin,
    showDefinitions: session.state.showDefinitions,
    showToneMarks: session.state.showToneMarks,
    togglePinyin: session.togglePinyin,
    toggleDefinitions: session.toggleDefinitions,
    toggleToneMarks: session.toggleToneMarks,
    
    // Loading states
    isLoading: session.state.isLoading,
    error: session.state.error,
    setLoading: session.setLoading,
    setError: session.setError,
  };
};

// Hook for study progress
export const useStudyProgress = () => {
  const session = useSession();
  
  return {
    studyProgress: session.state.studyProgress,
    lessonProgress: session.state.lessonProgress,
    updateStudyProgress: session.updateStudyProgress,
    updateLessonProgress: session.updateLessonProgress,
  };
};

export default useSession;