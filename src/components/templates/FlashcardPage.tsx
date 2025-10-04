import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Fab,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Settings,
  Home,
  School,
  PlayArrow,
  Pause,
} from '@mui/icons-material';
import { FlashcardDeck } from '../organisms/FlashcardDeck';
import type { Flashcard } from '../../types/flashcard';
import type { TextSegment } from '../../types/annotation';

export interface FlashcardPageProps {
  /** Segments to create flashcards from */
  segments: TextSegment[];
  /** Pre-generated flashcards (optional) */
  flashcards?: Flashcard[];
  /** Study session progress (0-100) */
  progress?: number;
  /** Study deck title */
  deckTitle?: string;
  /** Study session type */
  sessionType?: 'new' | 'review' | 'mixed';
  /** Cards remaining in session */
  cardsRemaining?: number;
  /** Cards mastered in session */
  cardsMastered?: number;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Whether to show session stats */
  showStats?: boolean;
  /** Whether session is active/paused */
  isActive?: boolean;
  /** Study timer in seconds */
  studyTime?: number;

  /** Callback when flashcard is answered */
  onCardAnswer?: (cardId: string, difficulty: 'again' | 'hard' | 'good' | 'easy') => void;
  /** Callback when study session completes */
  onSessionComplete?: (stats: StudySessionStats) => void;
  /** Callback when session is paused/resumed */
  onSessionToggle?: (isActive: boolean) => void;
  /** Callback when session is restarted */
  onSessionRestart?: () => void;
  /** Callback when navigating back */
  onNavigateBack?: () => void;
  /** Callback when navigating home */
  onNavigateHome?: () => void;
  /** Callback when opening settings */
  onOpenSettings?: () => void;
}

export interface StudySessionStats {
  totalCards: number;
  cardsStudied: number;
  cardsMastered: number;
  cardsReviewed: number;
  studyTime: number;
  accuracy: number;
}

/**
 * FlashcardPage Template Component
 * 
 * A complete flashcard study interface that combines the FlashcardDeck organism
 * with page layout, session management, and study progress tracking. Provides
 * a focused study experience with SRS (Spaced Repetition System) integration.
 * 
 * Features:
 * - App bar with session controls and navigation
 * - Study progress tracking and timing
 * - Session statistics and performance metrics
 * - Full flashcard deck integration
 * - Study session pause/resume functionality
 * - Responsive layout optimized for study sessions
 * 
 * @param props - FlashcardPage component props
 * @returns JSX.Element
 */
export const FlashcardPage: React.FC<FlashcardPageProps> = ({
  segments,
  flashcards,
  progress = 0,
  deckTitle = 'Study Deck',
  sessionType = 'mixed',
  cardsRemaining,
  cardsMastered = 0,
  showProgress = true,
  showStats = true,
  isActive = true,
  studyTime = 0,

  onCardAnswer,
  onSessionComplete,
  onSessionToggle,
  onSessionRestart,
  onNavigateBack,
  onNavigateHome,
  onOpenSettings,
}) => {
  const navigate = useNavigate();
  
  // Handle navigation internally if no props provided
  const handleNavigateHome = useCallback(() => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
    }
  }, [onNavigateHome, navigate]);

  const handleNavigateBack = useCallback(() => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate(-1);
    }
  }, [onNavigateBack, navigate]);
  const [sessionState, setSessionState] = useState({
    studiedCards: new Set<string>(),
    masteredCards: new Set<string>(),
    sessionStartTime: Date.now(),
    isPaused: !isActive,
  });

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Calculate session statistics
  const totalCards = segments.length;
  const actualCardsRemaining = cardsRemaining ?? (totalCards - sessionState.studiedCards.size);
  const actualProgress = showProgress 
    ? progress || Math.round((sessionState.studiedCards.size / totalCards) * 100)
    : 0;

  // Format study time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardStudied = useCallback((cardId: string, correct: boolean) => {
    setSessionState(prev => {
      const newStudiedCards = new Set(prev.studiedCards).add(cardId);
      const newMasteredCards = correct 
        ? new Set(prev.masteredCards).add(cardId)
        : prev.masteredCards;
      
      return {
        ...prev,
        studiedCards: newStudiedCards,
        masteredCards: newMasteredCards,
      };
    });

    // Convert correct boolean to difficulty rating for backward compatibility
    const difficulty = correct ? 'good' : 'again';
    onCardAnswer?.(cardId, difficulty);
  }, [onCardAnswer]);

  const handleSessionToggle = useCallback(() => {
    const newIsActive = !sessionState.isPaused;
    setSessionState(prev => ({ ...prev, isPaused: !newIsActive }));
    onSessionToggle?.(newIsActive);
  }, [sessionState.isPaused, onSessionToggle]);

  const handleSessionRestart = useCallback(() => {
    setSessionState({
      studiedCards: new Set(),
      masteredCards: new Set(),
      sessionStartTime: Date.now(),
      isPaused: false,
    });
    onSessionRestart?.();
  }, [onSessionRestart]);

  // Settings handlers
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
    onOpenSettings?.();
  }, [onOpenSettings]);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleDeckComplete = useCallback((stats: { total: number; correct: number; accuracy: number }) => {
    const sessionStats: StudySessionStats = {
      totalCards: stats.total,
      cardsStudied: stats.total,
      cardsMastered: stats.correct,
      cardsReviewed: stats.total,
      studyTime: studyTime || Math.floor((Date.now() - sessionState.sessionStartTime) / 1000),
      accuracy: stats.accuracy,
    };
    onSessionComplete?.(sessionStats);
  }, [sessionState.sessionStartTime, studyTime, onSessionComplete]);

  // Get session type color and label
  const getSessionTypeProps = (type: string) => {
    switch (type) {
      case 'new': return { color: 'primary' as const, label: 'New Cards' };
      case 'review': return { color: 'secondary' as const, label: 'Review' };
      case 'mixed': return { color: 'info' as const, label: 'Mixed Study' };
      default: return { color: 'default' as const, label: 'Study' };
    }
  };

  const sessionTypeProps = getSessionTypeProps(sessionType);

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleNavigateBack}
            aria-label="Go back"
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
            {deckTitle}
          </Typography>

          {/* Study timer */}
          {showStats && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {formatTime(studyTime)}
            </Typography>
          )}

          {/* Session controls */}
          <IconButton
            color="inherit"
            onClick={handleSessionToggle}
            aria-label={sessionState.isPaused ? 'Resume study' : 'Pause study'}
          >
            {sessionState.isPaused ? <PlayArrow /> : <Pause />}
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleSessionRestart}
            aria-label="Restart session"
          >
            <Refresh />
          </IconButton>
          
          {showStats && (
            <IconButton
              color="inherit"
              onClick={handleOpenSettings}
              aria-label="Study settings"
            >
              <Settings />
            </IconButton>
          )}
          
          <IconButton
            color="inherit"
            onClick={handleNavigateHome}
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

      {/* Session Statistics */}
      {showStats && (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={sessionTypeProps.label}
                size="small"
                color={sessionTypeProps.color}
                variant="filled"
              />
              
              <Typography variant="body2" color="text.secondary">
                {sessionState.studiedCards.size} / {totalCards} studied
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Badge badgeContent={cardsMastered} color="success">
                <School fontSize="small" />
              </Badge>
              
              {actualCardsRemaining > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {actualCardsRemaining} remaining
                </Typography>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Flashcard Deck */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        <FlashcardDeck
          segments={segments}
          flashcards={flashcards}
          title={deckTitle}
          showStats={showStats}
          allowShuffle={true}
          settingsOpen={settingsOpen}
          onCloseSettings={handleCloseSettings}
        />        {/* Floating Study Indicator */}
        <Fab
          size="small"
          color={sessionState.isPaused ? 'secondary' : 'primary'}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            opacity: 0.8,
          }}
          onClick={handleSessionToggle}
        >
          {sessionState.isPaused ? <PlayArrow /> : <Pause />}
        </Fab>
      </Box>
    </Box>
  );
};