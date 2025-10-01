/**
 * QuizContainer - Organism component
 * Simplified interactive quiz interface for Chinese text learning
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Button,
  Stack,
  Chip,
  styled,
} from '@mui/material';

import { QuizQuestion } from '../molecules/QuizQuestion';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';

import type { Quiz, QuizGenerateRequest, QuizQuestion as OldQuizQuestion } from '../../types/quiz';
import type { LessonQuizQuestion, LessonQuestionType } from '../../types/enhancedQuiz';
import type { TextAnnotation } from '../../types/annotation';

// Adapter function to convert old QuizQuestion to LessonQuizQuestion
const adaptQuizQuestion = (oldQuestion: OldQuizQuestion, lessonId: string = 'unknown'): LessonQuizQuestion => ({
  id: oldQuestion.id,
  lessonId: lessonId,
  type: 'multiple-choice' as LessonQuestionType, // Default to multiple-choice
  question: oldQuestion.prompt,
  correctAnswer: Array.isArray(oldQuestion.correctAnswer) 
    ? oldQuestion.correctAnswer[0] 
    : oldQuestion.correctAnswer,
  options: oldQuestion.options,
  audioPrompt: undefined,
  metadata: {
    sourceWord: undefined,
    difficulty: 3, // Default difficulty
    createdAt: new Date(),
    tags: []
  }
});

// Styled components
const QuizContainerStyled = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 500,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const QuestionContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const ResultsContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
}));

export interface QuizProgress {
  quizId: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  completed: boolean;
}

export interface QuizContainerProps {
  /** Pre-generated quiz */
  quiz?: Quiz;
  /** Source annotation for dynamic quiz generation */
  sourceAnnotation?: TextAnnotation;
  /** Quiz generation options */
  generationOptions?: Partial<QuizGenerateRequest>;
  /** Show progress bar */
  showProgress?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when quiz completes */
  onQuizComplete?: (results: QuizProgress) => void;
  /** Callback on question answer */
  onQuestionAnswer?: (questionId: string, correct: boolean, timeSpent: number) => void;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  quiz: initialQuiz,
  sourceAnnotation,  
  generationOptions,
  showProgress = true,
  className,
  onQuizComplete,
  onQuestionAnswer,
}) => {
  // State for quiz generation
  const [quiz, setQuiz] = useState<Quiz | null>(initialQuiz || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generate quiz if needed
  useEffect(() => {
    const generateQuizFromAnnotation = async () => {
      if (initialQuiz || !sourceAnnotation) return;

      try {
        setIsGenerating(true);
        setGenerationError(null);

        // Dynamic import for code splitting
        const { generateQuiz } = await import('../../services/quizService');

        const request: QuizGenerateRequest = {
          sourceAnnotationId: sourceAnnotation.id,
          questionTypes: ['multiple-choice', 'fill-in-blank'],
          questionCount: 10,
          difficulty: 'intermediate',  
          ...generationOptions,
        };

        const response = await generateQuiz(request, sourceAnnotation);

        if (!response.success) {
          throw new Error(response.error || 'Failed to generate quiz');
        }

        setQuiz(response.data!.quiz);

      } catch (error) {
        console.error('Quiz generation failed:', error);
        setGenerationError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsGenerating(false);
      }
    };

    generateQuizFromAnnotation();
  }, [initialQuiz, sourceAnnotation, generationOptions]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());
  const [isCompleted, setIsCompleted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Handle answer submission
  const handleAnswer = useCallback((answer: string | string[]) => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const answerStr = Array.isArray(answer) ? answer.join(',') : answer;
    const correctAnswerStr = Array.isArray(currentQuestion.correctAnswer) 
      ? currentQuestion.correctAnswer.join(',') 
      : currentQuestion.correctAnswer;
    
    const isCorrect = answerStr === correctAnswerStr;
    const timeSpent = Date.now() - questionStartTime;

    // Update answers
    setAnswers(prev => new Map(prev).set(currentQuestion.id, isCorrect));

    // Notify parent component
    onQuestionAnswer?.(currentQuestion.id, isCorrect, timeSpent);

    // Move to next question or complete quiz
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= quiz.questions.length) {
      // Quiz completed
      const correctCount = Array.from(answers.values()).filter(Boolean).length + (isCorrect ? 1 : 0);
      const totalQuestions = quiz.questions.length;
      const accuracy = (correctCount / totalQuestions) * 100;

      const results: QuizProgress = {
        quizId: quiz.id,
        correctAnswers: correctCount,
        totalQuestions,
        accuracy,
        timeSpent: Date.now() - (quiz.createdAt?.getTime() || Date.now()),
        completed: true,
      };

      setIsCompleted(true);
      onQuizComplete?.(results);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(Date.now());
    }
  }, [
    quiz,
    currentQuestionIndex,
    questionStartTime,
    answers,
    onQuestionAnswer,
    onQuizComplete,
  ]);

  // Handle restart quiz
  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setIsCompleted(false);
    setQuestionStartTime(Date.now());
  }, []);

  // Calculate progress
  const progressValue = isCompleted || !quiz
    ? 100 
    : (currentQuestionIndex / quiz.questions.length) * 100;

  const correctAnswers = Array.from(answers.values()).filter(Boolean).length;
  const currentAccuracy = answers.size > 0 ? (correctAnswers / answers.size) * 100 : 0;

  // Loading state
  if (isGenerating) {
    return (
      <QuizContainerStyled className={className}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={6}
        >
          <LoadingSpinner size="large" />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Generating quiz questions...
          </Typography>
        </Box>
      </QuizContainerStyled>
    );
  }

  // Error state
  if (generationError) {
    return (
      <QuizContainerStyled className={className}>
        <ErrorMessage 
          message={`Failed to generate quiz: ${generationError}`}
          severity="error"
        />
      </QuizContainerStyled>
    );
  }

  // No quiz available
  if (!quiz) {
    return (
      <QuizContainerStyled className={className}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={6}
          color="text.secondary"
        >
          <Typography variant="h6" gutterBottom>
            No Quiz Available
          </Typography>
          <Typography variant="body2">
            Please provide a quiz or source annotation to generate questions.
          </Typography>
        </Box>
      </QuizContainerStyled>
    );
  }

  return (
    <QuizContainerStyled className={className}>
      {/* Header */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Chinese Quiz
        </Typography>
        
        {showProgress && (
          <ProgressSection>
            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Question {Math.min(currentQuestionIndex + 1, quiz?.questions.length || 0)} of {quiz?.questions.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progressValue)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressValue} />
            </Box>
          </ProgressSection>
        )}

        {/* Stats */}
        {answers.size > 0 && (
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Chip 
              label={`${correctAnswers}/${answers.size} correct`}
              color={currentAccuracy >= 70 ? 'success' : 'default'}
              size="small"
            />
            <Chip 
              label={`${Math.round(currentAccuracy)}% accuracy`}
              color={currentAccuracy >= 70 ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Quiz content */}
      {!isCompleted ? (
        <QuestionContainer>
          {quiz && currentQuestionIndex < quiz.questions.length && (
            <QuizQuestion
              question={adaptQuizQuestion(quiz.questions[currentQuestionIndex], quiz.sourceAnnotationId)}
              questionNumber={currentQuestionIndex + 1}
              onAnswerChange={handleAnswer}
              interactive
            />
          )}
        </QuestionContainer>
      ) : (
        /* Results */
        <ResultsContainer>
          <Typography variant="h5" color="primary" gutterBottom>
            Quiz Complete!
          </Typography>
          
          <Box my={3}>
            <Typography variant="h3" component="div" color="success.main">
              {Math.round(currentAccuracy)}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {correctAnswers} out of {quiz?.questions.length || 0} correct
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button
              variant="contained"
              onClick={handleRestart}
              size="large"
            >
              Retake Quiz
            </Button>
          </Stack>
        </ResultsContainer>
      )}
    </QuizContainerStyled>
  );
};