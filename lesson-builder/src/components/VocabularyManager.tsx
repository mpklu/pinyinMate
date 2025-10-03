import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { Add, Delete, Edit, Check, Close } from '@mui/icons-material';
import type { VocabularyEntry, SuggestedVocabEntry } from '../types';

interface VocabularyManagerProps {
  vocabulary: VocabularyEntry[];
  suggestedVocabulary: SuggestedVocabEntry[];
  onAdd: (entry: VocabularyEntry) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, entry: VocabularyEntry) => void;
}

const VocabularyManager = ({
  vocabulary,
  suggestedVocabulary,
  onAdd,
  onRemove,
  onUpdate,
}: VocabularyManagerProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState<VocabularyEntry>({ word: '', definition: '' });

  const handleAddSuggestion = (suggestion: SuggestedVocabEntry) => {
    onAdd({ word: suggestion.word, definition: suggestion.definition });
  };

  const handleAddManual = () => {
    if (newEntry.word.trim() && newEntry.definition.trim()) {
      onAdd(newEntry);
      setNewEntry({ word: '', definition: '' });
      setAddDialogOpen(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setNewEntry(vocabulary[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newEntry.word.trim() && newEntry.definition.trim()) {
      onUpdate(editingIndex, newEntry);
      setEditingIndex(null);
      setNewEntry({ word: '', definition: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewEntry({ word: '', definition: '' });
  };

  return (
    <Box>
      {/* Suggested Vocabulary */}
      {suggestedVocabulary.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Suggested Vocabulary ({suggestedVocabulary.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedVocabulary.map((suggestion, index) => (
              <Chip
                key={`${suggestion.word}-${index}`}
                label={`${suggestion.word} (${suggestion.frequency})`}
                onClick={() => handleAddSuggestion(suggestion)}
                color={suggestion.isSelected ? 'primary' : 'default'}
                variant={suggestion.isSelected ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Current Vocabulary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Vocabulary Entries ({vocabulary.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Entry
        </Button>
      </Box>

      <List>
        {vocabulary.map((entry, index) => (
          <ListItem key={`${entry.word}-${index}`} divider>
            <ListItemText
              primary={entry.word}
              secondary={entry.definition}
              primaryTypographyProps={{
                className: 'chinese-text',
                fontWeight: 500,
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleEdit(index)}
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
              <IconButton
                edge="end"
                size="small"
                onClick={() => onRemove(index)}
                color="error"
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {vocabulary.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
          No vocabulary entries yet. Add some manually or extract from content.
        </Typography>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={addDialogOpen || editingIndex !== null} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Vocabulary Entry' : 'Add Vocabulary Entry'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Chinese Word"
            value={newEntry.word}
            onChange={(e) => setNewEntry({ ...newEntry, word: e.target.value })}
            margin="normal"
            className="chinese-text"
          />
          <TextField
            fullWidth
            label="English Definition"
            value={newEntry.definition}
            onChange={(e) => setNewEntry({ ...newEntry, definition: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            onClick={editingIndex !== null ? handleSaveEdit : handleAddManual}
            startIcon={<Check />}
            variant="contained"
            disabled={!newEntry.word.trim() || !newEntry.definition.trim()}
          >
            {editingIndex !== null ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VocabularyManager;