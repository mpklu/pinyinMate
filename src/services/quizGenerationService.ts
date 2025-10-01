/**
 * Lesson Quiz Generation Service
 * 
 * Provides comprehensive quiz generation from Chinese lesson content
 * with multiple question types and audio integration.
 * 
 * This service implements the contract defined in:
 * tests/contract/quiz-generation-service.test.ts
 */

import type {
  EnhancedLesson,
  VocabularyEntryWithPinyin,
  DifficultyLevel,
  ValidationResult
} from '../types';

// Import pinyin generation functionality
import { generatePinyin } from './pinyinService';

  /**
   * Quiz generation configuration options
   */
  export interface QuizGenerationOptions {
    questionTypes: QuizQuestionType[];
    questionCount: number; // 3-20
    difficulty: DifficultyLevel;
    includeAudio: boolean;
    timeLimit?: number; // seconds, 30-1800
    shuffleOptions: boolean;
    preventRepeat: boolean;
    focusVocabulary?: string[]; // specific words to focus on
  }

  /**
   * Default mixed-type quiz configuration
   * Includes both Chinese→Pinyin and Pinyin→Chinese questions
   */
  export const DEFAULT_MIXED_QUIZ_OPTIONS: Partial<QuizGenerationOptions> = {
    questionTypes: [
      'chinese-to-pinyin',      // Chinese text → Select pinyin
      'pinyin-to-chinese',      // Pinyin → Select Chinese text  
      'multiple-choice-definition', // Traditional definition questions
      'multiple-choice-pinyin'   // Traditional pinyin questions
    ],
    questionCount: 10,
    difficulty: 'intermediate' as DifficultyLevel,
    includeAudio: false,
    shuffleOptions: true,
    preventRepeat: true
  };/**
 * Supported quiz question types
 */
export type QuizQuestionType = 
  | 'multiple-choice-definition'
  | 'multiple-choice-pinyin'
  | 'multiple-choice-audio'
  | 'chinese-to-pinyin'     // NEW: Given Chinese text, select pinyin
  | 'pinyin-to-chinese'     // NEW: Given pinyin, select Chinese text
  | 'fill-in-blank'
  | 'audio-recognition'
  | 'pronunciation-match';

/**
 * Quiz generation result
 */
export interface QuizGenerationResult {
  success: boolean;
  quiz: LessonQuiz;
  generationStats: QuizGenerationStats;
  generatedAt: Date;
  errors?: QuizGenerationError[];
}

/**
 * Question generation result
 */
export interface QuestionGenerationResult {
  success: boolean;
  questions: LessonQuizQuestion[];
  generationTime: number;
  errors?: string[];
}

/**
 * Pronunciation quiz options
 */
export interface PronunciationQuizOptions {
  audioRequired: boolean;
  includeSegments: boolean;
  focusWords?: string[];
  maxQuestions: number;
}

/**
 * Quiz generation request
 */
export interface QuizGenerationRequest {
  lesson: EnhancedLesson;
  options: QuizGenerationOptions;
}

/**
 * Generated lesson quiz
 */
export interface LessonQuiz {
  id: string;
  lessonId: string;
  title: string;
  questions: LessonQuizQuestion[];
  metadata: QuizMetadata;
  generatedAt: Date;
}

/**
 * Quiz question
 */
export interface LessonQuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioId?: string;
  difficulty: number; // 1-5
  vocabularyWord?: string;
  timeLimit?: number;
}

/**
 * Quiz metadata
 */
export interface QuizMetadata {
  totalQuestions: number;
  estimatedTime: number;
  difficulty: DifficultyLevel;
  vocabularyFocus: string[];
  includesAudio: boolean;
}

/**
 * Quiz generation statistics
 */
export interface QuizGenerationStats {
  totalGenerated: number;
  byQuestionType: Record<QuizQuestionType, number>;
  vocabularyWordsUsed: number;
  generationTime: number;
  audioGenerated: number;
}

/**
 * Quiz template
 */
export interface QuizTemplate {
  id: string;
  name: string;
  questionType: QuizQuestionType;
  template: string;
  supportAudio: boolean;
  difficulty: DifficultyLevel;
}

/**
 * Quiz generation error
 */
export interface QuizGenerationError {
  code: 'INVALID_LESSON' | 'INSUFFICIENT_VOCABULARY' | 'AUDIO_GENERATION_FAILED' | 'TEMPLATE_ERROR';
  message: string;
  questionType?: QuizQuestionType;
  vocabularyWord?: string;
}

/**
 * Lesson Quiz Generation Service
 * 
 * Handles comprehensive quiz generation from Chinese lessons including:
 * - Multiple choice questions (definition, pinyin, audio)
 * - Fill-in-the-blank questions
 * - Audio recognition questions
 * - Pronunciation matching questions
 * - Configurable difficulty and question counts
 * - Audio integration for pronunciation practice
 */
class LessonQuizGenerationService {
  private readonly quizTemplates = new Map<QuizQuestionType, QuizTemplate>();
  private readonly distractorPool = new Map<string, string[]>(); // Cache for answer distractors

  constructor() {
    this.initializeTemplates();
    this.initializeDistractorPool();
  }

  /**
   * Generate a complete quiz from a lesson
   * 
   * @param lesson - Enhanced lesson with vocabulary
   * @param options - Quiz generation configuration
   * @returns Promise<QuizGenerationResult> - Generated quiz
   */
  async generateQuizFromLesson(
    lesson: EnhancedLesson,
    options: QuizGenerationOptions
  ): Promise<QuizGenerationResult> {
    const startTime = Date.now();
    const generatedAt = new Date();

    // Validate lesson
    const vocabularyValidation = this.validateLessonVocabulary(lesson);
    if (!vocabularyValidation.isValid) {
      return this.createFailureResult(startTime, generatedAt, vocabularyValidation.errors);
    }

    // Prepare vocabulary for question generation
    const vocabularyToUse = this.prepareVocabularyForQuiz(lesson, options);
    
    // Generate questions
    const { questions, errors } = await this.generateQuestionsFromVocabulary(
      lesson, vocabularyToUse, options
    );

    // Create quiz
    const quiz = this.createQuiz(lesson, questions, options, generatedAt);

    return this.createSuccessResult(
      quiz, vocabularyToUse, startTime, generatedAt, errors
    );
  }

  /**
   * Generate vocabulary questions directly from vocabulary entries
   * 
   * @param vocabularyEntries - Vocabulary entries to generate questions from
   * @param questionTypes - Types of questions to generate
   * @param count - Number of questions to generate
   * @returns Promise<QuestionGenerationResult> - Generated questions
   */
  async generateVocabularyQuestions(
    vocabularyEntries: VocabularyEntryWithPinyin[],
    questionTypes: QuizQuestionType[],
    count: number
  ): Promise<QuestionGenerationResult> {
    const startTime = Date.now();
    const questions: LessonQuizQuestion[] = [];
    const errors: string[] = [];

    if (vocabularyEntries.length === 0) {
      return {
        success: false,
        questions: [],
        generationTime: Date.now() - startTime,
        errors: ['No vocabulary entries provided']
      };
    }

    const questionsPerType = Math.ceil(count / questionTypes.length);
    
    for (const questionType of questionTypes) {
      const typeQuestions = await this.generateQuestionsOfType(
        vocabularyEntries.slice(0, questionsPerType),
        questionType,
        questionsPerType
      );
      
      questions.push(...typeQuestions);
    }

    // Limit to requested count
    const finalQuestions = questions.slice(0, count);

    return {
      success: errors.length === 0,
      questions: finalQuestions,
      generationTime: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Generate pronunciation-focused questions
   * 
   * @param lesson - Enhanced lesson with audio
   * @param options - Pronunciation quiz options
   * @returns Promise<QuestionGenerationResult> - Generated pronunciation questions
   */
  async generatePronunciationQuestions(
    lesson: EnhancedLesson,
    options: PronunciationQuizOptions
  ): Promise<QuestionGenerationResult> {
    const startTime = Date.now();
    const questions: LessonQuizQuestion[] = [];

    const vocabularyToUse = lesson.metadata.vocabulary
      .filter(entry => !options.focusWords || options.focusWords.includes(entry.word))
      .slice(0, options.maxQuestions);

    for (const vocabEntry of vocabularyToUse) {
      const enhancedEntry: VocabularyEntryWithPinyin = {
        ...vocabEntry,
        pinyin: vocabEntry.word, // Would be enhanced with actual pinyin
        frequency: 1,
        studyCount: 0,
        masteryLevel: 0
      };

      if (options.audioRequired) {
        const audioQuestion = await this.generateAudioRecognitionQuestion(enhancedEntry);
        questions.push(audioQuestion);
      }

      if (options.includeSegments) {
        const pronunciationQuestion = await this.generatePronunciationMatchQuestion(enhancedEntry);
        questions.push(pronunciationQuestion);
      }
    }

    return {
      success: true,
      questions: questions.slice(0, options.maxQuestions),
      generationTime: Date.now() - startTime
    };
  }

  /**
   * Validate quiz generation request
   * 
   * @param request - Quiz generation request to validate
   * @returns Promise<ValidationResult> - Validation results
   */
  async validateQuizRequest(
    request: QuizGenerationRequest
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    this.validateLessonInQuizRequest(request, errors);
    this.validateQuizOptions(request, errors);

    return { isValid: errors.length === 0, errors, warnings: [] };
  }

  /**
   * Get available quiz templates
   * 
   * @returns Promise<QuizTemplate[]> - Available templates
   */
  async getQuizTemplates(): Promise<QuizTemplate[]> {
    return Array.from(this.quizTemplates.values());
  }

  /**
   * Generate a mixed-type quiz with Chinese↔Pinyin questions
   * Convenience method that uses the DEFAULT_MIXED_QUIZ_OPTIONS
   * 
   * @param lesson - Enhanced lesson with vocabulary
   * @param customOptions - Optional custom options to override defaults
   * @returns Promise<QuizGenerationResult> - Generated mixed-type quiz
   */
  async generateMixedTypeQuiz(
    lesson: EnhancedLesson,
    customOptions?: Partial<QuizGenerationOptions>
  ): Promise<QuizGenerationResult> {
    const options: QuizGenerationOptions = {
      ...DEFAULT_MIXED_QUIZ_OPTIONS,
      ...customOptions
    } as QuizGenerationOptions;

    return this.generateQuizFromLesson(lesson, options);
  }

  // Private helper methods

  private validateLessonVocabulary(lesson: EnhancedLesson): { isValid: boolean; errors: QuizGenerationError[] } {
    const errors: QuizGenerationError[] = [];
    
    if (!lesson.metadata.vocabulary || lesson.metadata.vocabulary.length === 0) {
      errors.push({
        code: 'INSUFFICIENT_VOCABULARY',
        message: 'Lesson must contain vocabulary entries to generate quiz questions'
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }

  private createFailureResult(
    startTime: number, 
    generatedAt: Date, 
    errors: QuizGenerationError[]
  ): QuizGenerationResult {
    return {
      success: false,
      quiz: this.createEmptyQuiz(generatedAt),
      generationStats: this.createEmptyStats(startTime),
      generatedAt,
      errors
    };
  }

  private prepareVocabularyForQuiz(
    lesson: EnhancedLesson, 
    options: QuizGenerationOptions
  ): VocabularyEntryWithPinyin[] {
    let vocabularyToUse: VocabularyEntryWithPinyin[] = lesson.metadata.vocabulary.map(entry => ({
      ...entry,
      pinyin: entry.word, // Placeholder - would be enhanced with actual pinyin
      frequency: 1,
      studyCount: 0,
      masteryLevel: 0
    }));

    // Filter by focus vocabulary if specified
    if (options.focusVocabulary && options.focusVocabulary.length > 0) {
      vocabularyToUse = vocabularyToUse.filter(entry => 
        options.focusVocabulary!.includes(entry.word)
      );
    }

    // Limit vocabulary count
    const maxVocabWords = Math.min(vocabularyToUse.length, options.questionCount);
    return vocabularyToUse.slice(0, maxVocabWords);
  }

  private async generateQuestionsFromVocabulary(
    _lesson: EnhancedLesson,
    vocabularyToUse: VocabularyEntryWithPinyin[],
    options: QuizGenerationOptions
  ): Promise<{ questions: LessonQuizQuestion[]; errors: QuizGenerationError[] }> {
    const questions: LessonQuizQuestion[] = [];
    const errors: QuizGenerationError[] = [];

    const questionsPerType = Math.ceil(options.questionCount / options.questionTypes.length);

    for (const questionType of options.questionTypes) {
      const typeQuestions = await this.generateQuestionsOfType(
        vocabularyToUse, questionType, questionsPerType
      );
      questions.push(...typeQuestions);
    }

    // Shuffle if requested
    if (options.shuffleOptions) {
      this.shuffleArray(questions);
    }

    return { 
      questions: questions.slice(0, options.questionCount), 
      errors 
    };
  }

  private async generateQuestionsOfType(
    vocabulary: VocabularyEntryWithPinyin[],
    questionType: QuizQuestionType,
    count: number
  ): Promise<LessonQuizQuestion[]> {
    const questions: LessonQuizQuestion[] = [];

    for (let i = 0; i < Math.min(count, vocabulary.length); i++) {
      const vocabEntry = vocabulary[i];
      
      switch (questionType) {
        case 'multiple-choice-definition':
          questions.push(await this.generateMultipleChoiceDefinitionQuestion(vocabEntry));
          break;
        case 'multiple-choice-pinyin':
          questions.push(await this.generateMultipleChoicePinyinQuestion(vocabEntry));
          break;
        case 'multiple-choice-audio':
          questions.push(await this.generateMultipleChoiceAudioQuestion(vocabEntry));
          break;
        case 'chinese-to-pinyin':
          questions.push(await this.generateChineseToPinyinQuestion(vocabEntry));
          break;
        case 'pinyin-to-chinese':
          questions.push(await this.generatePinyinToChineseQuestion(vocabEntry));
          break;
        case 'fill-in-blank':
          questions.push(await this.generateFillInBlankQuestion(vocabEntry));
          break;
        case 'audio-recognition':
          questions.push(await this.generateAudioRecognitionQuestion(vocabEntry));
          break;
        case 'pronunciation-match':
          questions.push(await this.generatePronunciationMatchQuestion(vocabEntry));
          break;
      }
    }

    return questions;
  }

  private async generateMultipleChoiceDefinitionQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    const distractors = this.generateDistractors(vocabEntry.translation, 3);
    const options = [vocabEntry.translation, ...distractors];
    this.shuffleArray(options);

    return {
      id: this.generateQuestionId(vocabEntry.word, 'multiple-choice-definition'),
      type: 'multiple-choice-definition',
      question: `What does "${vocabEntry.word}" mean?`,
      options,
      correctAnswer: vocabEntry.translation,
      explanation: `"${vocabEntry.word}" means "${vocabEntry.translation}"`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry),
      vocabularyWord: vocabEntry.word
    };
  }

  private async generateMultipleChoicePinyinQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    const distractors = this.generatePinyinDistractors(vocabEntry.pinyin, 3);
    const options = [vocabEntry.pinyin, ...distractors];
    this.shuffleArray(options);

    return {
      id: this.generateQuestionId(vocabEntry.word, 'multiple-choice-pinyin'),
      type: 'multiple-choice-pinyin',
      question: `What is the pinyin for "${vocabEntry.word}"?`,
      options,
      correctAnswer: vocabEntry.pinyin,
      explanation: `The pinyin for "${vocabEntry.word}" is "${vocabEntry.pinyin}"`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry),
      vocabularyWord: vocabEntry.word
    };
  }

  private async generateMultipleChoiceAudioQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    const distractors = this.generateDistractors(vocabEntry.word, 3);
    const options = [vocabEntry.word, ...distractors];
    this.shuffleArray(options);

    return {
      id: this.generateQuestionId(vocabEntry.word, 'multiple-choice-audio'),
      type: 'multiple-choice-audio',
      question: 'Listen to the audio and select the correct Chinese character:',
      options,
      correctAnswer: vocabEntry.word,
      explanation: `The audio plays "${vocabEntry.word}" (${vocabEntry.pinyin})`,
      audioId: `audio-${vocabEntry.word}`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry) + 1, // Audio is harder
      vocabularyWord: vocabEntry.word
    };
  }

  private async generateFillInBlankQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    const sentence = `The Chinese word for "${vocabEntry.translation}" is _____.`;

    return {
      id: this.generateQuestionId(vocabEntry.word, 'fill-in-blank'),
      type: 'fill-in-blank',
      question: sentence,
      correctAnswer: vocabEntry.word,
      explanation: `The correct answer is "${vocabEntry.word}" (${vocabEntry.pinyin})`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry) + 1, // Fill-in is harder
      vocabularyWord: vocabEntry.word
    };
  }

  private async generateAudioRecognitionQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    return {
      id: this.generateQuestionId(vocabEntry.word, 'audio-recognition'),
      type: 'audio-recognition',
      question: 'Listen to the pronunciation and write the Chinese characters:',
      correctAnswer: vocabEntry.word,
      explanation: `The pronunciation is "${vocabEntry.word}" (${vocabEntry.pinyin}), meaning "${vocabEntry.translation}"`,
      audioId: `audio-${vocabEntry.word}`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry) + 2, // Audio recognition is hardest
      vocabularyWord: vocabEntry.word
    };
  }

  private async generatePronunciationMatchQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    const distractors = this.generatePinyinDistractors(vocabEntry.pinyin, 3);
    const options = [vocabEntry.pinyin, ...distractors];
    this.shuffleArray(options);

    return {
      id: this.generateQuestionId(vocabEntry.word, 'pronunciation-match'),
      type: 'pronunciation-match',
      question: `Match the pronunciation to "${vocabEntry.word}":`,
      options,
      correctAnswer: vocabEntry.pinyin,
      explanation: `"${vocabEntry.word}" is pronounced "${vocabEntry.pinyin}"`,
      audioId: `audio-${vocabEntry.word}`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry),
      vocabularyWord: vocabEntry.word
    };
  }

  private async generateChineseToPinyinQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    // Generate proper pinyin for the word using PinyinService
    const actualPinyin = await this.generatePinyinForWord(vocabEntry.word);
    
    // Generate pinyin distractors (incorrect pinyin options)
    const distractors = this.generatePinyinDistractors(actualPinyin, 3);
    const options = [actualPinyin, ...distractors];
    this.shuffleArray(options);

    return {
      id: this.generateQuestionId(vocabEntry.word, 'chinese-to-pinyin'),
      type: 'chinese-to-pinyin',
      question: `What is the pinyin pronunciation for "${vocabEntry.word}"?`,
      options,
      correctAnswer: actualPinyin,
      explanation: `"${vocabEntry.word}" is pronounced "${actualPinyin}"`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry),
      vocabularyWord: vocabEntry.word
    };
  }

  private async generatePinyinToChineseQuestion(
    vocabEntry: VocabularyEntryWithPinyin
  ): Promise<LessonQuizQuestion> {
    // Generate proper pinyin for the word
    const actualPinyin = await this.generatePinyinForWord(vocabEntry.word);
    
    // Generate Chinese character distractors (incorrect Chinese characters)
    const distractors = this.generateDistractors(vocabEntry.word, 3);
    const options = [vocabEntry.word, ...distractors];
    this.shuffleArray(options);

    return {
      id: this.generateQuestionId(vocabEntry.word, 'pinyin-to-chinese'),
      type: 'pinyin-to-chinese',
      question: `Which Chinese characters match the pinyin "${actualPinyin}"?`,
      options,
      correctAnswer: vocabEntry.word,
      explanation: `The pinyin "${actualPinyin}" corresponds to "${vocabEntry.word}"`,
      difficulty: this.calculateQuestionDifficulty(vocabEntry),
      vocabularyWord: vocabEntry.word
    };
  }

  private createQuiz(
    lesson: EnhancedLesson,
    questions: LessonQuizQuestion[],
    options: QuizGenerationOptions,
    generatedAt: Date
  ): LessonQuiz {
    const vocabularyFocus = questions
      .map(q => q.vocabularyWord)
      .filter((word): word is string => word !== undefined);

    return {
      id: `quiz-${lesson.id}-${Date.now()}`,
      lessonId: lesson.id,
      title: `${lesson.title} - Quiz`,
      questions,
      metadata: {
        totalQuestions: questions.length,
        estimatedTime: questions.length * 30, // 30 seconds per question
        difficulty: options.difficulty,
        vocabularyFocus,
        includesAudio: options.includeAudio
      },
      generatedAt
    };
  }

  private createSuccessResult(
    quiz: LessonQuiz,
    vocabularyToUse: VocabularyEntryWithPinyin[],
    startTime: number,
    generatedAt: Date,
    errors: QuizGenerationError[]
  ): QuizGenerationResult {
    const statsByQuestionType: Record<QuizQuestionType, number> = {
      'multiple-choice-definition': 0,
      'multiple-choice-pinyin': 0,
      'multiple-choice-audio': 0,
      'chinese-to-pinyin': 0,
      'pinyin-to-chinese': 0,
      'fill-in-blank': 0,
      'audio-recognition': 0,
      'pronunciation-match': 0
    };
    
    // Count questions by type
    quiz.questions.forEach(question => {
      statsByQuestionType[question.type]++;
    });

    const audioGenerated = quiz.questions.filter(q => q.audioId).length;

    return {
      success: errors.length === 0,
      quiz,
      generationStats: {
        totalGenerated: quiz.questions.length,
        byQuestionType: statsByQuestionType,
        vocabularyWordsUsed: vocabularyToUse.length,
        generationTime: Date.now() - startTime,
        audioGenerated
      },
      generatedAt,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateLessonInQuizRequest(request: QuizGenerationRequest, errors: string[]): void {
    if (!request.lesson) {
      errors.push('Lesson is required');
      return;
    }
    
    if (!request.lesson.metadata.vocabulary || request.lesson.metadata.vocabulary.length === 0) {
      errors.push('Lesson must contain vocabulary entries');
    }
  }

  private validateQuizOptions(request: QuizGenerationRequest, errors: string[]): void {
    if (!request.options) {
      errors.push('Quiz options are required');
      return;
    }

    const { options } = request;

    // Validate question count
    if (options.questionCount < 3 || options.questionCount > 20) {
      errors.push(`questionCount must be between 3 and 20 (received: ${options.questionCount})`);
    }

    // Validate question types
    if (!options.questionTypes || options.questionTypes.length === 0) {
      errors.push('At least one question type is required');
    }

    // Validate time limit if provided
    if (options.timeLimit && (options.timeLimit < 30 || options.timeLimit > 1800)) {
      errors.push(`timeLimit must be between 30 and 1800 seconds (received: ${options.timeLimit})`);
    }
  }

  private initializeTemplates(): void {
    const templates: QuizTemplate[] = [
      {
        id: 'mc-definition-basic',
        name: 'Multiple Choice Definition',
        questionType: 'multiple-choice-definition',
        template: 'What does "{{word}}" mean?',
        supportAudio: false,
        difficulty: 'beginner'
      },
      {
        id: 'mc-pinyin-basic',
        name: 'Multiple Choice Pinyin',
        questionType: 'multiple-choice-pinyin',
        template: 'What is the pinyin for "{{word}}"?',
        supportAudio: true,
        difficulty: 'beginner'
      },
      {
        id: 'mc-audio-basic',
        name: 'Multiple Choice Audio',
        questionType: 'multiple-choice-audio',
        template: 'Listen and select the correct character:',
        supportAudio: true,
        difficulty: 'intermediate'
      },
      {
        id: 'fill-blank-basic',
        name: 'Fill in the Blank',
        questionType: 'fill-in-blank',
        template: 'The Chinese word for "{{translation}}" is ___.',
        supportAudio: false,
        difficulty: 'intermediate'
      },
      {
        id: 'audio-recognition-basic',
        name: 'Audio Recognition',
        questionType: 'audio-recognition',
        template: 'Listen and write the Chinese characters:',
        supportAudio: true,
        difficulty: 'advanced'
      },
      {
        id: 'pronunciation-match-basic',
        name: 'Pronunciation Match',
        questionType: 'pronunciation-match',
        template: 'Match the pronunciation to "{{word}}":',
        supportAudio: true,
        difficulty: 'intermediate'
      },
      {
        id: 'chinese-to-pinyin-basic',
        name: 'Chinese to Pinyin',
        questionType: 'chinese-to-pinyin',
        template: 'What is the pinyin pronunciation for "{{word}}"?',
        supportAudio: false,
        difficulty: 'beginner'
      },
      {
        id: 'pinyin-to-chinese-basic',
        name: 'Pinyin to Chinese',
        questionType: 'pinyin-to-chinese',
        template: 'Which Chinese characters match the pinyin "{{pinyin}}"?',
        supportAudio: false,
        difficulty: 'beginner'
      }
    ];

    templates.forEach(template => {
      this.quizTemplates.set(template.questionType, template);
    });
  }

  private initializeDistractorPool(): void {
    // Common English words for distractors
    this.distractorPool.set('common-translations', [
      'water', 'food', 'house', 'car', 'book', 'school', 'friend', 'family',
      'work', 'time', 'money', 'love', 'good', 'bad', 'big', 'small',
      'hot', 'cold', 'new', 'old', 'today', 'tomorrow', 'yesterday'
    ]);

    // Common pinyin syllables for distractors  
    this.distractorPool.set('common-pinyin', [
      'wǒ', 'nǐ', 'tā', 'de', 'shì', 'yǒu', 'zài', 'le', 'yī', 'èr',
      'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ', 'shí', 'lái', 'qù'
    ]);
  }

  /**
   * Generate proper pinyin for a Chinese word using the PinyinService
   */
  private async generatePinyinForWord(chineseWord: string): Promise<string> {
    try {
      const pinyinResponse = await generatePinyin({
        text: chineseWord,
        format: 'tone-marks' // Use tone marks (ā, é, ǐ, ò, ǔ)
      });
      
      if (pinyinResponse.success && pinyinResponse.data) {
        return pinyinResponse.data.pinyin;
      } else {
        // Fallback: return the original word if pinyin generation fails
        console.warn(`Failed to generate pinyin for "${chineseWord}":`, pinyinResponse.error);
        return chineseWord;
      }
    } catch (error) {
      console.error(`Error generating pinyin for "${chineseWord}":`, error);
      // Fallback: return the original word
      return chineseWord;
    }
  }

  private generateDistractors(correctAnswer: string, count: number): string[] {
    const pool = this.distractorPool.get('common-translations') || [];
    const distractors = pool.filter(item => item !== correctAnswer);
    this.shuffleArray(distractors);
    return distractors.slice(0, count);
  }

  private generatePinyinDistractors(correctPinyin: string, count: number): string[] {
    const pool = this.distractorPool.get('common-pinyin') || [];
    const distractors = pool.filter(item => item !== correctPinyin);
    this.shuffleArray(distractors);
    return distractors.slice(0, count);
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private calculateQuestionDifficulty(vocabEntry: VocabularyEntryWithPinyin): number {
    // Base difficulty from vocabulary entry
    let difficulty = 3; // Default medium
    
    if ('difficulty' in vocabEntry) {
      const entryDifficulty = (vocabEntry as VocabularyEntryWithPinyin & { difficulty?: DifficultyLevel }).difficulty;
      switch (entryDifficulty) {
        case 'beginner': difficulty = 2; break;
        case 'intermediate': break; // Already 3
        case 'advanced': difficulty = 4; break;
      }
    }

    return Math.min(5, Math.max(1, difficulty));
  }

  private generateQuestionId(word: string, questionType: QuizQuestionType): string {
    const wordHash = btoa(word).replace(/[+/=]/g, '').substring(0, 8);
    return `question-${wordHash}-${questionType}`;
  }

  private createEmptyQuiz(generatedAt: Date): LessonQuiz {
    return {
      id: 'empty-quiz',
      lessonId: 'unknown',
      title: 'Empty Quiz',
      questions: [],
      metadata: {
        totalQuestions: 0,
        estimatedTime: 0,
        difficulty: 'beginner',
        vocabularyFocus: [],
        includesAudio: false
      },
      generatedAt
    };
  }

  private createEmptyStats(startTime: number): QuizGenerationStats {
    return {
      totalGenerated: 0,
      byQuestionType: {
        'multiple-choice-definition': 0,
        'multiple-choice-pinyin': 0,
        'multiple-choice-audio': 0,
        'chinese-to-pinyin': 0,
        'pinyin-to-chinese': 0,
        'fill-in-blank': 0,
        'audio-recognition': 0,
        'pronunciation-match': 0
      },
      vocabularyWordsUsed: 0,
      generationTime: Date.now() - startTime,
      audioGenerated: 0
    };
  }
}

// Export singleton instance
export const quizGenerationService = new LessonQuizGenerationService();