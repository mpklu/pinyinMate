/**
 * LessonPage - Main lesson study template
 * Integrates all lesson study components into a complete learning experience
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  Backdrop,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Settings as SettingsIcon,
  MenuBook as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

// Import our molecules (organisms will be imported when implemented)
import { StudyToolsPanel } from '../molecules';

// Import types and services
import type {
  EnhancedLesson,
  LessonStudyProgress,
  VocabularyEntryWithPinyin
} from '../../types';

// Mock services - these would be replaced with actual service implementations
import { lessonService } from '../../services/lessonService';
import { audioSynthesisService } from '../../services/audioSynthesisService';
import { flashcardGenerationService } from '../../services/flashcardGenerationService';
import { quizGenerationService } from '../../services/quizGenerationService';

export interface LessonPageProps {
  /** Optional lesson ID override (if not using route params) */
  lessonId?: string;
  
  /** Optional lesson data override */
  lesson?: EnhancedLesson;
  
  /** Whether to show the study tools panel initially */
  showStudyTools?: boolean;
  
  /** Whether to enable fullscreen mode */
  enableFullscreen?: boolean;
  
  /** Callback when lesson is completed */
  onLessonComplete?: (lesson: EnhancedLesson, progress: LessonStudyProgress) => void;
  
  /** Callback when user exits the lesson */
  onLessonExit?: (lesson: EnhancedLesson, progress: LessonStudyProgress) => void;
}

// Temporary interfaces for generated content - would use proper types from services
interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: string;
}

interface GeneratedQuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  type: string;
}

export const LessonPage: React.FC<LessonPageProps> = ({
  lessonId: propLessonId,
  lesson: propLesson,
  showStudyTools = false,
  enableFullscreen = true,
  onLessonComplete,
  onLessonExit
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { lessonId: routeLessonId } = useParams<{ lessonId: string }>();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [lesson, setLesson] = useState<EnhancedLesson | null>(propLesson || null);
  const [progress, setProgress] = useState<LessonStudyProgress | null>(null);
  const [loading, setLoading] = useState(!propLesson);
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition] = useState(0);
  
  // Study tools state
  const [studyToolsOpen, setStudyToolsOpen] = useState(showStudyTools);
  const [flashcards, setFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<GeneratedQuizQuestion[]>([]);
  const [generatingStudyMaterials, setGeneratingStudyMaterials] = useState(false);
  
  // UI state
  const [fullscreen, setFullscreen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  const lessonId = propLessonId || routeLessonId;

  // Load lesson data
  useEffect(() => {
    if (!lesson && lessonId) {
      loadLesson(lessonId);
    }
  }, [lesson, lessonId]);

  // Initialize progress tracking
  useEffect(() => {
    if (lesson && !progress) {
      initializeProgress();
    }
  }, [lesson, progress, initializeProgress]);

  const loadLesson = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load lesson with enhanced processing
      const loadedLesson = await lessonService.getLesson(id, {
        includeFlashcards: false,
        includeQuizzes: false,
        includePinyin: true,
        segmentText: true,
        cacheResult: true
      });
      
      setLesson(loadedLesson as EnhancedLesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const initializeProgress = useCallback(() => {
    if (!lesson) return;
    
    const initialProgress: LessonStudyProgress = {
      lessonId: lesson.id,
      status: 'in-progress',
      startedAt: new Date(),
      timeSpent: 0,
      segmentsViewed: new Set(),
      vocabularyStudied: new Set(),
      audioPlayed: new Set(),
      sessionCount: 1,
      lastSessionAt: new Date()
    };
    
    setProgress(initialProgress);
  }, [lesson]);

  const handleSegmentSelect = useCallback((segmentIndex: number) => {
    setCurrentSegmentIndex(segmentIndex);
    
    // Update progress
    if (progress && lesson?.processedContent?.segments) {
      const segment = lesson.processedContent.segments[segmentIndex];
      if (segment) {
        const updatedProgress = {
          ...progress,
          segmentsViewed: new Set([...progress.segmentsViewed, segment.id])
        };
        setProgress(updatedProgress);
      }
    }
  }, [progress, lesson]);

  const handlePlayAudio = useCallback(async (segmentId?: string) => {
    if (!lesson) return;
    
    try {
      if (segmentId) {
        // Play specific segment
        await audioSynthesisService.playSegmentAudio(lesson.id, segmentId);
        
        // Update progress
        if (progress) {
          const updatedProgress = {
            ...progress,
            audioPlayed: new Set([...progress.audioPlayed, segmentId])
          };
          setProgress(updatedProgress);
        }
      } else {
        // Play current segment
        const segments = lesson.processedContent?.segments;
        if (segments && segments[currentSegmentIndex]) {
          await audioSynthesisService.playSegmentAudio(lesson.id, segments[currentSegmentIndex].id);
        }
      }
      
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio playback failed:', err);
      setNotification({
        message: 'Failed to play audio',
        severity: 'error'
      });
    }
  }, [lesson, currentSegmentIndex, progress]);

  const handlePauseAudio = useCallback(() => {
    setIsPlaying(false);
    // Would call audio service to pause
  }, []);

  const handleVocabularyClick = useCallback((word: string, entry?: VocabularyEntryWithPinyin) => {
    // Update progress
    if (progress) {
      const updatedProgress = {
        ...progress,
        vocabularyStudied: new Set([...progress.vocabularyStudied, word])
      };
      setProgress(updatedProgress);
    }
    
    // Could show vocabulary details modal or add to study list
    setNotification({
      message: `Added "${word}" to vocabulary study`,
      severity: 'info'
    });
  }, [progress]);

  const handleGenerateFlashcards = useCallback(async (options: Record<string, unknown>) => {
    if (!lesson) return;
    
    try {
      setGeneratingStudyMaterials(true);
      const generatedFlashcards = await flashcardGenerationService.generateFlashcardsFromLesson(lesson.id, options);
      setFlashcards(generatedFlashcards);
      
      setNotification({
        message: `Generated ${generatedFlashcards.length} flashcards`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Flashcard generation failed:', err);
      setNotification({
        message: 'Failed to generate flashcards',
        severity: 'error'
      });
    } finally {
      setGeneratingStudyMaterials(false);
    }
  }, [lesson]);

  const handleGenerateQuiz = useCallback(async (options: Record<string, unknown>) => {
    if (!lesson) return;
    
    try {
      setGeneratingStudyMaterials(true);
      
      // Convert StudyToolsPanel options to enhanced quiz service format
      const questionTypes: string[] = [];
      
      // Always include our new Chinese↔Pinyin question types
      questionTypes.push('chinese-to-pinyin', 'pinyin-to-chinese');
      
      // Add traditional types based on UI options
      if (options.includeMultipleChoice) {
        questionTypes.push('multiple-choice-definition', 'multiple-choice-pinyin');
      }
      if (options.includeFillInBlank) {
        questionTypes.push('fill-in-blank');
      }
      if (options.includeListening) {
        questionTypes.push('multiple-choice-audio');
      }
      
      // Use the enhanced quiz generation service
      const result = await quizGenerationService.generateMixedTypeQuiz(lesson, {
        questionTypes: questionTypes as import('../../services/quizGenerationService').QuizQuestionType[],
        questionCount: (options.maxQuestions as number) || 10,
        difficulty: 'intermediate',
        includeAudio: false,
        shuffleOptions: true,
        preventRepeat: true
      });
      
      if (result.success && result.quiz.questions) {
        setQuizQuestions(result.quiz.questions);
        setNotification({
          message: `Generated ${result.quiz.questions.length} quiz questions including Chinese↔Pinyin!`,
          severity: 'success'
        });
      } else {
        throw new Error(result.errors?.[0]?.message || 'Quiz generation failed');
      }
    } catch (err) {
      console.error('Quiz generation failed:', err);
      setNotification({
        message: 'Failed to generate quiz',
        severity: 'error'
      });
    } finally {
      setGeneratingStudyMaterials(false);
    }
  }, [lesson]);

  const handleExportStudyMaterials = useCallback((format: 'json' | 'csv' | 'anki' | 'pdf') => {
    // Would implement export functionality
    setNotification({
      message: `Exported study materials as ${format.toUpperCase()}`,
      severity: 'success'
    });
  }, []);

  const handleProgressUpdate = useCallback((updatedProgress: Partial<LessonStudyProgress>) => {
    if (progress) {
      const newProgress = { ...progress, ...updatedProgress };
      setProgress(newProgress);
      
      // Check if lesson is completed
      const segments = lesson?.processedContent?.segments || [];
      if (segments.length > 0 && newProgress.segmentsViewed.size === segments.length) {
        newProgress.status = 'completed';
        newProgress.completedAt = new Date();
        setProgress(newProgress);
        
        if (onLessonComplete && lesson) {
          onLessonComplete(lesson, newProgress);
        }
      }
    }
  }, [progress, lesson, onLessonComplete]);

  const handleBack = useCallback(() => {
    if (progress && progress.segmentsViewed.size > 0) {
      setExitDialogOpen(true);
    } else {
      navigate(-1);
    }
  }, [navigate, progress]);

  const handleConfirmExit = useCallback(() => {
    if (onLessonExit && lesson && progress) {
      progress.timeSpent = Math.floor((Date.now() - (progress.startedAt?.getTime() || Date.now())) / 1000);
      onLessonExit(lesson, progress);
    }
    navigate(-1);
  }, [navigate, onLessonExit, lesson, progress]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen(!fullscreen);
  }, [fullscreen]);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Memoized segments for performance
  const segments = useMemo(() => {
    return lesson?.processedContent?.segments || [];
  }, [lesson?.processedContent?.segments]);

  if (loading) {
    return (
      <Backdrop open sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Lesson...
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  if (error || !lesson) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Lesson not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const appBarContent = (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleBack}
          aria-label="back"
        >
          <BackIcon />
        </IconButton>
        
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }} noWrap>
          {lesson.title}
        </Typography>
        
        {!isMobile && (
          <IconButton
            color="inherit"
            onClick={() => setStudyToolsOpen(!studyToolsOpen)}
            aria-label="study tools"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {enableFullscreen && (
          <IconButton
            color="inherit"
            onClick={toggleFullscreen}
            aria-label="fullscreen"
          >
            <SettingsIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );

  const studyToolsDrawer = (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="right"
      open={studyToolsOpen}
      onClose={() => setStudyToolsOpen(false)}
      sx={{
        width: 400,
        '& .MuiDrawer-paper': {
          width: 400,
          mt: fullscreen ? 0 : 8,
          height: fullscreen ? '100vh' : 'calc(100vh - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Study Tools</Typography>
          <IconButton onClick={() => setStudyToolsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <StudyToolsPanel
          lesson={lesson}
          flashcards={flashcards}
          quizQuestions={quizQuestions}
          isGenerating={generatingStudyMaterials}
          variant="compact"
          collapsible={false}
          onGenerateFlashcards={handleGenerateFlashcards}
          onGenerateQuiz={handleGenerateQuiz}
          onExportStudyMaterials={handleExportStudyMaterials}
        />
      </Box>
    </Drawer>
  );

  const mainContent = (
    <Box sx={{ 
      pt: fullscreen ? 0 : 8,
      pb: 2,
      mr: studyToolsOpen && !isMobile ? '400px' : 0,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    }}>
      <LessonContent
        lesson={lesson}
        progress={progress}
        currentSegmentIndex={currentSegmentIndex}
        isPlaying={isPlaying}
        playbackPosition={playbackPosition}
        variant={fullscreen ? 'focused' : 'full'}
        showProgress={!fullscreen}
        enableVocabularyHighlight={true}
        showAudioControls={true}
        onSegmentSelect={handleSegmentSelect}
        onPlayAudio={handlePlayAudio}
        onPauseAudio={handlePauseAudio}
        onVocabularyClick={handleVocabularyClick}
        onProgressUpdate={handleProgressUpdate}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {!fullscreen && appBarContent}
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {mainContent}
        {studyToolsDrawer}
      </Box>

      {/* Floating study tools for mobile */}
      {isMobile && !studyToolsOpen && (
        <StudyToolsPanel
          lesson={lesson}
          flashcards={flashcards}
          quizQuestions={quizQuestions}
          isGenerating={generatingStudyMaterials}
          variant="floating"
          onGenerateFlashcards={handleGenerateFlashcards}
          onGenerateQuiz={handleGenerateQuiz}
          onExportStudyMaterials={handleExportStudyMaterials}
        />
      )}

      {/* Exit confirmation dialog */}
      <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
        <DialogTitle>Exit Lesson?</DialogTitle>
        <DialogContent>
          <Typography>
            You have made progress in this lesson. Are you sure you want to exit?
            Your progress will be saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitDialogOpen(false)}>
            Continue Studying
          </Button>
          <Button onClick={handleConfirmExit} color="primary">
            Save & Exit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {notification && (
          <Alert onClose={closeNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default LessonPage;