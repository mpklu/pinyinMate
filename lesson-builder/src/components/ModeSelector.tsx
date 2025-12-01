/**
 * Mode Selector Component
 * Allows users to toggle between "Create New" and "Edit Existing" lesson modes
 */

import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material';

interface ModeSelectorProps {
  mode: 'create' | 'edit';
  onChange: (mode: 'create' | 'edit') => void;
  disabled?: boolean;
}

const ModeSelector = ({ mode, onChange, disabled = false }: ModeSelectorProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as 'create' | 'edit');
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <FormControl component="fieldset" disabled={disabled}>
        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
          Lesson Builder Mode
        </FormLabel>
        <RadioGroup
          row
          aria-label="lesson builder mode"
          name="mode"
          value={mode}
          onChange={handleChange}
        >
          <FormControlLabel
            value="create"
            control={<Radio />}
            label="Create New Lesson"
            sx={{ mr: 4 }}
          />
          <FormControlLabel
            value="edit"
            control={<Radio />}
            label="Edit Existing Lesson"
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default ModeSelector;
