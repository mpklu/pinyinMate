/**
 * CategoryFilter - Molecule component
 * Provides filtering and search functionality for lesson library
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  styled,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

import type { SearchQuery, LessonCategory } from '../../types/library';
import type { DifficultyLevel } from '../../types/common';

// Styled components
const FilterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'flex-end',
  marginBottom: theme.spacing(2),
}));

const TagContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
}));

const FilterActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

export interface CategoryFilterProps {
  /** Available categories */
  categories: LessonCategory[];
  /** Current search query */
  query: SearchQuery;
  /** Available tags for filtering */
  availableTags?: string[];
  /** Whether the filter is in compact mode */
  compact?: boolean;
  /** Callback when search query changes */
  onQueryChange: (query: SearchQuery) => void;
  /** Callback when filters are cleared */
  onClear?: () => void;
  /** Custom CSS class */
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  query,
  availableTags = [],
  compact = false,
  onQueryChange,
  onClear,
  className,
}) => {
  const [searchText, setSearchText] = useState(query.text || '');
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>(
    query.difficulty || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(query.tags || []);
  const [selectedCategory, setSelectedCategory] = useState(query.category || '');
  const [hasAudio, setHasAudio] = useState(query.hasAudio || false);

  // Extract all unique tags from categories if not provided
  const allTags = availableTags.length > 0 
    ? availableTags 
    : Array.from(
        new Set(
          categories.flatMap(cat => 
            cat.lessons.flatMap(lesson => lesson.metadata.tags)
          )
        )
      ).sort();

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    onQueryChange({
      ...query,
      text: text.trim() || undefined,
    });
  }, [query, onQueryChange]);

  const handleDifficultyChange = useCallback((difficulties: DifficultyLevel[]) => {
    setSelectedDifficulties(difficulties);
    onQueryChange({
      ...query,
      difficulty: difficulties.length > 0 ? difficulties : undefined,
    });
  }, [query, onQueryChange]);

  const handleTagChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
    onQueryChange({
      ...query,
      tags: tags.length > 0 ? tags : undefined,
    });
  }, [query, onQueryChange]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    onQueryChange({
      ...query,
      category: category || undefined,
    });
  }, [query, onQueryChange]);

  const handleAudioChange = useCallback((audio: boolean) => {
    setHasAudio(audio);
    onQueryChange({
      ...query,
      hasAudio: audio || undefined,
    });
  }, [query, onQueryChange]);

  const handleClear = useCallback(() => {
    setSearchText('');
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setSelectedCategory('');
    setHasAudio(false);
    
    onQueryChange({});
    onClear?.();
  }, [onQueryChange, onClear]);

  const hasActiveFilters = Boolean(
    searchText || 
    selectedDifficulties.length > 0 || 
    selectedTags.length > 0 || 
    selectedCategory ||
    hasAudio
  );

  const getLessonCount = (categoryId?: string) => {
    if (!categoryId) {
      return categories.reduce((sum, cat) => sum + cat.totalLessons, 0);
    }
    const category = categories.find(cat => cat.id === categoryId);
    return category?.totalLessons || 0;
  };

  if (compact) {
    return (
      <FilterContainer className={className}>
        <SearchContainer>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search lessons..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
              endAdornment: searchText && (
                <Button
                  size="small"
                  onClick={() => handleSearchChange('')}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="">
                All ({getLessonCount()})
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.totalLessons})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SearchContainer>

        {hasActiveFilters && (
          <FilterActions>
            <Typography variant="caption" color="text.secondary">
              {hasActiveFilters ? 'Filters active' : 'No filters'}
            </Typography>
            <Button size="small" onClick={handleClear}>
              Clear All
            </Button>
          </FilterActions>
        )}
      </FilterContainer>
    );
  }

  return (
    <FilterContainer className={className}>
      {/* Search */}
      <SearchContainer>
        <TextField
          fullWidth
          variant="outlined"
          label="Search lessons"
          placeholder="Enter keywords, lesson titles, or topics..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
            endAdornment: searchText && (
              <Button
                size="small"
                onClick={() => handleSearchChange('')}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </Button>
            ),
          }}
        />
      </SearchContainer>

      {/* Category Filter */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <MenuItem value="">
            <Box display="flex" justifyContent="space-between" width="100%">
              <span>All Categories</span>
              <Chip label={getLessonCount()} size="small" />
            </Box>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              <Box display="flex" justifyContent="space-between" width="100%">
                <span>{category.name}</span>
                <Chip label={category.totalLessons} size="small" />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Advanced Filters */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon fontSize="small" />
            Advanced Filters
            {hasActiveFilters && (
              <Chip label="Active" size="small" color="primary" />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Difficulty */}
          <Typography variant="subtitle2" gutterBottom>
            Difficulty Level
          </Typography>
          <FormGroup row sx={{ mb: 2 }}>
            {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((difficulty) => (
              <FormControlLabel
                key={difficulty}
                control={
                  <Checkbox
                    checked={selectedDifficulties.includes(difficulty)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDifficultyChange([...selectedDifficulties, difficulty]);
                      } else {
                        handleDifficultyChange(
                          selectedDifficulties.filter(d => d !== difficulty)
                        );
                      }
                    }}
                  />
                }
                label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              />
            ))}
          </FormGroup>

          {/* Tags */}
          {allTags.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Topics
              </Typography>
              <TagContainer sx={{ mb: 2 }}>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    clickable
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        handleTagChange(selectedTags.filter(t => t !== tag));
                      } else {
                        handleTagChange([...selectedTags, tag]);
                      }
                    }}
                  />
                ))}
              </TagContainer>
            </>
          )}

          {/* Audio Filter */}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasAudio}
                  onChange={(e) => handleAudioChange(e.target.checked)}
                />
              }
              label="Has audio content"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Filter Actions */}
      <FilterActions>
        <Typography variant="caption" color="text.secondary">
          {hasActiveFilters 
            ? `${selectedDifficulties.length + selectedTags.length + (selectedCategory ? 1 : 0) + (hasAudio ? 1 : 0)} filters active`
            : 'No filters applied'
          }
        </Typography>
        <Button 
          size="small" 
          onClick={handleClear}
          disabled={!hasActiveFilters}
          startIcon={<ClearIcon />}
        >
          Clear All
        </Button>
      </FilterActions>
    </FilterContainer>
  );
};

export default CategoryFilter;