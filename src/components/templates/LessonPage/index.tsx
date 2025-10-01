/**
 * LessonPage - Template component
 * Individual lesson learning interface with enhanced features
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { 
  LessonContent, 
  StudyMaterials, 
  ProgressTracker 
} from './organisms';

interface LessonPageProps {
  // Props will be expanded during implementation
  className?: string;
}

/**
 * LessonPage component for enhanced interactive lesson learning
 * Composed of atomic design components following the established pattern
 */
export const LessonPage: React.FC<LessonPageProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" color="error">
          Lesson ID required
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className={className}>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Enhanced Lesson Learning
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <LessonContent lessonId={id} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <ProgressTracker lessonId={id} />
              <StudyMaterials lessonId={id} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LessonPage;