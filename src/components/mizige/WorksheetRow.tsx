import { memo } from 'react';
import { TianzigeCell } from './TianzigeCell';
import { StrokeOrderGuide } from './StrokeOrderGuide';

interface WorksheetRowProps {
  char: string;
  pinyin: string;
  traceCells: number;
  blankCells: number;
  cellSize: number;
  showPinyin: boolean;
  showStrokeOrder: boolean;
  maxStrokeFrames: number;
  gridType: 'mizige' | 'tianzige';
}

function WorksheetRowBase({
  char, pinyin, traceCells, blankCells, cellSize,
  showPinyin, showStrokeOrder, maxStrokeFrames, gridType,
}: WorksheetRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {showStrokeOrder && (
        <StrokeOrderGuide char={char} cellSize={cellSize} maxFrames={maxStrokeFrames} gridType={gridType} />
      )}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end' }}>
        <TianzigeCell size={cellSize} char={char} mode="reference" showPinyin={showPinyin} pinyin={pinyin} gridType={gridType} />
        {Array.from({ length: traceCells }, (_, i) => (
          <TianzigeCell key={`trace-${i}`} size={cellSize} char={char} mode="trace" showPinyin={showPinyin} gridType={gridType} />
        ))}
        {Array.from({ length: blankCells }, (_, i) => (
          <TianzigeCell key={`blank-${i}`} size={cellSize} mode="blank" showPinyin={showPinyin} gridType={gridType} />
        ))}
      </div>
    </div>
  );
}

export const WorksheetRow = memo(WorksheetRowBase);
