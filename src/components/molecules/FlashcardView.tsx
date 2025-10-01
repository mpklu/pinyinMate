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
  Refresh as AgainIcon,
  ThumbUp as EasyIcon,
  RemoveRedEye as ShowIcon,
} from '@mui/icons-material';

import { ChineseText, AudioButton, DifficultyRating } from '../atoms';
import type { Flashcard } from '../../types/flashcard';
import { pinyinService } from '../../services/pinyinService';


interface FlashcardViewProps {
  /** The flashcard data */
  flashcard: Flashcard;
  /** Whether to show the back side initially */
  initialSide?: 'front' | 'back';
  /** Whether to show study controls (rating buttons) */
  showStudyControls?: boolean;


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
  transition: `transform ${animationDuration}ms ease-in-out, box-shadow 0.2s ease-in-out`,
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  cursor: 'pointer',
  
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: isFlipped ? 'rotateY(180deg) scale(1.02)' : 'rotateY(0deg) scale(1.02)',
  },
  
  '&:active': {
    transform: isFlipped ? 'rotateY(180deg) scale(0.98)' : 'rotateY(0deg) scale(0.98)',
  },
}));

const StyledCardSide = styled(CardContent, {
  shouldForwardProp: (prop) => prop !== 'side' && prop !== 'isFlipped',
})<{ side: 'front' | 'back'; isFlipped: boolean }>(({ theme, side, isFlipped }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.paper,
  
  // Use opacity instead of backfaceVisibility for more reliable hiding
  opacity: (side === 'front' && !isFlipped) || (side === 'back' && isFlipped) ? 1 : 0,
  pointerEvents: (side === 'front' && !isFlipped) || (side === 'back' && isFlipped) ? 'auto' : 'none',
  
  ...(side === 'back' && {
    transform: 'rotateY(180deg)',
  }),
}));



const StyledStudyControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
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
  const [generatedPinyin, setGeneratedPinyin] = useState<string | null>(null);
  const autoFlipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate pinyin if not provided in flashcard data
  React.useEffect(() => {
    const generatePinyinForFlashcard = async () => {
      if (!flashcard.back.pinyin && flashcard.front) {
        try {
          const pinyinResult = await pinyinService.generateToneMarks(flashcard.front);
          if (pinyinResult && pinyinResult.trim().length > 0) {
            setGeneratedPinyin(pinyinResult);
          }
        } catch (error) {
          console.warn('Failed to generate pinyin for flashcard:', error);
        }
      }
    };

    generatePinyinForFlashcard();
  }, [flashcard.front, flashcard.back.pinyin]);

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
        <StyledCardSide side="front" isFlipped={isShowingBack}>
          {/* TEST: This should only show on FRONT */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'red', color: 'white', padding: '5px', fontSize: '12px', zIndex: 1000 }}>
            FRONT SIDE
          </div>
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
        <StyledCardSide side="back" isFlipped={isShowingBack}>
          {/* TEST: This should only show on BACK */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'green', color: 'white', padding: '5px', fontSize: '12px', zIndex: 1000 }}>
            BACK SIDE
          </div>
          {/* Debug info - remove this later */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, fontSize: '10px', color: 'red' }}>
              Back: {JSON.stringify({
                hasPinyin: !!(flashcard.back.pinyin || generatedPinyin),
                hasDefinition: !!flashcard.back.definition,
                pinyinValue: flashcard.back.pinyin || generatedPinyin,
                definitionValue: flashcard.back.definition
              })}
            </Box>
          )}
          
          {/* Aligned Pinyin and Chinese Characters */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {/* Pinyin row */}
            {(flashcard.back.pinyin || generatedPinyin) ? (
              <Typography 
                variant={size === 'small' ? 'body2' : 'body1'}
                color="primary.main"
                sx={{ 
                  fontFamily: 'monospace',
                  fontWeight: 500,
                  letterSpacing: '0.5em',
                  mb: 0.5,
                  lineHeight: 1.2
                }}
              >
                {(flashcard.back.pinyin || generatedPinyin || '').split(' ').join('  ')}
              </Typography>
            ) : (
              <Typography variant="body2" color="warning.main" sx={{ mb: 0.5 }}>
                [Generating pinyin...]
              </Typography>
            )}
            
            {/* Chinese characters row */}
            <Typography
              variant={(() => {
                if (size === 'small') return 'h6';
                if (size === 'large') return 'h4';
                return 'h5';
              })()}
              sx={{
                fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
                fontWeight: 600,
                letterSpacing: '0.2em',
                color: 'text.primary'
              }}
            >
              {flashcard.front}
            </Typography>
            
            {/* Audio button */}
            <Box sx={{ mt: 1 }} data-no-flip>
              <AudioButton
                text={flashcard.front}
                audioUrl={flashcard.back.audioUrl}
                size="medium"
                onPlay={() => handleAudioPlay(flashcard.front)}
              />
            </Box>
          </Box>
          
          {/* Definition */}
          {flashcard.back.definition ? (
            <Typography 
              variant={size === 'small' ? 'body2' : 'body1'}
              color="text.primary"
              sx={{ mt: 2, textAlign: 'center', fontWeight: 500 }}
            >
              {flashcard.back.definition}
            </Typography>
          ) : (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}
            >
              [No definition available]
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



      {/* Study Controls */}
      {showStudyControls && isShowingBack && (
        <Fade in={isShowingBack} timeout={300}>
          <StyledStudyControls data-no-flip>
            <Tooltip title="Again - Show this card soon" arrow>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleStudyRating(1)}
              >
                <AgainIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Good - Normal interval" arrow>
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleStudyRating(3)}
              >
                <ShowIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Easy - Longer interval" arrow>
              <IconButton
                color="success"
                size="small"
                onClick={() => handleStudyRating(5)}
              >
                <EasyIcon />
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