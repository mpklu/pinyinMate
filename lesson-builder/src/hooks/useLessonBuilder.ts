import { useState, useCallback, useEffect } from 'react';
import type {
  LessonBuilderState,
  LessonSource,
  VocabularyEntry,
  Lesson,
  DifficultyLevel,
} from '../types';
import { validateLesson } from '../utils/validation';
import { analyzeChineseText } from '../utils/textAnalysis';
import { generateLessonJSON } from '../services/lessonGenerator';
import { publishLessonToGitHub, updateLessonOnGitHub } from '../services/githubService';
import { calculateDiff, hasChanges as diffHasChanges, generateCommitMessage } from '../services/lessonDiffService';
import type { LSCSLevel } from '../utils/lscsMapping';
import { getDefaultLSCSLevel, getLSCSLevelFromDifficulty } from '../utils/lscsMapping';
import { debugLessonState } from '../utils/debug';

const initialState: LessonBuilderState = {
  id: '',
  title: '',
  description: '',
  content: '',
  difficulty: 'beginner' as DifficultyLevel,
  lscsLevel: getDefaultLSCSLevel('beginner'),
  tags: [],
  source: '',
  book: null,
  estimatedTime: 15,
  vocabulary: [],
  suggestedVocabulary: [],
  validation: { isValid: false, errors: [], warnings: [] },
  isProcessing: false,
  isDirty: false,
  publishStatus: {
    isPublishing: false,
    lastPublishSuccess: false,
  },
  mode: 'create',
  browserOpen: false,
  availableLessons: [],
  lessonSearchQuery: '',
  isLoadingLessons: false,
};

export const useLessonBuilder = () => {
  const [state, setState] = useState<LessonBuilderState>(initialState);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('lesson-builder-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        
        // Ensure lscsLevel is set correctly based on difficulty
        const correctedLscsLevel = parsed.lscsLevel || getDefaultLSCSLevel(parsed.difficulty || 'beginner');
        
        setState(prev => ({ 
          ...prev, 
          ...parsed, 
          lscsLevel: correctedLscsLevel,
          isProcessing: false,
          publishStatus: {
            isPublishing: false,
            lastPublishSuccess: false,
          },
        }));
        
        // Show resume notification if it's an edit session
        if (parsed.mode === 'edit' && parsed.originalLesson) {
          console.log('Resumed editing:', parsed.title || parsed.id);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (state.isDirty) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('lesson-builder-draft', JSON.stringify(state));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state, state.isDirty]);

  // Validate lesson whenever relevant state changes
  useEffect(() => {
    const lesson = generateLessonJSON(state);
    const validation = validateLesson(lesson);
    setState(prev => ({ ...prev, validation }));
  }, [
    state.id,
    state.title,
    state.description,
    state.content,
    state.difficulty,
    state.tags,
    state.source,
    state.book,
    state.estimatedTime,
    state.vocabulary,
  ]);

  const updateField = useCallback((field: keyof LessonBuilderState, value: any) => {
    setState(prev => ({ ...prev, [field]: value, isDirty: true }));
  }, []);

  const updateMetadata = useCallback((field: string, value: any) => {
    setState(prev => ({ ...prev, [field]: value, isDirty: true }));
  }, []);

  const addVocabulary = useCallback((entry: VocabularyEntry) => {
    setState(prev => ({
      ...prev,
      vocabulary: [...prev.vocabulary, entry],
      isDirty: true,
    }));
  }, []);

  const removeVocabulary = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== index),
      isDirty: true,
    }));
  }, []);

  const updateVocabulary = useCallback((index: number, entry: VocabularyEntry) => {
    setState(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.map((item, i) => (i === index ? entry : item)),
      isDirty: true,
    }));
  }, []);

  const extractVocabulary = useCallback(async () => {
    if (!state.content.trim()) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const analysis = await analyzeChineseText(state.content);
      setState(prev => ({
        ...prev,
        suggestedVocabulary: analysis.suggestedVocabulary,
        isProcessing: false,
        isDirty: true,
      }));
    } catch (error) {
      console.error('Failed to extract vocabulary:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.content]);

  const generateLesson = useCallback((): Lesson => {
    debugLessonState(state); // Debug current state
    const lesson = generateLessonJSON(state);
    console.log('Generated lesson metadata:', lesson.metadata);
    return lesson;
  }, [state]);

  const exportLesson = useCallback((lesson: Lesson) => {
    const jsonString = JSON.stringify(lesson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.id || 'lesson'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const publishToGitHub = useCallback(async (lesson: Lesson) => {
    setState(prev => ({
      ...prev,
      publishStatus: { ...prev.publishStatus, isPublishing: true },
    }));

    try {
      await publishLessonToGitHub(lesson, state.lscsLevel as LSCSLevel);
      setState(prev => ({
        ...prev,
        publishStatus: {
          isPublishing: false,
          lastPublishSuccess: true,
          lastPublishError: undefined,
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        publishStatus: {
          isPublishing: false,
          lastPublishSuccess: false,
          lastPublishError: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
      throw error;
    }
  }, [state.lscsLevel]);

  // Mode management
  const switchMode = useCallback((mode: 'create' | 'edit') => {
    setState(prev => ({ ...prev, mode, browserOpen: mode === 'edit' }));
  }, []);

  // Load existing lesson for editing
  const loadLesson = useCallback((
    lesson: Lesson,
    source: LessonSource,
    sha?: string
  ) => {
    const lscsLevel = lesson.metadata.lscsLevel || getLSCSLevelFromDifficulty(lesson.metadata.difficulty);
    
    const newState = {
      ...initialState,
      mode: 'edit' as const,
      originalLesson: lesson,
      lessonSource: source,
      originalSha: sha,
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      difficulty: lesson.metadata.difficulty,
      lscsLevel,
      tags: lesson.metadata.tags,
      source: lesson.metadata.source,
      book: lesson.metadata.book,
      estimatedTime: lesson.metadata.estimatedTime,
      vocabulary: lesson.metadata.vocabulary,
      suggestedVocabulary: [],
      isDirty: false,
      browserOpen: false,
    };
    
    setState(newState);
    
    // Save to localStorage immediately to prevent old draft from being restored
    localStorage.setItem('lesson-builder-draft', JSON.stringify(newState));
  }, []);

  // Check if current lesson has changes from original
  const hasChanges = useCallback((): boolean => {
    if (!state.originalLesson) return true; // New lesson

    const currentLesson = generateLessonJSON(state);
    const diff = calculateDiff(state.originalLesson, currentLesson);

    return diffHasChanges(diff);
  }, [state, generateLessonJSON]);

  // Revert to original lesson
  const revertChanges = useCallback(() => {
    if (state.originalLesson && state.lessonSource) {
      loadLesson(state.originalLesson, state.lessonSource, state.originalSha);
    }
  }, [state.originalLesson, state.lessonSource, state.originalSha, loadLesson]);

  // Helper: Check for GitHub conflicts
  const checkForConflicts = async (
    lessonSource: LessonSource,
    originalSha: string,
    lessonPath: string
  ): Promise<void> => {
    const owner = lessonSource.sourceId === 'lscs-depot' ? 'gelileo' : '';
    const repo = lessonSource.sourceId === 'lscs-depot' ? 'chinese-lesson-depot' : '';
    
    if (!owner || !repo) return;

    const { getFileSha } = await import('../services/githubFetchService');
    const currentSha = await getFileSha(owner, repo, lessonPath);
    
    if (currentSha && currentSha !== originalSha) {
      const error = new Error(
        'CONFLICT: This lesson has been modified by another user since you started editing. ' +
        'Please reload the lesson to see the latest version, or use force update to overwrite.'
      );
      (error as any).code = 'CONFLICT';
      (error as any).currentSha = currentSha;
      throw error;
    }
  };

  // Update existing lesson on GitHub
  const updateLesson = useCallback(async (options?: { force?: boolean }) => {
    if (!state.originalLesson || !state.lessonSource || !state.validation.isValid) {
      throw new Error('Cannot update: missing original lesson or validation failed');
    }

    setState(prev => ({
      ...prev,
      publishStatus: { ...prev.publishStatus, isPublishing: true },
    }));

    try {
      // Check for conflicts unless force update
      if (!options?.force && state.originalSha) {
        await checkForConflicts(state.lessonSource, state.originalSha, state.lessonSource.path);
      }

      const currentLesson = generateLessonJSON(state);
      const diff = calculateDiff(state.originalLesson, currentLesson);
      const commitMessage = generateCommitMessage(diff, currentLesson.title);

      const result = await updateLessonOnGitHub(
        currentLesson,
        state.lscsLevel as LSCSLevel,
        state.originalSha || '',
        commitMessage
      );

      if (result.success) {
        setState(prev => ({
          ...prev,
          originalLesson: currentLesson,
          originalSha: result.sha,
          isDirty: false,
          publishStatus: {
            isPublishing: false,
            lastPublishSuccess: true,
            lastPublishError: undefined,
          },
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        publishStatus: {
          isPublishing: false,
          lastPublishSuccess: false,
          lastPublishError: errorMessage,
        },
      }));
      throw error;
    }
  }, [state, generateLessonJSON]);

  // Toggle lesson browser
  const toggleBrowser = useCallback((open?: boolean) => {
    setState(prev => ({
      ...prev,
      browserOpen: open ?? !prev.browserOpen,
    }));
  }, []);

  // Set available lessons
  const setAvailableLessons = useCallback((lessons: any[]) => {
    setState(prev => ({ ...prev, availableLessons: lessons }));
  }, []);

  // Set lesson search query
  const setLessonSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, lessonSearchQuery: query }));
  }, []);

  // Set loading lessons state
  const setLoadingLessons = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoadingLessons: loading }));
  }, []);

  return {
    state,
    updateField,
    updateMetadata,
    addVocabulary,
    removeVocabulary,
    updateVocabulary,
    extractVocabulary,
    generateLesson,
    exportLesson,
    publishToGitHub,
    validation: state.validation,
    // Edit mode methods
    switchMode,
    loadLesson,
    hasChanges,
    revertChanges,
    updateLesson,
    // Browser methods
    toggleBrowser,
    setAvailableLessons,
    setLessonSearchQuery,
    setLoadingLessons,
  };
};