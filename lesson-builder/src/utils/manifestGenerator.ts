import { Lesson } from '../types';

export interface ManifestEntry {
  id: string;
  title: string;
  description: string;
  source: {
    type: 'local';
    path: string;
  };
  metadata: {
    difficulty: string;
    tags: string[];
    characterCount: number;
    estimatedTime: number;
  };
}

/**
 * Generates a manifest entry for a lesson that can be added to the library manifest.json
 */
export function generateManifestEntry(lesson: Lesson): ManifestEntry {
  const { id, title, description, metadata } = lesson;
  
  // Determine the category path based on difficulty
  let categoryPath = 'advanced';
  if (metadata.difficulty === 'beginner') {
    categoryPath = 'beginner';
  } else if (metadata.difficulty === 'intermediate') {
    categoryPath = 'intermediate';
  }
  
  return {
    id,
    title,
    description,
    source: {
      type: 'local',
      path: `/lessons/${categoryPath}/${id}.json`
    },
    metadata: {
      difficulty: metadata.difficulty,
      tags: metadata.tags,
      characterCount: metadata.characterCount,
      estimatedTime: metadata.estimatedTime
    }
  };
}

/**
 * Generates instructions for updating the manifest.json file
 */
export function generateManifestInstructions(lesson: Lesson): string {
  const difficulty = lesson.metadata.difficulty;
  return `
Add this entry to the "${difficulty}" category's "lessons" array in your manifest.json file.

Steps:
1. Open public/lessons/manifest.json
2. Find the "${difficulty}" category object
3. Add this entry to the "lessons" array
4. Update the "totalLessons" count (+1)
5. Update the "estimatedTime" (add ${lesson.metadata.estimatedTime} minutes)
6. Update the "lastUpdated" timestamp

Note: Make sure to place the entry in the correct position within the lessons array.
  `.trim();
}