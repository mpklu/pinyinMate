/**
 * Utility functions for debugging and managing lesson builder state
 */

import type { LessonBuilderState } from '../types';
import { getDefaultLSCSLevel } from '../utils/lscsMapping';

/**
 * Clear localStorage and reset lesson builder state
 */
export function clearLessonBuilderDraft(): void {
  localStorage.removeItem('lesson-builder-draft');
  console.log('✅ Lesson builder draft cleared from localStorage');
}

/**
 * Get current localStorage draft data
 */
export function getCurrentDraft(): LessonBuilderState | null {
  try {
    const savedDraft = localStorage.getItem('lesson-builder-draft');
    if (savedDraft) {
      return JSON.parse(savedDraft);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Debug function to check current lesson state
 */
export function debugLessonState(state: LessonBuilderState): void {
  console.group('🔍 Lesson Builder State Debug');
  console.log('Difficulty:', state.difficulty);
  console.log('LSCS Level:', state.lscsLevel);
  console.log('Expected LSCS Level for difficulty:', getDefaultLSCSLevel(state.difficulty));
  console.log('Title:', state.title);
  console.log('Full state:', state);
  console.groupEnd();
}

/**
 * Fix corrupted localStorage draft
 */
export function fixDraftLSCSLevel(): void {
  const draft = getCurrentDraft();
  if (draft) {
    const correctedLscsLevel = draft.lscsLevel || getDefaultLSCSLevel(draft.difficulty || 'beginner');
    const fixedDraft = { ...draft, lscsLevel: correctedLscsLevel };
    localStorage.setItem('lesson-builder-draft', JSON.stringify(fixedDraft));
    console.log('✅ Draft LSCS level corrected:', correctedLscsLevel);
  } else {
    console.log('ℹ️ No draft found in localStorage');
  }
}

// Make functions available in window for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).lessonBuilderDebug = {
    clearDraft: clearLessonBuilderDraft,
    getCurrentDraft,
    debugState: debugLessonState,
    fixDraftLSCSLevel,
  };
  console.log('🛠️ Lesson builder debug tools available at window.lessonBuilderDebug');
}