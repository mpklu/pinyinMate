import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  Alert,
  Snackbar,
  Fab,
  Stack
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Settings as SettingsIcon,
  Quiz as QuizIcon,
  School as FlashcardIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

// Import types
import type {
  EnhancedLesson,
  LessonStudyProgress
} from '../../types';

// Import services
import { playTextDirectly } from '../../services/audioService';
import { pinyinService } from '../../services/pinyinService';

interface NotificationState {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// PinyinDisplay component for rendering pinyin with proper loading state
const PinyinDisplay: React.FC<{ sentence: string }> = ({ sentence }) => {
  const [pinyin, setPinyin] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePinyin = async () => {
      try {
        setLoading(true);
        const pinyinResponse = await pinyinService.generate({
          text: sentence,
          format: 'tone-marks'
        });

        if (pinyinResponse.success && pinyinResponse.data) {
          setPinyin(pinyinResponse.data.pinyin);
        } else {
          console.warn('Pinyin generation failed:', pinyinResponse.error);
          setPinyin(sentence); // Fallback to original text
        }
      } catch (error) {
        console.error('Error generating pinyin:', error);
        setPinyin(sentence); // Fallback to original text
      } finally {
        setLoading(false);
      }
    };

    generatePinyin();
  }, [sentence]);

  if (loading) {
    return (
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontStyle: 'italic',
          fontSize: '0.9rem',
          opacity: 0.7
        }}
      >
        Generating pinyin...
      </Typography>
    );
  }

  return (
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        fontStyle: 'italic',
        fontSize: '0.9rem'
      }}
    >
      {pinyin}
    </Typography>
  );
};

export const LessonPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { lessonId, sourceId } = useParams<{ lessonId: string; sourceId: string }>();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Core state
  const [lesson, setLesson] = useState<EnhancedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LessonStudyProgress | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

    // UI state
  const [showPinyin, setShowPinyin] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);


  // Audio playback function
  const playAudio = useCallback(async (text: string, id: string) => {
    if (playingAudio) {
      // Stop current audio if playing
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }

    try {
      setPlayingAudio(id);
      
      const audioRequest = {
        text,
        options: {
          language: 'zh-CN',
          speed: 0.8,
          pitch: 1.0
        }
      };

      const response = await playTextDirectly(audioRequest);
      
      if (response.success) {
        // Audio should play automatically through Web Speech API
        console.log('Audio synthesis successful:', response);
      } else {
        console.error('Audio synthesis failed:', response.error);
        setNotification({
          message: 'Audio playback failed. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setNotification({
        message: 'Audio playback failed. Please try again.',
        severity: 'error'
      });
    } finally {
      // Reset playing state after a delay
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  }, [playingAudio, setNotification]);

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) {
        setError('No lesson ID provided');
        setLoading(false);
        return;
      }

      if (!sourceId) {
        setError('No library source ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to load lesson from specific library using libraryService
        const { libraryService } = await import('../../services/libraryService');
        await libraryService.initialize();
        
        // Only get lessons from the specific library/source
        const lessons = await libraryService.getLessons(sourceId);
        console.log(`Available lessons from library ${sourceId}:`, lessons.map(l => l.id));
        console.log('Looking for lesson ID:', lessonId);
        const foundLesson = lessons.find(lesson => lesson.id === lessonId);
        
        if (foundLesson) {
          // Convert to EnhancedLesson format
          const enhancedLesson: EnhancedLesson = {
            id: foundLesson.id,
            title: foundLesson.title,
            description: foundLesson.description,
            content: foundLesson.content,
            metadata: {
              difficulty: foundLesson.metadata?.difficulty || 'beginner',
              tags: foundLesson.metadata?.tags || [],
              characterCount: foundLesson.content.length,
              source: foundLesson.metadata?.source || 'Library',
              book: foundLesson.metadata?.book || null,
              vocabulary: foundLesson.metadata?.vocabulary || [],
              estimatedTime: foundLesson.metadata?.estimatedTime || 30,
              createdAt: foundLesson.metadata?.createdAt || new Date(),
              updatedAt: foundLesson.metadata?.updatedAt || new Date()
            }
          };
          setLesson(enhancedLesson);
        } else {
          // Fallback to mock lesson if not found
          // Fallback to demo lesson
        const fallbackLesson: EnhancedLesson = {
          id: lessonId,
          title: `Lesson ${lessonId}`,
            description: 'Lesson content is being loaded...',
            content: `欢迎学习中文！这是一个例子。你好，我叫小明。`,
            metadata: {
              difficulty: 'beginner',
              tags: ['beginner'],
              characterCount: 20,
              source: 'Demo data',
              book: null,
              vocabulary: [
                {
                  word: '你好',
                  translation: 'hello; hi',
                  partOfSpeech: 'greeting'
                },
                {
                  word: '我',
                  translation: 'I; me', 
                  partOfSpeech: 'pronoun'
                }
              ],
              estimatedTime: 30,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          };
          setLesson(fallbackLesson);
        }
        
        // Initialize progress
        const initialProgress: LessonStudyProgress = {
          lessonId,
          status: 'in-progress',
          timeSpent: 0,
          segmentsViewed: new Set(),
          vocabularyStudied: new Set(),
          audioPlayed: new Set(),
          sessionCount: 1,
          lastSessionAt: new Date()
        };
        setProgress(initialProgress);
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, sourceId]);

  // Handlers
  const handleBack = useCallback(() => {
    // Navigate back to the specific library source page
    if (sourceId) {
      navigate(`/library/${sourceId}`);
    } else {
      navigate('/library');
    }
  }, [navigate, sourceId]);

  const handleProgressUpdate = useCallback((segmentId: string) => {
    setProgress(prev => {
      if (!prev) return prev;
      const newSegmentsViewed = new Set(prev.segmentsViewed);
      newSegmentsViewed.add(segmentId);
      return {
        ...prev,
        segmentsViewed: newSegmentsViewed,
        lastSessionAt: new Date()
      };
    });
  }, []);

  const handleNotificationClose = useCallback(() => {
    setNotification(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ px: 3, py: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading lesson...</Typography>
      </Box>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <Box sx={{ px: 3, py: 4, width: '100%' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Lesson not found'}
        </Alert>
        <Button onClick={handleBack} startIcon={<BackIcon />}>
          Back to Library
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {lesson.title}
          </Typography>

          <IconButton
            color="inherit"
            onClick={() => setShowPinyin(!showPinyin)}
            title="Toggle Pinyin"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content - Full Width Desktop Layout */}
      <Box 
        sx={{ 
          flex: 1, 
          py: 0, // Remove vertical padding for true full width
          width: '100%',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 0, // Remove gap for full width
        }}
      >
        {/* Main Lesson Content */}
        <Box sx={{ 
          flex: 1,
          minWidth: 0, // Allows content to shrink properly
        }}>
          <Box sx={{ 
            px: isMobile ? 2 : 4, // Only horizontal padding for readability
            py: 3,
            bgcolor: 'background.paper', 
            minHeight: 400,
            width: '100%'
          }}>
            <Typography variant="h5" gutterBottom>
              {lesson.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {lesson.description}
            </Typography>
            
            {/* Enhanced Content Display with Interactive Features */}
            <Box sx={{ mt: 3 }}>
              {/* Split content into sentences for interactive display */}
              {lesson.content.split(/[。！？]/).filter(s => s.trim()).map((sentence, index) => (
                <Box 
                  key={`${lesson.id}-sentence-${sentence.slice(0, 10)}-${index}`}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: 1,
                    borderColor: 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.50',
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => {
                    handleProgressUpdate(`segment-${index}`);
                    // Future: Integrate Web Speech API for audio playback
                    console.log('Playing sentence:', sentence.trim());
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Noto Sans SC", sans-serif',
                      mb: showPinyin ? 1 : 0,
                      fontSize: '1.25rem',
                      lineHeight: 1.5
                    }}
                  >
                    {sentence.trim()}。
                  </Typography>
                  {showPinyin && (
                    <PinyinDisplay sentence={sentence.trim()} />
                  )}
                  
                  {/* Audio playback button */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 1, 
                      gap: 1,
                      cursor: 'pointer',
                      p: 0.5,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => playAudio(sentence.trim(), `sentence-${index}`)}
                  >
                    <Typography 
                      variant="caption" 
                      color={playingAudio === `sentence-${index}` ? 'secondary.main' : 'primary'}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5,
                        userSelect: 'none'
                      }}
                    >
                      {playingAudio === `sentence-${index}` ? '🔊' : '🔈'} 
                      {playingAudio === `sentence-${index}` ? 'Playing...' : 'Click to hear pronunciation'}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {/* Vocabulary Section */}
              {lesson.metadata.vocabulary.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Vocabulary
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {lesson.metadata.vocabulary.map((vocab, index) => (
                      <Box
                        key={`vocab-${vocab.word}-${index}`}
                        sx={{
                          p: 1.5,
                          bgcolor: playingAudio === `vocab-${vocab.word}-${index}` ? 'primary.50' : 'secondary.50',
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: playingAudio === `vocab-${vocab.word}-${index}` ? 'primary.100' : 'secondary.100'
                          },
                          border: playingAudio === `vocab-${vocab.word}-${index}` ? '2px solid' : 'none',
                          borderColor: 'primary.main'
                        }}
                        onClick={() => playAudio(vocab.word, `vocab-${vocab.word}-${index}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {vocab.word}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            {playingAudio === `vocab-${vocab.word}-${index}` ? '🔊' : '🔈'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {vocab.translation}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <Box sx={{ 
            width: 320, // Slightly wider for better proportions
            bgcolor: 'grey.50',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {/* Lesson Info */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 2, 
              boxShadow: 1
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                Lesson Info
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Difficulty: {lesson?.metadata.difficulty}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Vocabulary: {lesson?.metadata.vocabulary?.length || 0} words
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Est. Time: {lesson?.metadata.estimatedTime || 'N/A'} min
              </Typography>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 2, 
              boxShadow: 1
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                Study Tools
              </Typography>
              <Stack spacing={1}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<FlashcardIcon />}
                  onClick={() => navigate(`/library/${sourceId}/flashcards/${lesson?.id}`)}
                  fullWidth
                >
                  Flashcards
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<QuizIcon />}
                  onClick={() => navigate(`/quiz/${lesson?.id}`)}
                  fullWidth
                >
                  Quiz
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>

      {/* Floating Action Buttons for Study Tools (as per spec requirements) */}
      <Fab
        color="primary"
        aria-label="Generate Flashcards"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          zIndex: 1000
        }}
        onClick={() => {
          console.log('Generating flashcards for lesson:', lesson.id);
          setNotification({
            message: 'Generating flashcards...',
            severity: 'info'
          });
          // Navigate to flashcards page with lesson ID and sourceId
          navigate(`/library/${sourceId}/flashcards/${lesson.id}`);
        }}
      >
        <FlashcardIcon />
      </Fab>

      <Fab
        color="secondary"
        aria-label="Generate Quiz"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
        onClick={() => {
          console.log('Generating quiz for lesson:', lesson.id);
          setNotification({
            message: 'Generating quiz...',
            severity: 'info'
          });
          // Navigate to quiz page with lesson ID
          navigate(`/quiz/${lesson.id}`);
        }}
      >
        <QuizIcon />
      </Fab>

      {/* Notification Snackbar */}
      {notification && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default LessonPage;