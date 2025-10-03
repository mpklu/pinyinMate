import type { Lesson } from '../types';
import type { LSCSLevel, PinyinMateDifficulty } from './lscsMapping';
import { LSCS_LEVEL_MAPPINGS } from './lscsMapping';

/**
 * Remote manifest structure for chinese-lesson-depot
 * Uses same schema as local manifest but adapted for LSCS levels
 */
export interface RemoteManifest {
  version: string;
  lastUpdated: string;
  source: {
    name: string;
    description: string;
    baseUrl: string;
    type: 'remote';
  };
  categories: RemoteCategory[];
  settings: {
    cacheDuration: number;
    maxCacheSize: number;
    prefetchEnabled: boolean;
  };
}

export interface RemoteCategory {
  id: LSCSLevel;
  name: string;
  description: string;
  difficulty: PinyinMateDifficulty;
  totalLessons: number;
  estimatedTime: number;
  lessons: RemoteLessonEntry[];
}

export interface RemoteLessonEntry {
  id: string;
  title: string;
  description: string;
  source: {
    type: 'remote';
    path: string;
  };
  metadata: {
    difficulty: PinyinMateDifficulty;
    lscsLevel: LSCSLevel;
    tags: string[];
    characterCount: number;
    estimatedTime: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Generate a complete remote manifest for chinese-lesson-depot
 */
export function generateRemoteManifest(lessons: Lesson[] = []): RemoteManifest {
  const categories = generateRemoteCategories(lessons);
  
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    source: {
      name: 'LSCS Chinese Lesson Depot',
      description: 'Chinese lessons from Little Star Chinese School, organized by proficiency levels',
      baseUrl: 'https://raw.githubusercontent.com/gelileo/chinese-lesson-depot/main/',
      type: 'remote'
    },
    categories,
    settings: {
      cacheDuration: 3600000, // 1 hour
      maxCacheSize: 104857600, // 100MB
      prefetchEnabled: true
    }
  };
}

/**
 * Generate remote categories based on LSCS levels
 */
function generateRemoteCategories(lessons: Lesson[]): RemoteCategory[] {
  const categories: Map<LSCSLevel, RemoteCategory> = new Map();

  // Initialize all LSCS level categories
  LSCS_LEVEL_MAPPINGS.forEach(mapping => {
    if (!categories.has(mapping.lscsLevel)) {
      categories.set(mapping.lscsLevel, {
        id: mapping.lscsLevel,
        name: mapping.displayName,
        description: mapping.description,
        difficulty: mapping.pinyinMateLevel,
        totalLessons: 0,
        estimatedTime: 0,
        lessons: []
      });
    }
  });

  // Add lessons to appropriate categories
  lessons.forEach(lesson => {
    const lscsLevel = (lesson.metadata as any).lscsLevel || getDefaultLSCSLevel(lesson.metadata.difficulty);
    const category = categories.get(lscsLevel as LSCSLevel);
    
    if (category) {
      const lessonEntry = generateRemoteLessonEntry(lesson, lscsLevel as LSCSLevel);
      category.lessons.push(lessonEntry);
      category.totalLessons++;
      category.estimatedTime += lesson.metadata.estimatedTime;
    }
  });

  return Array.from(categories.values());
}

/**
 * Generate a remote lesson entry
 */
function generateRemoteLessonEntry(lesson: Lesson, lscsLevel: LSCSLevel): RemoteLessonEntry {
  const now = new Date().toISOString();
  
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    source: {
      type: 'remote',
      path: `lessons/${lscsLevel}/${lesson.id}.json`
    },
    metadata: {
      difficulty: lesson.metadata.difficulty,
      lscsLevel,
      tags: lesson.metadata.tags,
      characterCount: lesson.metadata.characterCount,
      estimatedTime: lesson.metadata.estimatedTime,
      createdAt: lesson.metadata.createdAt || now,
      updatedAt: now
    }
  };
}

/**
 * Update an existing remote manifest with a new lesson
 */
export function updateRemoteManifestWithLesson(
  existingManifest: RemoteManifest, 
  lesson: Lesson, 
  lscsLevel: LSCSLevel
): RemoteManifest {
  const updatedManifest = { ...existingManifest };
  updatedManifest.lastUpdated = new Date().toISOString();

  // Find the category for this LSCS level
  const categoryIndex = updatedManifest.categories.findIndex(cat => cat.id === lscsLevel);
  
  if (categoryIndex === -1) {
    // Category doesn't exist, create it
    const mapping = LSCS_LEVEL_MAPPINGS.find(m => m.lscsLevel === lscsLevel);
    if (mapping) {
      updatedManifest.categories.push({
        id: lscsLevel,
        name: mapping.displayName,
        description: mapping.description,
        difficulty: mapping.pinyinMateLevel,
        totalLessons: 1,
        estimatedTime: lesson.metadata.estimatedTime,
        lessons: [generateRemoteLessonEntry(lesson, lscsLevel)]
      });
    }
  } else {
    // Update existing category
    const category = { ...updatedManifest.categories[categoryIndex] };
    const existingLessonIndex = category.lessons.findIndex(l => l.id === lesson.id);
    
    if (existingLessonIndex >= 0) {
      // Update existing lesson
      category.lessons[existingLessonIndex] = generateRemoteLessonEntry(lesson, lscsLevel);
    } else {
      // Add new lesson
      category.lessons.push(generateRemoteLessonEntry(lesson, lscsLevel));
      category.totalLessons++;
      category.estimatedTime += lesson.metadata.estimatedTime;
    }
    
    updatedManifest.categories[categoryIndex] = category;
  }

  return updatedManifest;
}

/**
 * Get default LSCS level for a difficulty (helper function)
 */
function getDefaultLSCSLevel(difficulty: PinyinMateDifficulty): LSCSLevel {
  const levels = LSCS_LEVEL_MAPPINGS.filter(mapping => mapping.pinyinMateLevel === difficulty);
  return levels[0]?.lscsLevel || 'level1';
}

/**
 * Validate remote manifest structure
 */
export function validateRemoteManifest(manifest: any): boolean {
  try {
    return (
      manifest &&
      typeof manifest.version === 'string' &&
      typeof manifest.lastUpdated === 'string' &&
      manifest.source &&
      Array.isArray(manifest.categories) &&
      manifest.settings &&
      typeof manifest.settings.cacheDuration === 'number'
    );
  } catch {
    return false;
  }
}