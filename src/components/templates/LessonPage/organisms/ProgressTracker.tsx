/**
 * ProgressTracker - Organism component
 * Tracks and displays learning progress for the enhanced lesson experience
 */

import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface ProgressTrackerProps {
  lessonId: string;
  className?: string;
}

/**
 * Progress tracking organism for lesson learning metrics
 * Manages study session progress and SRS integration
 */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  lessonId, 
  className 
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Progress: {lessonId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Progress tracking and SRS integration coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;