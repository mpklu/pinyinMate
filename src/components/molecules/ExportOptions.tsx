/**
 * ExportOptions component (format selection)
 * Provides options for exporting learning content in various formats
 */

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  PictureAsPdf as PDFIcon,
  Description as AnkiIcon,
  Quiz as QuizletIcon,
  Settings as OptionsIcon,
} from '@mui/icons-material';

export type ExportFormat = 'pdf' | 'anki' | 'quizlet' | 'csv';
export type ExportContentType = 'flashcards' | 'quiz' | 'annotation' | 'vocabulary';

interface ExportOptionsProps {
  /** Available export formats */
  availableFormats?: ExportFormat[];
  /** Content type being exported */
  contentType: ExportContentType;
  /** Initial selected format */
  initialFormat?: ExportFormat;
  /** Whether export is in progress */
  isExporting?: boolean;
  /** Export progress (0-100) */
  exportProgress?: number;
  /** Callback when export is requested */
  onExport?: (options: ExportConfig) => void;
  /** Callback when format changes */
  onFormatChange?: (format: ExportFormat) => void;
}

export interface ExportConfig {
  format: ExportFormat;
  contentType: ExportContentType;
  options: {
    // PDF options
    pageSize?: 'A4' | 'Letter' | 'A5';
    fontSize?: number;
    margin?: number;
    includeAnswers?: boolean;
    
    // Flashcard options
    includeDefinitions?: boolean;
    includeExamples?: boolean;
    includePinyin?: boolean;
    
    // CSV/Quizlet options
    delimiter?: string;
    encoding?: 'UTF-8' | 'UTF-16';
    
    // General options
    filename?: string;
    title?: string;
  };
}

const StyledExportCard = styled(Card)(() => ({
  maxWidth: 600,
  margin: 'auto',
}));

const StyledFormatSelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const StyledFormatChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiChip-icon': {
      color: theme.palette.primary.contrastText,
    },
  }),
  
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledOptionsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

// Format configurations
const formatConfigs = {
  pdf: {
    label: 'PDF Document',
    icon: PDFIcon,
    description: 'Print-friendly document format',
    supportedContent: ['flashcards', 'quiz', 'annotation', 'vocabulary'] as ExportContentType[],
  },
  anki: {
    label: 'Anki Cards',
    icon: AnkiIcon,
    description: 'Import into Anki spaced repetition app',
    supportedContent: ['flashcards', 'vocabulary'] as ExportContentType[],
  },
  quizlet: {
    label: 'Quizlet Set',
    icon: QuizletIcon,
    description: 'CSV format for Quizlet import',
    supportedContent: ['flashcards', 'vocabulary'] as ExportContentType[],
  },
  csv: {
    label: 'CSV File',
    icon: QuizletIcon,
    description: 'Comma-separated values for spreadsheets',
    supportedContent: ['flashcards', 'vocabulary', 'annotation'] as ExportContentType[],
  },
};

/**
 * Export options component
 */
const ExportOptions: React.FC<ExportOptionsProps> = ({
  availableFormats = ['pdf', 'anki', 'quizlet', 'csv'],
  contentType,
  initialFormat = 'pdf',
  isExporting = false,
  exportProgress = 0,
  onExport,
  onFormatChange,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat);
  const [options, setOptions] = useState<ExportConfig['options']>({
    pageSize: 'A4',
    fontSize: 12,
    margin: 20,
    includeAnswers: true,
    includeDefinitions: true,
    includeExamples: true,
    includePinyin: true,
    delimiter: ',',
    encoding: 'UTF-8',
    filename: '',
    title: '',
  });

  // Filter available formats based on content type
  const supportedFormats = availableFormats.filter(format =>
    formatConfigs[format].supportedContent.includes(contentType)
  );

  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format);
    onFormatChange?.(format);
  };

  const handleOptionChange = (key: keyof ExportConfig['options'], value: string | number | boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExport = () => {
    const config: ExportConfig = {
      format: selectedFormat,
      contentType,
      options,
    };
    onExport?.(config);
  };

  const renderFormatOptions = () => {
    switch (selectedFormat) {
      case 'pdf':
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <FormLabel>Page Size</FormLabel>
              <Select
                value={options.pageSize || 'A4'}
                onChange={(e) => handleOptionChange('pageSize', e.target.value)}
                size="small"
              >
                <MenuItem value="A4">A4</MenuItem>
                <MenuItem value="Letter">Letter</MenuItem>
                <MenuItem value="A5">A5</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <FormLabel>Font Size</FormLabel>
              <TextField
                type="number"
                value={options.fontSize || 12}
                onChange={(e) => handleOptionChange('fontSize', parseInt(e.target.value))}
                slotProps={{ htmlInput: { min: 8, max: 24 } }}
                size="small"
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <FormLabel>Margin (mm)</FormLabel>
              <TextField
                type="number"
                value={options.margin || 20}
                onChange={(e) => handleOptionChange('margin', parseInt(e.target.value))}
                slotProps={{ htmlInput: { min: 0, max: 50 } }}
                size="small"
              />
            </FormControl>
            
            {(contentType === 'quiz' || contentType === 'flashcards') && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeAnswers ?? true}
                    onChange={(e) => handleOptionChange('includeAnswers', e.target.checked)}
                  />
                }
                label="Include answers"
              />
            )}
          </Box>
        );
        
      case 'quizlet':
      case 'csv':
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <FormLabel>Delimiter</FormLabel>
              <Select
                value={options.delimiter || ','}
                onChange={(e) => handleOptionChange('delimiter', e.target.value)}
                size="small"
              >
                <MenuItem value=",">, (Comma)</MenuItem>
                <MenuItem value="&#9;">\t (Tab)</MenuItem>
                <MenuItem value=";">; (Semicolon)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <FormLabel>Character Encoding</FormLabel>
              <Select
                value={options.encoding || 'UTF-8'}
                onChange={(e) => handleOptionChange('encoding', e.target.value)}
                size="small"
              >
                <MenuItem value="UTF-8">UTF-8</MenuItem>
                <MenuItem value="UTF-16">UTF-16</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
        
      case 'anki':
        return (
          <Alert severity="info" sx={{ mt: 2 }}>
            Anki export will generate an .apkg file that can be imported directly into Anki.
          </Alert>
        );
        
      default:
        return null;
    }
  };

  const renderContentOptions = () => {
    if (contentType !== 'flashcards' && contentType !== 'vocabulary') {
      return null;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Content Options
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={options.includeDefinitions ?? true}
              onChange={(e) => handleOptionChange('includeDefinitions', e.target.checked)}
            />
          }
          label="Include definitions"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={options.includeExamples ?? true}
              onChange={(e) => handleOptionChange('includeExamples', e.target.checked)}
            />
          }
          label="Include examples"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={options.includePinyin ?? true}
              onChange={(e) => handleOptionChange('includePinyin', e.target.checked)}
            />
          }
          label="Include pinyin"
        />
      </Box>
    );
  };

  return (
    <StyledExportCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Export Options
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Choose a format and configure options for exporting your {contentType}.
        </Typography>

        {/* Format Selection */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          
          <StyledFormatSelector>
            {supportedFormats.map((format) => {
              const config = formatConfigs[format];
              const Icon = config.icon;
              
              return (
                <StyledFormatChip
                  key={format}
                  selected={selectedFormat === format}
                  icon={<Icon />}
                  label={config.label}
                  onClick={() => handleFormatChange(format)}
                  variant={selectedFormat === format ? 'filled' : 'outlined'}
                />
              );
            })}
          </StyledFormatSelector>
          
          {formatConfigs[selectedFormat] && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {formatConfigs[selectedFormat].description}
            </Typography>
          )}
        </Box>

        {/* Advanced Options */}
        <StyledOptionsSection>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <OptionsIcon fontSize="small" />
                <Typography variant="subtitle1">
                  Advanced Options
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* General Options */}
              <TextField
                fullWidth
                label="Filename (optional)"
                value={options.filename || ''}
                onChange={(e) => handleOptionChange('filename', e.target.value)}
                margin="normal"
                size="small"
                placeholder="Leave empty for auto-generated name"
              />
              
              <TextField
                fullWidth
                label="Title (optional)"
                value={options.title || ''}
                onChange={(e) => handleOptionChange('title', e.target.value)}
                margin="normal"
                size="small"
                placeholder="Document title"
              />
              
              {/* Format-specific options */}
              {renderFormatOptions()}
              
              {/* Content-specific options */}
              {renderContentOptions()}
            </AccordionDetails>
          </Accordion>
        </StyledOptionsSection>

        {/* Export Progress */}
        {isExporting && (
          <StyledProgressContainer>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Exporting... {exportProgress}%
            </Typography>
          </StyledProgressContainer>
        )}
      </CardContent>

      <CardActions>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={isExporting}
          fullWidth
        >
          {isExporting ? 'Exporting...' : `Export as ${formatConfigs[selectedFormat].label}`}
        </Button>
      </CardActions>
    </StyledExportCard>
  );
};

export default ExportOptions;
export type { ExportOptionsProps };