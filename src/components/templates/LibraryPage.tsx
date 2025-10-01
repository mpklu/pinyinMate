import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Settings,
  Home,
} from '@mui/icons-material';
import { EnhancedLessonCard } from '../molecules';
import type { EnhancedLesson } from '../../types/lesson';

export interface LibraryPageProps {
  lessons?: EnhancedLesson[];
  onLessonStart?: (lessonId: string) => void;
  onLessonPreview?: (lessonId: string) => void;
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  lessons = [],
  onLessonStart,
  onLessonPreview,
  onNavigateBack,
  onNavigateHome,
  onOpenSettings,
}) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onNavigateBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Lesson Library</Typography>
          <IconButton color="inherit" onClick={onOpenSettings}><Settings /></IconButton>
          <IconButton color="inherit" onClick={onNavigateHome}><Home /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2}>
          {lessons.map((lesson) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={lesson.id}>
              <EnhancedLessonCard
                lesson={lesson}
                variant="standard"
                showActions={true}
                enablePreview={true}
                onStartLesson={() => onLessonStart?.(lesson.id)}
                onPreviewLesson={() => onLessonPreview?.(lesson.id)}
              />
            </Grid>
          ))}
          {lessons.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No lessons available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lessons will appear here when they are loaded from your library sources.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default LibraryPage;
