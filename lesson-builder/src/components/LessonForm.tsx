import {
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Save,
  CloudUpload,
  Download,
  ArrowBack,
  Update,
} from '@mui/icons-material';

import { useLessonBuilder } from '../hooks/useLessonBuilder';
import MetadataForm from './MetadataForm';
import ContentEditor from './ContentEditor';
import VocabularyManager from './VocabularyManager';
import JSONPreview from './JSONPreview';
import ValidationStatus from './ValidationStatus';

interface LessonFormProps {
  mode?: 'create' | 'edit';
}

const LessonForm = ({ mode = 'create' }: LessonFormProps) => {
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
    updateLesson,
    revertChanges,
    hasChanges,
    toggleBrowser,
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

  const handleUpdate = async () => {
    if (!validation.isValid) {
      return;
    }

    try {
      await updateLesson();
    } catch (error) {
      console.error('Failed to update lesson:', error);
    }
  };

  const handleRevert = () => {
    if (globalThis.confirm('Are you sure you want to revert all changes? This cannot be undone.')) {
      revertChanges();
    }
  };

  const isEditMode = mode === 'edit';
  const showChangesIndicator = isEditMode && hasChanges();

  return (
    <Box>
      {/* Edit Mode Header */}
      {isEditMode && state.lessonSource && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Editing: {state.title || 'Untitled Lesson'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Source: ${state.lessonSource.sourceId}`}
                  size="small"
                  variant="outlined"
                />
                {state.originalLesson?.metadata.updatedAt && (
                  <Chip
                    label={`Last modified: ${new Date(
                      state.originalLesson.metadata.updatedAt
                    ).toLocaleDateString()}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {showChangesIndicator && (
                  <Chip label="Unsaved changes" size="small" color="warning" />
                )}
              </Box>
            </Box>
            <Button startIcon={<ArrowBack />} onClick={() => toggleBrowser()} variant="outlined">
              Back to Browser
            </Button>
          </Box>
        </Paper>
      )}

      {/* Action Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
        
        {isEditMode ? (
          <>
            <Button
              variant="contained"
              startIcon={state.publishStatus.isPublishing ? <CircularProgress size={16} /> : <Update />}
              onClick={handleUpdate}
              disabled={!validation.isValid || !showChangesIndicator || state.publishStatus.isPublishing}
              color="primary"
            >
              {state.publishStatus.isPublishing ? 'Updating...' : 'Update on GitHub'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleRevert}
              disabled={!showChangesIndicator || state.isProcessing}
              color="warning"
            >
              Revert Changes
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={state.publishStatus.isPublishing ? <CircularProgress size={16} /> : <CloudUpload />}
            onClick={handlePublish}
            disabled={!validation.isValid || state.publishStatus.isPublishing}
            color="primary"
          >
            {state.publishStatus.isPublishing ? 'Publishing...' : 'Publish to GitHub'}
          </Button>
        )}

        {state.publishStatus.lastPublishError && (
          <Alert severity="error" sx={{ ml: 2 }}>
            {state.publishStatus.lastPublishError}
          </Alert>
        )}

        {state.publishStatus.lastPublishSuccess && (
          <Alert severity="success" sx={{ ml: 2 }}>
            {isEditMode ? 'Lesson updated successfully!' : 'Lesson published successfully!'}
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
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LessonForm;