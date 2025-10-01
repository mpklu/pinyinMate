/**
 * StudyMaterials - Organism component  
 * Container for flashcards and quiz generation based on lesson content
 */

import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface StudyMaterialsProps {
  lessonId: string;
  className?: string;
}

/**
 * Study materials organism for flashcards and quizzes
 * Manages generated study content based on lesson vocabulary and content
 */
export const StudyMaterials: React.FC<StudyMaterialsProps> = ({ 
  lessonId, 
  className 
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Study Materials: {lessonId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Flashcard and quiz generation coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StudyMaterials;