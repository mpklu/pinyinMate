import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { SessionProvider } from './context/SessionContext';
import { router } from './router';
import { librarySourceService } from './services/librarySourceService';

/**
 * Root component that sets up routing, theming, and global state management
 * for the Chinese learning application. Provides navigation between all
 * page templates and manages session state across the application.
 * 
 * Features:
 * - React Router v7 with createBrowserRouter for enhanced performance
 * - Material-UI theming with mobile-first design
 * - Session context for state management
 * - Multi-source library system with local and remote lesson sources
 * - Lazy-loaded components for optimal code splitting
 * - Service initialization with automatic library source setup
 */
function App() {
  useEffect(() => {
    // Initialize library source service on app startup
    const initializeServices = async () => {
      try {
        await librarySourceService.initialize();
        console.log('Library source service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize library source service:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
