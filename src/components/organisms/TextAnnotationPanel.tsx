/**
 * TextAnnotationPanel - Organism component
 * Main interface for Chinese text annotation and segmentation
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Chip,
  Button,
  styled,
} from '@mui/material';

import { TextInput } from '../molecules/TextInput';
import { SegmentDisplay } from '../molecules/SegmentDisplay';
import { AudioPlayer } from '../molecules/AudioPlayer';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';

import { textSegmentationService } from '../../services/textSegmentationService';
import { pinyinService } from '../../services/pinyinService';

import type { TextSegment } from '../../types/annotation';

// Define AnnotationResult type
export interface AnnotationResult {
  originalText: string;
  segments: TextSegment[];
  metadata: {
    processingTime: number;
    segmentCount: number;
    characterCount: number;
  };
}

// Styled components
const PanelContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SegmentContainer = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflowY: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

export interface TextAnnotationPanelProps {
  /** Initial text to load */
  initialText?: string;
  /** Show audio controls */
  showAudio?: boolean;
  /** Show pinyin annotations */
  showPinyin?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when text is processed */
  onTextProcessed?: (result: AnnotationResult) => void;
  /** Callback when segments are selected */
  onSegmentsSelected?: (segments: TextSegment[]) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export const TextAnnotationPanel: React.FC<TextAnnotationPanelProps> = ({
  initialText = '',
  showAudio = true,
  showPinyin = true,
  className,
  onTextProcessed,
  onSegmentsSelected,
  onError,
}) => {
  // State
  const [inputText, setInputText] = useState(initialText);
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<TextSegment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCharacters: 0,
    uniqueWords: 0,
    segments: 0,
  });

  // Process text into segments
  const processText = useCallback(async (text: string) => {
    if (!text.trim()) {
      setSegments([]);
      setStats({ totalCharacters: 0, uniqueWords: 0, segments: 0 });
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Segment the text
      const rawSegments = await textSegmentationService.segment(text.trim());
      
      if (!rawSegments || rawSegments.length === 0) {
        throw new Error('Failed to segment text');
      }

      // Create text segments
      let processedSegments = textSegmentationService.createSegments(text.trim(), rawSegments);

      // Add pinyin if enabled
      if (showPinyin) {
        processedSegments = await pinyinService.enrichSegments(processedSegments);
      }

      // Update state
      setSegments(processedSegments);
      
      // Calculate stats
      const uniqueWords = new Set(processedSegments.map(s => s.text.trim())).size;
      const newStats = {
        totalCharacters: text.length,
        uniqueWords,
        segments: processedSegments.length,
      };
      setStats(newStats);

      // Create annotation result
      const result: AnnotationResult = {
        originalText: text,
        segments: processedSegments,
        metadata: {
          processingTime: Date.now(),
          segmentCount: processedSegments.length,
          characterCount: text.length,
        },
      };

      onTextProcessed?.(result);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process text');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  }, [showPinyin, onTextProcessed, onError]);

  // Handle text input change
  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
  }, []);



  // Handle segment selection
  const handleSegmentClick = useCallback((segment: TextSegment) => {
    setSelectedSegments(prev => {
      const isSelected = prev.some(s => s.id === segment.id);
      let newSelection: TextSegment[];
      
      if (isSelected) {
        newSelection = prev.filter(s => s.id !== segment.id);
      } else {
        newSelection = [...prev, segment];
      }
      
      onSegmentsSelected?.(newSelection);
      return newSelection;
    });
  }, [onSegmentsSelected]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (inputText.trim()) {
      processText(inputText);
    }
  }, [inputText, processText]);

  // Process initial text
  useEffect(() => {
    if (initialText.trim()) {
      processText(initialText);
    }
  }, [initialText, processText]);

  return (
    <PanelContainer className={className}>
      {/* Input section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Chinese Text Annotation
        </Typography>
        <Box display="flex" gap={1} alignItems="flex-start">
          <TextInput
            value={inputText}
            onChange={handleTextChange}
            placeholder="Enter Chinese text to analyze..."
            disabled={isProcessing}
            maxLength={1000}
          />
          <Button
            variant="contained"
            onClick={() => processText(inputText)}
            disabled={isProcessing || !inputText.trim()}
            sx={{ minWidth: 100, height: 56 }}
          >
            Analyze
          </Button>
        </Box>
      </Box>

      {/* Processing state */}
      {isProcessing && (
        <Box display="flex" justifyContent="center" py={2}>
          <LoadingSpinner message="Processing text..." />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRetry}
        />
      )}

      {/* Results section */}
      {segments.length > 0 && !isProcessing && (
        <>
          {/* Stats */}
          <StatsContainer>
            <Typography variant="body2" color="text.secondary">
              Analysis:
            </Typography>
            <Chip 
              label={`${stats.totalCharacters} characters`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${stats.segments} segments`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${stats.uniqueWords} unique words`} 
              size="small" 
              variant="outlined" 
            />
          </StatsContainer>

          {/* Segments display */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Segmented Text
              {selectedSegments.length > 0 && (
                <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                  ({selectedSegments.length} selected)
                </Typography>
              )}
            </Typography>
            
            <SegmentContainer>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {segments.map((segment) => (
                  <SegmentDisplay
                    key={segment.id}
                    segment={segment}
                    selected={selectedSegments.some(s => s.id === segment.id)}
                    onClick={handleSegmentClick}
                    showPinyin={showPinyin}
                    interactive
                  />
                ))}
              </Box>
            </SegmentContainer>
          </Box>

          {/* Audio section */}
          {showAudio && inputText.trim() && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Audio Pronunciation
              </Typography>
              <AudioPlayer
                source={inputText.trim()}
                sourceType="tts"
                title="Full Text Pronunciation"
                showVolume={false}
                compact
              />
            </Box>
          )}

          {/* Selection info */}
          {selectedSegments.length > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {selectedSegments.length} segment{selectedSegments.length === 1 ? '' : 's'} selected.
                Use these segments to create flashcards or quizzes.
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* Empty state */}
      {segments.length === 0 && !isProcessing && !error && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={4}
          color="text.secondary"
        >
          <Typography variant="body1" align="center">
            Enter Chinese text above to see word segmentation and pinyin annotations
          </Typography>
        </Box>
      )}
    </PanelContainer>
  );
};