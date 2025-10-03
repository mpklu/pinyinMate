/**
 * Mapping between PinyinMate difficulty levels and LSCS levels
 */

export type PinyinMateDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LSCSLevel = 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'level6' | 'level7' | 'advanced';

export interface LSCSLevelMapping {
  pinyinMateLevel: PinyinMateDifficulty;
  lscsLevel: LSCSLevel;
  displayName: string;
  description: string;
}

export const LSCS_LEVEL_MAPPINGS: LSCSLevelMapping[] = [
  {
    pinyinMateLevel: 'beginner',
    lscsLevel: 'level1',
    displayName: 'Level 1 (Beginner)',
    description: 'Basic characters and simple phrases'
  },
  {
    pinyinMateLevel: 'beginner',
    lscsLevel: 'level2',
    displayName: 'Level 2 (Beginner)',
    description: 'Elementary vocabulary and sentence patterns'
  },
  {
    pinyinMateLevel: 'intermediate',
    lscsLevel: 'level3',
    displayName: 'Level 3 (Intermediate)',
    description: 'Intermediate grammar and expressions'
  },
  {
    pinyinMateLevel: 'intermediate',
    lscsLevel: 'level4',
    displayName: 'Level 4 (Intermediate)',
    description: 'Complex sentences and dialogue'
  },
  {
    pinyinMateLevel: 'intermediate',
    lscsLevel: 'level5',
    displayName: 'Level 5 (Intermediate)',
    description: 'Advanced intermediate topics'
  },
  {
    pinyinMateLevel: 'advanced',
    lscsLevel: 'level6',
    displayName: 'Level 6 (Advanced)',
    description: 'Complex texts and cultural topics'
  },
  {
    pinyinMateLevel: 'advanced',
    lscsLevel: 'level7',
    displayName: 'Level 7 (Advanced)',
    description: 'Advanced literature and sophisticated discourse'
  },
  {
    pinyinMateLevel: 'advanced',
    lscsLevel: 'advanced',
    displayName: 'Advanced (Expert)',
    description: 'Expert-level content and specialized topics'
  }
];

/**
 * Get LSCS levels for a given PinyinMate difficulty
 */
export function getLSCSLevelsForDifficulty(difficulty: PinyinMateDifficulty): LSCSLevelMapping[] {
  return LSCS_LEVEL_MAPPINGS.filter(mapping => mapping.pinyinMateLevel === difficulty);
}

/**
 * Get default LSCS level for a PinyinMate difficulty
 */
export function getDefaultLSCSLevel(difficulty: PinyinMateDifficulty): string {
  const levels = getLSCSLevelsForDifficulty(difficulty);
  return levels[0]?.lscsLevel || 'level1';
}

/**
 * Get LSCS level mapping by level name
 */
export function getLSCSLevelMapping(lscsLevel: string): LSCSLevelMapping | undefined {
  return LSCS_LEVEL_MAPPINGS.find(mapping => mapping.lscsLevel === lscsLevel);
}

/**
 * Get all available LSCS levels
 */
export function getAllLSCSLevels(): LSCSLevelMapping[] {
  return LSCS_LEVEL_MAPPINGS;
}

/**
 * Convert PinyinMate difficulty to appropriate LSCS folder path
 */
export function getLSCSFolderPath(lscsLevel: string): string {
  return lscsLevel; // Directly use the level name as folder
}