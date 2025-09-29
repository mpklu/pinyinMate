/**
 * FlashcardDeck - Organism component
 * Interactive flashcard study interface with SRS
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Chip,
  styled,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Shuffle,
  Replay,
} from '@mui/icons-material';

import { FlashcardPreview } from '../molecules/FlashcardPreview';

import type { TextSegment } from '../../types/annotation';
import type { Flashcard } from '../../types/flashcard';

// Styled components
const DeckContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 500,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
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
  /** Deck title */
  title?: string;
  /** Show progress stats */
  showStats?: boolean;
  /** Enable shuffle mode */
  allowShuffle?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when card is studied */
  onCardStudied?: (cardId: string, correct: boolean) => void;
  /** Callback when deck is completed */
  onDeckComplete?: (stats: { total: number; correct: number; accuracy: number }) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  segments,
  flashcards: initialFlashcards,
  title,
  showStats = true,
  allowShuffle = true,
  className,
  onCardStudied,
  onDeckComplete,
}) => {
  // Generate flashcards from segments if not provided
  const generateFlashcards = useCallback((): StudyFlashcard[] => {
    return segments.map((segment, index) => ({
      id: `card_${segment.id || index}`,
      front: segment.text,
      back: {
        pinyin: segment.toneMarks || segment.pinyin,
        definition: segment.definition,
        example: `Example with ${segment.text}`,
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

  // Convert initial flashcards to study format
  const convertToStudyCards = useCallback((cards: Flashcard[]): StudyFlashcard[] => {
    return cards.map(card => ({
      ...card,
      studied: false,
    }));
  }, []);

  // State
  const [flashcards, setFlashcards] = useState<StudyFlashcard[]>(
    initialFlashcards ? convertToStudyCards(initialFlashcards) : generateFlashcards()
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);

  // Handle card study (correct/incorrect)
  const handleCardStudy = useCallback((correct: boolean) => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    // Update flashcard state
    setFlashcards(prev => prev.map((card, index) => 
      index === currentIndex 
        ? { ...card, studied: true, correct }
        : card
    ));

    // Notify parent
    onCardStudied?.(currentCard.id, correct);

    // Move to next card
    const nextIndex = currentIndex + 1;
    if (nextIndex >= flashcards.length) {
      // Deck completed
      const updatedCards = flashcards.map((card, index) => 
        index === currentIndex 
          ? { ...card, studied: true, correct }
          : card
      );
      const correctCount = updatedCards.filter(card => card.correct).length;
      const accuracy = (correctCount / updatedCards.length) * 100;
      
      setStudyComplete(true);
      onDeckComplete?.({
        total: updatedCards.length,
        correct: correctCount,
        accuracy,
      });
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [flashcards, currentIndex, onCardStudied, onDeckComplete]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(flashcards.length - 1, prev + 1));
  }, [flashcards.length]);

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
  }, [flashcards]);

  // Update flashcards when segments change
  useEffect(() => {
    if (!initialFlashcards && segments.length > 0) {
      setFlashcards(generateFlashcards());
      setCurrentIndex(0);
      setStudyComplete(false);
    }
  }, [segments, initialFlashcards, generateFlashcards]);

  // Calculate stats
  const studiedCards = flashcards.filter(card => card.studied);
  const correctCards = flashcards.filter(card => card.correct);
  const accuracy = studiedCards.length > 0 
    ? (correctCards.length / studiedCards.length) * 100 
    : 0;

  const currentCard = flashcards[currentIndex];

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
            <FlashcardPreview
              flashcard={currentCard}
              interactive
              onClick={() => {}} // placeholder for flip functionality
            />
          )}
          
          {/* Study buttons */}
          {currentCard && (
            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleCardStudy(false)}
                size="large"
              >
                Incorrect
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleCardStudy(true)}
                size="large"
              >
                Correct
              </Button>
            </Stack>
          )}
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
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              onClick={handlePrevious} 
              disabled={currentIndex === 0}
              size="small"
            >
              <NavigateBefore />
            </IconButton>
            
            <IconButton 
              onClick={handleNext} 
              disabled={currentIndex === flashcards.length - 1}
              size="small"
            >
              <NavigateNext />
            </IconButton>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {allowShuffle && (
              <IconButton 
                onClick={handleShuffle}
                size="small"
                color={isShuffled ? 'primary' : 'default'}
              >
                <Shuffle />
              </IconButton>
            )}
            
            <IconButton 
              onClick={handleReset}
              size="small"
            >
              <Replay />
            </IconButton>
          </Box>
        </NavigationBar>
      )}
    </DeckContainer>
  );
};