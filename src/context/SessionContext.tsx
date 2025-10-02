import React, { createContext, useReducer, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TextAnnotation } from '../types/annotation';
import type { Quiz } from '../types/quiz';
import type { Flashcard } from '../types/flashcard';
import type { EnhancedLesson, LessonStudyProgress } from '../types/lesson';
import { enhancedLessonService } from '../services/simpleEnhancedIntegration';

// Session state interface
export interface SessionState {
  // Current content being worked with
  currentAnnotation: TextAnnotation | null;
  currentQuiz: Quiz | null;
  currentFlashcards: Flashcard[];
  
  // Enhanced lesson support
  currentLesson: EnhancedLesson | null;
  lessonProgress: LessonStudyProgress | null;
  activeSessionId: string | null;
  
  // UI preferences
  showPinyin: boolean;
  showDefinitions: boolean;
  showToneMarks: boolean;
  
  // Study session data
  studyProgress: {
    totalStudied: number;
    correctAnswers: number;
    timeSpent: number; // in seconds
  };
  
  // Navigation state
  lastVisitedPage: string;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: SessionState = {
  currentAnnotation: null,
  currentQuiz: null,
  currentFlashcards: [],
  currentLesson: null,
  lessonProgress: null,
  activeSessionId: null,
  showPinyin: true,
  showDefinitions: true,
  showToneMarks: true,
  studyProgress: {
    totalStudied: 0,
    correctAnswers: 0,
    timeSpent: 0,
  },
  lastVisitedPage: '/',
  isLoading: false,
  error: null,
};

// Action types
export type SessionAction =
  | { type: 'SET_CURRENT_ANNOTATION'; payload: TextAnnotation }
  | { type: 'SET_CURRENT_QUIZ'; payload: Quiz }
  | { type: 'SET_CURRENT_FLASHCARDS'; payload: Flashcard[] }
  | { type: 'SET_CURRENT_LESSON'; payload: EnhancedLesson }
  | { type: 'SET_LESSON_PROGRESS'; payload: LessonStudyProgress }
  | { type: 'SET_ACTIVE_SESSION'; payload: string | null }
  | { type: 'UPDATE_LESSON_PROGRESS'; payload: Partial<LessonStudyProgress> }
  | { type: 'TOGGLE_PINYIN' }
  | { type: 'TOGGLE_DEFINITIONS' }
  | { type: 'TOGGLE_TONE_MARKS' }
  | { type: 'UPDATE_STUDY_PROGRESS'; payload: { correct: boolean; timeSpent: number } }
  | { type: 'SET_LAST_VISITED_PAGE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_SESSION' };

// Session reducer
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_CURRENT_ANNOTATION':
      return {
        ...state,
        currentAnnotation: action.payload,
        error: null,
      };
    
    case 'SET_CURRENT_QUIZ':
      return {
        ...state,
        currentQuiz: action.payload,
        error: null,
      };
    
    case 'SET_CURRENT_FLASHCARDS':
      return {
        ...state,
        currentFlashcards: action.payload,
        error: null,
      };
    
    case 'SET_CURRENT_LESSON':
      return {
        ...state,
        currentLesson: action.payload,
        error: null,
      };
    
    case 'SET_LESSON_PROGRESS':
      return {
        ...state,
        lessonProgress: action.payload,
        error: null,
      };
    
    case 'SET_ACTIVE_SESSION':
      return {
        ...state,
        activeSessionId: action.payload,
      };
    
    case 'UPDATE_LESSON_PROGRESS':
      return {
        ...state,
        lessonProgress: state.lessonProgress ? {
          ...state.lessonProgress,
          ...action.payload
        } : null,
      };
    
    case 'TOGGLE_PINYIN':
      return {
        ...state,
        showPinyin: !state.showPinyin,
      };
    
    case 'TOGGLE_DEFINITIONS':
      return {
        ...state,
        showDefinitions: !state.showDefinitions,
      };
    
    case 'TOGGLE_TONE_MARKS':
      return {
        ...state,
        showToneMarks: !state.showToneMarks,
      };
    
    case 'UPDATE_STUDY_PROGRESS':
      return {
        ...state,
        studyProgress: {
          totalStudied: state.studyProgress.totalStudied + 1,
          correctAnswers: state.studyProgress.correctAnswers + (action.payload.correct ? 1 : 0),
          timeSpent: state.studyProgress.timeSpent + action.payload.timeSpent,
        },
      };
    
    case 'SET_LAST_VISITED_PAGE':
      return {
        ...state,
        lastVisitedPage: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'RESET_SESSION':
      return {
        ...initialState,
        showPinyin: state.showPinyin, // Preserve UI preferences
        showDefinitions: state.showDefinitions,
        showToneMarks: state.showToneMarks,
      };
    
    default:
      return state;
  }
}

// Context interface
export interface SessionContextType {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  
  // Convenience methods
  setCurrentAnnotation: (annotation: TextAnnotation) => void;
  setCurrentQuiz: (quiz: Quiz) => void;
  setCurrentFlashcards: (flashcards: Flashcard[]) => void;
  
  // Lesson methods
  setCurrentLesson: (lesson: EnhancedLesson) => void;
  setLessonProgress: (progress: LessonStudyProgress) => void;
  updateLessonProgress: (updates: Partial<LessonStudyProgress>) => void;
  setActiveSession: (sessionId: string | null) => void;
  startLessonStudy: (lessonId: string, userId?: string) => Promise<void>;
  
  // UI methods
  togglePinyin: () => void;
  toggleDefinitions: () => void;
  toggleToneMarks: () => void;
  updateStudyProgress: (correct: boolean, timeSpent: number) => void;
  setLastVisitedPage: (page: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

// Create context
// eslint-disable-next-line react-refresh/only-export-components
export const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Session provider component
interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider Component
 * 
 * Provides global session state management for the Chinese learning application.
 * Manages current content, UI preferences, study progress, and navigation state.
 * 
 * Features:
 * - Current annotation, quiz, and flashcard state
 * - UI preference toggles (pinyin, definitions, tone marks)
 * - Study progress tracking
 * - Loading and error state management
 * - Session reset functionality
 * 
 * @param props - SessionProvider component props
 * @returns JSX.Element
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Convenience methods
  const setCurrentAnnotation = (annotation: TextAnnotation) => {
    dispatch({ type: 'SET_CURRENT_ANNOTATION', payload: annotation });
  };

  const setCurrentQuiz = (quiz: Quiz) => {
    dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz });
  };

  const setCurrentFlashcards = (flashcards: Flashcard[]) => {
    dispatch({ type: 'SET_CURRENT_FLASHCARDS', payload: flashcards });
  };

  // Lesson methods
  const setCurrentLesson = useCallback((lesson: EnhancedLesson) => {
    dispatch({ type: 'SET_CURRENT_LESSON', payload: lesson });
  }, []);

  const setLessonProgress = useCallback((progress: LessonStudyProgress) => {
    dispatch({ type: 'SET_LESSON_PROGRESS', payload: progress });
  }, []);

  const updateLessonProgress = useCallback((updates: Partial<LessonStudyProgress>) => {
    dispatch({ type: 'UPDATE_LESSON_PROGRESS', payload: updates });
  }, []);

  const setActiveSession = useCallback((sessionId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId });
  }, []);

  const startLessonStudy = useCallback(async (lessonId: string, userId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load lesson
      const lesson = await enhancedLessonService.loadLessonForStudy(lessonId);
      if (!lesson) {
        throw new Error(`Lesson ${lessonId} not found`);
      }

      // Start study session
      const progress = await enhancedLessonService.startLessonStudy(lessonId, userId);
      if (!progress) {
        throw new Error('Failed to initialize lesson progress');
      }

      // Update session state
      dispatch({ type: 'SET_CURRENT_LESSON', payload: lesson });
      dispatch({ type: 'SET_LESSON_PROGRESS', payload: progress });
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: `session-${Date.now()}-${lessonId}` });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start lesson study' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const togglePinyin = () => {
    dispatch({ type: 'TOGGLE_PINYIN' });
  };

  const toggleDefinitions = () => {
    dispatch({ type: 'TOGGLE_DEFINITIONS' });
  };

  const toggleToneMarks = () => {
    dispatch({ type: 'TOGGLE_TONE_MARKS' });
  };

  const updateStudyProgress = (correct: boolean, timeSpent: number) => {
    dispatch({ type: 'UPDATE_STUDY_PROGRESS', payload: { correct, timeSpent } });
  };

  const setLastVisitedPage = (page: string) => {
    dispatch({ type: 'SET_LAST_VISITED_PAGE', payload: page });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  const contextValue: SessionContextType = useMemo(() => ({
    state,
    dispatch,
    setCurrentAnnotation,
    setCurrentQuiz,
    setCurrentFlashcards,
    setCurrentLesson,
    setLessonProgress,
    updateLessonProgress,
    setActiveSession,
    startLessonStudy,
    togglePinyin,
    toggleDefinitions,
    toggleToneMarks,
    updateStudyProgress,
    setLastVisitedPage,
    setLoading,
    setError,
    resetSession,
  }), [
    state, 
    setCurrentLesson, 
    setLessonProgress, 
    updateLessonProgress, 
    setActiveSession, 
    startLessonStudy
  ]);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

