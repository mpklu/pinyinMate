/**
 * AnnotationPage - Template component
 * Page layout for Chinese text annotation and analysis
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Paper,
  styled,
} from '@mui/material';
import {
  ArrowBack,
  Home,
  Save,
  Share,
} from '@mui/icons-material';

import { TextAnnotationPanel } from '../organisms/TextAnnotationPanel';
import type { AnnotationResult } from '../organisms/TextAnnotationPanel';
import type { TextSegment } from '../../types/annotation';

// Styled components
const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#fafafa',
});

const ContentContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const ActionBar = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: 64, // AppBar height
  zIndex: theme.zIndex.appBar - 1,
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export interface AnnotationPageProps {
  /** Initial text to load */
  initialText?: string;
  /** Page title */
  title?: string;
  /** Callback to navigate back */
  onBack?: () => void;
  /** Callback to navigate home */
  onHome?: () => void;
  /** Callback when annotation is completed */
  onAnnotationComplete?: (result: AnnotationResult) => void;
  /** Callback when segments are selected for further study */
  onSegmentsSelected?: (segments: TextSegment[]) => void;
  /** Callback to save annotation */
  onSave?: (result: AnnotationResult) => void;
  /** Callback to share annotation */
  onShare?: (result: AnnotationResult) => void;
}

export const AnnotationPage: React.FC<AnnotationPageProps> = ({
  initialText,
  title = 'Text Annotation',
  onBack,
  onHome,
  onAnnotationComplete,
  onSegmentsSelected,
  onSave,
  onShare,
}) => {
  // State
  const [currentResult, setCurrentResult] = useState<AnnotationResult | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<TextSegment[]>([]);

  // Handle annotation completion
  const handleAnnotationComplete = useCallback((result: AnnotationResult) => {
    setCurrentResult(result);
    onAnnotationComplete?.(result);
  }, [onAnnotationComplete]);

  // Handle segment selection
  const handleSegmentsSelected = useCallback((segments: TextSegment[]) => {
    setSelectedSegments(segments);
    onSegmentsSelected?.(segments);
  }, [onSegmentsSelected]);

  // Handle save
  const handleSave = useCallback(() => {
    if (currentResult) {
      onSave?.(currentResult);
    }
  }, [currentResult, onSave]);

  // Handle share
  const handleShare = useCallback(() => {
    if (currentResult) {
      onShare?.(currentResult);
    }
  }, [currentResult, onShare]);

  const hasContent = currentResult && currentResult.segments.length > 0;
  const hasSelection = selectedSegments.length > 0;

  return (
    <PageContainer>
      {/* App Bar */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={onHome}
          >
            <Home />
          </IconButton>
        </Toolbar>
      </AppBar>

      <ContentContainer maxWidth="lg">
        {/* Action Bar */}
        {hasContent && (
          <ActionBar elevation={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                {currentResult.segments.length} segments analyzed
              </Typography>
              
              {hasSelection && (
                <Typography variant="body2" color="primary">
                  {selectedSegments.length} selected
                </Typography>
              )}
            </Box>
            
            <Box display="flex" gap={1}>
              {hasSelection && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onSegmentsSelected?.(selectedSegments)}
                >
                  Create Study Materials
                </Button>
              )}
              
              <IconButton
                onClick={handleSave}
                disabled={!hasContent}
                color="primary"
              >
                <Save />
              </IconButton>
              
              <IconButton
                onClick={handleShare}
                disabled={!hasContent}
                color="primary"
              >
                <Share />
              </IconButton>
            </Box>
          </ActionBar>
        )}

        {/* Main Content */}
        <Box>
          <TextAnnotationPanel
            initialText={initialText}
            showAudio={true}
            showPinyin={true}
            onTextProcessed={handleAnnotationComplete}
            onSegmentsSelected={handleSegmentsSelected}
          />
        </Box>

        {/* Instructions */}
        {!hasContent && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              How to Use Text Annotation
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Enter or paste Chinese text in the input field above
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Click "Analyze" to process the text and generate word segmentation
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Click on individual segments to select them for study materials
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Use the audio player to listen to pronunciation of the full text
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </ContentContainer>
    </PageContainer>
  );
};