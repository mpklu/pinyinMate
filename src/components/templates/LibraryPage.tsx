import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Paper,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Fab,
  Badge,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack,
  Settings,
  Home,
  Search,
  Add,
  ImportExport,
  School,
  Quiz as QuizIcon,
  Description,
} from '@mui/icons-material';
import { ExportPanel } from '../organisms/ExportPanel';
import type { TextAnnotation } from '../../types/annotation';
import type { Quiz } from '../../types/quiz';
import type { Flashcard } from '../../types/flashcard';

export interface LibraryItem {
  id: string;
  type: 'annotation' | 'quiz' | 'flashcard-deck';
  title: string;
  description?: string;
  createdAt: Date;
  lastAccessed?: Date;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  itemCount?: number; // segments, questions, or cards
  data: TextAnnotation | Quiz | Flashcard[];
}

export interface LibraryPageProps {
  /** Library items to display */
  items: LibraryItem[];
  /** Current search query */
  searchQuery?: string;
  /** Current filter tags */
  filterTags?: string[];
  /** Current view tab */
  currentTab?: 'all' | 'annotations' | 'quizzes' | 'flashcards';
  /** Whether to show export panel */
  showExportPanel?: boolean;
  /** Selected items for bulk operations */
  selectedItems?: string[];

  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Callback when item is selected */
  onItemSelect?: (itemId: string) => void;
  /** Callback when item is opened */
  onItemOpen?: (item: LibraryItem) => void;

  /** Callback when items are exported */
  onItemsExport?: (itemIds: string[], format: 'pdf' | 'csv' | 'anki') => void;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Callback when filters change */
  onFiltersChange?: (tags: string[]) => void;
  /** Callback when tab changes */
  onTabChange?: (tab: 'all' | 'annotations' | 'quizzes' | 'flashcards') => void;
  /** Callback when creating new item */
  onCreateNew?: (type: 'annotation' | 'quiz' | 'flashcard-deck') => void;
  /** Callback when navigating back */
  onNavigateBack?: () => void;
  /** Callback when navigating home */
  onNavigateHome?: () => void;
  /** Callback when opening settings */
  onOpenSettings?: () => void;
}

/**
 * LibraryPage Template Component
 * 
 * A complete content management interface that combines the ExportPanel organism
 * with content browsing, searching, filtering, and organization capabilities.
 * Provides a comprehensive library experience for managing all study content.
 * 
 * Features:
 * - App bar with navigation and actions
 * - Tabbed interface for content types
 * - Search and filtering capabilities
 * - Grid layout for content browsing
 * - Export panel integration
 * - Bulk operations support
 * - Responsive design for all screen sizes
 * 
 * @param props - LibraryPage component props
 * @returns JSX.Element
 */
export const LibraryPage: React.FC<LibraryPageProps> = ({
  items,
  searchQuery = '',
  filterTags = [],
  currentTab = 'all',
  showExportPanel = false,
  selectedItems = [],
  showSearch = true,
  showFilters = true,
  onItemSelect,
  onItemOpen,
  onItemsExport,
  onSearchChange,
  onFiltersChange,
  onTabChange,
  onCreateNew,
  onNavigateBack,
  onNavigateHome,
  onOpenSettings,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [exportPanelOpen, setExportPanelOpen] = useState(showExportPanel);

  // Filter items based on current tab
  const filteredItems = items.filter(item => {
    if (currentTab === 'annotations') return item.type === 'annotation';
    if (currentTab === 'quizzes') return item.type === 'quiz';
    if (currentTab === 'flashcards') return item.type === 'flashcard-deck';
    return true; // 'all' tab
  });

  // Get item counts for tabs
  const tabCounts = {
    all: items.length,
    annotations: items.filter(item => item.type === 'annotation').length,
    quizzes: items.filter(item => item.type === 'quiz').length,
    flashcards: items.filter(item => item.type === 'flashcard-deck').length,
  };

  const handleSearchSubmit = useCallback(() => {
    onSearchChange?.(localSearchQuery);
  }, [localSearchQuery, onSearchChange]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    onTabChange?.(newValue as 'all' | 'annotations' | 'quizzes' | 'flashcards');
  }, [onTabChange]);

  const handleExportToggle = useCallback(() => {
    setExportPanelOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((item: LibraryItem) => {
    if (selectedItems.includes(item.id)) {
      // If item is selected, open it
      onItemOpen?.(item);
    } else {
      // Otherwise, select it
      onItemSelect?.(item.id);
    }
  }, [selectedItems, onItemSelect, onItemOpen]);

  // Get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'annotation': return <Description />;
      case 'quiz': return <QuizIcon />;
      case 'flashcard-deck': return <School />;
      default: return <Description />;
    }
  };

  // Get color for item type
  const getItemColor = (type: string): 'primary' | 'secondary' | 'success' | 'default' => {
    switch (type) {
      case 'annotation': return 'primary';
      case 'quiz': return 'secondary';
      case 'flashcard-deck': return 'success';
      default: return 'default';
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onNavigateBack}
            aria-label="Go back"
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
            Study Library
          </Typography>

          {/* Action buttons */}
          <IconButton
            color="inherit"
            onClick={handleExportToggle}
            aria-label="Export options"
          >
            <Badge badgeContent={selectedItems.length} color="secondary">
              <ImportExport />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={onOpenSettings}
            aria-label="Library settings"
          >
            <Settings />
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={onNavigateHome}
            aria-label="Go home"
          >
            <Home />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content Tabs */}
      <Paper elevation={0} square>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            label={`All (${tabCounts.all})`} 
            value="all" 
          />
          <Tab 
            label={`Texts (${tabCounts.annotations})`} 
            value="annotations" 
          />
          <Tab 
            label={`Quizzes (${tabCounts.quizzes})`} 
            value="quizzes" 
          />
          <Tab 
            label={`Cards (${tabCounts.flashcards})`} 
            value="flashcards" 
          />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      {showSearch && (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search your library..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
            
            {showFilters && filterTags.length > 0 && (
              <Stack direction="row" spacing={1}>
                {filterTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => {
                      const newTags = filterTags.filter(t => t !== tag);
                      onFiltersChange?.(newTags);
                    }}
                    size="small"
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      {/* Content Grid */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {filteredItems.map((item) => (
            <Paper
              key={item.id}
                elevation={selectedItems.includes(item.id) ? 4 : 1}
                sx={{
                  p: 2,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  bgcolor: selectedItems.includes(item.id) ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    elevation: 3,
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleItemClick(item)}
              >
                {/* Item Header */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  {getItemIcon(item.type)}
                  <Chip
                    label={item.type}
                    size="small"
                    color={getItemColor(item.type)}
                    variant="outlined"
                  />
                </Stack>

                {/* Item Title */}
                <Typography variant="h6" sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </Typography>

                {/* Item Description */}
                {item.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.description}
                  </Typography>
                )}

                {/* Item Footer */}
                <Box sx={{ mt: 'auto' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.createdAt)}
                    </Typography>
                    
                    {item.itemCount && (
                      <Typography variant="caption" color="text.secondary">
                        {item.itemCount} items
                      </Typography>
                    )}
                  </Stack>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      {item.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                      {item.tags.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{item.tags.length - 2}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              </Paper>
          ))}
        </Box>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by creating some content!'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Export Panel */}
      {exportPanelOpen && (
        <Paper elevation={4} sx={{ m: 2, maxHeight: 300, overflow: 'auto' }}>
          <ExportPanel
            segments={[]} // Simplified export panel - would need actual segments
            title="Export Selected Items"
            availableFormats={['pdf', 'csv', 'txt']}
            onExportStart={(format) => {
              const formatMap = { pdf: 'pdf', csv: 'csv', txt: 'csv' } as const;
              onItemsExport?.(selectedItems, formatMap[format] as 'pdf' | 'csv' | 'anki');
            }}
          />
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => onCreateNew?.('annotation')}
        aria-label="Create new content"
      >
        <Add />
      </Fab>
    </Box>
  );
};