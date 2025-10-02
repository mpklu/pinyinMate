import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  LinearProgress,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Settings,
  Home,
} from '@mui/icons-material';
import { QuizContainer } from '../organisms/QuizContainer';
import type { Quiz } from '../../types/quiz';

export interface QuizPageProps {
  /** Quiz data to display */
  quiz: Quiz;
  /** Current question index */
  currentQuestionIndex?: number;
  /** Total number of questions */
  totalQuestions?: number;
  /** Quiz completion percentage (0-100) */
  progress?: number;
  /** Quiz category/topic */
  category?: string;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Whether to show quiz settings */
  showSettings?: boolean;
  /** Callback when quiz is completed */
  onQuizComplete?: (score: number, totalQuestions: number) => void;
  /** Callback when quiz is restarted */
  onQuizRestart?: () => void;
  /** Callback when navigating back */
  onNavigateBack?: () => void;
  /** Callback when navigating home */
  onNavigateHome?: () => void;
  /** Callback when opening settings */
  onOpenSettings?: () => void;
}

/**
 * QuizPage Template Component
 * 
 * A complete quiz-taking interface that combines the QuizContainer organism
 * with page layout, navigation, and progress tracking. Provides a full-screen
 * quiz experience with proper state management and user feedback.
 * 
 * Features:
 * - App bar with navigation and actions
 * - Progress tracking and visual indicators
 * - Quiz metadata display (category, difficulty)
 * - Full quiz container integration
 * - Responsive layout for all screen sizes
 * 
 * @param props - QuizPage component props
 * @returns JSX.Element
 */
export const QuizPage: React.FC<QuizPageProps> = ({
  quiz,
  currentQuestionIndex = 0,
  totalQuestions,
  progress = 0,
  category,
  difficulty = 'intermediate',
  showProgress = true,
  showSettings = true,
  onQuizComplete,
  onQuizRestart,
  onNavigateBack,
  onNavigateHome,
  onOpenSettings,
}) => {
  const [quizState, setQuizState] = useState({
    currentIndex: currentQuestionIndex,
    answers: new Map<string, string>(),
    score: 0,
    isCompleted: false,
  });

  // Calculate actual total questions from quiz data if not provided
  const actualTotalQuestions = totalQuestions || quiz.questions.length;
  
  // Calculate progress based on current question
  const actualProgress = showProgress 
    ? progress || Math.round((quizState.currentIndex / actualTotalQuestions) * 100)
    : 0;

  const handleQuizAnswer = useCallback((
    questionId: string, 
    correct: boolean, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _timeSpent: number
  ) => {
    setQuizState(prev => ({
      ...prev,
      answers: new Map(prev.answers).set(questionId, correct ? 'correct' : 'incorrect'),
    }));
  }, []);

  const handleQuizComplete = useCallback((results: import('../organisms/QuizContainer').QuizProgress) => {
    setQuizState(prev => ({
      ...prev,
      score: results.correctAnswers,
      isCompleted: true,
    }));
    
    onQuizComplete?.(results.correctAnswers, results.totalQuestions);
  }, [onQuizComplete]);

  const handleQuestionChange = useCallback((
    currentIndex: number, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _totalQuestions: number
  ) => {
    setQuizState(prev => ({
      ...prev,
      currentIndex,
    }));
  }, []);

  const handleQuizRestart = useCallback(() => {
    setQuizState({
      currentIndex: 0,
      answers: new Map(),
      score: 0,
      isCompleted: false,
    });
    
    onQuizRestart?.();
  }, [onQuizRestart]);

  // Get difficulty color
  const getDifficultyColor = (level: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onNavigateBack}
            aria-label="Go back"
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
            Quiz
          </Typography>

          {/* Action buttons */}
          <IconButton
            color="inherit"
            onClick={handleQuizRestart}
            aria-label="Restart quiz"
          >
            <Refresh />
          </IconButton>
          
          {showSettings && (
            <IconButton
              color="inherit"
              onClick={onOpenSettings}
              aria-label="Quiz settings"
            >
              <Settings />
            </IconButton>
          )}
          
          <IconButton
            color="inherit"
            onClick={onNavigateHome}
            aria-label="Go home"
          >
            <Home />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Progress Bar */}
      {showProgress && (
        <LinearProgress
          variant="determinate"
          value={actualProgress}
          sx={{ height: 4 }}
        />
      )}

      {/* Quiz Metadata */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {category && (
            <Chip
              label={category}
              size="small"
              variant="outlined"
            />
          )}
          
          <Chip
            label={difficulty}
            size="small"
            color={getDifficultyColor(difficulty)}
            variant="filled"
          />
          
          <Typography variant="body2" color="text.secondary">
            Question {quizState.currentIndex + 1} of {actualTotalQuestions}
          </Typography>
          
          {showProgress && (
            <Typography variant="body2" color="text.secondary">
              {actualProgress}% Complete
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Quiz Container */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <QuizContainer
          quiz={quiz}
          showProgress={false} // We handle progress at page level
          onQuestionAnswer={handleQuizAnswer}
          onQuizComplete={handleQuizComplete}
          onQuestionChange={handleQuestionChange}
        />
      </Box>
    </Box>
  );
};