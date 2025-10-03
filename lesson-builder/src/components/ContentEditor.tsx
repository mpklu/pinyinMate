import { TextField, Box, Typography, Button, CircularProgress } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onExtractVocabulary: () => void;
  isProcessing: boolean;
}

const ContentEditor = ({ content, onChange, onExtractVocabulary, isProcessing }: ContentEditorProps) => {
  const chineseCharCount = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalCharCount = content.length;

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={8}
        label="Chinese Content"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter Chinese text content here..."
        className="chinese-text"
        sx={{
          '& .MuiInputBase-input': {
            fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
            fontSize: '16px',
            lineHeight: 1.6,
          },
        }}
      />
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chinese characters: {chineseCharCount} | Total: {totalCharCount}
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={isProcessing ? <CircularProgress size={16} /> : <AutoAwesome />}
          onClick={onExtractVocabulary}
          disabled={!content.trim() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Extract Vocabulary'}
        </Button>
      </Box>
    </Box>
  );
};

export default ContentEditor;