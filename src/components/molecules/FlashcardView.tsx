/**
 * FlashcardView component (front/back flip)
 * Interactive flashcard with flip animation and study controls
 */

import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  IconButton,
  Tooltip,
  Chip,
  Fade,
} from '@mui/material';
import { 
  Flip as FlipIcon,

  Check as CorrectIcon,
  Clear as IncorrectIcon,
  Help as HintIcon,
} from '@mui/icons-material';

import { ChineseText, PinyinText, AudioButton, DifficultyRating } from '../atoms';
import type { Flashcard } from '../../types/flashcard';


interface FlashcardViewProps {
  /** The flashcard data */
  flashcard: Flashcard;
  /** Whether to show the back side initially */
  initialSide?: 'front' | 'back';
  /** Whether to show study controls (rating buttons) */
  showStudyControls?: boolean;
  /** Whether to show audio button */
  showAudio?: boolean;
  /** Whether to show flip button */
  showFlipButton?: boolean;
  /** Whether to show difficulty rating */
  showDifficulty?: boolean;
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Auto-flip after delay (in seconds, 0 to disable) */
  autoFlipDelay?: number;
  /** Callback when card is flipped */
  onFlip?: (side: 'front' | 'back') => void;
  /** Callback when study rating is given */
  onStudyRating?: (rating: number) => void;
  /** Callback when audio is played */
  onAudioPlay?: (text: string) => void;
}



const StyledFlashcardContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'cardSize',
})<{ cardSize?: 'small' | 'medium' | 'large' }>(({ cardSize = 'medium' }) => {
  const sizeMap = {
    small: { width: 240, height: 160 },
    medium: { width: 320, height: 200 },
    large: { width: 400, height: 250 },
  };
  
  const { width, height } = sizeMap[cardSize];
  
  return {
    perspective: '1000px',
    width,
    height,
    margin: 'auto',
    position: 'relative',
  };
});

const StyledFlipCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isFlipped' && prop !== 'animationDuration',
})<{ isFlipped: boolean; animationDuration: number }>(({ theme, isFlipped, animationDuration }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: `transform ${animationDuration}ms ease-in-out`,
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  cursor: 'pointer',
  
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StyledCardSide = styled(CardContent, {
  shouldForwardProp: (prop) => prop !== 'side',
})<{ side: 'front' | 'back' }>(({ theme, side }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  
  ...(side === 'back' && {
    transform: 'rotateY(180deg)',
  }),
}));

const StyledControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  backdropFilter: 'blur(4px)',
}));

const StyledStudyControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1),
  backdropFilter: 'blur(4px)',
}));

const StyledTagsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  maxWidth: '60%',
}));

/**
 * Flashcard view component with flip animation
 */
const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  initialSide = 'front',
  showStudyControls = true,
  showAudio = true,
  showFlipButton = true,
  showDifficulty = false,
  size = 'medium',
  animationDuration = 600,
  autoFlipDelay = 0,
  onFlip,
  onStudyRating,
  onAudioPlay,
}) => {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(initialSide);
  const [isFlipping, setIsFlipping] = useState(false);
  const autoFlipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFlip = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    const newSide = currentSide === 'front' ? 'back' : 'front';
    
    setTimeout(() => {
      setCurrentSide(newSide);
      setIsFlipping(false);
      onFlip?.(newSide);
    }, animationDuration / 2);
    
    // Clear any existing auto-flip timeout
    if (autoFlipTimeoutRef.current) {
      clearTimeout(autoFlipTimeoutRef.current);
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    // Don't flip if clicking on controls
    const target = event.target as HTMLElement;
    if (target.closest('[data-no-flip]')) {
      return;
    }
    handleFlip();
  };

  const handleStudyRating = (rating: number) => {
    onStudyRating?.(rating);
  };

  const handleAudioPlay = (text: string) => {
    onAudioPlay?.(text);
  };

  // Set up auto-flip
  React.useEffect(() => {
    if (autoFlipDelay > 0 && currentSide === 'front') {
      autoFlipTimeoutRef.current = setTimeout(() => {
        handleFlip();
      }, autoFlipDelay * 1000);
    }
    
    return () => {
      if (autoFlipTimeoutRef.current) {
        clearTimeout(autoFlipTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSide, autoFlipDelay]);

  const isShowingBack = currentSide === 'back';

  return (
    <StyledFlashcardContainer cardSize={size}>
      <StyledFlipCard
        isFlipped={isShowingBack}
        animationDuration={animationDuration}
        onClick={handleCardClick}
        elevation={4}
      >
        {/* Front Side */}
        <StyledCardSide side="front">
          {/* Tags */}
          {flashcard.tags && flashcard.tags.length > 0 && (
            <StyledTagsContainer>
              {flashcard.tags.slice(0, 3).map((tag) => (
                <Chip 
                  key={tag}
                  label={tag} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
              ))}
            </StyledTagsContainer>
          )}
          
          {/* Chinese Text */}
          <ChineseText
            text={flashcard.front}
            showToneColors={true}
            variant={(() => {
              if (size === 'small') return 'h6';
              if (size === 'large') return 'h4';
              return 'h5';
            })()}
          />
          
          {/* Question prompt for front */}
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: 2, fontStyle: 'italic' }}
          >
            What is the pronunciation and meaning?
          </Typography>
        </StyledCardSide>

        {/* Back Side */}
        <StyledCardSide side="back">
          {/* Pinyin */}
          {flashcard.back.pinyin && (
            <PinyinText
              pinyin={flashcard.back.pinyin}
              showToneMarks={true}
              initiallyVisible={true}
              showToggle={false}
              size={size === 'small' ? 'medium' : 'large'}
              color="primary"
            />
          )}
          
          {/* Definition */}
          {flashcard.back.definition && (
            <Typography 
              variant={size === 'small' ? 'body2' : 'body1'}
              color="text.primary"
              sx={{ mt: 1, mb: 1 }}
            >
              {flashcard.back.definition}
            </Typography>
          )}
          
          {/* Example */}
          {flashcard.back.example && (
            <Typography 
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: 'italic', textAlign: 'center' }}
            >
              Example: {flashcard.back.example}
            </Typography>
          )}
          
          {/* Difficulty Rating */}
          {showDifficulty && flashcard.srsData && (
            <Box sx={{ mt: 2 }}>
              <DifficultyRating
                value={3} // Could be calculated from SRS data
                readOnly={true}
                size="small"
                variant="stars"
                showLabel={false}
              />
            </Box>
          )}
        </StyledCardSide>
      </StyledFlipCard>

      {/* Card Controls */}
      <StyledControlsContainer data-no-flip>
        {showFlipButton && (
          <Tooltip title="Flip card" arrow>
            <IconButton
              size="small"
              onClick={handleFlip}
              disabled={isFlipping}
            >
              <FlipIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {showAudio && (flashcard.back.audioUrl || flashcard.front) && (
          <AudioButton
            text={flashcard.front}
            audioUrl={flashcard.back.audioUrl}
            size="small"
            onPlay={() => handleAudioPlay(flashcard.front)}
          />
        )}
      </StyledControlsContainer>

      {/* Study Controls */}
      {showStudyControls && isShowingBack && (
        <Fade in={isShowingBack} timeout={300}>
          <StyledStudyControls data-no-flip>
            <Tooltip title="Again (Hard)" arrow>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleStudyRating(1)}
              >
                <IncorrectIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Good (Normal)" arrow>
              <IconButton
                color="info"
                size="small"
                onClick={() => handleStudyRating(3)}
              >
                <HintIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Easy (Perfect)" arrow>
              <IconButton
                color="success"
                size="small"
                onClick={() => handleStudyRating(5)}
              >
                <CorrectIcon />
              </IconButton>
            </Tooltip>
          </StyledStudyControls>
        </Fade>
      )}
    </StyledFlashcardContainer>
  );
};

export default FlashcardView;
export type { FlashcardViewProps };