/**
 * ExportPanel - Organism component
 * Interface for exporting content in various formats
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Divider,
  styled,
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  Description,
} from '@mui/icons-material';

import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';

import type { TextSegment } from '../../types/annotation';

// Styled components
const ExportContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const FormatSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  maxHeight: 200,
  overflow: 'auto',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
}));

export type ExportFormat = 'pdf' | 'csv' | 'txt';

export interface ExportOptions {
  includePinyin: boolean;
  includeDefinitions: boolean;
}

export interface ExportPanelProps {
  /** Text segments to export */
  segments: TextSegment[];
  /** Export title */
  title?: string;
  /** Available export formats */
  availableFormats?: ExportFormat[];
  /** Custom CSS class */
  className?: string;
  /** Callback when export starts */
  onExportStart?: (format: ExportFormat, options: ExportOptions) => void;
  /** Callback when export completes */
  onExportComplete?: (format: ExportFormat) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  pdf: <PictureAsPdf />,
  csv: <TableChart />,
  txt: <Description />,
};

const formatLabels: Record<ExportFormat, string> = {
  pdf: 'PDF Document',
  csv: 'CSV Spreadsheet',
  txt: 'Plain Text',
};

export const ExportPanel: React.FC<ExportPanelProps> = ({
  segments,
  title = 'Chinese Study Materials',
  availableFormats = ['pdf', 'csv', 'txt'],
  className,
  onExportStart,
  onExportComplete,
  onError,
}) => {
  // State
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(availableFormats[0] || 'pdf');
  const [options, setOptions] = useState<ExportOptions>({
    includePinyin: true,
    includeDefinitions: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle format change
  const handleFormatChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const format = event.target.value as ExportFormat;
    setSelectedFormat(format);
  }, []);

  // Handle option change
  const handleOptionChange = useCallback((option: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  }, []);

  // Generate preview content
  const generatePreview = useCallback((format: ExportFormat, exportOptions: ExportOptions) => {
    const sampleSegments = segments.slice(0, 3);
    let preview = '';
    
    switch (format) {
      case 'pdf':
        preview = `${title}\n\n`;
        sampleSegments.forEach((segment, index) => {
          preview += `${index + 1}. ${segment.text}`;
          if (exportOptions.includePinyin) preview += ` (${segment.pinyin})`;
          if (exportOptions.includeDefinitions && segment.definition) {
            preview += `\n   Definition: ${segment.definition}`;
          }
          preview += '\n\n';
        });
        break;
        
      case 'csv':
        preview = 'Chinese,Pinyin,Definition\n';
        sampleSegments.forEach(segment => {
          const pinyin = exportOptions.includePinyin ? segment.pinyin : '';
          const definition = exportOptions.includeDefinitions ? (segment.definition || '') : '';
          preview += `"${segment.text}","${pinyin}","${definition}"\n`;
        });
        break;
        
      case 'txt':
        sampleSegments.forEach(segment => {
          preview += segment.text;
          if (exportOptions.includePinyin) preview += ` (${segment.pinyin})`;
          if (exportOptions.includeDefinitions && segment.definition) {
            preview += ` - ${segment.definition}`;
          }
          preview += '\n';
        });
        break;
    }
    
    return preview;
  }, [segments, title]);

  // Handle export (simplified mock implementation)
  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      onExportStart?.(selectedFormat, options);

      // Mock export delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate content
      const content = generatePreview(selectedFormat, options);
      
      // Create and download file
      const blob = new Blob([content], { 
        type: selectedFormat === 'csv' ? 'text/csv' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onExportComplete?.(selectedFormat);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Export failed');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedFormat, options, title, generatePreview, onExportStart, onExportComplete, onError]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  const hasContent = segments.length > 0;
  const previewContent = hasContent ? generatePreview(selectedFormat, options) : '';

  return (
    <ExportContainer className={className}>
      {/* Header */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Export Study Materials
        </Typography>
        
        {hasContent && (
          <Chip 
            label={`${segments.length} segments`}
            size="small"
            color="primary"
          />
        )}
      </Box>

      {/* Content */}
      {hasContent ? (
        <>
          {/* Format Selection */}
          <FormatSection>
            <FormControl>
              <FormLabel component="legend">Export Format</FormLabel>
              <RadioGroup
                value={selectedFormat}
                onChange={handleFormatChange}
              >
                {availableFormats.map((format) => (
                  <FormControlLabel
                    key={format}
                    value={format}
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {formatIcons[format]}
                        <Typography variant="body2">
                          {formatLabels[format]}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </FormatSection>

          {/* Export Options */}
          <FormatSection>
            <FormLabel component="legend">Export Options</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includePinyin}
                    onChange={() => handleOptionChange('includePinyin')}
                  />
                }
                label="Include Pinyin"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeDefinitions}
                    onChange={() => handleOptionChange('includeDefinitions')}
                  />
                }
                label="Include Definitions"
              />
            </FormGroup>
          </FormatSection>

          {/* Preview */}
          {previewContent && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preview (first 3 items)
              </Typography>
              <PreviewContainer>
                <pre>{previewContent}</pre>
              </PreviewContainer>
            </Box>
          )}

          <Divider />

          {/* Export Actions */}
          <Box>
            {isExporting && (
              <Box display="flex" justifyContent="center" py={2}>
                <LoadingSpinner message={`Exporting ${formatLabels[selectedFormat]}...`} />
              </Box>
            )}

            {error && (
              <ErrorMessage
                message={error}
                onRetry={handleRetry}
              />
            )}

            {!isExporting && !error && (
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  onClick={handleExport}
                  disabled={!hasContent}
                >
                  Export {formatLabels[selectedFormat]}
                </Button>
              </Stack>
            )}
          </Box>
        </>
      ) : (
        /* Empty State */
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={6}
          color="text.secondary"
        >
          <Typography variant="h6" gutterBottom>
            No Content to Export
          </Typography>
          <Typography variant="body1" align="center">
            Add text segments to enable export functionality.
          </Typography>
        </Box>
      )}
    </ExportContainer>
  );
};