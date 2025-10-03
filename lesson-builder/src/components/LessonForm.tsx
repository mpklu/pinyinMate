import {
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, CloudUpload, Download } from '@mui/icons-material';

import { useLessonBuilder } from '../hooks/useLessonBuilder';
import MetadataForm from './MetadataForm';
import ContentEditor from './ContentEditor';
import VocabularyManager from './VocabularyManager';
import JSONPreview from './JSONPreview';
import ValidationStatus from './ValidationStatus';

const LessonForm = () => {
  const {
    state,
    updateField,
    updateMetadata,
    addVocabulary,
    removeVocabulary,
    updateVocabulary,
    extractVocabulary,
    generateLesson,
    exportLesson,
    publishToGitHub,
    validation,
  } = useLessonBuilder();

  const handleSave = () => {
    // Auto-save to localStorage
    localStorage.setItem('lesson-builder-draft', JSON.stringify(state));
  };

  const handleExport = () => {
    const lesson = generateLesson();
    exportLesson(lesson);
  };

  const handlePublish = async () => {
    if (!validation.isValid) {
      return;
    }
    
    try {
      const lesson = generateLesson();
      await publishToGitHub(lesson);
    } catch (error) {
      console.error('Failed to publish lesson:', error);
    }
  };

  return (
    <Box>
      {/* Action Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={state.isProcessing}
        >
          Save Draft
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
          disabled={!validation.isValid || state.isProcessing}
        >
          Export JSON
        </Button>
        
        <Button
          variant="contained"
          startIcon={state.publishStatus.isPublishing ? <CircularProgress size={16} /> : <CloudUpload />}
          onClick={handlePublish}
          disabled={!validation.isValid || state.publishStatus.isPublishing}
          color="primary"
        >
          {state.publishStatus.isPublishing ? 'Publishing...' : 'Publish to GitHub'}
        </Button>

        {state.publishStatus.lastPublishError && (
          <Alert severity="error" sx={{ ml: 2 }}>
            {state.publishStatus.lastPublishError}
          </Alert>
        )}

        {state.publishStatus.lastPublishSuccess && (
          <Alert severity="success" sx={{ ml: 2 }}>
            Lesson published successfully!
          </Alert>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Forms */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <MetadataForm
                state={state}
                onUpdateField={updateField}
                onUpdateMetadata={updateMetadata}
              />
            </Paper>

            {/* Content Editor */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Lesson Content
              </Typography>
              <ContentEditor
                content={state.content}
                onChange={(content: string) => updateField('content', content)}
                onExtractVocabulary={extractVocabulary}
                isProcessing={state.isProcessing}
              />
            </Paper>

            {/* Vocabulary Manager */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Vocabulary Management
              </Typography>
              <VocabularyManager
                vocabulary={state.vocabulary}
                suggestedVocabulary={state.suggestedVocabulary}
                onAdd={addVocabulary}
                onRemove={removeVocabulary}
                onUpdate={updateVocabulary}
              />
            </Paper>
          </Box>
        </Grid>

        {/* Right Column - Preview & Validation */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            {/* Validation Status */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Validation Status
              </Typography>
              <ValidationStatus validation={validation} />
            </Paper>

            {/* JSON Preview */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                JSON Preview
              </Typography>
              <JSONPreview
                lesson={generateLesson()}
                validation={validation}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LessonForm;