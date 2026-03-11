import React, { memo } from 'react';

interface LearnControlsProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

function LearnControlsBase({ current, total, onPrev, onNext }: LearnControlsProps) {
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 500,
    background: 'var(--ink-border)',
    color: 'var(--text-primary)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    transition: 'colors 0.2s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 384 }}>
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', height: 6, borderRadius: 9999, background: 'var(--ink-border)' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 9999,
              transition: 'all 0.3s',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--vermillion), var(--gold-accent))',
            }}
          />
        </div>
        <div style={{ fontSize: 12, textAlign: 'center', marginTop: 6, fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
          {current + 1} / {total} characters
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onPrev} disabled={isFirst} style={buttonStyle(isFirst)}>Prev</button>
        <button onClick={onNext} disabled={isLast} style={buttonStyle(isLast)}>Next</button>
      </div>
    </div>
  );
}

export const LearnControls = memo(LearnControlsBase);
