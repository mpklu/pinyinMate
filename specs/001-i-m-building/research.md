# Phase 0: Research & Technology Decisions

## Key Technology Decisions

### Chinese Text Segmentation
**Decision**: Use jieba-js or similar JavaScript Chinese NLP library
**Rationale**: Need client-side Chinese word segmentation for real-time text processing without backend
**Alternatives considered**: 
- Server-side processing (rejected: no backend requirement)
- Manual segmentation (rejected: inaccurate for learning)

### Pinyin Generation
**Decision**: Use pinyin-pro or similar JavaScript pinyin library with tone mark support
**Rationale**: Accurate pinyin with tone marks essential for learning, client-side for no-backend constraint
**Alternatives considered**:
- Backend API (rejected: no backend requirement)
- Static lookup tables (rejected: incomplete coverage)

### Audio Synthesis
**Decision**: MeloTTS integration or Web Speech API fallback
**Rationale**: High-quality Chinese pronunciation essential for language learning
**Alternatives considered**:
- Pre-recorded audio files (rejected: storage size, coverage limitations)
- Browser TTS only (rejected: inconsistent Chinese pronunciation quality)

### Frontend Framework
**Decision**: React 18+ with TypeScript
**Rationale**: Component-based architecture aligns with constitution, strong ecosystem, TypeScript for reliability
**Alternatives considered**:
- Vue.js (rejected: team familiarity preference)
- Vanilla JS (rejected: component architecture requirement)

### UI Component Library & Styling
**Decision**: Material-UI (MUI) v5 with custom theming
**Rationale**: Excellent accessibility support (WCAG 2.1 AA), mobile-first responsive components, extensive component library
**Alternatives considered**:
- Tailwind CSS (rejected: prefer pre-built accessible components)
- Ant Design (rejected: less mobile-first focus)
- Chakra UI (rejected: smaller ecosystem)

### State Management
**Decision**: React Context + useReducer for global state
**Rationale**: No persistence requirement makes complex state management unnecessary
**Alternatives considered**:
- Redux (rejected: overkill for session-only state)
- Zustand (rejected: unnecessary for temporary state)

### Build & Bundling
**Decision**: Vite for development and building
**Rationale**: Fast development server, excellent code splitting, modern build tools
**Alternatives considered**:
- Create React App (rejected: less flexible bundling)
- Webpack directly (rejected: configuration complexity)

### Testing Strategy
**Decision**: Vitest for unit tests, Playwright for E2E tests
**Rationale**: Fast unit testing, comprehensive browser testing for responsive design
**Alternatives considered**:
- Jest (rejected: Vite integration preference)
- Cypress (rejected: Playwright better for mobile testing)

### Export Functionality
**Decision**: jsPDF for PDF export, custom formatters for Anki/Quizlet
**Rationale**: Client-side export maintains no-backend architecture
**Alternatives considered**:
- Server-side export (rejected: no backend requirement)
- Browser print API (rejected: limited formatting control)

### Accessibility Implementation
**Decision**: Material-UI (MUI) built-in accessibility + custom ARIA enhancements
**Rationale**: MUI provides excellent WCAG 2.1 AA compliance out-of-the-box, keyboard navigation, screen reader support
**Alternatives considered**:
- Radix UI primitives (rejected: prefer complete component library)
- Manual implementation only (rejected: complexity and compliance risk)

## Architecture Patterns

### Component Structure
- Material-UI components as foundation layer
- Custom components following atomic design (atoms, molecules, organisms)
- Single responsibility per component
- Props interfaces with TypeScript
- MUI's built-in theming and responsive system
- No direct DOM manipulation outside component boundaries

### Data Flow
- Unidirectional data flow
- Event-driven interactions
- Session-only state (no persistence)

### Performance Strategy
- Code splitting by feature
- Lazy loading for non-critical components
- Bundle size optimization
- Progressive enhancement

## Technical Constraints Addressed

### No Backend Storage
- All content bundled at build time
- Session-only SRS scheduling
- Client-side text processing

### Mobile-First Responsive
- Touch-friendly UI (44px minimum targets)
- Progressive enhancement for desktop
- Responsive breakpoints: 320px, 768px, 1024px

### Performance Requirements
- <3 second initial load
- Code splitting for feature isolation
- Optimized bundle sizes
- Offline-capable core features

### Accessibility Compliance
- WCAG 2.1 AA standards
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance (4.5:1 normal, 3:1 large text)