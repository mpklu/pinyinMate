import { useState, useCallback, useEffect } from 'react';
import type {
  LessonBuilderState,
  VocabularyEntry,
  ValidationResult,
  Lesson,
  DifficultyLevel,
} from '../types';
import { validateLesson } from '../utils/validation';
import { analyzeChineseText } from '../utils/textAnalysis';
import { generateLessonJSON } from '../services/lessonGenerator';
import { publishLessonToGitHub } from '../services/githubService';

const initialState: LessonBuilderState = {
  id: '',
  title: '',
  description: '',
  content: '',
  difficulty: 'beginner' as DifficultyLevel,
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
};

export const useLessonBuilder = () => {
  const [state, setState] = useState<LessonBuilderState>(initialState);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('lesson-builder-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setState(prev => ({ ...prev, ...parsed, isProcessing: false }));
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
    return generateLessonJSON(state);
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
      await publishLessonToGitHub(lesson);
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
  };
};