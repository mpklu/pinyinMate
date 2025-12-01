/**
 * Lesson Diff Service
 * Calculates differences between lesson versions
 */

import type { Lesson, VocabularyEntry, LessonMetadata } from '../types';

export interface VocabularyDiff {
  word: string;
  oldDefinition: string;
  newDefinition: string;
}

export interface LessonDiff {
  fieldsChanged: string[];
  vocabularyAdded: VocabularyEntry[];
  vocabularyRemoved: VocabularyEntry[];
  vocabularyModified: VocabularyDiff[];
  metadataDiff: Record<string, { old: any; new: any }>;
  contentDiff?: string;
}

/**
 * Calculate diff between two lessons
 */
export function calculateDiff(original: Lesson, modified: Lesson): LessonDiff {
  const diff: LessonDiff = {
    fieldsChanged: [],
    vocabularyAdded: [],
    vocabularyRemoved: [],
    vocabularyModified: [],
    metadataDiff: {},
  };

  // Check basic fields and metadata
  checkBasicFieldChanges(original, modified, diff);
  checkMetadataChanges(original, modified, diff);
  checkVocabularyChanges(original, modified, diff);

  // Generate content diff if content changed
  if (diff.fieldsChanged.includes('content')) {
    diff.contentDiff = generateSimpleContentDiff(original.content, modified.content);
  }

  return diff;
}

/**
 * Check basic field changes
 */
function checkBasicFieldChanges(original: Lesson, modified: Lesson, diff: LessonDiff): void {
  const fieldsToCheck: (keyof Lesson)[] = ['id', 'title', 'description', 'content'];
  for (const field of fieldsToCheck) {
    if (original[field] !== modified[field]) {
      diff.fieldsChanged.push(field);
    }
  }
}

/**
 * Check metadata changes
 */
function checkMetadataChanges(original: Lesson, modified: Lesson, diff: LessonDiff): void {
  const metadataFields: (keyof LessonMetadata)[] = [
    'difficulty',
    'tags',
    'source',
    'book',
    'estimatedTime',
    'lscsLevel',
  ];

  for (const field of metadataFields) {
    const oldValue = original.metadata[field];
    const newValue = modified.metadata[field];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff.metadataDiff[field] = {
        old: oldValue,
        new: newValue,
      };
    }
  }
}

/**
 * Check vocabulary changes
 */
function checkVocabularyChanges(original: Lesson, modified: Lesson, diff: LessonDiff): void {
  const originalVocab = new Map(original.metadata.vocabulary.map((v) => [v.word, v]));
  const modifiedVocab = new Map(modified.metadata.vocabulary.map((v) => [v.word, v]));

  // Find added vocabulary
  for (const [word, entry] of modifiedVocab) {
    if (!originalVocab.has(word)) {
      diff.vocabularyAdded.push(entry);
    }
  }

  // Find removed vocabulary
  for (const [word, entry] of originalVocab) {
    if (!modifiedVocab.has(word)) {
      diff.vocabularyRemoved.push(entry);
    }
  }

  // Find modified vocabulary
  for (const [word, newEntry] of modifiedVocab) {
    const oldEntry = originalVocab.get(word);
    if (oldEntry && oldEntry.definition !== newEntry.definition) {
      diff.vocabularyModified.push({
        word,
        oldDefinition: oldEntry.definition,
        newDefinition: newEntry.definition,
      });
    }
  }
}

/**
 * Generate a simple unified diff for content
 */
function generateSimpleContentDiff(oldContent: string, newContent: string): string {
  // Simple line-by-line diff
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const diff: string[] = [];
  const maxLength = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine !== newLine) {
      if (oldLine !== undefined) {
        diff.push(`- ${oldLine}`);
      }
      if (newLine !== undefined) {
        diff.push(`+ ${newLine}`);
      }
    }
  }

  return diff.join('\n');
}

/**
 * Check if lesson has meaningful changes
 */
export function hasChanges(diff: LessonDiff): boolean {
  return (
    diff.fieldsChanged.length > 0 ||
    diff.vocabularyAdded.length > 0 ||
    diff.vocabularyRemoved.length > 0 ||
    diff.vocabularyModified.length > 0 ||
    Object.keys(diff.metadataDiff).length > 0
  );
}

/**
 * Generate human-readable diff summary
 */
export function getDiffSummary(diff: LessonDiff): string {
  const parts: string[] = [];

  addFieldChangeSummaries(diff, parts);
  addVocabularySummaries(diff, parts);
  addMetadataSummaries(diff, parts);

  return parts.length > 0 ? parts.join('; ') : 'No changes detected';
}

/**
 * Add field change summaries
 */
function addFieldChangeSummaries(diff: LessonDiff, parts: string[]): void {
  if (diff.fieldsChanged.includes('title')) {
    parts.push('Title updated');
  }
  if (diff.fieldsChanged.includes('description')) {
    parts.push('Description updated');
  }
  if (diff.fieldsChanged.includes('content')) {
    parts.push('Content modified');
  }
}

/**
 * Add vocabulary summaries
 */
function addVocabularySummaries(diff: LessonDiff, parts: string[]): void {
  if (diff.vocabularyAdded.length > 0) {
    const itemWord = diff.vocabularyAdded.length === 1 ? 'item' : 'items';
    parts.push(`${diff.vocabularyAdded.length} vocabulary ${itemWord} added`);
  }

  if (diff.vocabularyRemoved.length > 0) {
    const itemWord = diff.vocabularyRemoved.length === 1 ? 'item' : 'items';
    parts.push(`${diff.vocabularyRemoved.length} vocabulary ${itemWord} removed`);
  }

  if (diff.vocabularyModified.length > 0) {
    const defWord = diff.vocabularyModified.length === 1 ? 'definition' : 'definitions';
    parts.push(`${diff.vocabularyModified.length} vocabulary ${defWord} updated`);
  }
}

/**
 * Add metadata summaries
 */
function addMetadataSummaries(diff: LessonDiff, parts: string[]): void {
  if (diff.metadataDiff.difficulty) {
    const oldVal = diff.metadataDiff.difficulty.old;
    const newVal = diff.metadataDiff.difficulty.new;
    parts.push(`Difficulty changed from ${oldVal} to ${newVal}`);
  }

  if (diff.metadataDiff.tags) {
    const oldTags = (diff.metadataDiff.tags.old as string[]) || [];
    const newTags = (diff.metadataDiff.tags.new as string[]) || [];
    const added = newTags.filter((t) => !oldTags.includes(t));
    const removed = oldTags.filter((t) => !newTags.includes(t));

    if (added.length > 0) {
      parts.push(`Added tags: ${added.join(', ')}`);
    }
    if (removed.length > 0) {
      parts.push(`Removed tags: ${removed.join(', ')}`);
    }
  }

  if (diff.metadataDiff.estimatedTime) {
    const oldTime = diff.metadataDiff.estimatedTime.old;
    const newTime = diff.metadataDiff.estimatedTime.new;
    parts.push(`Estimated time updated from ${oldTime} to ${newTime} minutes`);
  }
}

/**
 * Generate commit message from diff
 */
export function generateCommitMessage(diff: LessonDiff, lessonTitle?: string): string {
  const parts: string[] = [];

  if (diff.fieldsChanged.includes('content')) {
    parts.push('update content');
  }

  if (diff.vocabularyAdded.length > 0) {
    parts.push(`add ${diff.vocabularyAdded.length} vocabulary`);
  }

  if (diff.vocabularyRemoved.length > 0) {
    parts.push(`remove ${diff.vocabularyRemoved.length} vocabulary`);
  }

  if (diff.vocabularyModified.length > 0) {
    parts.push(`update ${diff.vocabularyModified.length} definitions`);
  }

  if (diff.fieldsChanged.includes('title')) {
    parts.push('update title');
  }

  if (diff.fieldsChanged.includes('description')) {
    parts.push('update description');
  }

  if (diff.metadataDiff.difficulty) {
    parts.push('change difficulty');
  }

  if (diff.metadataDiff.tags) {
    parts.push('update tags');
  }

  if (parts.length === 0) {
    const suffix = lessonTitle ? ` - ${lessonTitle}` : '';
    return `chore(lesson): minor updates${suffix}`;
  }

  const action = parts.join(', ');
  const suffix = lessonTitle ? ` - ${lessonTitle}` : '';
  return `feat(lesson): ${action}${suffix}`;
}

/**
 * Compare two vocabulary entries
 */
export function areVocabularyEntriesEqual(
  entry1: VocabularyEntry,
  entry2: VocabularyEntry
): boolean {
  return entry1.word === entry2.word && entry1.definition === entry2.definition;
}

/**
 * Get detailed change description for a field
 */
export function getFieldChangeDescription(
  fieldName: string,
  oldValue: any,
  newValue: any
): string {
  if (fieldName === 'tags' && Array.isArray(oldValue) && Array.isArray(newValue)) {
    const added = newValue.filter((t) => !oldValue.includes(t));
    const removed = oldValue.filter((t) => !newValue.includes(t));

    const descriptions: string[] = [];
    if (added.length > 0) {
      descriptions.push(`Added: ${added.join(', ')}`);
    }
    if (removed.length > 0) {
      descriptions.push(`Removed: ${removed.join(', ')}`);
    }

    return descriptions.join('; ');
  }

  return `Changed from "${oldValue}" to "${newValue}"`;
}

/**
 * Calculate change statistics
 */
export interface ChangeStats {
  totalChanges: number;
  fieldsModified: number;
  vocabularyChanges: number;
  metadataChanges: number;
  hasContentChange: boolean;
}

export function getChangeStats(diff: LessonDiff): ChangeStats {
  return {
    totalChanges:
      diff.fieldsChanged.length +
      diff.vocabularyAdded.length +
      diff.vocabularyRemoved.length +
      diff.vocabularyModified.length +
      Object.keys(diff.metadataDiff).length,
    fieldsModified: diff.fieldsChanged.length,
    vocabularyChanges:
      diff.vocabularyAdded.length +
      diff.vocabularyRemoved.length +
      diff.vocabularyModified.length,
    metadataChanges: Object.keys(diff.metadataDiff).length,
    hasContentChange: diff.fieldsChanged.includes('content'),
  };
}
