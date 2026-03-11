import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { ArrowBack, Settings } from '@mui/icons-material';
import 'lxgw-wenkai-webfont/style.css';
import '../../styles/mizige.css';
import { WorksheetPreview } from '../mizige/WorksheetPreview';
import { LearnMode } from '../mizige/LearnMode';
import { MizigeSettingsDrawer } from '../mizige/MizigeSettingsDrawer';
import { extractChineseChars } from '../../utils/mizige/pinyin';
import { exportToPdf } from '../../utils/mizige/pdf';

export interface MizigePageProps {
  onBack?: () => void;
  onHome?: () => void;
}

export function MizigePage({ onBack }: MizigePageProps) {
  const [text, setText] = useState('黄河之水天上来');
  const [traceCells, setTraceCells] = useState(3);
  const [blankCells, setBlankCells] = useState(5);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showStrokeOrder, setShowStrokeOrder] = useState(true);
  const [maxStrokeFrames, setMaxStrokeFrames] = useState(11);
  const [cellSize, setCellSize] = useState(72);
  const [gridType, setGridType] = useState<'mizige' | 'tianzige'>('mizige');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [isExporting, setIsExporting] = useState(false);
  const [mode, setMode] = useState<'worksheet' | 'learn'>('worksheet');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const charCount = useMemo(() => extractChineseChars(text).length, [text]);

  useEffect(() => { setCurrentCharIndex(0); }, [text]);

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      await exportToPdf(previewRef.current, paperSize);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [paperSize]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back" sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: "'LXGW WenKai', serif" }}>
            米字格
          </Typography>
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} aria-label="settings">
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content area with mizige aesthetic */}
      <Box
        className="mizige-root"
        sx={{
          flex: 1,
          overflow: 'auto',
          background: '#0d0f12',
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(201, 168, 76, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(232, 75, 58, 0.02) 0%, transparent 50%)
          `,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', p: { xs: 3, lg: 5 } }}>
          {mode === 'learn' ? (
            <LearnMode
              text={text}
              currentCharIndex={currentCharIndex}
              onCharIndexChange={setCurrentCharIndex}
              showPinyin={showPinyin}
              gridType={gridType}
              drawerOpen={drawerOpen}
            />
          ) : (
            <WorksheetPreview
              ref={previewRef}
              text={text}
              traceCells={traceCells}
              blankCells={blankCells}
              cellSize={cellSize}
              showPinyin={showPinyin}
              showStrokeOrder={showStrokeOrder}
              maxStrokeFrames={maxStrokeFrames}
              gridType={gridType}
            />
          )}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            flexShrink: 0,
            textAlign: 'center',
            py: 1.5,
            fontSize: 12,
            color: '#6b665e',
            borderTop: '1px solid #2a2e38',
          }}
        >
          Stroke data powered by{' '}
          <a
            href="https://hanziwriter.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9a9488' }}
          >
            Hanzi Writer
          </a>
        </Box>
      </Box>

      {/* Settings drawer */}
      <MizigeSettingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={mode}
        onModeChange={setMode}
        text={text}
        onTextChange={setText}
        traceCells={traceCells}
        onTraceCellsChange={setTraceCells}
        blankCells={blankCells}
        onBlankCellsChange={setBlankCells}
        showPinyin={showPinyin}
        onShowPinyinChange={setShowPinyin}
        showStrokeOrder={showStrokeOrder}
        onShowStrokeOrderChange={setShowStrokeOrder}
        maxStrokeFrames={maxStrokeFrames}
        onMaxStrokeFramesChange={setMaxStrokeFrames}
        cellSize={cellSize}
        onCellSizeChange={setCellSize}
        gridType={gridType}
        onGridTypeChange={setGridType}
        paperSize={paperSize}
        onPaperSizeChange={setPaperSize}
        onExport={handleExport}
        isExporting={isExporting}
        charCount={charCount}
      />
    </Box>
  );
}
