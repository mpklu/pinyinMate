import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import { GitHub, Help } from '@mui/icons-material';
import theme from './theme';
import LessonForm from './components/LessonForm';

function App() {
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const appName = import.meta.env.VITE_APP_NAME || 'PinyinMate Lesson Builder';

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
            <IconButton
              color="inherit"
              href="https://github.com/mpklu/pinyinMate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub />
            </IconButton>
            <IconButton color="inherit">
              <Help />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Create Chinese Lesson
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Build interactive Chinese language lessons with automatic vocabulary extraction and GitHub publishing.
            </Typography>
          </Box>
          
          <LessonForm />
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
      </Box>
    </ThemeProvider>
  );
}

export default App;