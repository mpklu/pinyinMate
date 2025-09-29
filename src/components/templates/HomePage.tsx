/**
 * HomePage - Template component
 * Main landing page layout with navigation and feature overview
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  styled,
} from '@mui/material';
import {
  Translate,
  Quiz,
  Book,
  Download,
  School,
  VolumeUp,
} from '@mui/icons-material';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
}));

const FeatureCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

export interface HomePageProps {
  /** Callback when user wants to start text annotation */
  onStartAnnotation?: () => void;
  /** Callback when user wants to take a quiz */
  onStartQuiz?: () => void;
  /** Callback when user wants to study flashcards */
  onStartFlashcards?: () => void;
  /** Callback when user wants to view library */
  onViewLibrary?: () => void;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  onClick?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartAnnotation,
  onStartQuiz,
  onStartFlashcards,
  onViewLibrary,
}) => {
  const features: Feature[] = [
    {
      id: 'annotation',
      title: 'Text Annotation',
      description: 'Analyze Chinese text with automatic word segmentation, pinyin generation, and pronunciation guides.',
      icon: <Translate fontSize="large" />,
      action: 'Start Analyzing',
      onClick: onStartAnnotation,
    },
    {
      id: 'quiz', 
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with auto-generated quizzes based on your study materials.',
      icon: <Quiz fontSize="large" />,
      action: 'Take Quiz',
      onClick: onStartQuiz,
    },
    {
      id: 'flashcards',
      title: 'Smart Flashcards',
      description: 'Study with spaced repetition flashcards that adapt to your learning progress.',
      icon: <School fontSize="large" />,
      action: 'Study Cards',
      onClick: onStartFlashcards,
    },
    {
      id: 'audio',
      title: 'Audio Pronunciation',
      description: 'Listen to native Chinese pronunciation with text-to-speech technology.',
      icon: <VolumeUp fontSize="large" />,
      action: 'Hear Audio',
      onClick: () => {}, // Placeholder
    },
    {
      id: 'export',
      title: 'Export Materials',
      description: 'Export your study materials to PDF, CSV, or other formats for external use.',
      icon: <Download fontSize="large" />,
      action: 'Export Data',
      onClick: () => {}, // Placeholder
    },
    {
      id: 'library',
      title: 'Study Library',
      description: 'Access your saved annotations, flashcards, and study progress in one place.',
      icon: <Book fontSize="large" />,
      action: 'View Library',
      onClick: onViewLibrary,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Learn Chinese
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Master Chinese characters, pronunciation, and vocabulary with our intelligent learning tools
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={onStartAnnotation}
              sx={{ 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onViewLibrary}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              View Library
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Typography 
          variant="h6" 
          component="p" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6 }}
        >
          Comprehensive tools for Chinese language learning
        </Typography>

        <Box 
          display="grid" 
          gridTemplateColumns={{ 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }}
          gap={4}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={feature.onClick}
                  disabled={!feature.onClick}
                >
                  {feature.action}
                </Button>
              </CardActions>
            </FeatureCard>
          ))}
        </Box>
      </Container>

      {/* Getting Started Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Quick Start Guide
          </Typography>
          
          <Box 
            display="grid" 
            gridTemplateColumns={{ 
              xs: '1fr', 
              sm: 'repeat(3, 1fr)' 
            }}
            gap={3}
            sx={{ mt: 2 }}
          >
            <Box textAlign="center">
              <Typography variant="h6" color="primary" gutterBottom>
                1. Add Text
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paste or type Chinese text that you want to analyze and learn from.
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h6" color="primary" gutterBottom>
                2. Analyze
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get automatic word segmentation, pinyin, and pronunciation guides.
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h6" color="primary" gutterBottom>
                3. Study
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Practice with quizzes, flashcards, and spaced repetition learning.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};