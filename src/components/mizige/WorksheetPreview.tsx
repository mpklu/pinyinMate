import { forwardRef, useMemo } from 'react';
import { WorksheetRow } from './WorksheetRow';
import { extractChineseChars, getPinyin } from '../../utils/mizige/pinyin';

interface WorksheetPreviewProps {
  text: string;
  traceCells: number;
  blankCells: number;
  cellSize: number;
  showPinyin: boolean;
  showStrokeOrder: boolean;
  maxStrokeFrames: number;
  gridType: 'mizige' | 'tianzige';
}

export const WorksheetPreview = forwardRef<HTMLDivElement, WorksheetPreviewProps>(
  function WorksheetPreview(
    { text, traceCells, blankCells, cellSize, showPinyin, showStrokeOrder, maxStrokeFrames, gridType },
    ref,
  ) {
    const characters = useMemo(() => {
      const chars = extractChineseChars(text);
      return chars.map((c) => ({ char: c, pinyin: getPinyin(c) }));
    }, [text]);

    if (characters.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <div style={{ fontSize: 64, marginBottom: 16, fontFamily: "'LXGW WenKai', serif", color: '#a09080' }}>
              米字格
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Enter Chinese characters to generate practice sheets
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="rice-paper"
        style={{ padding: 32, borderRadius: 8, display: 'inline-block', minWidth: 'fit-content', minHeight: 200 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {characters.map((c, i) => (
            <div
              key={`${c.char}-${i}`}
              className="mizige-fade-in-up"
              style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
            >
              <WorksheetRow
                char={c.char}
                pinyin={c.pinyin}
                traceCells={traceCells}
                blankCells={blankCells}
                cellSize={cellSize}
                showPinyin={showPinyin}
                showStrokeOrder={showStrokeOrder}
                maxStrokeFrames={maxStrokeFrames}
                gridType={gridType}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);
