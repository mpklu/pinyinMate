# Mizige Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the standalone mizige character practice sheet generator into PinyinMate as a new `/mizige` route with full feature parity.

**Architecture:** New route `/mizige` with lazy-loaded MizigePage template. Ported mizige components live in `src/components/mizige/`. Settings in MUI Drawer. Hybrid visual: MUI AppBar chrome + ink/rice paper content. hanzi-writer-data served as static files from `public/`.

**Tech Stack:** React 19, TypeScript, MUI v7, hanzi-writer, jsPDF v4, html2canvas-pro, pinyin-pro, lxgw-wenkai-webfont

**Spec:** `docs/superpowers/specs/2026-03-11-mizige-integration-design.md`

---

## Chunk 1: Foundation (dependencies, styles, utilities)

### Task 1: Add dependencies and setup hanzi-writer-data

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install new dependencies and bump jspdf**

```bash
cd /Users/kunlu/Projects/mpklu/learn-chinese/pinyinMate
npm install hanzi-writer@^3.7.3 hanzi-writer-data@^2.0.1 html2canvas-pro@^2.0.2 lxgw-wenkai-webfont@^1.7.0 jspdf@^4.2.0
```

- [ ] **Step 2: Add postinstall script to package.json**

In `package.json` scripts, add:
```json
"postinstall": "cp -r node_modules/hanzi-writer-data public/hanzi-writer-data"
```

- [ ] **Step 3: Run postinstall to copy data files**

```bash
npm run postinstall
```

- [ ] **Step 4: Add public/hanzi-writer-data to .gitignore**

Append to `.gitignore`:
```
public/hanzi-writer-data
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "feat: add mizige dependencies and hanzi-writer-data setup"
```

---

### Task 2: Create mizige CSS styles

**Files:**
- Create: `src/styles/mizige.css`

- [ ] **Step 1: Create scoped CSS file**

Create `src/styles/mizige.css` with all mizige CSS variables, animations, and utility classes scoped under `.mizige-root`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

.mizige-root {
  --ink-black: #1a1a1a;
  --ink-dark: #0d0f12;
  --ink-surface: #161920;
  --ink-surface-2: #1c2028;
  --ink-border: #2a2e38;
  --ink-border-light: #363a46;
  --rice-warm: #f5e6c8;
  --rice-light: #faf3e6;
  --rice-cream: #f0dbb8;
  --vermillion: #e84b3a;
  --vermillion-soft: #f0705e;
  --ink-stroke: #2c2018;
  --ink-trace: #d4c4a0;
  --gold-accent: #c9a84c;
  --gold-glow: #e8c35a;
  --jade-accent: #5a9e7a;
  --text-primary: #e8e0d4;
  --text-secondary: #9a9488;
  --text-muted: #6b665e;
}

/* Rice paper texture */
.mizige-root .rice-paper {
  background-color: var(--rice-warm);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(255,248,230,0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255,240,210,0.3) 0%, transparent 40%);
}

/* Animation keyframes */
@keyframes mizigeFadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.mizige-root .mizige-fade-in-up {
  animation: mizigeFadeInUp 0.5s ease-out forwards;
}

/* Character display */
.mizige-root .char-reference {
  font-family: 'LXGW WenKai', serif;
  font-weight: 700;
}

.mizige-root .char-trace {
  font-family: 'LXGW WenKai', serif;
  font-weight: 700;
  opacity: 0.18;
  color: var(--ink-stroke);
}

/* Scrollbar within mizige */
.mizige-root ::-webkit-scrollbar {
  width: 6px;
}
.mizige-root ::-webkit-scrollbar-track {
  background: transparent;
}
.mizige-root ::-webkit-scrollbar-thumb {
  background: var(--ink-border);
  border-radius: 3px;
}
.mizige-root ::-webkit-scrollbar-thumb:hover {
  background: var(--ink-border-light);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/mizige.css
git commit -m "feat: add scoped mizige CSS styles"
```

---

### Task 3: Port utility files

**Files:**
- Create: `src/utils/mizige/strokes.ts`
- Create: `src/utils/mizige/pdf.ts`
- Create: `src/utils/mizige/pinyin.ts`

- [ ] **Step 1: Create strokes.ts with fetch-based loading**

Create `src/utils/mizige/strokes.ts`:

```typescript
export interface CharacterStrokeData {
  strokes: string[];
  medians: number[][][];
}

const cache = new Map<string, CharacterStrokeData | null>();

export async function loadStrokeData(char: string): Promise<CharacterStrokeData | null> {
  if (cache.has(char)) return cache.get(char)!;

  try {
    const response = await fetch(`/hanzi-writer-data/${char}.json`);
    if (!response.ok) {
      cache.set(char, null);
      return null;
    }
    const data = await response.json();
    const result: CharacterStrokeData = {
      strokes: data.strokes,
      medians: data.medians,
    };
    cache.set(char, result);
    return result;
  } catch {
    cache.set(char, null);
    return null;
  }
}

export interface StrokeFrame {
  completedStrokes: string[];
  currentStroke: string;
  frameNumber: number;
  totalStrokes: number;
}

export function generateStrokeFrames(
  strokeData: CharacterStrokeData,
  maxFrames: number,
): StrokeFrame[] {
  const { strokes } = strokeData;
  const total = strokes.length;

  if (total <= maxFrames) {
    return strokes.map((stroke, i) => ({
      completedStrokes: strokes.slice(0, i),
      currentStroke: stroke,
      frameNumber: i + 1,
      totalStrokes: total,
    }));
  }

  const frames: StrokeFrame[] = [];
  for (let i = 0; i < maxFrames - 1; i++) {
    frames.push({
      completedStrokes: strokes.slice(0, i),
      currentStroke: strokes[i],
      frameNumber: i + 1,
      totalStrokes: total,
    });
  }

  frames.push({
    completedStrokes: strokes.slice(0, total - 1),
    currentStroke: strokes[total - 1],
    frameNumber: total,
    totalStrokes: total,
  });

  return frames;
}

export async function filterAvailableChars(chars: string[]): Promise<string[]> {
  const results = await Promise.all(
    chars.map(async (char) => {
      const data = await loadStrokeData(char);
      return data ? char : null;
    })
  );
  return results.filter((c): c is string => c !== null);
}
```

- [ ] **Step 2: Create pdf.ts with updated class selector**

Create `src/utils/mizige/pdf.ts`:

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export async function exportToPdf(
  element: HTMLElement,
  paperSize: 'a4' | 'letter' = 'a4'
) {
  const prevBgImage = element.style.backgroundImage;
  const prevBorderRadius = element.style.borderRadius;
  element.style.backgroundImage = 'none';
  element.style.borderRadius = '0';

  // Force all animated rows to full opacity — uses renamed class
  const animatedEls = element.querySelectorAll<HTMLElement>('.mizige-fade-in-up');
  animatedEls.forEach((el) => {
    el.style.animation = 'none';
    el.style.opacity = '1';
  });

  const containerRect = element.getBoundingClientRect();
  const rowEls = element.querySelectorAll<HTMLElement>('.mizige-fade-in-up');
  const rowBreaks: number[] = [0];
  rowEls.forEach((row) => {
    const rect = row.getBoundingClientRect();
    const bottom = rect.bottom - containerRect.top;
    rowBreaks.push(bottom);
  });

  const scale = 2;
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: '#f5e6c8',
  });

  element.style.backgroundImage = prevBgImage;
  element.style.borderRadius = prevBorderRadius;
  animatedEls.forEach((el) => {
    el.style.animation = '';
    el.style.opacity = '';
  });

  const pageWidthMm = paperSize === 'a4' ? 210 : 215.9;
  const pageHeightMm = paperSize === 'a4' ? 297 : 279.4;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize,
  });

  const pxToMm = pageWidthMm / containerRect.width;
  const marginTopMm = 10;
  const usablePageHeightMm = pageHeightMm - marginTopMm;
  const pageHeightPx = usablePageHeightMm / pxToMm;

  const pages: { startPx: number; endPx: number }[] = [];
  let currentStartPx = 0;

  while (currentStartPx < containerRect.height) {
    const idealEndPx = currentStartPx + pageHeightPx;

    let bestBreak = idealEndPx;
    for (let i = rowBreaks.length - 1; i >= 0; i--) {
      if (rowBreaks[i] <= idealEndPx && rowBreaks[i] > currentStartPx) {
        bestBreak = rowBreaks[i];
        break;
      }
    }

    if (bestBreak <= currentStartPx) {
      bestBreak = idealEndPx;
    }

    pages.push({ startPx: currentStartPx, endPx: Math.min(bestBreak, containerRect.height) });
    currentStartPx = bestBreak;

    if (bestBreak >= containerRect.height) break;
  }

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    pdf.setFillColor(245, 230, 200);
    pdf.rect(0, 0, pageWidthMm, pageHeightMm, 'F');

    const { startPx, endPx } = pages[i];
    const cropY = Math.round(startPx * scale);
    const cropH = Math.round((endPx - startPx) * scale);
    const cropW = canvas.width;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = cropW;
    pageCanvas.height = cropH;
    const ctx = pageCanvas.getContext('2d')!;

    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, cropW, cropH);

    ctx.drawImage(canvas, 0, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const pageImgData = pageCanvas.toDataURL('image/png');
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (endPx - startPx) * pxToMm;

    pdf.addImage(pageImgData, 'PNG', 0, marginTopMm, imgWidthMm, imgHeightMm);
  }

  pdf.save('mizige-worksheet.pdf');
}
```

- [ ] **Step 3: Create pinyin.ts**

Create `src/utils/mizige/pinyin.ts`:

```typescript
import { pinyin } from 'pinyin-pro';

export function getPinyin(char: string): string {
  return pinyin(char, { toneType: 'symbol', type: 'array' })[0] || '';
}

export function isChinese(char: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(char);
}

export function extractChineseChars(text: string): string[] {
  return [...text].filter(isChinese);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/mizige/
git commit -m "feat: add mizige utility modules (strokes, pdf, pinyin)"
```

---

## Chunk 2: Ported Components (SVG + Learn mode)

### Task 4: Port SVG worksheet components

**Files:**
- Create: `src/components/mizige/TianzigeCell.tsx`
- Create: `src/components/mizige/StrokeOrderGuide.tsx`
- Create: `src/components/mizige/WorksheetRow.tsx`
- Create: `src/components/mizige/WorksheetPreview.tsx`

Port these components from mizige replacing Tailwind classes with inline styles / sx props. Keep all SVG logic, memo, and coordinate systems identical.

Key changes from original:
- Replace `className="flex ..."` with `style={{ display: 'flex', ... }}`
- Replace `animate-fade-in-up` with `mizige-fade-in-up`
- Import from `../../utils/mizige/` instead of `../utils/`
- All other logic stays identical

- [ ] **Step 1: Create TianzigeCell.tsx**

Create `src/components/mizige/TianzigeCell.tsx` — port from mizige, replace Tailwind with inline styles:

```tsx
import { memo, useEffect, useState } from 'react';
import { loadStrokeData, type CharacterStrokeData } from '../../utils/mizige/strokes';

interface TianzigeCellProps {
  size: number;
  char?: string;
  mode: 'reference' | 'trace' | 'blank';
  showPinyin?: boolean;
  pinyin?: string;
  gridType?: 'mizige' | 'tianzige';
}

function TianzigeCellBase({ size, char, mode, showPinyin, pinyin, gridType = 'mizige' }: TianzigeCellProps) {
  const borderColor = '#c4a882';
  const guideColor = '#dbc8a8';
  const [strokeData, setStrokeData] = useState<CharacterStrokeData | null>(null);

  useEffect(() => {
    if (!char || mode === 'blank') return;
    let cancelled = false;
    loadStrokeData(char).then((data) => {
      if (!cancelled) setStrokeData(data);
    });
    return () => { cancelled = true; };
  }, [char, mode]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {showPinyin && mode === 'reference' && pinyin && (
        <div
          style={{
            textAlign: 'center',
            lineHeight: 1,
            marginBottom: 2,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: Math.max(10, size * 0.16),
            color: '#c0572b',
            letterSpacing: '0.5px',
          }}
        >
          {pinyin}
        </div>
      )}
      {showPinyin && mode !== 'reference' && (
        <div style={{ height: Math.max(10, size * 0.16) + 2 }} />
      )}
      <svg
        width={size}
        height={size}
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
        {char && mode !== 'blank' && strokeData && (
          <g transform="scale(1, -1) translate(0, -900)" opacity={mode === 'reference' ? 1 : 0.15}>
            {strokeData.strokes.map((path, i) => (
              <path key={i} d={path} fill="#2c2018" stroke="none" />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export const TianzigeCell = memo(TianzigeCellBase);
```

- [ ] **Step 2: Create StrokeOrderGuide.tsx**

Create `src/components/mizige/StrokeOrderGuide.tsx`:

```tsx
import { memo, useEffect, useState } from 'react';
import {
  loadStrokeData,
  generateStrokeFrames,
  type StrokeFrame,
} from '../../utils/mizige/strokes';

interface StrokeOrderGuideProps {
  char: string;
  cellSize: number;
  maxFrames: number;
  gridType: 'mizige' | 'tianzige';
}

function StrokeOrderGuideBase({ char, cellSize, maxFrames, gridType }: StrokeOrderGuideProps) {
  const [frames, setFrames] = useState<StrokeFrame[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadStrokeData(char).then((data) => {
      if (cancelled || !data) return;
      setFrames(generateStrokeFrames(data, maxFrames));
    });
    return () => { cancelled = true; };
  }, [char, maxFrames]);

  if (frames.length === 0) return null;

  const guideSize = Math.round(cellSize * 0.55);
  const borderColor = '#c4a882';
  const guideColor = '#dbc8a8';

  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', marginBottom: 2 }}>
      {frames.map((frame, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <svg
            width={guideSize}
            height={guideSize}
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x={4} y={4} width={1016} height={1016} fill="none" stroke={borderColor} strokeWidth={8} />
            <line x1={4} y1={512} x2={1020} y2={512} stroke={guideColor} strokeWidth={4} strokeDasharray="20 15" />
            <line x1={512} y1={4} x2={512} y2={1020} stroke={guideColor} strokeWidth={4} strokeDasharray="20 15" />
            {gridType !== 'tianzige' && (
              <>
                <line x1={4} y1={4} x2={1020} y2={1020} stroke={guideColor} strokeWidth={3} strokeDasharray="20 20" opacity={0.5} />
                <line x1={1020} y1={4} x2={4} y2={1020} stroke={guideColor} strokeWidth={3} strokeDasharray="20 20" opacity={0.5} />
              </>
            )}
            <g transform="scale(1, -1) translate(0, -900)">
              {frame.completedStrokes.map((path, j) => (
                <path key={j} d={path} fill="#2c2018" stroke="none" opacity={0.85} />
              ))}
              <path d={frame.currentStroke} fill="#e84b3a" stroke="none" />
            </g>
            <text
              x={55}
              y={115}
              style={{
                fontSize: 95,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fill: '#9a9488',
                opacity: 0.5,
              }}
            >
              {frame.frameNumber}
            </text>
          </svg>
        </div>
      ))}
    </div>
  );
}

export const StrokeOrderGuide = memo(StrokeOrderGuideBase);
```

- [ ] **Step 3: Create WorksheetRow.tsx**

Create `src/components/mizige/WorksheetRow.tsx`:

```tsx
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
```

- [ ] **Step 4: Create WorksheetPreview.tsx**

Create `src/components/mizige/WorksheetPreview.tsx`:

```tsx
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
```

- [ ] **Step 5: Commit**

```bash
git add src/components/mizige/TianzigeCell.tsx src/components/mizige/StrokeOrderGuide.tsx src/components/mizige/WorksheetRow.tsx src/components/mizige/WorksheetPreview.tsx
git commit -m "feat: port mizige SVG worksheet components"
```

---

### Task 5: Port Learn mode components

**Files:**
- Create: `src/components/mizige/LearnControls.tsx`
- Create: `src/components/mizige/CharacterCard.tsx`
- Create: `src/components/mizige/LearnMode.tsx`

Same porting strategy: replace Tailwind with inline styles, update import paths.

- [ ] **Step 1: Create LearnControls.tsx**

Create `src/components/mizige/LearnControls.tsx`:

```tsx
import { memo } from 'react';

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
```

- [ ] **Step 2: Create CharacterCard.tsx**

Create `src/components/mizige/CharacterCard.tsx`:

```tsx
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
```

- [ ] **Step 3: Create LearnMode.tsx**

Create `src/components/mizige/LearnMode.tsx`:

```tsx
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
        <div style={{ fontSize: 64, color: 'var(--jade-accent)' }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Complete!</h2>
        <p style={{ color: 'var(--text-muted)' }}>
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
```

- [ ] **Step 4: Commit**

```bash
git add src/components/mizige/LearnControls.tsx src/components/mizige/CharacterCard.tsx src/components/mizige/LearnMode.tsx
git commit -m "feat: port mizige Learn mode components"
```

---

## Chunk 3: Settings Drawer, Page Template, and Integration

### Task 6: Create MizigeSettingsDrawer

**Files:**
- Create: `src/components/mizige/MizigeSettingsDrawer.tsx`

- [ ] **Step 1: Create settings drawer with MUI components**

Create `src/components/mizige/MizigeSettingsDrawer.tsx` — MUI Drawer with dark theme, all mizige settings:

```tsx
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
  ...toggleGroupSx,
  '& .MuiToggleButton-root': {
    ...toggleGroupSx['& .MuiToggleButton-root'],
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mizige/MizigeSettingsDrawer.tsx
git commit -m "feat: create MUI settings drawer for mizige"
```

---

### Task 7: Create MizigePage template and route wrapper

**Files:**
- Create: `src/components/templates/MizigePage.tsx`
- Modify: `src/components/routes/RouteWrappers.tsx`

- [ ] **Step 1: Create MizigePage.tsx**

Create `src/components/templates/MizigePage.tsx`:

```tsx
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
```

- [ ] **Step 2: Add MizigePageRoute to RouteWrappers.tsx**

At the end of `src/components/routes/RouteWrappers.tsx`, add the import and the route wrapper:

Import at top:
```tsx
import { MizigePage } from '../templates/MizigePage';
```

Route wrapper at end:
```tsx
export const MizigePageRoute = () => {
  const navigate = useNavigate();
  return (
    <MizigePage
      onBack={() => navigate(-1)}
      onHome={() => navigate('/')}
    />
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/templates/MizigePage.tsx src/components/routes/RouteWrappers.tsx
git commit -m "feat: create MizigePage template and route wrapper"
```

---

### Task 8: Wire up routing, lazy loading, navigation, and homepage

**Files:**
- Modify: `src/utils/lazyLoading.ts`
- Modify: `src/router/index.tsx`
- Modify: `src/components/organisms/Navigation.tsx`
- Modify: `src/components/templates/HomePage.tsx`
- Modify: `src/components/routes/RouteWrappers.tsx` (HomePageRoute)
- Modify: `vite.config.ts`

- [ ] **Step 1: Add lazy import to lazyLoading.ts**

In `src/utils/lazyLoading.ts`, add after the existing lazy exports:

```tsx
export const MizigePage = lazy(() =>
  import('../components/routes/RouteWrappers').then(module => ({
    default: module.MizigePageRoute
  }))
);
```

- [ ] **Step 2: Add route to router/index.tsx**

In `src/router/index.tsx`, add the import of `MizigePage` and the route:

Add `MizigePage` to the import from `'../utils/lazyLoading'`.

Add route as a child:
```tsx
{
  path: "mizige",
  element: <MizigePage />,
},
```

- [ ] **Step 3: Add navigation menu item**

In `src/components/organisms/Navigation.tsx`:

Add `Draw` to the MUI icons import:
```tsx
import { Home, LibraryBooks, Translate, Quiz, School, Menu as MenuIcon, Draw } from '@mui/icons-material';
```

Add to `menuItems` array:
```tsx
{ path: '/mizige', label: '米字格', icon: <Draw /> },
```

- [ ] **Step 4: Update HomePage — replace Export card, add hero button, add prop**

In `src/components/templates/HomePage.tsx`:

Add `Draw` to MUI icons import:
```tsx
import { Translate, Quiz, Book, Download, School, VolumeUp, Draw } from '@mui/icons-material';
```

Add to `HomePageProps`:
```tsx
onStartMizige?: () => void;
```

Add to component destructuring:
```tsx
const { onStartAnnotation, onStartQuiz, onStartFlashcards, onViewLibrary, onStartMizige } = props;
```

Replace the "Export Materials" feature (id: 'export') with:
```tsx
{
  id: 'mizige',
  title: '米字格',
  description: 'Generate printable character practice sheets with stroke order guides, or learn interactively with stroke animation.',
  icon: <Draw fontSize="large" />,
  action: 'Practice Writing',
  onClick: onStartMizige,
},
```

Add "米字格" button in HeroSection `Stack`, between "Get Started" and "View Library":
```tsx
<Button
  variant="outlined"
  size="large"
  onClick={onStartMizige}
  sx={{
    borderColor: 'white',
    color: 'white',
    '&:hover': {
      borderColor: 'white',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
  }}
>
  米字格
</Button>
```

- [ ] **Step 5: Update HomePageRoute to wire onStartMizige**

In `src/components/routes/RouteWrappers.tsx`, update `HomePageRoute`:

```tsx
export const HomePageRoute = () => {
  const navigate = useNavigate();
  return (
    <HomePage
      onStartAnnotation={() => navigate('/annotate')}
      onStartQuiz={() => navigate('/quiz')}
      onStartFlashcards={() => navigate('/flashcards')}
      onViewLibrary={() => navigate('/library')}
      onStartMizige={() => navigate('/mizige')}
    />
  );
};
```

- [ ] **Step 6: Update vite.config.ts with mizige chunk**

In `vite.config.ts`, add to `manualChunks`:

```tsx
'mizige': [
  'hanzi-writer',
  'html2canvas-pro',
  'lxgw-wenkai-webfont',
],
```

- [ ] **Step 7: Commit**

```bash
git add src/utils/lazyLoading.ts src/router/index.tsx src/components/organisms/Navigation.tsx src/components/templates/HomePage.tsx src/components/routes/RouteWrappers.tsx vite.config.ts
git commit -m "feat: wire mizige route, navigation, homepage card and hero button"
```

---

## Chunk 4: Verification

### Task 9: Build verification

- [ ] **Step 1: Run type check**

```bash
cd /Users/kunlu/Projects/mpklu/learn-chinese/pinyinMate
npm run type-check
```

Expected: No type errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors (or only pre-existing ones).

- [ ] **Step 3: Run build**

```bash
npm run build:with-types
```

Expected: Build succeeds. Mizige chunk appears in output.

- [ ] **Step 4: Run dev server and manually verify**

```bash
npm run dev
```

Verify:
- Homepage shows "米字格" card where "Export Materials" was
- Homepage hero section has "米字格" button
- Clicking either navigates to `/mizige`
- Mizige page shows AppBar with back arrow and settings gear
- Settings drawer opens from right
- Worksheet mode renders character grid with rice paper background
- Learn mode shows character animation
- PDF export works
- Navigation menu includes "米字格" item

- [ ] **Step 5: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: address build/lint issues from mizige integration"
```
