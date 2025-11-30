import { ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
} from '@mui/material';
import { GitHub, Help, Keyboard } from '@mui/icons-material';
import theme from './theme';
import LessonForm from './components/LessonForm';
import ModeSelector from './components/ModeSelector';
import LessonBrowser from './components/LessonBrowser';
import ChangeTracker from './components/ChangeTracker';
import { useLessonBuilder } from './hooks/useLessonBuilder';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import type { Lesson } from './types';
import { calculateDiff } from './services/lessonDiffService';
import { useMemo, useState } from 'react';

function App() {
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const appName = import.meta.env.VITE_APP_NAME || 'PinyinMate Lesson Builder';
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const {
    state,
    switchMode,
    loadLesson,
    toggleBrowser,
    generateLesson,
  } = useLessonBuilder();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrlKey: true,
      description: 'Save draft',
      handler: () => {
        localStorage.setItem('lesson-builder-draft', JSON.stringify(state));
        console.log('Draft saved');
      },
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Toggle mode',
      handler: () => {
        const newMode = state.mode === 'create' ? 'edit' : 'create';
        switchMode(newMode);
      },
    },
    {
      key: 'b',
      ctrlKey: true,
      description: 'Toggle browser',
      handler: () => {
        if (state.mode === 'edit') {
          toggleBrowser();
        }
      },
    },
    {
      key: 'Escape',
      description: 'Close dialogs',
      handler: () => {
        if (state.browserOpen) {
          toggleBrowser();
        }
        if (showShortcuts) {
          setShowShortcuts(false);
        }
      },
    },
  ]);

  // Calculate diff for change tracker
  const currentDiff = useMemo(() => {
    if (state.mode === 'edit' && state.originalLesson) {
      const currentLesson = generateLesson();
      return calculateDiff(state.originalLesson, currentLesson);
    }
    return null;
  }, [state.mode, state.originalLesson, state, generateLesson]);

  const handleLessonSelect = (lesson: Lesson, source: any, sha?: string) => {
    loadLesson(lesson, source, sha);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {appName}
            </Typography>
            <Typography variant="caption" sx={{ mr: 2, opacity: 0.8 }}>
              v{appVersion}
            </Typography>
            <Tooltip title="View on GitHub">
              <IconButton
                color="inherit"
                href="https://github.com/mpklu/pinyinMate"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub />
              </IconButton>
            </Tooltip>
            <Tooltip title="Keyboard Shortcuts">
              <IconButton color="inherit" onClick={() => setShowShortcuts(true)}>
                <Keyboard />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton color="inherit">
                <Help />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
          {/* Mode Selector */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <ModeSelector
              mode={state.mode}
              onChange={switchMode}
              disabled={state.isProcessing || state.publishStatus.isPublishing}
            />
          </Paper>

          {/* Page Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {state.mode === 'create' ? 'Create Chinese Lesson' : 'Edit Chinese Lesson'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {state.mode === 'create'
                ? 'Build interactive Chinese language lessons with automatic vocabulary extraction and GitHub publishing.'
                : 'Edit and update existing lessons from the LSCS Chinese Lesson Depot.'}
            </Typography>
          </Box>

          {/* Lesson Browser Dialog (Edit Mode) */}
          <Dialog
            open={state.browserOpen}
            onClose={() => toggleBrowser()}
            maxWidth="lg"
            fullWidth
          >
            <LessonBrowser
              onLessonSelect={handleLessonSelect}
              onClose={() => toggleBrowser()}
            />
          </Dialog>

          {/* Main Form */}
          {(!state.mode || state.mode === 'create' || state.lessonSource) ? (
            <LessonForm mode={state.mode} />
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No lesson selected
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click the button below to browse and select a lesson to edit.
              </Typography>
              <Box>
                <ModeSelector
                  mode={state.mode}
                  onChange={switchMode}
                  disabled={false}
                />
              </Box>
            </Paper>
          )}

          {/* Change Tracker (Edit Mode) */}
          {state.mode === 'edit' && state.lessonSource && currentDiff && (
            <Box sx={{ mt: 3 }}>
              <ChangeTracker diff={currentDiff} />
            </Box>
          )}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              Built for PinyinMate Chinese Learning Platform
            </Typography>
          </Container>
        </Box>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog
          open={showShortcuts}
          onClose={() => setShowShortcuts(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Shortcut</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {KEYBOARD_SHORTCUTS.map((shortcut) => (
                    <TableRow key={shortcut.key}>
                      <TableCell>
                        <Chip
                          label={shortcut.key}
                          size="small"
                          sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{shortcut.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowShortcuts(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;