import { Box, Typography } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Lesson, ValidationResult } from '../types';

interface JSONPreviewProps {
  lesson: Lesson;
  validation: ValidationResult;
}

const JSONPreview = ({ lesson }: JSONPreviewProps) => {
  const jsonString = JSON.stringify(lesson, null, 2);

  return (
    <Box>
      <Box sx={{ maxHeight: 600, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <SyntaxHighlighter
          language="json"
          style={oneLight}
          customStyle={{
            margin: 0,
            fontSize: '12px',
            lineHeight: '1.4',
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {jsonString.split('\n').length} lines • {new Blob([jsonString]).size} bytes
      </Typography>
    </Box>
  );
};

export default JSONPreview;