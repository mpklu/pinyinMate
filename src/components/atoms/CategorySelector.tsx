/**
 * CategorySelector Atomic Component
 * Dropdown selector for filtering lessons by category
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

// Component props interface
interface CategorySelectorProps {
  categories: string[];
  value?: string | null;
  onChange?: (category: string | null) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  value = null,
  onChange,
  label = 'Category',
  disabled = false,
  error = false,
  helperText,
  loading = false,
  fullWidth = true
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    if (onChange) {
      onChange(selectedValue === 'all' ? null : selectedValue);
    }
  };

  const displayValue = value ?? 'all';
  const labelId = `category-selector-label-${React.useId()}`;

  return (
    <FormControl 
      fullWidth={fullWidth} 
      disabled={disabled || loading} 
      error={error}
      className={error ? 'Mui-error' : undefined}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={displayValue}
        onChange={handleChange}
        label={label}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        tabIndex={0}
        inputProps={{
          'aria-labelledby': labelId
        }}
        endAdornment={
          loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : undefined
        }
      >
        <MenuItem value="all">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};