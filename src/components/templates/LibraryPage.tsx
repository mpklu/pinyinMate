import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Paper,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Settings,
  Home,
  LibraryBooks,
  Description,
  Quiz as QuizIcon,
  School,
} from '@mui/icons-material';
import { LessonBrowser } from '../organisms/LessonBrowser';
import type { TextAnnotation } from '../../types/annotation';
import type { Quiz } from '../../types/quiz';
import type { Flashcard } from '../../types/flashcard';

type TabType = 'all' | 'annotations' | 'quizzes' | 'flashcards' | 'lessons';

export interface LibraryItem {
  id: string;
  type: 'annotation' | 'quiz' | 'flashcard-deck';
  title: string;
  description?: string;
  createdAt: Date;
  lastAccessed?: Date;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  itemCount?: number;
  data: TextAnnotation | Quiz | Flashcard[];
}

export interface LibraryPageProps {
  items?: LibraryItem[];
  currentTab?: TabType;
  showFilters?: boolean;
  onTabChange?: (tab: TabType) => void;
  onItemSelect?: (itemId: string) => void;
  onItemOpen?: (item: LibraryItem) => void;
  // onItemsExport?: (itemIds: string[], format: 'pdf' | 'csv' | 'anki') => void; // TODO: Implement export functionality
  onCreateNew?: (type: 'annotation' | 'quiz' | 'flashcard-deck') => void;
  onLessonStart?: (lessonId: string) => void;
  onLessonPreview?: (lessonId: string) => void;
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  items = [],
  currentTab = 'all',
  showFilters = true,
  onTabChange,
  onItemSelect,
  onItemOpen,
  // onItemsExport, // TODO: Implement export functionality
  onCreateNew,
  onLessonStart,
  onLessonPreview,
  onNavigateBack,
  onNavigateHome,
  onOpenSettings,
}) => {
  const [localTab, setLocalTab] = useState(currentTab);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    const tab = newValue as TabType;
    setLocalTab(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  // Filter items based on current tab
  const filteredItems = items.filter(item => {
    if (localTab === 'annotations') return item.type === 'annotation';
    if (localTab === 'quizzes') return item.type === 'quiz';
    if (localTab === 'flashcards') return item.type === 'flashcard-deck';
    if (localTab === 'lessons') return false; // Lessons are handled separately
    return true; // 'all' tab
  });

  // Get item counts for tabs
  const tabCounts = {
    all: items.length,
    annotations: items.filter(item => item.type === 'annotation').length,
    quizzes: items.filter(item => item.type === 'quiz').length,
    flashcards: items.filter(item => item.type === 'flashcard-deck').length,
  };

  // Helper functions
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'annotation': return <Description />;
      case 'quiz': return <QuizIcon />;
      case 'flashcard-deck': return <School />;
      default: return <Description />;
    }
  };

  const getItemColor = (type: string): 'primary' | 'secondary' | 'success' => {
    switch (type) {
      case 'annotation': return 'primary';
      case 'quiz': return 'secondary';
      case 'flashcard-deck': return 'success';
      default: return 'primary';
    }
  };

  const handleItemClick = useCallback((item: LibraryItem) => {
    onItemOpen?.(item);
  }, [onItemOpen]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onNavigateBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Library</Typography>
          <IconButton color="inherit" onClick={onOpenSettings}><Settings /></IconButton>
          <IconButton color="inherit" onClick={onNavigateHome}><Home /></IconButton>
        </Toolbar>
      </AppBar>

      <Paper elevation={0} square>
        <Tabs value={localTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label={`All (${tabCounts.all})`} value="all" />
          <Tab label={`Texts (${tabCounts.annotations})`} value="annotations" />
          <Tab label={`Quizzes (${tabCounts.quizzes})`} value="quizzes" />
          <Tab label={`Cards (${tabCounts.flashcards})`} value="flashcards" />
          <Tab label="Lessons" value="lessons" icon={<LibraryBooks />} />
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {localTab === 'lessons' ? (
          <LessonBrowser
            showFilters={showFilters}
            onLessonStart={onLessonStart}
            onLessonPreview={onLessonPreview}
          />
        ) : (
          <>
            <Grid container spacing={2}>
              {filteredItems.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        {getItemIcon(item.type)}
                        <Chip
                          label={item.type}
                          size="small"
                          color={getItemColor(item.type)}
                          variant="outlined"
                        />
                      </Stack>
                      
                      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                        {item.title}
                      </Typography>
                      
                      {item.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {item.description}
                        </Typography>
                      )}
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        {item.difficulty && (
                          <Chip 
                            label={item.difficulty} 
                            size="small" 
                            color={(() => {
                              if (item.difficulty === 'beginner') return 'success';
                              if (item.difficulty === 'intermediate') return 'warning';
                              return 'error';
                            })()}
                          />
                        )}
                        {item.itemCount && (
                          <Typography variant="caption" color="text.secondary">
                            {item.itemCount} items
                          </Typography>
                        )}
                      </Stack>
                      
                      {item.tags && item.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {item.tags.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{item.tags.length - 3}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </CardContent>
                    
                    <CardActions>
                      <Button size="small" color="primary">
                        Open
                      </Button>
                      {onItemSelect && (
                        <Button size="small" onClick={(e) => {
                          e.stopPropagation();
                          onItemSelect(item.id);
                        }}>
                          Select
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {filteredItems.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No items found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {localTab === 'all' ? 'No content available yet.' : `No ${localTab} content available yet.`}
                </Typography>
                {onCreateNew && (
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => {
                      if (localTab === 'annotations') onCreateNew('annotation');
                      else if (localTab === 'quizzes') onCreateNew('quiz');
                      else if (localTab === 'flashcards') onCreateNew('flashcard-deck');
                      else onCreateNew('annotation');
                    }}
                  >
                    Create {localTab === 'all' ? 'Content' : localTab.slice(0, -1)}
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default LibraryPage;
