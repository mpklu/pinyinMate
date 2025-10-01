/**
 * TextSegmentGroup - Molecule component
 * Groups related text segments with audio and vocabulary integration
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

interface TextSegmentGroupProps {
  segments: Array<{
    id: string;
    text: string;
    pinyin: string;
  }>;
  className?: string;
}

/**
 * Text segment grouping molecule
 * Manages display of segmented text with pinyin and audio capabilities
 */
export const TextSegmentGroup: React.FC<TextSegmentGroupProps> = ({ 
  segments, 
  className 
}) => {
  return (
    <Box className={className}>
      <Typography variant="h6" gutterBottom>
        Text Segments ({segments.length})
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Text segmentation with audio integration coming soon...
      </Typography>
    </Box>
  );
};

export default TextSegmentGroup;