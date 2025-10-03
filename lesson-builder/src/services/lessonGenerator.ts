import type { Lesson, LessonBuilderState } from '../types';
import { countChineseCharacters } from '../utils/textAnalysis';

/**
 * Generate a complete lesson JSON from builder state
 */
export function generateLessonJSON(state: LessonBuilderState): Lesson {
  const now = new Date().toISOString();
  
  return {
    id: state.id,
    title: state.title,
    description: state.description,
    content: state.content,
    metadata: {
      difficulty: state.difficulty,
      tags: state.tags,
      characterCount: countChineseCharacters(state.content),
      source: state.source,
      book: state.book,
      vocabulary: state.vocabulary,
      estimatedTime: state.estimatedTime,
      createdAt: now,
      updatedAt: now,
    },
  };
}