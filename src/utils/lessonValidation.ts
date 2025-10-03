/**
 * Lesson Schema Validation Utilities
 * 
 * Provides validation functions for lesson data against the standardized schema.
 * Used by library services to ensure data integrity and compatibility.
 */

import type { Lesson } from '../types/lesson';

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validate a complete lesson object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateLesson(lesson: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields validation
  if (!lesson.id) {
    errors.push({ field: 'id', message: 'Lesson ID is required' });
  } else if (typeof lesson.id !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(lesson.id)) {
    errors.push({ field: 'id', message: 'Lesson ID must be alphanumeric with hyphens/underscores only', value: lesson.id });
  }

  if (!lesson.title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (typeof lesson.title !== 'string' || lesson.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be a string with max 100 characters', value: lesson.title });
  }

  if (!lesson.description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (typeof lesson.description !== 'string' || lesson.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be a string with max 500 characters', value: lesson.description });
  }

  if (!lesson.content) {
    errors.push({ field: 'content', message: 'Content is required' });
  } else if (typeof lesson.content !== 'string' || lesson.content.length > 10000) {
    errors.push({ field: 'content', message: 'Content must be a string with max 10,000 characters', value: lesson.content });
  }

  if (!lesson.metadata) {
    errors.push({ field: 'metadata', message: 'Metadata is required' });
  } else {
    const metadataValidation = validateMetadata(lesson.metadata);
    errors.push(...metadataValidation.errors.map(e => ({ ...e, field: `metadata.${e.field}` })));
    warnings.push(...metadataValidation.warnings.map(w => ({ ...w, field: `metadata.${w.field}` })));
  }



  // Cross-field validations
  if (lesson.content && lesson.metadata?.characterCount) {
    const actualCharCount = countChineseCharacters(lesson.content);
    if (Math.abs(actualCharCount - lesson.metadata.characterCount) > 5) {
      warnings.push({
        field: 'metadata.characterCount',
        message: `Character count mismatch: declared ${lesson.metadata.characterCount}, actual ${actualCharCount}`,
        value: lesson.metadata.characterCount
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate lesson metadata
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateMetadata(metadata: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  const requiredFields = [
    'difficulty', 'tags', 'characterCount', 'source', 'book',
    'vocabulary', 'grammarPoints', 'culturalNotes', 'estimatedTime',
    'createdAt', 'updatedAt'
  ];

  for (const field of requiredFields) {
    if (metadata[field] === undefined) {
      errors.push({ field, message: `${field} is required` });
    }
  }

  // Difficulty validation
  if (metadata.difficulty && !['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty)) {
    errors.push({
      field: 'difficulty',
      message: 'Difficulty must be "beginner", "intermediate", or "advanced"',
      value: metadata.difficulty
    });
  }

  // Tags validation
  if (metadata.tags) {
    if (!Array.isArray(metadata.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array', value: metadata.tags });
    } else if (metadata.tags.length === 0) {
      errors.push({ field: 'tags', message: 'At least one tag is required' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (metadata.tags.some((tag: any) => typeof tag !== 'string')) {
      errors.push({ field: 'tags', message: 'All tags must be strings', value: metadata.tags });
    }
  }

  // Character count validation
  if (metadata.characterCount && (typeof metadata.characterCount !== 'number' || metadata.characterCount < 1)) {
    errors.push({
      field: 'characterCount',
      message: 'Character count must be a positive number',
      value: metadata.characterCount
    });
  }

  // Source validation
  if (metadata.source && (typeof metadata.source !== 'string' || metadata.source.trim().length === 0)) {
    errors.push({ field: 'source', message: 'Source must be a non-empty string', value: metadata.source });
  }

  // Book validation (can be string or null)
  if (metadata.book !== null && metadata.book !== undefined && typeof metadata.book !== 'string') {
    errors.push({ field: 'book', message: 'Book must be a string or null', value: metadata.book });
  }

  // Vocabulary validation
  if (metadata.vocabulary) {
    if (!Array.isArray(metadata.vocabulary)) {
      errors.push({ field: 'vocabulary', message: 'Vocabulary must be an array', value: metadata.vocabulary });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata.vocabulary.forEach((entry: any, index: number) => {
        const entryValidation = validateVocabularyEntry(entry);
        errors.push(...entryValidation.errors.map(e => ({ ...e, field: `vocabulary[${index}].${e.field}` })));
        warnings.push(...entryValidation.warnings.map(w => ({ ...w, field: `vocabulary[${index}].${w.field}` })));
      });
    }
  }

  // Estimated time validation
  if (metadata.estimatedTime && (typeof metadata.estimatedTime !== 'number' || metadata.estimatedTime < 1 || metadata.estimatedTime > 300)) {
    errors.push({
      field: 'estimatedTime',
      message: 'Estimated time must be between 1 and 300 minutes',
      value: metadata.estimatedTime
    });
  }

  // Date validation
  if (metadata.createdAt && !isValidISODate(metadata.createdAt)) {
    errors.push({
      field: 'createdAt',
      message: 'Created date must be in ISO 8601 format',
      value: metadata.createdAt
    });
  }

  if (metadata.updatedAt && !isValidISODate(metadata.updatedAt)) {
    errors.push({
      field: 'updatedAt',
      message: 'Updated date must be in ISO 8601 format',
      value: metadata.updatedAt
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate vocabulary entry
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateVocabularyEntry(entry: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!entry.word) {
    errors.push({ field: 'word', message: 'Word is required' });
  } else if (typeof entry.word !== 'string' || entry.word.length > 50) {
    errors.push({ field: 'word', message: 'Word must be a string with max 50 characters', value: entry.word });
  }

  if (!entry.definition) {
    errors.push({ field: 'definition', message: 'Definition is required' });
  } else if (typeof entry.definition !== 'string' || entry.definition.length > 200) {
    errors.push({ field: 'definition', message: 'Definition must be a string with max 200 characters', value: entry.definition });
  }

  // Check for deprecated fields
  if (entry.pinyin) {
    warnings.push({ field: 'pinyin', message: 'Pinyin field is deprecated and will be ignored (generated at runtime)' });
  }

  if (entry.partOfSpeech) {
    warnings.push({ field: 'partOfSpeech', message: 'PartOfSpeech field is deprecated and will be ignored' });
  }

  return { valid: errors.length === 0, errors, warnings };
}



/**
 * Count Chinese characters in text
 */
function countChineseCharacters(text: string): number {
  // Chinese character range in Unicode
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const matches = text.match(chineseRegex);
  return matches ? matches.length : 0;
}

/**
 * Validate ISO 8601 date string
 */
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Clean lesson data by removing deprecated fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanLessonData(lesson: any): Lesson {
  // Create a deep copy to avoid mutating the original
  const cleaned = JSON.parse(JSON.stringify(lesson));

  // Remove deprecated fields from vocabulary
  if (cleaned.metadata?.vocabulary) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cleaned.metadata.vocabulary = cleaned.metadata.vocabulary.map((entry: any) => ({
      word: entry.word,
      definition: entry.definition
      // Remove pinyin, partOfSpeech, and any other deprecated fields
    }));
  }

  return cleaned as Lesson;
}

/**
 * Migrate legacy lesson format to current schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateLegacyLesson(legacyLesson: any): Lesson {
  const migrated = { ...legacyLesson };

  // Add default values for new required fields if missing
  if (!migrated.metadata) {
    migrated.metadata = {};
  }

  if (!migrated.metadata.source) {
    migrated.metadata.source = 'Unknown Source';
  }

  if (migrated.metadata.book === undefined) {
    migrated.metadata.book = null;
  }

  if (!migrated.metadata.vocabulary) {
    migrated.metadata.vocabulary = legacyLesson.vocabulary || [];
  }

  if (!migrated.metadata.grammarPoints) {
    migrated.metadata.grammarPoints = [];
  }

  if (!migrated.metadata.culturalNotes) {
    migrated.metadata.culturalNotes = [];
  }

  if (!migrated.metadata.characterCount && migrated.content) {
    migrated.metadata.characterCount = countChineseCharacters(migrated.content);
  }

  // Clean deprecated fields
  return cleanLessonData(migrated);
}