/**
 * VocabularyPanel - Molecule component
 * Interactive vocabulary panel with pinyin and definitions
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

interface VocabularyPanelProps {
  vocabularyMap: Map<string, {
    pinyin: string;
    definition: string;
  }>;
  className?: string;
}

/**
 * Vocabulary panel molecule
 * Displays lesson vocabulary with interactive features and audio
 */
export const VocabularyPanel: React.FC<VocabularyPanelProps> = ({ 
  vocabularyMap, 
  className 
}) => {
  return (
    <Box className={className}>
      <Typography variant="h6" gutterBottom>
        Vocabulary ({vocabularyMap.size} words)
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Interactive vocabulary panel coming soon...
      </Typography>
    </Box>
  );
};

export default VocabularyPanel;