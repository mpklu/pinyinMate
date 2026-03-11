# Mizige Integration into PinyinMate — Design Spec

## Overview

Port the standalone mizige (Chinese character practice sheet generator) into PinyinMate as a new `/mizige` route with full feature parity: Worksheet mode, Learn mode, PDF export. The standalone `mizige/` directory remains untouched.

## Goals

- Add mizige as a first-class feature accessible from PinyinMate's homepage and navigation
- Preserve mizige's full functionality (both modes, all settings, PDF export)
- Match PinyinMate's navigation patterns (AppBar, routing, lazy loading)
- Hybrid visual approach: MUI-themed chrome, ink/rice paper content area

## Non-Goals

- Integration with PinyinMate's lesson/annotation data (future enhancement)
- Modifying the standalone mizige project
- Rewriting SVG rendering or HanziWriter integration logic

## Dependencies

### New dependencies to add

```
hanzi-writer: ^3.7.3
hanzi-writer-data: ^2.0.1
html2canvas-pro: ^2.0.2
lxgw-wenkai-webfont: ^1.7.0
```

### Existing dependency upgrade required

`jspdf` must be bumped from `^3.0.3` to `^4.2.0`. Mizige's `pdf.ts` was written against the v4 API which has breaking changes from v3. Since PinyinMate doesn't actively use jspdf elsewhere (the export feature card is a placeholder), this is safe to upgrade.

`pinyin-pro` is already shared — no version conflict.

## Architecture

### New Files

```
src/
├── components/
│   ├── mizige/
│   │   ├── MizigeSettingsDrawer.tsx   # MUI Drawer with all settings controls
│   │   ├── WorksheetPreview.tsx        # Ported: worksheet grid container
│   │   ├── WorksheetRow.tsx            # Ported: single character row
│   │   ├── TianzigeCell.tsx            # Ported: single grid cell (SVG)
│   │   ├── StrokeOrderGuide.tsx        # Ported: stroke sequence frames (SVG)
│   │   ├── LearnMode.tsx               # Ported: learn mode orchestrator
│   │   ├── CharacterCard.tsx           # Ported: HanziWriter canvas
│   │   └── LearnControls.tsx           # Ported: progress bar + nav
│   ├── templates/
│   │   └── MizigePage.tsx              # New page template (props interface)
│   └── routes/
│       └── (update RouteWrappers.tsx)  # New MizigePageRoute wrapper
├── utils/
│   └── mizige/
│       ├── strokes.ts                  # Ported: stroke data loading (import path fixed)
│       └── pdf.ts                      # Ported: PDF export (uses jspdf v4)
└── styles/
    └── mizige.css                      # Ported: CSS variables, animations, rice-paper class
```

### Modified Files

| File | Change |
|------|--------|
| `src/components/templates/HomePage.tsx` | Replace "Export Materials" card with "米字格" card; add "米字格" button in HeroSection; add `onStartMizige` prop |
| `src/components/routes/RouteWrappers.tsx` | Add `MizigePageRoute` wrapper; update `HomePageRoute` to wire `onStartMizige={() => navigate('/mizige')}` |
| `src/components/organisms/Navigation.tsx` | Add "米字格" menu item |
| `src/router/index.tsx` | Add `/mizige` route using lazy-loaded `MizigePage` from `lazyLoading.ts` |
| `src/utils/lazyLoading.ts` | Add lazy import for `MizigePageRoute` from RouteWrappers |
| `vite.config.ts` | Add `mizige` manual chunk to isolate mizige dependencies from templates chunk |
| `package.json` | Add 4 new dependencies; bump jspdf to ^4.2.0 |

**Note**: `MizigePage` must NOT be exported from `src/components/templates/index.ts`. Adding it to the barrel export would pull all mizige dependencies (hanzi-writer, hanzi-writer-data, html2canvas-pro, lxgw-wenkai-webfont) into the `components-templates` manual chunk, defeating lazy loading. The template is only imported by `RouteWrappers.tsx` which is itself lazy-loaded.

## Component Design

### MizigePage.tsx (Template)

Top-level page layout:

```
┌─────────────────────────────────────────┐
│  AppBar: ← Back | 米字格 | ⚙️ Settings  │
├─────────────────────────────────────────┤
│                                         │
│  Dark ink background (--ink-dark)       │
│  with radial gradient texture           │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  WorksheetPreview (rice     │        │
│  │  paper) or LearnMode        │        │
│  └─────────────────────────────┘        │
│                                         │
│  Footer: Hanzi Writer attribution       │
│                                         │
└─────────────────────────────────────────┘
```

Props interface:
```tsx
interface MizigePageProps {
  onBack?: () => void;
  onHome?: () => void;
}
```

- All mizige-specific state lives in this component (mirrors mizige's App.tsx pattern)
- State: text, traceCells, blankCells, cellSize, gridType, showPinyin, showStrokeOrder, maxStrokeFrames, paperSize, mode, currentCharIndex, isExporting, drawerOpen
- Settings gear icon in AppBar opens the MUI Drawer

### MizigePageRoute (RouteWrappers.tsx)

Follows the same pattern as `HomePageRoute`, `AnnotationPageRoute`, etc:

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

No service preloading needed — mizige is self-contained.

### MizigeSettingsDrawer.tsx

MUI `Drawer` with `anchor="right"` and `variant="temporary"`:

- **Mode toggle**: MUI `ToggleButtonGroup` — Worksheet / Learn
- **Text input**: MUI `TextField` multiline with character counter
- **Layout settings** (worksheet only): MUI `Slider` or number inputs for trace cells, blank cells, cell size, max stroke frames
- **Display toggles**: MUI `Switch` for pinyin, stroke order
- **Grid type**: MUI `ToggleButtonGroup` — 米字格 / 田字格
- **Paper size** (worksheet only): MUI `ToggleButtonGroup` — A4 / Letter
- **Export button** (worksheet only): MUI `Button` with loading state

The drawer interior uses mizige's dark theme (--ink-surface background) to feel like part of the workspace.

### Ported Components (src/components/mizige/)

These components are copied from `mizige/src/components/` with minimal changes:

- **Remove Tailwind classes** — replace with MUI `sx` prop or inline styles using CSS variables
- **Keep all SVG rendering logic unchanged** — viewBox, transforms, stroke widths
- **Keep React.memo() on all memoized components**
- **Keep HanziWriter integration unchanged** — fixed 560px + CSS scale
- **Adjust LearnMode canvas size computation** — account for AppBar height (~64px) instead of sidebar

### Ported Utilities (src/utils/mizige/)

- **strokes.ts**: Copied with import path fix (see hanzi-writer-data section below).
- **pdf.ts**: Copied as-is. Uses html2canvas-pro + jsPDF v4.
- **pinyin.ts**: NOT copied. Reuse PinyinMate's existing `pinyin-pro` dependency directly (same library, same API). Import `pinyin` from `pinyin-pro` in the components that need it.

### hanzi-writer-data Loading Strategy

The standalone mizige uses a relative path to node_modules:
```ts
const data = await import(`../../node_modules/hanzi-writer-data/${char}.json`);
```

This will not work in PinyinMate — Vite blocks `import.meta.glob` over `node_modules`, and dynamic `import()` with runtime variables cannot be statically analyzed.

**Solution: `fetch()` from `public/` directory.**

Add a build/install script that copies the JSON files from `node_modules/hanzi-writer-data/` to `public/hanzi-writer-data/`. Then use `fetch()`:

```ts
export async function loadStrokeData(char: string): Promise<CharacterStrokeData | null> {
  if (cache.has(char)) return cache.get(char)!;
  try {
    const response = await fetch(`/hanzi-writer-data/${char}.json`);
    if (!response.ok) { cache.set(char, null); return null; }
    const data = await response.json();
    const result: CharacterStrokeData = { strokes: data.strokes, medians: data.medians };
    cache.set(char, result);
    return result;
  } catch {
    cache.set(char, null);
    return null;
  }
}
```

Add a `postinstall` script in `package.json`:
```json
"postinstall": "cp -r node_modules/hanzi-writer-data public/hanzi-writer-data"
```

Add `public/hanzi-writer-data/` to `.gitignore` since these are derived files.

**Note**: `hanzi-writer-data` is NOT bundled — it is served as static assets from `public/`. This means it should NOT appear in `vite.config.ts` `manualChunks`.

### Styles (src/styles/mizige.css)

Ported from mizige's `index.css`, scoped under `.mizige-root` to avoid conflicts:

```css
.mizige-root {
  /* CSS variables */
  --ink-dark: #0d0f12;
  --ink-surface: #161920;
  --rice-warm: #f5e6c8;
  --vermillion: #e84b3a;
  --gold-accent: #c9a84c;
  /* ... all other variables ... */
}

.mizige-root .rice-paper { /* ... */ }
.mizige-root .char-reference { /* ... */ }
.mizige-root .char-trace { /* ... */ }
/* ... etc ... */
```

- All CSS variables and classes scoped under `.mizige-root`
- LXGW WenKai font import
- `@keyframes mizige-fade-in-up` (prefixed to avoid collisions)
- Class `.mizige-fade-in-up` on animated worksheet rows (renamed from `.animate-fade-in-up`)
- Custom scrollbar styles scoped to `.mizige-root`
- The `MizigePage` template wraps its content in a `<div className="mizige-root">`

**Important**: The ported `pdf.ts` queries animated elements by class name (`.animate-fade-in-up`) to force opacity before capture. This selector must be updated to `.mizige-fade-in-up` to match the renamed class. Similarly, `WorksheetPreview.tsx` must apply `mizige-fade-in-up` instead of `animate-fade-in-up` on rows.

## HomePage Changes

### HomePageProps

Add `onStartMizige?: () => void` callback.

### HeroSection

Add a third button between "Get Started" and "View Library":

```tsx
<Button variant="outlined" size="large" onClick={onStartMizige}
  sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
  米字格
</Button>
```

### Feature Cards

Replace the "Export Materials" card (id: 'export') with:

```tsx
{
  id: 'mizige',
  title: '米字格',
  description: 'Generate printable character practice sheets with stroke order guides, or learn interactively with stroke animation.',
  icon: <Draw fontSize="large" />,
  action: 'Practice Writing',
  onClick: onStartMizige,
}
```

### HomePageRoute Update

In `RouteWrappers.tsx`, update `HomePageRoute` to wire the new callback:

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

## Navigation Changes

Add to `menuItems` array in `Navigation.tsx`:

```tsx
{ path: '/mizige', label: '米字格', icon: <Draw /> }
```

## Routing & Lazy Loading

In `lazyLoading.ts` — follows the established RouteWrappers pattern:

```tsx
export const MizigePage = lazy(() =>
  import('../components/routes/RouteWrappers').then(module => ({
    default: module.MizigePageRoute
  }))
);
```

In `router/index.tsx` — uses the lazy-loaded export (same pattern as all other routes):

```tsx
{
  path: "mizige",
  element: <MizigePage />,
}
```

Here `MizigePage` refers to the lazy export from `lazyLoading.ts`, NOT a direct template import.

## Build Configuration

Add a `mizige` manual chunk in `vite.config.ts` to keep mizige dependencies isolated:

```ts
manualChunks: {
  // ... existing chunks ...
  'mizige': [
    'hanzi-writer',
    'html2canvas-pro',
    'lxgw-wenkai-webfont',
  ],
}
```

This prevents mizige's large dependencies from inflating other chunks and ensures they're only loaded when the user navigates to `/mizige`.

## Visual Design

### Chrome (AppBar, Drawer shell)

Uses PinyinMate's standard MUI theme — primary blue AppBar, standard typography, consistent with all other pages.

### Content Area

Preserves mizige's aesthetic:
- Background: `--ink-dark` (#0d0f12) with radial gradient texture
- Worksheet cells: `--rice-warm` (#f5e6c8) rice paper background
- Accents: vermillion (#e84b3a) and gold (#c9a84c)
- Font: LXGW WenKai for Chinese characters
- Animations: fadeInUp on worksheet rows

### Settings Drawer Interior

Dark themed to match the workspace:
- Background: `--ink-surface` (#161920)
- Text: `--text-primary` (#e8e0d4)
- MUI components with dark-mode overrides via `sx` props
- Export button: vermillion gradient

## Testing

No existing tests in mizige. For this integration:
- Verify the route loads and renders without errors
- Verify navigation from homepage card and hero button
- Verify settings drawer opens/closes
- Verify PDF export still works
- Type-check passes with `npm run build:with-types`
