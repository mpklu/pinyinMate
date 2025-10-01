/**
 * StudyToolsPanel - Panel for generating flashcards and quizzes from lesson content
 * Molecular component combining study tool buttons with generation options and results
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Alert,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore,
  Style,
  Quiz,
  Settings,
  CheckCircle,
  Error
} from '@mui/icons-material';

import { StudyToolButton } from '../atoms';
import type { 
  EnhancedLesson,
  DifficultyLevel,
  Flashcard,
  QuizQuestion 
} from '../../types';

// Type aliases for lesson-specific flashcards and quiz questions
type LessonFlashcard = Flashcard;
type LessonQuizQuestion = QuizQuestion;

export interface StudyToolsPanelProps {
  /** The lesson to generate study materials from */
  lesson: EnhancedLesson;
  
  /** Generated flashcards */
  flashcards?: LessonFlashcard[];
  
  /** Generated quiz questions */
  quizQuestions?: LessonQuizQuestion[];
  
  /** Whether generation is in progress */
  isGenerating?: boolean;
  
  /** Generation error message */
  generationError?: string;
  
  /** Display variant */
  variant?: 'full' | 'compact' | 'floating';
  
  /** Whether the panel is collapsible */
  collapsible?: boolean;
  
  /** Initially expanded state (for collapsible variant) */
  defaultExpanded?: boolean;
  
  /** Callback when flashcards are requested */
  onGenerateFlashcards?: (options: FlashcardGenerationOptions) => void;
  
  /** Callback when quiz is requested */
  onGenerateQuiz?: (options: QuizGenerationOptions) => void;
  
  /** Callback when export is requested */
  onExportStudyMaterials?: (format: 'json' | 'csv' | 'anki' | 'pdf') => void;
}

export interface FlashcardGenerationOptions {
  includeVocabulary: boolean;
  includeSentences: boolean;
  includeAudio: boolean;
  maxCards: number;
  difficulty: DifficultyLevel[];
  cardTypes: string[];
}

export interface QuizGenerationOptions {
  includeMultipleChoice: boolean;
  includeFillInBlank: boolean;
  includePronunciation: boolean;
  includeListening: boolean;
  maxQuestions: number;
  difficulty: DifficultyLevel[];
}

const DEFAULT_FLASHCARD_OPTIONS: FlashcardGenerationOptions = {
  includeVocabulary: true,
  includeSentences: true,
  includeAudio: true,
  maxCards: 20,
  difficulty: ['beginner', 'intermediate'],
  cardTypes: ['vocabulary', 'sentence', 'audio']
};

const DEFAULT_QUIZ_OPTIONS: QuizGenerationOptions = {
  includeMultipleChoice: true,
  includeFillInBlank: true,
  includePronunciation: false,
  includeListening: false,
  maxQuestions: 10,
  difficulty: ['beginner', 'intermediate']
};

export const StudyToolsPanel: React.FC<StudyToolsPanelProps> = ({
  lesson,
  flashcards = [],
  quizQuestions = [],
  isGenerating = false,
  generationError,
  variant = 'full',
  collapsible = true,
  defaultExpanded = false,
  onGenerateFlashcards,
  onGenerateQuiz,
  onExportStudyMaterials
}) => {
  const [flashcardOptions, setFlashcardOptions] = useState<FlashcardGenerationOptions>(DEFAULT_FLASHCARD_OPTIONS);
  const [quizOptions, setQuizOptions] = useState<QuizGenerationOptions>(DEFAULT_QUIZ_OPTIONS);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  const handleGenerateFlashcards = useCallback(() => {
    if (onGenerateFlashcards) {
      onGenerateFlashcards(flashcardOptions);
    }
  }, [onGenerateFlashcards, flashcardOptions]);

  const handleGenerateQuiz = useCallback(() => {
    if (onGenerateQuiz) {
      onGenerateQuiz(quizOptions);
    }
  }, [onGenerateQuiz, quizOptions]);

  const handleExport = useCallback((format: 'json' | 'csv' | 'anki' | 'pdf') => {
    if (onExportStudyMaterials) {
      onExportStudyMaterials(format);
    }
  }, [onExportStudyMaterials]);

  const renderFlashcardOptions = () => (
    <Box>
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Content Types</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={flashcardOptions.includeVocabulary}
                onChange={(e) => setFlashcardOptions(prev => ({
                  ...prev,
                  includeVocabulary: e.target.checked
                }))}
              />
            }
            label="Vocabulary Cards"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flashcardOptions.includeSentences}
                onChange={(e) => setFlashcardOptions(prev => ({
                  ...prev,
                  includeSentences: e.target.checked
                }))}
              />
            }
            label="Sentence Cards"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flashcardOptions.includeAudio}
                onChange={(e) => setFlashcardOptions(prev => ({
                  ...prev,
                  includeAudio: e.target.checked
                }))}
              />
            }
            label="Audio Cards"
          />
        </FormGroup>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Maximum Cards: {flashcardOptions.maxCards}</Typography>
        <Slider
          value={flashcardOptions.maxCards}
          onChange={(_e, value) => setFlashcardOptions(prev => ({
            ...prev,
            maxCards: Array.isArray(value) ? value[0] : value
          }))}
          min={5}
          max={50}
          step={5}
          marks={[
            { value: 5, label: '5' },
            { value: 25, label: '25' },
            { value: 50, label: '50' }
          ]}
        />
      </Box>

      <Button
        variant="contained"
        startIcon={<Style />}
        onClick={handleGenerateFlashcards}
        disabled={isGenerating}
        fullWidth
        sx={{ mb: 2 }}
      >
        {isGenerating ? <CircularProgress size={20} /> : 'Generate Flashcards'}
      </Button>

      {flashcards.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Generated {flashcards.length} flashcards successfully!
        </Alert>
      )}
    </Box>
  );

  const renderQuizOptions = () => (
    <Box>
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Question Types</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={quizOptions.includeMultipleChoice}
                onChange={(e) => setQuizOptions(prev => ({
                  ...prev,
                  includeMultipleChoice: e.target.checked
                }))}
              />
            }
            label="Multiple Choice"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={quizOptions.includeFillInBlank}
                onChange={(e) => setQuizOptions(prev => ({
                  ...prev,
                  includeFillInBlank: e.target.checked
                }))}
              />
            }
            label="Fill in the Blank"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={quizOptions.includePronunciation}
                onChange={(e) => setQuizOptions(prev => ({
                  ...prev,
                  includePronunciation: e.target.checked
                }))}
              />
            }
            label="Pronunciation"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={quizOptions.includeListening}
                onChange={(e) => setQuizOptions(prev => ({
                  ...prev,
                  includeListening: e.target.checked
                }))}
              />
            }
            label="Listening"
          />
        </FormGroup>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Maximum Questions: {quizOptions.maxQuestions}</Typography>
        <Slider
          value={quizOptions.maxQuestions}
          onChange={(_e, value) => setQuizOptions(prev => ({
            ...prev,
            maxQuestions: Array.isArray(value) ? value[0] : value
          }))}
          min={5}
          max={30}
          step={5}
          marks={[
            { value: 5, label: '5' },
            { value: 15, label: '15' },
            { value: 30, label: '30' }
          ]}
        />
      </Box>

      <Button
        variant="contained"
        startIcon={<Quiz />}
        onClick={handleGenerateQuiz}
        disabled={isGenerating}
        fullWidth
        sx={{ mb: 2 }}
      >
        {isGenerating ? <CircularProgress size={20} /> : 'Generate Quiz'}
      </Button>

      {quizQuestions.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Generated {quizQuestions.length} quiz questions successfully!
        </Alert>
      )}
    </Box>
  );

  const renderResults = () => {
    const hasResults = flashcards.length > 0 || quizQuestions.length > 0;
    
    if (!hasResults) {
      return null;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Generated Study Materials
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {flashcards.length > 0 && (
            <Chip
              icon={<Style />}
              label={`${flashcards.length} Flashcards`}
              color="primary"
              variant="outlined"
            />
          )}
          {quizQuestions.length > 0 && (
            <Chip
              icon={<Quiz />}
              label={`${quizQuestions.length} Questions`}
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Export your study materials:
        </Typography>
        
        <ButtonGroup size="small" sx={{ mb: 2 }}>
          <Button onClick={() => handleExport('json')}>JSON</Button>
          <Button onClick={() => handleExport('csv')}>CSV</Button>
          <Button onClick={() => handleExport('anki')}>Anki</Button>
          <Button onClick={() => handleExport('pdf')}>PDF</Button>
        </ButtonGroup>
      </Box>
    );
  };

  if (variant === 'floating') {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000,
        }}
      >
        <StudyToolButton
          toolType="flashcards"
          onClick={() => handleGenerateFlashcards()}
          badgeCount={flashcards.length}
          loading={isGenerating}
        />
        <StudyToolButton
          toolType="quiz"
          onClick={() => handleGenerateQuiz()}
          badgeCount={quizQuestions.length}
          loading={isGenerating}
        />
        {(flashcards.length > 0 || quizQuestions.length > 0) && (
          <StudyToolButton
            toolType="export"
            onClick={() => handleExport('pdf')}
          />
        )}
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Study Tools</Typography>
          {(flashcards.length > 0 || quizQuestions.length > 0) && (
            <Chip icon={<CheckCircle />} label="Ready" color="success" size="small" />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Style />}
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            size="small"
          >
            Flashcards ({flashcards.length})
          </Button>
          <Button
            variant="outlined"
            startIcon={<Quiz />}
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            size="small"
          >
            Quiz ({quizQuestions.length})
          </Button>
        </Box>

        {generationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generationError}
          </Alert>
        )}

        {renderResults()}
      </Paper>
    );
  }

  // Full variant (default)
  const content = (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Study Tools</Typography>
        {isGenerating && <CircularProgress size={24} />}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generate interactive study materials from "{lesson.title}" to enhance your learning experience.
      </Typography>

      {generationError && (
        <Alert severity="error" icon={<Error />} sx={{ mb: 2 }}>
          {generationError}
        </Alert>
      )}

      <ButtonGroup sx={{ mb: 2 }}>
        <Button
          variant={activeTab === 'flashcards' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('flashcards')}
          startIcon={<Style />}
        >
          Flashcards
        </Button>
        <Button
          variant={activeTab === 'quiz' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('quiz')}
          startIcon={<Quiz />}
        >
          Quiz
        </Button>
      </ButtonGroup>

      {activeTab === 'flashcards' ? renderFlashcardOptions() : renderQuizOptions()}
      
      {renderResults()}
    </Box>
  );

  if (collapsible) {
    return (
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            <Typography variant="h6">Study Tools</Typography>
            {(flashcards.length > 0 || quizQuestions.length > 0) && (
              <Chip icon={<CheckCircle />} label="Ready" color="success" size="small" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {content}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {content}
    </Paper>
  );
};

export default StudyToolsPanel;