import { createTheme } from '@mui/material/styles';

/**
 * Material-UI Theme Configuration
 * 
 * Mobile-first responsive design with accessibility features
 * Built for the Chinese learning application with proper
 * color contrast, typography, and touch target sizing.
 */
export const theme = createTheme({
  // Color palette
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Blue - professional and calming
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e', // Red - attention-grabbing for important actions
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32', // Green - positive feedback
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02', // Orange - warnings and difficulty indicators
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f', // Red - errors and incorrect answers
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },

  // Typography - optimized for Chinese characters and mobile reading
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      // Chinese fonts
      '"Noto Sans SC"',
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft YaHei"',
      '微软雅黑',
    ].join(','),
    
    // Responsive font sizes
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    // Special typography for Chinese text
    subtitle1: {
      fontSize: '1.25rem', // Larger for Chinese characters
      lineHeight: 1.8, // More spacing for readability
      fontWeight: 400,
    },
  },

  // Responsive breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // Spacing system
  spacing: 8, // 8px base unit

  // Shape and borders
  shape: {
    borderRadius: 8,
  },

  // Component overrides for accessibility and mobile-first design
  components: {
    // Button overrides - ensure minimum touch target size
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // WCAG AAA touch target size
          textTransform: 'none', // Better for Chinese mixed content
          borderRadius: 8,
        },
        sizeLarge: {
          minHeight: 48,
          fontSize: '1.125rem',
        },
      },
    },

    // Icon button overrides
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },

    // Chip overrides for tags and categories
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 32,
        },
      },
    },

    // Card overrides for content containers
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },

    // Paper overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    // TextField overrides for Chinese input
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 44, // Touch target size
          },
        },
      },
    },

    // List item overrides
    MuiListItem: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },

    // Tab overrides
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: 'none',
        },
      },
    },

    // Tooltip overrides for better accessibility
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.875rem',
          borderRadius: 6,
        },
      },
    },
  },
});