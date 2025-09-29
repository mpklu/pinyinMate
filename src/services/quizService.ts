/**
 * Quiz generation service
 * Creates vocabulary and comprehension quizzes from annotated Chinese text
 */

import type {
  Quiz,
  QuizQuestion,
  QuestionType,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizGenerationOptions,
} from '../types/quiz';
import type {
  TextAnnotation,
  TextSegment,
} from '../types/annotation';
import type { PerformanceMetrics } from '../types/common';

// Import constants from types
import { QUIZ_CONSTANTS } from '../types/quiz';

/**
 * Validates quiz generation request
 */
export const validateQuizRequest = (request: QuizGenerateRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.sourceAnnotationId) {
    errors.push('Source annotation ID is required');
  }

  if (!request.questionTypes || request.questionTypes.length === 0) {
    errors.push('At least one question type must be specified');
  }

  if (request.questionCount && 
      (request.questionCount < QUIZ_CONSTANTS.MIN_QUESTION_COUNT || 
       request.questionCount > QUIZ_CONSTANTS.MAX_QUESTION_COUNT)) {
    errors.push(`Question count must be between ${QUIZ_CONSTANTS.MIN_QUESTION_COUNT} and ${QUIZ_CONSTANTS.MAX_QUESTION_COUNT}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generates a unique quiz ID
 */
const generateQuizId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `quiz_${timestamp}_${random}`;
};

/**
 * Generates a unique question ID
 */
const generateQuestionId = (index: number): string => {
  return `q_${index + 1}_${Date.now()}`;
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Creates multiple choice questions from text segments
 */
const createMultipleChoiceQuestion = (
  segment: TextSegment, 
  allSegments: TextSegment[], 
  questionIndex: number
): QuizQuestion => {
  // Create distractors from other segments
  const distractors = allSegments
    .filter(s => s.id !== segment.id && s.text !== segment.text)
    .map(s => s.pinyin)
    .slice(0, 3);

  // Ensure we have enough options
  while (distractors.length < 3) {
    distractors.push(`option_${distractors.length + 1}`);
  }

  const options = shuffleArray([segment.pinyin, ...distractors]);

  return {
    id: generateQuestionId(questionIndex),
    type: 'multiple-choice',
    prompt: `What is the pinyin for "${segment.text}"?`,
    options,
    correctAnswer: segment.pinyin,
    sourceSegmentId: segment.id,
    explanation: `"${segment.text}" is pronounced "${segment.toneMarks}" (${segment.pinyin})`,
    points: 1,
  };
};

/**
 * Creates fill-in-the-blank questions from text segments
 */
const createFillInBlankQuestion = (
  segment: TextSegment,
  annotation: TextAnnotation,
  questionIndex: number
): QuizQuestion => {
  // Create a sentence with the segment blanked out
  const originalText = annotation.originalText;
  const blankText = originalText.replace(segment.text, '______');

  return {
    id: generateQuestionId(questionIndex),
    type: 'fill-in-blank',
    prompt: `Fill in the blank: ${blankText}`,
    correctAnswer: segment.text,
    sourceSegmentId: segment.id,
    explanation: `The missing word is "${segment.text}" (${segment.toneMarks})`,
    points: 2,
  };
};

/**
 * Creates matching questions pairing Chinese text with pinyin
 */
const createMatchingQuestion = (
  segments: TextSegment[],
  questionIndex: number
): QuizQuestion => {
  // Take up to 5 segments for matching
  const matchingSegments = segments.slice(0, 5);
  
  // Create matching pairs
  const pairs = matchingSegments.map(segment => 
    `${segment.text} → ${segment.toneMarks}`
  );

  // For matching questions, we'll present them as a list
  const chineseChars = matchingSegments.map(s => s.text);
  const pinyinOptions = shuffleArray(matchingSegments.map(s => s.toneMarks));

  return {
    id: generateQuestionId(questionIndex),
    type: 'matching',
    prompt: `Match the Chinese characters with their correct pinyin pronunciation:\n${chineseChars.join(', ')}\n\nPinyin options: ${pinyinOptions.join(', ')}`,
    correctAnswer: pairs,
    explanation: `Correct matches:\n${pairs.join('\n')}`,
    points: matchingSegments.length,
  };
};

/**
 * Creates audio recognition questions (placeholder for future audio integration)
 */
const createAudioRecognitionQuestion = (
  segment: TextSegment,
  allSegments: TextSegment[],
  questionIndex: number
): QuizQuestion => {
  // Create options from multiple segments
  const options = [segment.text];
  const distractors = allSegments
    .filter(s => s.id !== segment.id)
    .map(s => s.text)
    .slice(0, 3);
  
  options.push(...distractors);
  const shuffledOptions = shuffleArray(options);

  return {
    id: generateQuestionId(questionIndex),
    type: 'audio-recognition',
    prompt: 'Listen to the audio and select the correct Chinese character:',
    options: shuffledOptions,
    correctAnswer: segment.text,
    sourceSegmentId: segment.id,
    explanation: `The audio pronunciation matches "${segment.text}" (${segment.toneMarks})`,
    points: 2,
  };
};

/**
 * Generates questions of specific types
 */
const generateQuestionsByType = (
  questionType: QuestionType,
  segments: TextSegment[],
  annotation: TextAnnotation,
  count: number,
  startIndex: number
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const availableSegments = segments.filter(s => s.pinyin && s.text);

  if (availableSegments.length === 0) {
    return questions;
  }

  switch (questionType) {
    case 'multiple-choice':
      for (let i = 0; i < Math.min(count, availableSegments.length); i++) {
        const segment = availableSegments[i];
        questions.push(createMultipleChoiceQuestion(segment, availableSegments, startIndex + i));
      }
      break;

    case 'fill-in-blank':
      for (let i = 0; i < Math.min(count, availableSegments.length); i++) {
        const segment = availableSegments[i];
        questions.push(createFillInBlankQuestion(segment, annotation, startIndex + i));
      }
      break;

    case 'matching':
      if (availableSegments.length >= 2) {
        questions.push(createMatchingQuestion(availableSegments, startIndex));
      }
      break;

    case 'audio-recognition':
      for (let i = 0; i < Math.min(count, availableSegments.length); i++) {
        const segment = availableSegments[i];
        questions.push(createAudioRecognitionQuestion(segment, availableSegments, startIndex + i));
      }
      break;
  }

  return questions;
};

/**
 * Calculates estimated completion time for quiz
 */
const calculateEstimatedTime = (questions: QuizQuestion[]): number => {
  const timePerQuestion = {
    'multiple-choice': 30, // seconds
    'fill-in-blank': 45,
    'matching': 60,
    'audio-recognition': 40,
  };

  const totalSeconds = questions.reduce((total, question) => {
    return total + (timePerQuestion[question.type] || 30);
  }, 0);

  return Math.ceil(totalSeconds / 60); // Convert to minutes
};

/**
 * Measures performance of quiz generation
 */
const measurePerformance = (startTime: number, operationType: string): PerformanceMetrics => {
  const endTime = performance.now();
  return {
    startTime,
    endTime,
    duration: endTime - startTime,
    operationType,
  };
};

/**
 * Main quiz generation function
 * Creates a quiz from annotated text with specified question types
 */
export const generateQuiz = async (
  request: QuizGenerateRequest,
  annotation: TextAnnotation,
  options: Partial<QuizGenerationOptions> = {}
): Promise<QuizGenerateResponse> => {
  const startTime = performance.now();

  try {
    // Validate request
    const validation = validateQuizRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Set defaults
    const questionCount = request.questionCount || QUIZ_CONSTANTS.DEFAULT_QUESTION_COUNT;
    const questionsPerType = Math.ceil(questionCount / request.questionTypes.length);

    // Generate questions for each type
    const allQuestions: QuizQuestion[] = [];
    let questionIndex = 0;

    for (const questionType of request.questionTypes) {
      const typeQuestions = generateQuestionsByType(
        questionType,
        annotation.segments,
        annotation,
        questionsPerType,
        questionIndex
      );
      
      allQuestions.push(...typeQuestions);
      questionIndex += typeQuestions.length;
    }

    // Limit to requested count and shuffle if needed
    let finalQuestions = allQuestions.slice(0, questionCount);
    
    if (options.randomizeOptions !== false) {
      finalQuestions = shuffleArray(finalQuestions);
    }

    if (finalQuestions.length === 0) {
      return {
        success: false,
        error: 'No questions could be generated from the provided text',
      };
    }

    // Calculate total points
    const totalPoints = finalQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    const estimatedTime = calculateEstimatedTime(finalQuestions);

    // Create quiz object
    const quiz: Quiz = {
      id: generateQuizId(),
      sourceAnnotationId: request.sourceAnnotationId,
      questions: finalQuestions,
      type: 'auto-generated',
      createdAt: new Date(),
      metadata: {
        difficulty: request.difficulty || annotation.metadata.difficulty || 'intermediate',
        estimatedTime,
        totalPoints,
        tags: ['auto-generated', 'vocabulary'],
      },
    };

    // Measure performance
    const performanceMetrics = measurePerformance(startTime, 'quiz_generation');

    return {
      success: true,
      data: {
        quiz,
        generationTime: Math.round(performanceMetrics.duration),
      },
    };

  } catch (error) {
    console.error('Quiz generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown quiz generation error',
    };
  }
};

/**
 * Service interface for quiz generation
 */
export const quizService = {
  generate: generateQuiz,
  validate: validateQuizRequest,
};

export default quizService;