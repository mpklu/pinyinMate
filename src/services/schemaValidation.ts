/**
 * Schema Validation Service
 * Provides comprehensive validation for lesson data, user inputs, and service contracts
 */

// Schema validation service for lesson data and user inputs

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Schema validation service
export class SchemaValidationService {
  private static instance: SchemaValidationService;

  static getInstance(): SchemaValidationService {
    if (!SchemaValidationService.instance) {
      SchemaValidationService.instance = new SchemaValidationService();
    }
    return SchemaValidationService.instance;
  }

  /**
   * Validate lesson data
   */
  validateLesson(lesson: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Type check
    if (!lesson || typeof lesson !== 'object') {
      errors.push({
        field: 'lesson',
        message: 'Lesson must be an object',
        code: 'INVALID_TYPE',
        severity: 'critical'
      });
      return { valid: false, errors, warnings };
    }

    const lessonObj = lesson as Record<string, unknown>;

    // Required fields
    this.validateRequiredField(lessonObj, 'id', 'string', errors);
    this.validateRequiredField(lessonObj, 'title', 'string', errors);
    this.validateRequiredField(lessonObj, 'description', 'string', errors);
    this.validateRequiredField(lessonObj, 'content', 'string', errors);
    this.validateRequiredField(lessonObj, 'metadata', 'object', errors);

    // Validate ID format
    if (typeof lessonObj.id === 'string') {
      if (!/^[a-zA-Z0-9_-]+$/.test(lessonObj.id)) {
        errors.push({
          field: 'id',
          message: 'Lesson ID must contain only alphanumeric characters, underscores, and hyphens',
          code: 'INVALID_ID_FORMAT',
          severity: 'high'
        });
      }
    }

    // Validate title length
    if (typeof lessonObj.title === 'string') {
      if (lessonObj.title.length < 1 || lessonObj.title.length > 200) {
        errors.push({
          field: 'title',
          message: 'Title must be between 1 and 200 characters',
          code: 'INVALID_TITLE_LENGTH',
          severity: 'medium'
        });
      }
    }

    // Validate content
    if (typeof lessonObj.content === 'string') {
      if (lessonObj.content.length < 1) {
        errors.push({
          field: 'content',
          message: 'Content cannot be empty',
          code: 'EMPTY_CONTENT',
          severity: 'high'
        });
      } else if (lessonObj.content.length > 10000) {
        warnings.push({
          field: 'content',
          message: 'Content is very long and may impact performance',
          code: 'LONG_CONTENT'
        });
      }

      // Check for Chinese characters
      if (!/[\u4e00-\u9fff]/.test(lessonObj.content)) {
        warnings.push({
          field: 'content',
          message: 'Content does not contain Chinese characters',
          code: 'NO_CHINESE_CONTENT'
        });
      }
    }

    // Validate metadata
    if (lessonObj.metadata && typeof lessonObj.metadata === 'object') {
      const metadataResult = this.validateLessonMetadata(lessonObj.metadata);
      errors.push(...metadataResult.errors);
      warnings.push(...metadataResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate enhanced lesson data
   */
  validateEnhancedLesson(lesson: unknown): ValidationResult {
    // First validate as basic lesson
    const basicResult = this.validateLesson(lesson);
    
    if (!basicResult.valid) {
      return basicResult;
    }

    const errors = [...basicResult.errors];
    const warnings = [...basicResult.warnings];
    
    const lessonObj = lesson as Record<string, unknown>;

    // Validate enhanced fields if present
    if (lessonObj.processedContent) {
      const processedResult = this.validateProcessedContent(lessonObj.processedContent);
      errors.push(...processedResult.errors);
      warnings.push(...processedResult.warnings);
    }

    if (lessonObj.studyProgress) {
      const progressResult = this.validateStudyProgress(lessonObj.studyProgress);
      errors.push(...progressResult.errors);
      warnings.push(...progressResult.warnings);
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
  validateLessonMetadata(metadata: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!metadata || typeof metadata !== 'object') {
      errors.push({
        field: 'metadata',
        message: 'Metadata must be an object',
        code: 'INVALID_METADATA_TYPE',
        severity: 'critical'
      });
      return { valid: false, errors, warnings };
    }

    const metadataObj = metadata as Record<string, unknown>;

    // Required fields
    this.validateRequiredField(metadataObj, 'difficulty', 'string', errors);
    this.validateRequiredField(metadataObj, 'tags', 'object', errors);
    this.validateRequiredField(metadataObj, 'characterCount', 'number', errors);
    this.validateRequiredField(metadataObj, 'source', 'string', errors);
    this.validateRequiredField(metadataObj, 'vocabulary', 'object', errors);
    this.validateRequiredField(metadataObj, 'grammarPoints', 'object', errors);
    this.validateRequiredField(metadataObj, 'culturalNotes', 'object', errors);
    this.validateRequiredField(metadataObj, 'estimatedTime', 'number', errors);

    // Validate difficulty level
    if (typeof metadataObj.difficulty === 'string') {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(metadataObj.difficulty)) {
        errors.push({
          field: 'metadata.difficulty',
          message: 'Difficulty must be beginner, intermediate, or advanced',
          code: 'INVALID_DIFFICULTY',
          severity: 'medium'
        });
      }
    }

    // Validate character count
    if (typeof metadataObj.characterCount === 'number') {
      if (metadataObj.characterCount < 0 || metadataObj.characterCount > 10000) {
        errors.push({
          field: 'metadata.characterCount',
          message: 'Character count must be between 0 and 10000',
          code: 'INVALID_CHARACTER_COUNT',
          severity: 'medium'
        });
      }
    }

    // Validate estimated time
    if (typeof metadataObj.estimatedTime === 'number') {
      if (metadataObj.estimatedTime < 0 || metadataObj.estimatedTime > 300) {
        warnings.push({
          field: 'metadata.estimatedTime',
          message: 'Estimated time should be between 0 and 300 minutes',
          code: 'UNUSUAL_ESTIMATED_TIME'
        });
      }
    }

    // Validate arrays
    if (Array.isArray(metadataObj.tags)) {
      metadataObj.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push({
            field: `metadata.tags[${index}]`,
            message: 'All tags must be strings',
            code: 'INVALID_TAG_TYPE',
            severity: 'medium'
          });
        }
      });
    }

    if (Array.isArray(metadataObj.vocabulary)) {
      metadataObj.vocabulary.forEach((entry, index) => {
        const vocabResult = this.validateVocabularyEntry(entry, `metadata.vocabulary[${index}]`);
        errors.push(...vocabResult.errors);
        warnings.push(...vocabResult.warnings);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate vocabulary entry
   */
  validateVocabularyEntry(entry: unknown, fieldPath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!entry || typeof entry !== 'object') {
      errors.push({
        field: fieldPath,
        message: 'Vocabulary entry must be an object',
        code: 'INVALID_VOCAB_TYPE',
        severity: 'medium'
      });
      return { valid: false, errors, warnings };
    }

    const entryObj = entry as Record<string, unknown>;

    // Required fields
    this.validateRequiredField(entryObj, 'word', 'string', errors, fieldPath);
    this.validateRequiredField(entryObj, 'translation', 'string', errors, fieldPath);

    // Validate word contains Chinese characters
    if (typeof entryObj.word === 'string') {
      if (!/[\u4e00-\u9fff]/.test(entryObj.word)) {
        warnings.push({
          field: `${fieldPath}.word`,
          message: 'Vocabulary word should contain Chinese characters',
          code: 'NO_CHINESE_CHARACTERS'
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
   * Validate lesson study progress
   */
  validateStudyProgress(progress: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!progress || typeof progress !== 'object') {
      errors.push({
        field: 'studyProgress',
        message: 'Study progress must be an object',
        code: 'INVALID_PROGRESS_TYPE',
        severity: 'critical'
      });
      return { valid: false, errors, warnings };
    }

    const progressObj = progress as Record<string, unknown>;

    // Required fields
    this.validateRequiredField(progressObj, 'lessonId', 'string', errors);
    this.validateRequiredField(progressObj, 'status', 'string', errors);
    this.validateRequiredField(progressObj, 'timeSpent', 'number', errors);
    this.validateRequiredField(progressObj, 'sessionCount', 'number', errors);
    this.validateRequiredField(progressObj, 'lastSessionAt', 'object', errors);

    // Validate status
    if (typeof progressObj.status === 'string') {
      const validStatuses = ['not-started', 'in-progress', 'completed'];
      if (!validStatuses.includes(progressObj.status)) {
        errors.push({
          field: 'studyProgress.status',
          message: 'Status must be not-started, in-progress, or completed',
          code: 'INVALID_STATUS',
          severity: 'medium'
        });
      }
    }

    // Validate time spent
    if (typeof progressObj.timeSpent === 'number') {
      if (progressObj.timeSpent < 0) {
        errors.push({
          field: 'studyProgress.timeSpent',
          message: 'Time spent cannot be negative',
          code: 'NEGATIVE_TIME',
          severity: 'medium'
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
   * Validate processed content
   */
  validateProcessedContent(content: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!content || typeof content !== 'object') {
      errors.push({
        field: 'processedContent',
        message: 'Processed content must be an object',
        code: 'INVALID_PROCESSED_CONTENT_TYPE',
        severity: 'medium'
      });
      return { valid: false, errors, warnings };
    }

    const contentObj = content as Record<string, unknown>;

    // Required fields
    this.validateRequiredField(contentObj, 'segments', 'object', errors);
    this.validateRequiredField(contentObj, 'totalSegments', 'number', errors);
    this.validateRequiredField(contentObj, 'processingTimestamp', 'object', errors);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate user input string
   */
  validateUserInput(input: string, fieldName: string, options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    allowChineseOnly?: boolean;
  } = {}): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const {
      minLength = 0,
      maxLength = 1000,
      required = false,
      allowChineseOnly = false
    } = options;

    // Check if required
    if (required && (!input || input.trim().length === 0)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED_FIELD',
        severity: 'high'
      });
      return { valid: false, errors, warnings };
    }

    // Skip further validation if empty and not required
    if (!input || input.trim().length === 0) {
      return { valid: true, errors, warnings };
    }

    // Length validation
    if (input.length < minLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${minLength} characters`,
        code: 'TOO_SHORT',
        severity: 'medium'
      });
    }

    if (input.length > maxLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be no more than ${maxLength} characters`,
        code: 'TOO_LONG',
        severity: 'medium'
      });
    }

    // Chinese character validation
    if (allowChineseOnly && !/^[\u4e00-\u9fff\s\p{P}]*$/u.test(input)) {
      warnings.push({
        field: fieldName,
        message: `${fieldName} should contain only Chinese characters`,
        code: 'NON_CHINESE_CHARACTERS'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Helper method to validate required fields
  private validateRequiredField(
    obj: Record<string, unknown>,
    field: string,
    expectedType: string,
    errors: ValidationError[],
    fieldPath?: string
  ): void {
    const fullFieldPath = fieldPath ? `${fieldPath}.${field}` : field;
    
    if (!(field in obj)) {
      errors.push({
        field: fullFieldPath,
        message: `${field} is required`,
        code: 'MISSING_REQUIRED_FIELD',
        severity: 'high'
      });
      return;
    }

    const value = obj[field];
    const actualType = Array.isArray(value) ? 'object' : typeof value;

    if (actualType !== expectedType) {
      errors.push({
        field: fullFieldPath,
        message: `${field} must be a ${expectedType}`,
        code: 'INVALID_FIELD_TYPE',
        severity: 'medium'
      });
    }
  }
}

// Export singleton instance
export const schemaValidator = SchemaValidationService.getInstance();
export default schemaValidator;