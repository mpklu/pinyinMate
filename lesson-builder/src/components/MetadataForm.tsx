import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box } from '@mui/material';
import type { LessonBuilderState, DifficultyLevel } from '../types';

interface MetadataFormProps {
  state: LessonBuilderState;
  onUpdateField: (field: keyof LessonBuilderState, value: any) => void;
  onUpdateMetadata: (field: string, value: any) => void;
}

const MetadataForm = ({ state, onUpdateField, onUpdateMetadata }: MetadataFormProps) => {
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onUpdateField('tags', tags);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Lesson ID"
          value={state.id}
          onChange={(e) => onUpdateField('id', e.target.value)}
          placeholder="e.g., greetings-basic"
          helperText="Unique identifier (alphanumeric, hyphens, underscores)"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={state.difficulty}
            label="Difficulty"
            onChange={(e) => onUpdateField('difficulty', e.target.value as DifficultyLevel)}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Title"
          value={state.title}
          onChange={(e) => onUpdateField('title', e.target.value)}
          placeholder="e.g., Basic Greetings"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={state.description}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="Brief description of the lesson content"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Source"
          value={state.source}
          onChange={(e) => onUpdateField('source', e.target.value)}
          placeholder="e.g., HSK Level 1 Textbook"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Book (Optional)"
          value={state.book || ''}
          onChange={(e) => onUpdateField('book', e.target.value || null)}
          placeholder="e.g., New Practical Chinese Reader"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Estimated Time (minutes)"
          value={state.estimatedTime}
          onChange={(e) => onUpdateField('estimatedTime', parseInt(e.target.value) || 15)}
          InputProps={{ inputProps: { min: 1, max: 300 } }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Tags"
          value={state.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="e.g., greetings, basic, conversation"
          helperText="Comma-separated tags"
        />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {state.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default MetadataForm;