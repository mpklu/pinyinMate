import { memo, useCallback, useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

const REF_SIZE = 560;
const REF_PADDING = 40;

interface CharacterCardProps {
  char: string;
  pinyin: string;
  showPinyin: boolean;
  gridType: 'mizige' | 'tianzige';
  strokeCount: number;
  size: number;
  onQuizComplete: () => void;
}

function CharacterCardBase({
  char, pinyin, showPinyin, gridType, strokeCount, size, onQuizComplete,
}: CharacterCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [phase, setPhase] = useState<'watch' | 'quiz'>('watch');

  const borderColor = '#c4a882';
  const guideColor = '#dbc8a8';
  const scale = size / REF_SIZE;

  const startAnimation = useCallback(() => {
    const writer = writerRef.current;
    if (!writer) return;
    setPhase('watch');
    writer.showCharacter();
    writer.animateCharacter({
      onComplete: () => {
        setTimeout(() => {
          setPhase('quiz');
          writer.hideCharacter();
          writer.quiz({
            showHintAfterMisses: 3,
            onComplete: () => {
              writer.showCharacter();
              setPhase('watch');
              setTimeout(() => { onQuizComplete(); }, 1000);
            },
          });
        }, 1500);
      },
    });
  }, [onQuizComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const writer = HanziWriter.create(container, char, {
      width: REF_SIZE,
      height: REF_SIZE,
      padding: REF_PADDING,
      strokeColor: '#2c2018',
      highlightColor: '#e84b3a',
      radicalColor: '#2c2018',
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 800,
      renderer: 'svg',
      showOutline: false,
    });

    writerRef.current = writer;

    writer.animateCharacter({
      onComplete: () => {
        setTimeout(() => {
          setPhase('quiz');
          writer.hideCharacter();
          writer.quiz({
            showHintAfterMisses: 3,
            onComplete: () => {
              writer.showCharacter();
              setPhase('watch');
              setTimeout(() => { onQuizComplete(); }, 1000);
            },
          });
        }, 1500);
      },
    });

    return () => {
      writer.cancelQuiz();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      writerRef.current = null;
    };
  }, [char, onQuizComplete]);

  const handleReplay = useCallback(() => {
    const writer = writerRef.current;
    if (!writer) return;
    writer.cancelQuiz();
    writer.showCharacter();
    startAnimation();
  }, [startAnimation]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {showPinyin && (
        <div style={{ textAlign: 'center', lineHeight: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: '#c0572b', letterSpacing: '0.5px' }}>
          {pinyin}
        </div>
      )}
      <div style={{ width: size, height: size }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            width: REF_SIZE,
            height: REF_SIZE,
            background: '#f5e6c8',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <svg
            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            width={REF_SIZE}
            height={REF_SIZE}
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x={4} y={4} width={1016} height={1016} fill="none" stroke={borderColor} strokeWidth={16} />
            <line x1={1} y1={512} x2={1023} y2={512} stroke={guideColor} strokeWidth={10} strokeDasharray="30 20" />
            <line x1={512} y1={1} x2={512} y2={1023} stroke={guideColor} strokeWidth={10} strokeDasharray="30 20" />
            {gridType !== 'tianzige' && (
              <>
                <line x1={1} y1={1} x2={1023} y2={1023} stroke={guideColor} strokeWidth={8} strokeDasharray="30 20" />
                <line x1={1023} y1={1} x2={1} y2={1023} stroke={guideColor} strokeWidth={8} strokeDasharray="30 20" />
              </>
            )}
          </svg>
          <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 14, color: '#8b7355' }}>
        {strokeCount} strokes &middot; {phase === 'watch' ? 'Watch' : 'Your turn'}
      </div>
      <button
        onClick={handleReplay}
        style={{
          padding: '6px 16px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          background: '#e8d5b5',
          color: '#5c4a32',
          border: '1px solid #c4a882',
          cursor: 'pointer',
        }}
      >
        Replay
      </button>
    </div>
  );
}

export const CharacterCard = memo(CharacterCardBase);
