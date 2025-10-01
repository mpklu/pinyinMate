/**
 * LessonErrorBoundary - Error boundary for lesson-related components
 * Provides graceful error handling and recovery for lesson study features
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class LessonErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('LessonErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Report to error tracking service (would integrate with Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    const errorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userId: 'unknown', // Would get from user context
      errorId: this.state.errorId
    };

    // Log for development
    console.warn('Error report:', errorReport);

    // Send to error tracking service in production
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }, 0);
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                
                <Typography variant="h4" gutterBottom color="error">
                  学习遇到问题
                </Typography>
                
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Something went wrong with the lesson
                </Typography>

                <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                  <Typography variant="body2">
                    We encountered an unexpected error while loading your lesson. 
                    This has been reported and we're working to fix it.
                  </Typography>
                </Alert>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    color="primary"
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                    color="primary"
                  >
                    Go Home
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={this.handleReload}
                    color="secondary"
                  >
                    Reload Page
                  </Button>
                </Stack>

                {/* Development error details */}
                {process.env.NODE_ENV === 'development' && error && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Debug Information:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ 
                      whiteSpace: 'pre-wrap', 
                      fontSize: '0.75rem',
                      maxHeight: 200,
                      overflow: 'auto'
                    }}>
                      {error.toString()}
                      {errorInfo && errorInfo.componentStack}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Container>
      );
    }

    return children;
  }
}

export default LessonErrorBoundary;