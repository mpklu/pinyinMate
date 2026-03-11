import { useCallback, useEffect, useMemo, useState } from 'react';
import { CharacterCard } from './CharacterCard';
import { LearnControls } from './LearnControls';
import { extractChineseChars, getPinyin } from '../../utils/mizige/pinyin';
import { filterAvailableChars, loadStrokeData } from '../../utils/mizige/strokes';

interface LearnModeProps {
  text: string;
  currentCharIndex: number;
  onCharIndexChange: (i: number) => void;
  showPinyin: boolean;
  gridType: 'mizige' | 'tianzige';
  drawerOpen: boolean;
}

function computeCanvasSize(drawerOpen: boolean): number {
  const drawerWidth = drawerOpen ? 320 : 0;
  const padding = 80;
  const overhead = 280; // AppBar (~64) + pinyin + stroke info + replay + controls + gaps
  const availW = window.innerWidth - drawerWidth - padding;
  const availH = window.innerHeight - overhead;
  return Math.max(200, Math.min(560, Math.floor(Math.min(availW, availH))));
}

export function LearnMode({
  text, currentCharIndex, onCharIndexChange, showPinyin, gridType, drawerOpen,
}: LearnModeProps) {
  const [availableChars, setAvailableChars] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [strokeCounts, setStrokeCounts] = useState<Record<string, number>>({});
  const [canvasSize, setCanvasSize] = useState(() => computeCanvasSize(drawerOpen));

  useEffect(() => {
    const onResize = () => setCanvasSize(computeCanvasSize(drawerOpen));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawerOpen]);

  useEffect(() => {
    const timer = setTimeout(() => { setCanvasSize(computeCanvasSize(drawerOpen)); }, 320);
    return () => clearTimeout(timer);
  }, [drawerOpen]);

  const allChars = useMemo(() => extractChineseChars(text), [text]);

  useEffect(() => { filterAvailableChars(allChars).then(setAvailableChars); }, [allChars]);
  useEffect(() => { setIsComplete(false); }, [availableChars]);

  useEffect(() => {
    if (availableChars.length === 0) return;
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        availableChars.map(async (char) => {
          const data = await loadStrokeData(char);
          if (data) counts[char] = data.strokes.length;
        }),
      );
      setStrokeCounts(counts);
    };
    loadCounts();
  }, [availableChars]);

  const currentChar = availableChars[currentCharIndex] || '';
  const currentPinyin = currentChar ? getPinyin(currentChar) : '';
  const currentStrokeCount = currentChar ? (strokeCounts[currentChar] ?? 0) : 0;

  const handleQuizComplete = useCallback(() => {
    if (currentCharIndex < availableChars.length - 1) {
      onCharIndexChange(currentCharIndex + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentCharIndex, availableChars.length, onCharIndexChange]);

  const handleStartOver = useCallback(() => {
    onCharIndexChange(0);
    setIsComplete(false);
  }, [onCharIndexChange]);

  if (availableChars.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 16 }}>
        <div style={{ fontFamily: "'LXGW WenKai', serif", fontSize: 64, color: '#a09080' }}>学</div>
        <p style={{ color: 'var(--text-muted)' }}>Enter Chinese characters to start learning</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 16 }}>
        <div style={{ fontSize: 64, color: 'var(--jade-accent)' }}>&#x2713;</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Complete!</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          {availableChars.length} character{availableChars.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleStartOver}
          style={{
            padding: '8px 24px', borderRadius: 8, color: 'white', fontWeight: 500, cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--vermillion), var(--gold-accent))', border: 'none',
          }}
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 24 }}>
      <CharacterCard
        key={currentChar}
        char={currentChar}
        pinyin={currentPinyin}
        showPinyin={showPinyin}
        gridType={gridType}
        strokeCount={currentStrokeCount}
        size={canvasSize}
        onQuizComplete={handleQuizComplete}
      />
      <LearnControls
        current={currentCharIndex}
        total={availableChars.length}
        onPrev={() => onCharIndexChange(currentCharIndex - 1)}
        onNext={() => onCharIndexChange(currentCharIndex + 1)}
      />
    </div>
  );
}
