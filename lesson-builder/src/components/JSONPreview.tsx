import { useState } from 'react';
import { Box, Typography, IconButton, Snackbar, Alert, Tabs, Tab } from '@mui/material';
import { ContentCopy, Description, List } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Lesson } from '../types';
import { generateManifestEntry, generateManifestInstructions } from '../utils/manifestGenerator';

interface JSONPreviewProps {
  lesson: Lesson;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`json-tabpanel-${index}`}
      aria-labelledby={`json-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const JSONPreview = ({ lesson }: JSONPreviewProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Debug: Check if lscsLevel is present in the lesson
  console.log('JSONPreview lesson metadata:', lesson.metadata);
  console.log('lscsLevel in lesson:', lesson.metadata.lscsLevel);
  
  const lessonJsonString = JSON.stringify(lesson, null, 2);
  const manifestEntry = generateManifestEntry(lesson);
  const manifestJsonString = JSON.stringify(manifestEntry, null, 2);
  const manifestInstructions = generateManifestInstructions(lesson);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label="Lesson JSON"
          icon={<Description />}
          iconPosition="start"
          id="json-tab-0"
          aria-controls="json-tabpanel-0"
        />
        <Tab
          label="Manifest Entry"
          icon={<List />}
          iconPosition="start"
          id="json-tab-1"
          aria-controls="json-tabpanel-1"
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete lesson JSON file ready to be saved as <code>{lesson.id}.json</code> in the appropriate lesson directory. 
            This contains all the content, vocabulary, and metadata needed for PinyinMate to display and process the lesson.
          </Typography>
          
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => handleCopy(lessonJsonString)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
              size="small"
            >
              <ContentCopy fontSize="small" />
            </IconButton>
            
            <Box sx={{ maxHeight: 500, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <SyntaxHighlighter
                language="json"
                style={oneLight}
                customStyle={{
                  margin: 0,
                  fontSize: '12px',
                  lineHeight: '1.4',
                }}
              >
                {lessonJsonString}
              </SyntaxHighlighter>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {lessonJsonString.split('\n').length} lines • {new Blob([lessonJsonString]).size} bytes
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manifest entry to be added to <code>manifest.json</code>. This registers the lesson with PinyinMate's library system, 
            making it discoverable and accessible to users. Add this to the appropriate difficulty category's lessons array.
          </Typography>
          
          <Box sx={{ position: 'relative', mb: 2 }}>
            <IconButton
              onClick={() => handleCopy(manifestJsonString)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
              size="small"
            >
              <ContentCopy fontSize="small" />
            </IconButton>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <SyntaxHighlighter
                language="json"
                style={oneLight}
                customStyle={{
                  margin: 0,
                  fontSize: '12px',
                  lineHeight: '1.4',
                }}
              >
                {manifestJsonString}
              </SyntaxHighlighter>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {manifestJsonString.split('\n').length} lines • {new Blob([manifestJsonString]).size} bytes
            </Typography>
          </Box>

          <Box sx={{ 
            backgroundColor: 'grey.50', 
            p: 2, 
            borderRadius: 1, 
            border: 1, 
            borderColor: 'grey.200' 
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Integration Instructions:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'monospace',
              fontSize: '0.85em',
              lineHeight: 1.4,
              color: 'text.secondary'
            }}>
              {manifestInstructions}
            </Typography>
          </Box>
        </Box>
      </TabPanel>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" variant="filled">
          Content copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JSONPreview;