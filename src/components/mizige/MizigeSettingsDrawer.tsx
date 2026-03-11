import {
  Drawer,
  Box,
  Typography,
  TextField,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  IconButton,
  Slider,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface MizigeSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'worksheet' | 'learn';
  onModeChange: (mode: 'worksheet' | 'learn') => void;
  text: string;
  onTextChange: (text: string) => void;
  traceCells: number;
  onTraceCellsChange: (n: number) => void;
  blankCells: number;
  onBlankCellsChange: (n: number) => void;
  showPinyin: boolean;
  onShowPinyinChange: (v: boolean) => void;
  showStrokeOrder: boolean;
  onShowStrokeOrderChange: (v: boolean) => void;
  maxStrokeFrames: number;
  onMaxStrokeFramesChange: (n: number) => void;
  cellSize: number;
  onCellSizeChange: (n: number) => void;
  gridType: 'mizige' | 'tianzige';
  onGridTypeChange: (v: 'mizige' | 'tianzige') => void;
  paperSize: 'a4' | 'letter';
  onPaperSizeChange: (v: 'a4' | 'letter') => void;
  onExport: () => void;
  isExporting: boolean;
  charCount: number;
}

const drawerSx = {
  '& .MuiDrawer-paper': {
    width: 320,
    bgcolor: '#161920',
    color: '#e8e0d4',
    borderLeft: '1px solid #2a2e38',
  },
};

const sectionLabel = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#6b665e',
  mb: 1,
};

const toggleGroupSx = {
  width: '100%',
  '& .MuiToggleButton-root': {
    flex: 1,
    color: '#6b665e',
    borderColor: '#2a2e38',
    fontSize: 13,
    py: 0.75,
    '&.Mui-selected': {
      bgcolor: '#363a46',
      color: '#e84b3a',
      borderColor: '#e84b3a',
      '&:hover': { bgcolor: '#363a46' },
    },
  },
};

const goldToggleGroupSx = {
  width: '100%',
  '& .MuiToggleButton-root': {
    flex: 1,
    color: '#6b665e',
    borderColor: '#2a2e38',
    fontSize: 13,
    py: 0.75,
    '&.Mui-selected': {
      bgcolor: '#363a46',
      color: '#c9a84c',
      borderColor: '#c9a84c',
      '&:hover': { bgcolor: '#363a46' },
    },
  },
};

const sliderSx = {
  color: '#c9a84c',
  '& .MuiSlider-thumb': { width: 16, height: 16 },
  '& .MuiSlider-track': { height: 4 },
  '& .MuiSlider-rail': { height: 4, bgcolor: '#2a2e38' },
};

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#e84b3a' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#e84b3a' },
  '& .MuiSwitch-track': { bgcolor: '#2a2e38' },
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#1c2028',
    color: '#e8e0d4',
    fontFamily: "'LXGW WenKai', serif",
    fontSize: 16,
    lineHeight: 1.8,
    '& fieldset': { borderColor: '#2a2e38' },
    '&:hover fieldset': { borderColor: '#363a46' },
    '&.Mui-focused fieldset': { borderColor: '#c9a84c' },
  },
  '& .MuiInputLabel-root': { color: '#6b665e' },
};

export function MizigeSettingsDrawer({
  open, onClose, mode, onModeChange, text, onTextChange,
  traceCells, onTraceCellsChange, blankCells, onBlankCellsChange,
  showPinyin, onShowPinyinChange, showStrokeOrder, onShowStrokeOrderChange,
  maxStrokeFrames, onMaxStrokeFramesChange, cellSize, onCellSizeChange,
  gridType, onGridTypeChange, paperSize, onPaperSizeChange,
  onExport, isExporting, charCount,
}: MizigeSettingsDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={drawerSx}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2.5, gap: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '1px solid #2a2e38' }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, background: 'linear-gradient(135deg, #e84b3a, #c9a84c)', fontFamily: "'LXGW WenKai', serif",
            fontWeight: 900, color: 'white',
          }}>
            米
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: "'LXGW WenKai', serif", color: '#e8e0d4' }}>
              米字格
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#6b665e' }}>Practice Sheet Generator</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#6b665e' }}><Close fontSize="small" /></IconButton>
        </Box>

        {/* Mode toggle */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && onModeChange(v)}
          sx={toggleGroupSx}
        >
          <ToggleButton value="worksheet">Worksheet</ToggleButton>
          <ToggleButton value="learn">Learn</ToggleButton>
        </ToggleButtonGroup>

        {/* Text input */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={sectionLabel}>Chinese Text</Typography>
            {charCount > 0 && (
              <Typography sx={{ fontSize: 12, color: '#6b665e', fontVariantNumeric: 'tabular-nums' }}>
                {charCount} chars
              </Typography>
            )}
          </Box>
          <TextField
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="输入中文字符..."
            multiline
            rows={4}
            fullWidth
            sx={textFieldSx}
          />
        </Box>

        {/* Layout settings (worksheet only) */}
        {mode === 'worksheet' && (
          <Box>
            <Typography sx={sectionLabel}>Layout</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14, color: '#9a9488' }}>Trace cells</Typography>
                <Slider value={traceCells} onChange={(_, v) => onTraceCellsChange(v as number)} min={0} max={10} sx={{ ...sliderSx, width: 140 }} valueLabelDisplay="auto" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14, color: '#9a9488' }}>Blank cells</Typography>
                <Slider value={blankCells} onChange={(_, v) => onBlankCellsChange(v as number)} min={0} max={10} sx={{ ...sliderSx, width: 140 }} valueLabelDisplay="auto" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14, color: '#9a9488' }}>Cell size</Typography>
                <Slider value={cellSize} onChange={(_, v) => onCellSizeChange(v as number)} min={40} max={120} step={4} sx={{ ...sliderSx, width: 140 }} valueLabelDisplay="auto" />
              </Box>
              {showStrokeOrder && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 14, color: '#9a9488' }}>Max stroke frames</Typography>
                  <Slider value={maxStrokeFrames} onChange={(_, v) => onMaxStrokeFramesChange(v as number)} min={4} max={12} sx={{ ...sliderSx, width: 140 }} valueLabelDisplay="auto" />
                </Box>
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: '#2a2e38' }} />

        {/* Display */}
        <Box>
          <Typography sx={sectionLabel}>Display</Typography>
          <FormControlLabel
            control={<Switch checked={showPinyin} onChange={(e) => onShowPinyinChange(e.target.checked)} sx={switchSx} />}
            label={<Typography sx={{ fontSize: 14, color: '#9a9488' }}>Show Pinyin</Typography>}
            sx={{ ml: 0 }}
          />
        </Box>

        {/* Stroke Order (worksheet only) */}
        {mode === 'worksheet' && (
          <FormControlLabel
            control={<Switch checked={showStrokeOrder} onChange={(e) => onShowStrokeOrderChange(e.target.checked)} sx={switchSx} />}
            label={<Typography sx={{ fontSize: 14, color: '#9a9488' }}>Stroke Order</Typography>}
            sx={{ ml: 0 }}
          />
        )}

        {/* Grid type */}
        <Box>
          <Typography sx={sectionLabel}>Grid Type</Typography>
          <ToggleButtonGroup
            value={gridType}
            exclusive
            onChange={(_, v) => v && onGridTypeChange(v)}
            sx={goldToggleGroupSx}
          >
            <ToggleButton value="mizige">米字格</ToggleButton>
            <ToggleButton value="tianzige">田字格</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Paper size (worksheet only) */}
        {mode === 'worksheet' && (
          <Box>
            <Typography sx={sectionLabel}>Paper Size</Typography>
            <ToggleButtonGroup
              value={paperSize}
              exclusive
              onChange={(_, v) => v && onPaperSizeChange(v)}
              sx={goldToggleGroupSx}
            >
              <ToggleButton value="a4">A4</ToggleButton>
              <ToggleButton value="letter">LETTER</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Spacer + Export */}
        <Box sx={{ flex: 1 }} />
        {mode === 'worksheet' && (
          <Button
            onClick={onExport}
            disabled={isExporting || charCount === 0}
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              fontSize: 14,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #e84b3a, #c03a2a)',
              color: 'white',
              letterSpacing: '0.5px',
              '&:hover': { background: 'linear-gradient(135deg, #f0705e, #e84b3a)' },
              '&.Mui-disabled': { opacity: 0.4, color: 'white', background: 'linear-gradient(135deg, #e84b3a, #c03a2a)' },
            }}
          >
            {isExporting ? 'Generating PDF...' : 'Export PDF'}
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
