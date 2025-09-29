/**
 * QuizContainer - Organism component
 * Simplified interactive quiz interface for Chinese text learning
 */

import React, { useState, useCallback } from 'react';
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

import type { Quiz } from '../../types/quiz';

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
  quiz: Quiz;
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
  quiz,
  showProgress = true,
  className,
  onQuizComplete,
  onQuestionAnswer,
}) => {
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());
  const [isCompleted, setIsCompleted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Handle answer submission
  const handleAnswer = useCallback((answer: string | string[]) => {
    if (currentQuestionIndex >= quiz.questions.length) return;

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
  const progressValue = isCompleted 
    ? 100 
    : (currentQuestionIndex / quiz.questions.length) * 100;

  const correctAnswers = Array.from(answers.values()).filter(Boolean).length;
  const currentAccuracy = answers.size > 0 ? (correctAnswers / answers.size) * 100 : 0;

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
                  Question {Math.min(currentQuestionIndex + 1, quiz.questions.length)} of {quiz.questions.length}
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
          {currentQuestionIndex < quiz.questions.length && (
            <QuizQuestion
              question={quiz.questions[currentQuestionIndex]}
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
              {correctAnswers} out of {quiz.questions.length} correct
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