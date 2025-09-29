/**
 * QuizQuestion - Molecular component
 * Interactive quiz question display with multiple choice, fill-in-blank, and other question types
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Chip,
  styled,
} from '@mui/material';
import { CheckCircle, Cancel, Help } from '@mui/icons-material';
import { Card, Button } from '../atoms';
import type { QuizQuestion as QuizQuestionType } from '../../types';

export interface QuizQuestionProps {
  /**
   * Question data
   */
  question: QuizQuestionType;
  /**
   * Question number/index
   */
  questionNumber: number;
  /**
   * Current answer
   */
  answer?: string | string[];
  /**
   * Show correct answer
   */
  showAnswer?: boolean;
  /**
   * Question completed state
   */
  completed?: boolean;
  /**
   * Answer change handler
   */
  onAnswerChange?: (answer: string | string[]) => void;
  /**
   * Submit answer handler
   */
  onSubmit?: () => void;
  /**
   * Interactive mode
   */
  interactive?: boolean;
}

const QuestionContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const QuestionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const QuestionNumber = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
}));

const QuestionPrompt = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.5,
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}));

const OptionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const CorrectAnswerDisplay = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.success.main + '10',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.success.main}30`,
}));

const ExplanationDisplay = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.info.main + '10',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.info.main}30`,
}));

const AnswerStatus = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

/**
 * QuizQuestion component for displaying and interacting with quiz questions
 */
export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  answer,
  showAnswer = false,
  completed = false,
  onAnswerChange,
  onSubmit,
  interactive = true,
}) => {
  const [localAnswer, setLocalAnswer] = useState<string>('');

  let currentAnswer: string;
  if (answer !== undefined) {
    currentAnswer = Array.isArray(answer) ? answer.join(', ') : answer.toString();
  } else {
    currentAnswer = localAnswer;
  }

  const correctAnswer = Array.isArray(question.correctAnswer) ? 
    question.correctAnswer.join(', ') : 
    question.correctAnswer.toString();

  const isCorrect = currentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

  const handleAnswerChange = useCallback((newAnswer: string | string[]) => {
    const answerString = Array.isArray(newAnswer) ? newAnswer.join(', ') : newAnswer;
    
    if (answer === undefined) {
      setLocalAnswer(answerString);
    }
    
    onAnswerChange?.(newAnswer);
  }, [onAnswerChange, answer]);

  const handleMultipleChoiceChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleAnswerChange(event.target.value);
  }, [handleAnswerChange]);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleAnswerChange(event.target.value);
  }, [handleAnswerChange]);

  const handleSubmit = useCallback(() => {
    onSubmit?.();
  }, [onSubmit]);

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={currentAnswer}
              onChange={handleMultipleChoiceChange}
            >
              {question.options?.map((option) => (
                <OptionContainer key={option}>
                  <FormControlLabel
                    value={option}
                    control={<Radio disabled={!interactive || completed} />}
                    label={option}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </OptionContainer>
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'fill-in-blank':
        return (
          <TextField
            fullWidth
            value={currentAnswer}
            onChange={handleTextChange}
            placeholder="Enter your answer..."
            disabled={!interactive || completed}
            variant="outlined"
            size="medium"
          />
        );

      case 'matching':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={currentAnswer}
            onChange={handleTextChange}
            placeholder="Enter your matching pairs..."
            disabled={!interactive || completed}
            variant="outlined"
            helperText="Enter one match per line (e.g., 你好 → nǐ hǎo)"
          />
        );

      case 'audio-recognition':
        return (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Select the character you heard:
            </FormLabel>
            <RadioGroup
              value={currentAnswer}
              onChange={handleMultipleChoiceChange}
            >
              {question.options?.map((option) => (
                <OptionContainer key={option}>
                  <FormControlLabel
                    value={option}
                    control={<Radio disabled={!interactive || completed} />}
                    label={option}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: '1.25rem',
                        fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
                      },
                    }}
                  />
                </OptionContainer>
              ))}
            </RadioGroup>
          </FormControl>
        );

      default:
        return (
          <TextField
            fullWidth
            value={currentAnswer}
            onChange={handleTextChange}
            placeholder="Enter your answer..."
            disabled={!interactive || completed}
            variant="outlined"
          />
        );
    }
  };

  return (
    <QuestionContainer padding="large">
      <QuestionHeader>
        <QuestionNumber 
          label={`Question ${questionNumber}`}
          size="small"
        />
        {question.points && (
          <Chip 
            label={`${question.points} point${question.points !== 1 ? 's' : ''}`}
            variant="outlined"
            size="small"
          />
        )}
      </QuestionHeader>

      <QuestionPrompt>
        {question.prompt}
      </QuestionPrompt>

      {renderQuestionContent()}

      {interactive && !completed && onSubmit && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSubmit}
            disabled={!currentAnswer.trim()}
            variant="contained"
            color="primary"
          >
            Submit Answer
          </Button>
        </Box>
      )}

      {(completed || showAnswer) && (
        <AnswerStatus>
          {completed && (
            <>
              {isCorrect ? (
                <CheckCircle color="success" />
              ) : (
                <Cancel color="error" />
              )}
              <Typography
                variant="body2"
                color={isCorrect ? 'success.main' : 'error.main'}
                fontWeight={500}
              >
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Typography>
            </>
          )}
          {!isCorrect && <Help color="info" />}
        </AnswerStatus>
      )}

      {(showAnswer || (completed && !isCorrect)) && (
        <CorrectAnswerDisplay>
          <Typography variant="body2" fontWeight={500} color="success.main">
            Correct Answer: {correctAnswer}
          </Typography>
        </CorrectAnswerDisplay>
      )}

      {question.explanation && (showAnswer || completed) && (
        <ExplanationDisplay>
          <Typography variant="body2" color="info.main">
            <strong>Explanation:</strong> {question.explanation}
          </Typography>
        </ExplanationDisplay>
      )}
    </QuestionContainer>
  );
};

export default QuizQuestion;