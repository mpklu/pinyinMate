/**
 * FlashcardDeck - Organism component
 * Interactive flashcard study interface with SRS
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Chip,
  styled,
  Drawer,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Shuffle,
  Replay,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

import FlashcardView from '../molecules/FlashcardView';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';

import type { TextSegment, TextAnnotation } from '../../types/annotation';
import type { Flashcard, FlashcardGenerateRequest } from '../../types/flashcard';

// Styled components
const DeckContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: 'calc(100vh - 160px)', // Full height minus margins
  margin: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(3),
  },
}));

const CardContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const NavigationBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  minHeight: '64px',
}));

const NavigationSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flex: 1,
  '&.center': {
    justifyContent: 'center',
  },
  '&.right': {
    justifyContent: 'flex-end',
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

// Extended flashcard for study session
interface StudyFlashcard extends Flashcard {
  studied: boolean;
  correct?: boolean;
}

export interface FlashcardDeckProps {
  /** Segments to create flashcards from */
  segments: TextSegment[];
  /** Pre-generated flashcards */
  flashcards?: Flashcard[];
  /** Source annotation for advanced flashcard generation */
  sourceAnnotation?: TextAnnotation;
  /** Flashcard generation options */
  generationOptions?: Partial<FlashcardGenerateRequest>;
  /** Deck title */
  title?: string;
  /** Show progress stats */
  showStats?: boolean;
  /** Enable shuffle mode */
  allowShuffle?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Settings drawer open state */
  settingsOpen?: boolean;
  /** Callback when settings drawer should be closed */
  onCloseSettings?: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  segments,
  flashcards: initialFlashcards,
  sourceAnnotation,
  generationOptions,
  title,
  showStats = true,
  allowShuffle = true,
  className,
  settingsOpen = false,
  onCloseSettings,
}) => {
  // State for async flashcard generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Fallback simple flashcard generation from segments
  const generateSimpleFlashcards = useCallback((): StudyFlashcard[] => {
    return segments.map((segment, index) => ({
      id: `card_${segment.id || index}`,
      front: segment.text,
      back: {
        pinyin: segment.toneMarks || segment.pinyin,
        definition: segment.definition,
        example: segment.definition ? `Example with ${segment.text}` : undefined,
      },
      sourceSegmentId: segment.id,
      srsData: {
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date(),
        totalReviews: 0,
      },
      tags: ['study', 'vocabulary'],
      createdAt: new Date(),
      studied: false,
    }));
  }, [segments]);

  // Generate flashcards using SRS service if annotation is provided
  const generateFlashcardsFromAnnotation = useCallback(async (): Promise<StudyFlashcard[]> => {
    if (!sourceAnnotation) {
      return generateSimpleFlashcards();
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);

      // Dynamic import for code splitting
      const { generateFlashcards } = await import('../../services/srsService');

      const request: FlashcardGenerateRequest = {
        sourceAnnotationId: sourceAnnotation.id,
        includeDefinitions: true,
        includeExamples: false,
        cardLimit: 20,
        difficulty: 'intermediate',
        tags: ['vocabulary', 'study'],
        ...generationOptions,
      };

      const response = await generateFlashcards(request, sourceAnnotation);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate flashcards');
      }

      return response.data!.deck.cards.map(card => ({
        ...card,
        studied: false,
      }));

    } catch (error) {
      console.error('Flashcard generation failed:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
      return generateSimpleFlashcards();
    } finally {
      setIsGenerating(false);
    }
  }, [sourceAnnotation, generationOptions, generateSimpleFlashcards]);

  // Convert initial flashcards to study format
  const convertToStudyCards = useCallback((cards: Flashcard[]): StudyFlashcard[] => {
    return cards.map(card => ({
      ...card,
      studied: false,
    }));
  }, []);

  // State
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  
  // Auto-play state
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayTime, setAutoPlayTime] = useState(5); // seconds
  const [autoPlayProgress, setAutoPlayProgress] = useState(0); // 0-100 progress
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Settings state
  const [tempAutoPlayTime, setTempAutoPlayTime] = useState(autoPlayTime);

  // Initialize flashcards
  useEffect(() => {
    const initializeFlashcards = async () => {
      if (initialFlashcards) {
        setFlashcards(convertToStudyCards(initialFlashcards));
      } else if (sourceAnnotation) {
        const generatedCards = await generateFlashcardsFromAnnotation();
        setFlashcards(generatedCards);
      } else {
        setFlashcards(generateSimpleFlashcards());
      }
    };

    initializeFlashcards();
  }, [initialFlashcards, sourceAnnotation, generateFlashcardsFromAnnotation, generateSimpleFlashcards, convertToStudyCards]);

  // Auto-play timer effect with progress tracking
  useEffect(() => {
    if (isAutoPlay && !studyComplete && flashcards.length > 0) {
      // Reset progress
      setAutoPlayProgress(0);
      
      // Progress update interval (update every 100ms for smooth animation)
      const progressInterval = 100;
      const totalTime = autoPlayTime * 1000;
      const progressStep = (progressInterval / totalTime) * 100;
      
      // Progress timer - extracted to reduce nesting
      let currentProgress = 0;
      
      const updateProgress = () => {
        currentProgress += progressStep;
        
        if (currentProgress >= 100) {
          // Time to advance to next card
          if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            // Stop auto-play at the end
            setIsAutoPlay(false);
          }
          setAutoPlayProgress(0); // Reset for next card
        } else {
          setAutoPlayProgress(currentProgress);
          progressTimerRef.current = setTimeout(updateProgress, progressInterval);
        }
      };
      
      // Start progress tracking
      progressTimerRef.current = setTimeout(updateProgress, progressInterval);
    } else {
      // Reset progress when auto-play is off
      setAutoPlayProgress(0);
    }

    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isAutoPlay, currentIndex, flashcards.length, autoPlayTime, studyComplete]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, []);

  // Navigation handlers - pause auto-play on manual interaction
  const handlePrevious = useCallback(() => {
    // Pause auto-play and reset progress on manual navigation
    if (isAutoPlay) {
      setIsAutoPlay(false);
      setAutoPlayProgress(0);
    }
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, [isAutoPlay]);

  const handleNext = useCallback(() => {
    // Pause auto-play and reset progress on manual navigation  
    if (isAutoPlay) {
      setIsAutoPlay(false);
      setAutoPlayProgress(0);
    }
    setCurrentIndex(prev => Math.min(flashcards.length - 1, prev + 1));
  }, [flashcards.length, isAutoPlay]);

  // Shuffle deck
  const handleShuffle = useCallback(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsShuffled(!isShuffled);
  }, [flashcards, isShuffled]);

  // Reset deck
  const handleReset = useCallback(() => {
    const resetCards = flashcards.map(card => ({
      ...card,
      studied: false,
      correct: undefined,
    }));
    setFlashcards(resetCards);
    setCurrentIndex(0);
    setStudyComplete(false);
    setIsAutoPlay(false); // Stop auto-play on reset
    setAutoPlayProgress(0); // Reset progress
  }, [flashcards]);

  // Auto-play toggle handler
  const handleAutoPlayToggle = useCallback(() => {
    setIsAutoPlay(prev => {
      const newAutoPlay = !prev;
      if (!newAutoPlay) {
        setAutoPlayProgress(0); // Reset progress when stopping
      }
      return newAutoPlay;
    });
  }, []);

  // Settings handlers
  const handleSettingsSave = useCallback(() => {
    setAutoPlayTime(tempAutoPlayTime);
    if (onCloseSettings) {
      onCloseSettings();
    }
  }, [tempAutoPlayTime, onCloseSettings]);

  const handleSettingsCancel = useCallback(() => {
    setTempAutoPlayTime(autoPlayTime); // Reset to current value
    if (onCloseSettings) {
      onCloseSettings();
    }
  }, [autoPlayTime, onCloseSettings]);

  // This useEffect is removed - flashcard initialization is now handled above

  // Calculate stats
  const studiedCards = flashcards.filter(card => card.studied);
  const correctCards = flashcards.filter(card => card.correct);
  const accuracy = studiedCards.length > 0 
    ? (correctCards.length / studiedCards.length) * 100 
    : 0;

  const currentCard = flashcards[currentIndex];

  // Loading state
  if (isGenerating) {
    return (
      <DeckContainer className={className}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={6}
        >
          <LoadingSpinner size="large" />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Generating flashcards...
          </Typography>
        </Box>
      </DeckContainer>
    );
  }

  // Error state
  if (generationError) {
    return (
      <DeckContainer className={className}>
        <ErrorMessage 
          message={`Failed to generate flashcards: ${generationError}`}
          severity="warning"
        />
        {flashcards.length > 0 && (
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Using fallback flashcards from segments.
          </Typography>
        )}
      </DeckContainer>
    );
  }

  if (flashcards.length === 0) {
    return (
      <DeckContainer className={className}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={6}
          color="text.secondary"
        >
          <Typography variant="h6" gutterBottom>
            No Flashcards Available
          </Typography>
          <Typography variant="body1" align="center">
            Add text segments to create flashcards for study.
          </Typography>
        </Box>
      </DeckContainer>
    );
  }

  return (
    <DeckContainer className={className}>
      {/* Header */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {title || 'Flashcard Study'}
        </Typography>
        
        {showStats && (
          <StatsContainer>
            <Chip 
              label={`${currentIndex + 1} / ${flashcards.length}`}
              size="small"
              variant="outlined"
            />
            {studiedCards.length > 0 && (
              <>
                <Chip 
                  label={`${studiedCards.length} studied`}
                  size="small"
                  color="primary"
                />
                <Chip 
                  label={`${Math.round(accuracy)}% accuracy`}
                  size="small"
                  color={accuracy >= 70 ? 'success' : 'default'}
                />
              </>
            )}
            {isShuffled && (
              <Chip 
                label="Shuffled"
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </StatsContainer>
        )}
      </Box>

      {/* Card Container */}
      {!studyComplete ? (
        <CardContainer>
          {currentCard && (
            <FlashcardView
              flashcard={currentCard}
              showStudyControls={false}
              size="large"
              onAudioPlay={(text: string) => {
                // Audio playback is handled by AudioButton internally
                // This callback is just for notification/analytics
                console.log('Audio playback started for:', text);
              }}
            />
          )}
          
          {/* Card will auto-advance after flip or user can navigate manually */}
        </CardContainer>
      ) : (
        /* Study Complete */
        <Box textAlign="center" py={4}>
          <Typography variant="h5" color="primary" gutterBottom>
            Study Session Complete!
          </Typography>
          
          <Box my={3}>
            <Typography variant="h3" component="div" color="success.main">
              {Math.round(accuracy)}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {correctCards.length} out of {flashcards.length} correct
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={handleReset}
              size="large"
            >
              Study Again
            </Button>
          </Stack>
        </Box>
      )}

      {/* Navigation */}
      {!studyComplete && (
        <NavigationBar>
          {/* Left: Auto-play toggle */}
          <NavigationSection>
            <Tooltip title={isAutoPlay ? `Pause auto-play (${Math.ceil((100 - autoPlayProgress) * autoPlayTime / 100)}s remaining)` : 'Start auto-play'}>
              <Box sx={{ 
                position: 'relative', 
                display: 'inline-flex',
                width: 40,
                height: 40,
              }}>
                <IconButton 
                  onClick={handleAutoPlayToggle}
                  size="small"
                  color={isAutoPlay ? 'primary' : 'default'}
                  sx={{
                    width: 40,
                    height: 40,
                  }}
                >
                  {isAutoPlay ? <Pause /> : <PlayArrow />}
                </IconButton>
                <CircularProgress
                  variant="determinate"
                  value={autoPlayProgress}
                  size={40}
                  thickness={3}
                  sx={{
                    position: 'absolute',
                    top: 1.5,
                    left: 1.5,
                    color: isAutoPlay ? 'primary.main' : 'grey.300',
                    opacity: isAutoPlay ? 1 : 0.3,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none', // Ensure clicks go through to button
                  }}
                />
              </Box>
            </Tooltip>
          </NavigationSection>

          {/* Center: Navigation buttons */}
          <NavigationSection className="center">
            <Tooltip title="Previous card">
              <IconButton 
                onClick={handlePrevious} 
                disabled={currentIndex === 0}
                size="small"
              >
                <NavigateBefore />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Next card">
              <IconButton 
                onClick={handleNext} 
                disabled={currentIndex === flashcards.length - 1}
                size="small"
              >
                <NavigateNext />
              </IconButton>
            </Tooltip>
          </NavigationSection>

          {/* Right: Shuffle and Reset */}
          <NavigationSection className="right">
            {allowShuffle && (
              <Tooltip title={isShuffled ? 'Cards are shuffled' : 'Shuffle deck'}>
                <IconButton 
                  onClick={handleShuffle}
                  size="small"
                  color={isShuffled ? 'primary' : 'default'}
                >
                  <Shuffle />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Reset deck">
              <IconButton 
                onClick={handleReset}
                size="small"
              >
                <Replay />
              </IconButton>
            </Tooltip>
          </NavigationSection>
        </NavigationBar>
      )}

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={handleSettingsCancel}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Flashcard Settings
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Auto-play Settings
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Time per card (seconds)
            </Typography>
            
            <Slider
              value={tempAutoPlayTime}
              onChange={(_, value) => setTempAutoPlayTime(Array.isArray(value) ? value[0] : value)}
              min={1}
              max={30}
              step={1}
              marks={[
                { value: 1, label: '1s' },
                { value: 5, label: '5s' },
                { value: 10, label: '10s' },
                { value: 15, label: '15s' },
                { value: 30, label: '30s' },
              ]}
              valueLabelDisplay="on"
              sx={{ mb: 2 }}
            />
            
            <TextField
              type="number"
              label="Seconds"
              value={tempAutoPlayTime}
              onChange={(e) => setTempAutoPlayTime(Math.max(1, Math.min(30, Number(e.target.value))))}
              slotProps={{
                htmlInput: { min: 1, max: 30 }
              }}
              size="small"
              fullWidth
            />
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={isAutoPlay}
                onChange={(e) => setIsAutoPlay(e.target.checked)}
                color="primary"
              />
            }
            label="Auto-play enabled"
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleSettingsCancel} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSettingsSave} variant="contained">
              Save
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </DeckContainer>
  );
};