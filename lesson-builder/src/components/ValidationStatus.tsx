import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';
import type { ValidationResult } from '../types';

interface ValidationStatusProps {
  validation: ValidationResult;
}

const ValidationStatus = ({ validation }: ValidationStatusProps) => {
  const getStatusIcon = () => {
    if (!validation.isValid) {
      return <Error color="error" />;
    }
    if (validation.warnings.length > 0) {
      return <Warning color="warning" />;
    }
    return <CheckCircle color="success" />;
  };

  const getStatusText = () => {
    if (!validation.isValid) {
      return 'Validation Failed';
    }
    if (validation.warnings.length > 0) {
      return 'Valid with Warnings';
    }
    return 'Validation Passed';
  };

  const getStatusColor = () => {
    if (!validation.isValid) return 'error';
    if (validation.warnings.length > 0) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {getStatusText()}
        </Typography>
        <Chip
          label={validation.isValid ? 'Valid' : 'Invalid'}
          color={getStatusColor() as 'success' | 'warning' | 'error'}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      {validation.errors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Errors ({validation.errors.length})
          </Typography>
          <List dense>
            {validation.errors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={error.message}
                  secondary={error.field}
                  primaryTypographyProps={{ color: 'error', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {validation.warnings.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="warning.main" gutterBottom>
            Warnings ({validation.warnings.length})
          </Typography>
          <List dense>
            {validation.warnings.map((warning, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={warning.message}
                  secondary={warning.field}
                  primaryTypographyProps={{ color: 'warning.main', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {validation.isValid && validation.warnings.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          All validation checks passed. Lesson is ready for export or publishing.
        </Typography>
      )}
    </Box>
  );
};

export default ValidationStatus;