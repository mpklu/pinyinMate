import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Typography } from '@mui/material';
import { School } from '@mui/icons-material';
import { getLSCSLevelsForDifficulty, getAllLSCSLevels, type PinyinMateDifficulty } from '../utils/lscsMapping';

interface LSCSLevelSelectorProps {
  difficulty: PinyinMateDifficulty;
  selectedLevel: string;
  onChange: (level: string) => void;
  disabled?: boolean;
}

const LSCSLevelSelector = ({ difficulty, selectedLevel, onChange, disabled = false }: LSCSLevelSelectorProps) => {
  const availableLevels = getLSCSLevelsForDifficulty(difficulty);
  const allLevels = getAllLSCSLevels();
  
  // Find the selected level info for display
  const selectedLevelInfo = allLevels.find(level => level.lscsLevel === selectedLevel);

  return (
    <Box>
      <FormControl fullWidth variant="outlined" disabled={disabled}>
        <InputLabel id="lscs-level-select-label">LSCS Level</InputLabel>
        <Select
          labelId="lscs-level-select-label"
          id="lscs-level-select"
          value={selectedLevel}
          label="LSCS Level"
          onChange={(e) => onChange(e.target.value)}
          startAdornment={<School sx={{ mr: 1, color: 'action.active' }} />}
        >
          {availableLevels.map((levelMapping) => (
            <MenuItem key={levelMapping.lscsLevel} value={levelMapping.lscsLevel}>
              <Box>
                <Typography variant="body2" component="span">
                  {levelMapping.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {levelMapping.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {selectedLevelInfo ? (
            <>
              <strong>Target:</strong> {selectedLevelInfo.description}
              {' • '}
              <strong>Folder:</strong> lessons/{selectedLevel}/
            </>
          ) : (
            'Choose the appropriate LSCS level for this lesson'
          )}
        </FormHelperText>
      </FormControl>
      
      <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>LSCS Level System:</strong> Little Star Chinese School organizes lessons into 
          7 progressive levels plus advanced content. Each level corresponds to specific 
          learning objectives and complexity appropriate for different student groups.
        </Typography>
      </Box>
    </Box>
  );
};

export default LSCSLevelSelector;