/**
 * Validation Utilities
 * Helper functions for component-level validation
 */

import { schemaValidator, type ValidationResult } from '../services/schemaValidation';

/**
 * Form validation utilities for React components
 */
export class FormValidationUtils {
  /**
   * Validate lesson input form
   */
  static validateLessonInput(formData: {
    id?: string;
    title?: string;
    description?: string;
    content?: string;
    difficulty?: string;
  }): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string; severity: 'critical' | 'high' | 'medium' }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Validate ID
    if (formData.id) {
      const idResult = schemaValidator.validateUserInput(formData.id, 'id', {
        minLength: 1,
        maxLength: 50,
        required: true
      });
      errors.push(...idResult.errors);
      warnings.push(...idResult.warnings);
    }

    // Validate title
    if (formData.title) {
      const titleResult = schemaValidator.validateUserInput(formData.title, 'title', {
        minLength: 1,
        maxLength: 200,
        required: true
      });
      errors.push(...titleResult.errors);
      warnings.push(...titleResult.warnings);
    }

    // Validate content
    if (formData.content) {
      const contentResult = schemaValidator.validateUserInput(formData.content, 'content', {
        minLength: 1,
        maxLength: 10000,
        required: true,
        allowChineseOnly: false
      });
      errors.push(...contentResult.errors);
      warnings.push(...contentResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate search input
   */
  static validateSearchInput(query: string): ValidationResult {
    return schemaValidator.validateUserInput(query, 'search', {
      minLength: 1,
      maxLength: 100,
      required: false
    });
  }

  /**
   * Validate vocabulary input
   */
  static validateVocabularyInput(word: string, translation: string): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string; severity: 'critical' | 'high' | 'medium' }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Validate word
    const wordResult = schemaValidator.validateUserInput(word, 'word', {
      minLength: 1,
      maxLength: 50,
      required: true,
      allowChineseOnly: true
    });
    errors.push(...wordResult.errors);
    warnings.push(...wordResult.warnings);

    // Validate translation
    const translationResult = schemaValidator.validateUserInput(translation, 'translation', {
      minLength: 1,
      maxLength: 200,
      required: true
    });
    errors.push(...translationResult.errors);
    warnings.push(...translationResult.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(validationResult: ValidationResult): string {
    if (validationResult.valid) {
      return '';
    }

    const criticalErrors = validationResult.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      return criticalErrors[0].message;
    }

    const highErrors = validationResult.errors.filter(e => e.severity === 'high');
    if (highErrors.length > 0) {
      return highErrors[0].message;
    }

    return validationResult.errors[0]?.message || 'Validation failed';
  }

  /**
   * Get all error messages as a list
   */
  static getAllErrors(validationResult: ValidationResult): string[] {
    return validationResult.errors.map(error => error.message);
  }

  /**
   * Get all warning messages as a list
   */
  static getAllWarnings(validationResult: ValidationResult): string[] {
    return validationResult.warnings.map(warning => warning.message);
  }
}

// Export utilities
export const formValidation = FormValidationUtils;
export default FormValidationUtils;