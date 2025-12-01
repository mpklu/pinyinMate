# PinyinMate Project Summary

**Project Name**: PinyinMate  
**Repository**: mpklu/pinyinMate  
**Version**: 1.0.0  
**Last Updated**: November 29, 2025

## Executive Overview

PinyinMate is an **open-source, schema-driven Chinese language learning web application** built with React 19, TypeScript, and Vite. It transforms plain JSON lesson content into interactive study experiences with automatic pinyin generation, text segmentation, audio synthesis, vocabulary tools, flashcards, quizzes, and progress tracking. The project consists of two main applications:

1. **Main Learning App** (`/src`) - Student-facing learning platform
2. **Lesson Builder** (`/lesson-builder`) - Content creation tool for educators

**Live Demo**: https://pinyinmate.vercel.app/

---

## 🎯 Core Mission & Philosophy

**Mission**: Provide a transparent, extensible, and accessible platform for learning Mandarin Chinese through schema-driven content management.

**Key Principles**:
- **Schema-driven**: All content validates against a strict JSON schema
- **Service-based architecture**: Clean separation of concerns with orchestrated services
- **Accessibility-first**: WCAG compliant with full keyboard navigation
- **Performance-optimized**: Lazy loading, intelligent chunking, and caching strategies
- **Multi-source support**: Local and remote lesson sources with priority management

---

## 📂 Project Structure

```
learn-chinese/
├── src/                          # Main learning application
│   ├── components/               # Atomic design component hierarchy
│   │   ├── atoms/               # Basic UI elements (buttons, cards, text)
│   │   ├── molecules/           # Simple composites
│   │   ├── organisms/           # Complex components (navigation, content panels)
│   │   └── templates/           # Full page layouts
│   ├── services/                # Business logic layer
│   │   ├── serviceCoordinator.ts      # Central orchestration
│   │   ├── pinyinService.ts           # Pinyin generation (pinyin-pro)
│   │   ├── textSegmentationService.ts # Chinese text segmentation
│   │   ├── audioService.ts            # Web Speech API integration
│   │   ├── translationService.ts      # Multi-provider translation
│   │   ├── srsService.ts              # Spaced repetition (SM-2 algorithm)
│   │   ├── libraryService.ts          # Lesson library management
│   │   ├── librarySourceService.ts    # Remote source integration
│   │   └── exportService.ts           # PDF/print export
│   ├── context/                 # React context providers
│   ├── router/                  # Route configuration with preloading
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Helper utilities
│
├── lesson-builder/              # Standalone lesson authoring tool
│   ├── src/
│   │   ├── components/          # Builder-specific UI
│   │   ├── services/            # Validation, GitHub integration
│   │   └── types/               # Builder type definitions
│   └── docs/                    # Builder documentation
│
├── public/
│   ├── lessons/                 # Local lesson JSON files
│   │   ├── manifest.json        # Lesson catalog
│   │   ├── beginner/            # Beginner lessons
│   │   ├── intermediate/        # Intermediate lessons
│   │   └── advanced/            # Advanced lessons
│   └── remote-sources.json      # Remote source configuration
│
├── schemas/
│   └── lesson.schema.json       # Authoritative lesson schema (JSON Schema v7)
│
├── docs/                        # Comprehensive documentation
├── tests/                       # Test suites
│   ├── unit/                    # Vitest unit tests
│   ├── e2e/                     # Playwright E2E tests
│   ├── a11y/                    # Accessibility tests (axe-core)
│   ├── integration/             # Integration tests
│   └── performance/             # Performance benchmarks
│
└── specs/                       # Design specifications and planning
```

---

## 🏗️ Architecture Deep Dive

### Service-Based Architecture

All business logic lives in `src/services/` and is coordinated through **dependency injection** via `serviceCoordinator.ts`. Services are lazily loaded and cached for optimal performance.

**Key Services**:

| Service | Purpose | Dependencies |
|---------|---------|--------------|
| `pinyinService` | Pinyin romanization with tone marks | pinyin-pro library |
| `textSegmentationService` | Chinese text boundary detection | Custom sentence segmentation |
| `audioService` | Text-to-speech synthesis | Web Speech API |
| `translationService` | Multi-provider translation with fallbacks | External APIs + dictionary |
| `srsService` | Spaced repetition scheduling (SM-2) | Flashcard types |
| `libraryService` | Lesson catalog management | Manifest handling |
| `librarySourceService` | Remote source integration with caching | HTTP client, rate limiting |
| `exportService` | PDF/print generation | jsPDF |
| `schemaValidation` | Runtime lesson validation | JSON Schema validator |

**Service Integration Pattern**:
```typescript
// Services accessed through coordinator for consistent error handling
const result = await serviceCoordinator.processLessonForStudy(lessonId);
if (!result) {
  // Handle graceful degradation
}
```

### Component Architecture (Atomic Design)

Components follow Brad Frost's atomic design methodology:

1. **Atoms** (`/atoms`): Indivisible UI elements
   - `ChineseText.tsx`, `PinyinText.tsx`, `AudioButton.tsx`
   - `VocabularyHighlight.tsx`, `DifficultyBadge.tsx`
   - Basic input/button components

2. **Molecules** (`/molecules`): Simple composites
   - Segment + pinyin + audio combinations
   - Vocabulary word with tooltip/popover
   - Search bars, filter controls

3. **Organisms** (`/organisms`): Complex, reusable sections
   - `LessonContent.tsx` - Main reading interface
   - `FlashcardDeck.tsx` - SRS flashcard system
   - `QuizContainer.tsx` - Quiz generation and review
   - `Navigation.tsx` - App navigation
   - `ReaderView.tsx` - Enhanced reader mode

4. **Templates** (`/templates`): Full page layouts
   - `LessonPage.tsx` - Complete lesson study interface
   - Page-level composition patterns

### Data Flow Architecture

```
User Action → Component → Context → Service → State Update → Re-render
                ↓                      ↓
            Router Loader         serviceCoordinator
                ↓                      ↓
          Preload Services    Individual Services (pinyin, audio, etc.)
```

**Session Management**: `SessionContext.tsx` provides centralized state for:
- Current lesson and study progress
- UI preferences (show pinyin, definitions, tone marks)
- Reader mode state
- Study statistics tracking
- Loading and error states

---

## 📊 Lesson Data Schema

All lessons conform to `/schemas/lesson.schema.json` (JSON Schema v7).

### Schema Structure

```typescript
interface Lesson {
  id: string;              // Unique identifier (alphanumeric + hyphens)
  title: string;           // Display title (1-100 chars)
  description: string;     // Brief description (1-500 chars)
  content: string;         // Chinese text content (1-10,000 chars)
  metadata: LessonMetadata;
}

interface LessonMetadata {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];          // Searchable topics (1-50 tags)
  characterCount: number;  // Number of Chinese characters
  source: string;          // Attribution (publisher, URL)
  book: string | null;     // Textbook reference (optional)
  vocabulary: VocabularyEntry[];  // Pre-defined vocabulary
  estimatedTime: number;   // Study time in minutes
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}

interface VocabularyEntry {
  word: string;            // Chinese word/phrase
  definition: string;      // English translation
}
```

**Runtime Enhancement**: Lessons are processed into `EnhancedLesson` with:
- Segmented text with pinyin
- Generated flashcards
- Generated quiz questions
- Audio preparation hooks
- Difficulty heuristics

---

## 🚀 Key Features

### 1. Chinese Language Processing

**Text Segmentation**:
- Sentence-based segmentation using punctuation detection
- Custom algorithm for Chinese sentence boundaries (。！？；：)
- Respects natural reading units

**Pinyin Generation** (via `pinyin-pro` v3.27):
- Multiple tone mark styles: none, numbered (ma1), symbol (mā)
- Character-level and word-level romanization
- Configurable output formats

**Vocabulary Processing**:
- Automatic extraction from lesson content
- Frequency analysis for difficulty heuristics
- Cross-referencing with lesson vocabulary list
- Inline highlighting with interactive tooltips

### 2. Study Tools

**Flashcards** (`srsService.ts`):
- SuperMemo SM-2 spaced repetition algorithm
- Automatic card generation from vocabulary
- Progress tracking with ease factor adjustment
- Review queue prioritization by due date

**Quizzes** (`quizService.ts` via enhanced services):
- Multiple choice questions (MCQ)
- Fill-in-the-blank exercises
- Generated from lesson vocabulary and segments
- Configurable difficulty levels

**Progress Tracking**:
- Per-segment viewing history
- Time spent on lessons
- Vocabulary studied count
- Audio playback tracking
- Session count and completion status

### 3. Audio & Translation

**Audio Synthesis** (`audioService.ts`):
- Web Speech API integration with Chinese voice selection
- Fallback to available system voices
- Configurable speed and pitch
- Per-segment audio playback
- Graceful degradation when unavailable

**Translation** (`translationService.ts`):
- Multi-provider architecture (Google, Azure, LibreTranslate)
- Automatic fallback chain
- Response caching (LRU + TTL)
- Batch translation support

### 4. Multi-Source Lesson Library

**Local Sources**:
- JSON files in `/public/lessons/`
- Organized by difficulty (beginner/intermediate/advanced)
- Manifest-based catalog (`manifest.json`)

**Remote Sources** (`librarySourceService.ts`):
- GitHub raw content URLs
- Custom API endpoints
- Authentication support (Bearer tokens, API keys)
- Configurable sync intervals
- Priority-based source ordering
- Rate limiting and retry logic

**Configuration** (`public/remote-sources.json`):
```json
{
  "sources": [
    {
      "id": "lscs-depot",
      "name": "LSCS Chinese Lesson Depot",
      "type": "remote",
      "enabled": true,
      "priority": 1,
      "config": {
        "url": "https://raw.githubusercontent.com/.../manifest.json",
        "syncInterval": 30,
        "authentication": { "type": "none" }
      }
    }
  ]
}
```

### 5. Export & Reader Mode

**Export Service** (`exportService.ts`):
- PDF generation with jsPDF
- Printable lesson formats
- Includes Chinese text, pinyin, and vocabulary
- Custom formatting options

**Reader Mode**:
- Distraction-free reading interface
- Configurable text size and spacing
- Progress tracking during reading
- Audio playback integration

---

## 🛠️ Technology Stack

### Main Application

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.1.1 | UI library |
| **Language** | TypeScript | 5.8.3 | Type safety |
| **Build Tool** | Vite | 7.1.7 | Fast dev server + bundler |
| **Router** | React Router | 7.9.3 | Client-side routing with data loaders |
| **UI Library** | Material-UI | 7.3.2 | Component library |
| **Styling** | Emotion | 11.14.0 | CSS-in-JS |
| **Chinese Processing** | pinyin-pro | 3.27.0 | Pinyin romanization |
| **PDF Export** | jsPDF | 3.0.3 | PDF generation |
| **Testing** | Vitest | 3.2.4 | Unit testing |
| **E2E Testing** | Playwright | 1.55.1 | Browser automation |
| **A11y Testing** | @axe-core/react | 4.10.2 | Accessibility validation |
| **Linting** | ESLint | 9.36.0 | Code quality |
| **Formatting** | Prettier | 3.6.2 | Code formatting |

### Lesson Builder

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type safety |
| Material-UI | 5.14.20 | Component library |
| pinyin-pro | 3.19.6 | Vocabulary extraction |
| react-syntax-highlighter | 15.5.0 | JSON preview |
| Vite | 4.5.0 | Build tool |

### Deployment

- **Platform**: Vercel
- **Build**: `npm run build:with-types` (type-check + Vite build)
- **Output**: `dist/` directory with optimized chunks
- **Routing**: SPA with client-side routing + Vercel rewrites

---

## 🎨 Build Optimization Strategy

### Vite Manual Chunking (`vite.config.ts`)

The build uses strategic code splitting for optimal caching:

```typescript
manualChunks: {
  // Core React dependencies (stable, cached long-term)
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  
  // Material-UI (large bundle, cached separately)
  'mui-core': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
  
  // Component layers (granular caching by atomic level)
  'components-atoms': ['./src/components/atoms/index.ts'],
  'components-molecules': ['./src/components/molecules/index.ts'],
  'components-organisms': ['./src/components/organisms/index.ts'],
  'components-templates': ['./src/components/templates/index.ts'],
  
  // Chinese processing (specialty library)
  'chinese-processing': ['pinyin-pro'],
  
  // Services remain separate for lazy loading
}
```

**Benefits**:
- Services dynamically imported → only loaded when needed
- Vendor chunks cached across deploys
- Component updates don't invalidate vendor cache
- Parallel chunk loading for faster TTI

### Lazy Loading Pattern

Components and services use dynamic imports with React Suspense:

```typescript
// Example from src/utils/lazyLoading.ts
export const LessonPage = lazy(() => import('../components/templates/LessonPage'));
export const preloadServices = {
  pinyin: () => import('../services/pinyinService'),
  audio: () => import('../services/audioService'),
  // ...
};
```

**Route Loaders**: Preload services before navigation completes (see `src/router/index.tsx`).

---

## 📱 Testing Strategy

### 1. Unit Tests (Vitest)

**Location**: `tests/unit/`  
**Command**: `npm run test`

**Coverage**:
- Service logic (pinyin, segmentation, SRS, translation)
- Component rendering and props
- Utility functions
- Type validation

**Mocks** (`src/test/setup.ts`):
- Web Speech API (`speechSynthesis`, `SpeechSynthesisUtterance`)
- Browser APIs (`IntersectionObserver`, `ResizeObserver`)
- External libraries (pinyin-pro)

### 2. End-to-End Tests (Playwright)

**Location**: `tests/e2e/`  
**Command**: `npm run test:e2e`

**Test Matrix**:
- **Mobile**: iPhone 12 (320px), iPad Pro (768px)
- **Desktop**: Chrome, Firefox, Safari
- **Browsers**: Chromium, Firefox, WebKit

**Scenarios**:
- Lesson browsing and navigation
- Audio playback interactions
- Flashcard study flows
- Quiz completion
- Progress tracking
- Reader mode

### 3. Accessibility Tests (axe-core)

**Location**: `tests/a11y/`  
**Command**: `npm run test:a11y`

**Validation**:
- WCAG 2.1 Level AA compliance
- Keyboard navigation paths
- Screen reader compatibility
- Focus management
- ARIA labeling
- Color contrast ratios

### 4. Performance Tests

**Location**: `tests/performance/`  
**Tools**: Web Vitals, Lighthouse

**Metrics**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

---

## 🧩 Lesson Builder Application

**Purpose**: Standalone tool for creating schema-compliant Chinese lessons.

### Key Features

1. **Intuitive Lesson Creation**:
   - Rich forms for Chinese content and metadata
   - Difficulty level selection (beginner/intermediate/advanced)
   - Tag management and source attribution
   - Estimated study time calculation

2. **Automatic Vocabulary Extraction**:
   - AI-powered Chinese text analysis
   - Character frequency heuristics
   - Word length and educational value assessment
   - Manual curation and editing

3. **Real-time Schema Validation**:
   - Validates against `schemas/lesson.schema.json`
   - Field-level error messages
   - Required field indicators
   - Data type and constraint checking

4. **JSON Preview**:
   - Live-updating syntax-highlighted preview
   - Copy-to-clipboard functionality
   - Formatted output

5. **GitHub Integration**:
   - Direct publishing to lesson repositories
   - Automatic folder organization by difficulty
   - Descriptive commit messages
   - Hardcoded authentication (Vercel environment variables)

6. **Auto-save**:
   - LocalStorage-based draft persistence
   - Prevents data loss on refresh
   - Session recovery

### Workflow

```
1. Enter basic info (title, description, difficulty)
2. Input Chinese content
3. Click "Extract Vocabulary" → AI suggests words
4. Review/edit vocabulary list
5. Validate against schema → see real-time feedback
6. Preview JSON output
7. Export to file OR publish to GitHub
```

### Deployment

- **Platform**: Vercel (separate deployment from main app)
- **URL Pattern**: `lesson-builder.pinyinmate.vercel.app`
- **Commands**:
  ```bash
  cd lesson-builder
  npm run dev      # Development server
  npm run build    # Production build
  npm run preview  # Preview build
  ```

---

## 🔧 Developer Setup & Workflows

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser (Chrome/Firefox/Safari)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/mpklu/pinyinMate.git
cd learn-chinese

# Install main app dependencies
npm install

# Install lesson builder dependencies
cd lesson-builder
npm install
cd ..
```

### Development Commands

**Main App**:
```bash
npm run dev                    # Start dev server (http://localhost:5173)
npm run build:with-types       # Type-check + build (preferred over npm run build)
npm run preview                # Preview production build
npm run test                   # Run unit tests (Vitest)
npm run test:ui                # Vitest UI
npm run test:coverage          # Generate coverage report
npm run test:e2e               # Run E2E tests (Playwright)
npm run test:e2e:headed        # E2E with browser UI
npm run test:a11y              # Run accessibility tests
npm run lint                   # Lint code
npm run lint:fix               # Auto-fix lint issues
npm run format                 # Format code with Prettier
npm run type-check             # TypeScript validation
```

**Lesson Builder**:
```bash
cd lesson-builder
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Lint code
npm run type-check             # TypeScript validation
```

### Key Files for Reference

| File | Purpose |
|------|---------|
| `src/services/serviceCoordinator.ts` | Central service orchestration |
| `schemas/lesson.schema.json` | Authoritative lesson data structure |
| `src/router/index.tsx` | Route configuration with service preloading |
| `src/context/SessionContext.tsx` | Global state management |
| `vite.config.ts` | Build optimization and chunking |
| `public/lessons/manifest.json` | Local lesson catalog |
| `public/remote-sources.json` | Remote source configuration |
| `src/components/templates/LessonPage.tsx` | Main learning interface pattern |

### Common Development Tasks

**Adding a New Service**:
1. Create service file in `src/services/`
2. Define service interface and implementation
3. Add lazy import to `serviceCoordinator.ts`
4. Export preload function in `src/utils/lazyLoading.ts`
5. Add to relevant route loaders in `src/router/index.tsx`
6. Write unit tests

**Creating a New Component**:
1. Determine atomic level (atom/molecule/organism/template)
2. Create component file in appropriate directory
3. Define TypeScript interface for props
4. Implement with accessibility considerations (ARIA, keyboard nav)
5. Export from `components/index.ts`
6. Add to lazy loading if used in routes
7. Write unit and E2E tests

**Adding a Lesson**:
1. Create JSON file following schema structure
2. Validate against `schemas/lesson.schema.json`
3. Place in appropriate difficulty folder (`public/lessons/beginner/`)
4. Update `public/lessons/manifest.json`
5. Test loading and rendering in app

**Configuring Remote Source**:
1. Edit `public/remote-sources.json`
2. Add source configuration with URL and auth
3. Set priority and sync interval
4. Test connection and lesson loading
5. Handle errors gracefully

---

## 🌐 Remote Lesson Sources

### LSCS Chinese Lesson Depot

**Repository**: gelileo/chinese-lesson-depot  
**Organization**: Little Star Chinese School (LSCS)  
**System**: 7-level progression (Level 1 → Level 7 → Advanced)

**Configuration**:
```json
{
  "id": "lscs-depot",
  "enabled": true,
  "priority": 1,
  "config": {
    "url": "https://raw.githubusercontent.com/gelileo/chinese-lesson-depot/main/manifest.json",
    "syncInterval": 30,
    "supportedFeatures": ["flashcards", "quizzes", "pinyin", "vocabulary", "lscs-levels"]
  }
}
```

**Features**:
- Structured curriculum by proficiency level
- Rich vocabulary lists
- Schema-compliant lesson format
- Regular updates

### Adding New Remote Sources

1. **Requirements**:
   - Must provide `manifest.json` with lesson list
   - Individual lessons must conform to PinyinMate schema
   - Stable URL endpoint (GitHub raw, API, CDN)
   - Optional: authentication credentials

2. **Configuration** (`public/remote-sources.json`):
   ```json
   {
     "id": "unique-source-id",
     "name": "Display Name",
     "type": "remote",
     "enabled": true,
     "priority": 2,
     "config": {
       "url": "https://example.com/manifest.json",
       "syncInterval": 60,
       "authentication": {
         "type": "bearer",
         "credentials": { "token": "your-token" }
       }
     }
   }
   ```

3. **Testing**: Verify manifest structure, lesson loading, and error handling.

---

## 📖 Documentation Inventory

| Document | Location | Purpose |
|----------|----------|---------|
| **README.md** | `/README.md` | Project overview, quick start, features |
| **SUMMARY.md** | `/SUMMARY.md` | This comprehensive developer guide |
| **Copilot Instructions** | `/.github/copilot-instructions.md` | AI assistant integration guide |
| **Component API** | `/docs/COMPONENT_API.md` | Component props and usage |
| **Lesson Schema** | `/docs/lesson-schema.md` | Schema specifications and examples |
| **Lesson Data Architecture** | `/docs/lesson-data-architecture.md` | Data flow and source management |
| **Reader Mode** | `/docs/reader-mode.md` | Reader feature documentation |
| **Translation Setup** | `/docs/translation-setup.md` | Translation provider configuration |
| **Vercel Deployment** | `/docs/vercel-deployment-guide.md` | Deployment instructions |
| **GitHub Lesson Publishing** | `/docs/github-lesson-publishing-guide.md` | Publishing workflow |
| **Builder README** | `/lesson-builder/README.md` | Lesson builder quick start |
| **Builder Requirements** | `/lesson-builder/SOFTWARE_REQUIREMENTS.md` | Builder specifications |
| **Builder GitHub Setup** | `/lesson-builder/docs/github-setup.md` | GitHub integration guide |

---

## 🎯 Roadmap & Future Enhancements

### Completed Features ✅

- Schema-driven lesson management
- Chinese text segmentation and pinyin generation
- Audio synthesis with Web Speech API
- Flashcard generation with SM-2 spaced repetition
- Quiz generation and review
- Progress tracking and session management
- Multi-source lesson library (local + remote)
- PDF export functionality
- Reader mode
- Translation service with multi-provider support
- Comprehensive test coverage (unit, E2E, a11y)
- Lesson builder with GitHub integration
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimization (lazy loading, chunking)

### In Progress 🚧

- Enhanced vocabulary extraction algorithms
- Improved text segmentation with ML models
- Advanced quiz types (matching, ordering)
- User authentication and cloud sync
- Social features (lesson sharing, comments)

### Planned Features 🔮

**Short-term**:
- Offline mode with service workers
- Advanced SRS customization (custom algorithms)
- Character writing practice (stroke order)
- Grammar pattern recognition and highlighting
- Lesson difficulty auto-detection
- Audio recording and pronunciation comparison

**Medium-term**:
- Mobile apps (React Native)
- Collaborative lesson editing
- Advanced analytics dashboard
- Gamification (achievements, streaks)
- Integration with external dictionaries (Pleco, CC-CEDICT)
- Video lesson support

**Long-term**:
- AI-powered conversation practice
- Personalized learning paths
- Community-driven lesson marketplace
- Advanced HSK level alignment
- Integration with Chinese language certification programs

---

## 🤝 Contributing Guidelines

### For Developers

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pinyinMate.git
   cd learn-chinese
   ```

2. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Workflow**:
   - Write code following project conventions
   - Add/update tests (maintain >80% coverage)
   - Run linters and formatters
   - Test in multiple browsers (Chrome, Firefox, Safari)
   - Verify accessibility with axe-core

4. **Commit Standards**:
   ```
   feat: Add new flashcard review mode
   fix: Correct pinyin tone mark generation
   docs: Update lesson schema documentation
   test: Add E2E tests for quiz flow
   refactor: Extract audio service from component
   ```

5. **Pull Request**:
   - Clear description of changes
   - Link to related issues
   - Screenshots/videos for UI changes
   - Test results and coverage reports

### For Content Creators

1. **Use Lesson Builder**:
   - Visit lesson builder web app
   - Follow guided workflow
   - Publish directly to GitHub or export JSON

2. **Manual Lesson Creation**:
   - Follow schema in `schemas/lesson.schema.json`
   - Validate with online JSON Schema validator
   - Submit via GitHub pull request to lesson repositories

3. **Quality Standards**:
   - Accurate Chinese text (no typos)
   - Comprehensive vocabulary lists
   - Appropriate difficulty labeling
   - Source attribution
   - Estimated study time

---

## 🐛 Troubleshooting Common Issues

### Development Issues

**Issue**: Vite dev server won't start  
**Solution**: Delete `node_modules`, run `npm install`, ensure Node.js 18+

**Issue**: TypeScript errors after pulling updates  
**Solution**: Run `npm run type-check` to see full errors, may need to update type definitions

**Issue**: Tests failing with "Module not found"  
**Solution**: Check `src/test/setup.ts` for proper mocks, ensure test imports use correct paths

**Issue**: Build fails with "Chunk too large" warning  
**Solution**: Check `vite.config.ts` manual chunks, adjust chunking strategy

### Runtime Issues

**Issue**: Audio not playing  
**Solution**: Verify Web Speech API browser support, check console for synthesis errors

**Issue**: Pinyin not displaying correctly  
**Solution**: Ensure Chinese text is valid UTF-8, check pinyin-pro version compatibility

**Issue**: Lessons not loading from remote source  
**Solution**: Verify `remote-sources.json` URL is accessible, check CORS headers, validate manifest format

**Issue**: Progress not saving  
**Solution**: Check browser localStorage availability, ensure session context is properly initialized

### Browser Compatibility

**Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Known Issues**:
- Safari < 14: Web Speech API limited voice selection
- Firefox: Some Material-UI animations may be janky
- Mobile Safari: Audio autoplay restrictions

---

## 📊 Performance Benchmarks

### Lighthouse Scores (Target)

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

### Key Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.5s | 0.8s |
| Largest Contentful Paint (LCP) | < 2.5s | 1.9s |
| Time to Interactive (TTI) | < 3.5s | 2.3s |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.05 |
| Total Bundle Size | < 500KB gzipped | ~320KB |

### Optimization Strategies

- **Code Splitting**: 8+ manual chunks for optimal caching
- **Lazy Loading**: Services and routes loaded on-demand
- **Image Optimization**: SVG for icons, optimized PNGs
- **Caching**: Service Worker for offline support (planned)
- **CDN**: Vercel Edge Network for global distribution

---

## 🔐 Security Considerations

### Content Security Policy (CSP)

- **Script Sources**: Self-hosted only (no external scripts)
- **Style Sources**: Inline styles for Emotion CSS-in-JS
- **API Calls**: HTTPS only for remote sources

### Data Privacy

- **Local Storage**: User progress stored client-side only
- **No Analytics**: Privacy-first, no tracking by default
- **Optional Cloud Sync**: User-controlled (planned feature)

### GitHub Integration (Lesson Builder)

- **Authentication**: Environment variables (Vercel secrets)
- **Permissions**: Repository-scoped personal access tokens
- **Rate Limiting**: Respects GitHub API limits

---

## 📞 Support & Community

### Resources

- **GitHub Issues**: https://github.com/mpklu/pinyinMate/issues
- **Discussions**: https://github.com/mpklu/pinyinMate/discussions
- **Documentation**: https://github.com/mpklu/pinyinMate/tree/main/docs

### Getting Help

1. **Search existing issues** for similar problems
2. **Check documentation** for feature explanations
3. **Open new issue** with reproduction steps and environment details
4. **Join discussions** for feature requests and general questions

### Reporting Bugs

Include:
- **Description**: What happened vs. what you expected
- **Steps to Reproduce**: Detailed steps to trigger the bug
- **Environment**: Browser, OS, app version
- **Screenshots/Logs**: Visual evidence and console errors
- **Lesson Data**: Sample lesson JSON (if content-specific)

---

## 📜 License

**MIT License** - Open source and free to use, modify, and distribute.

See `/LICENSE` file for full license text.

---

## 🙏 Acknowledgments

### Technologies

- **React Team**: For the incredible React framework
- **Vercel**: For hosting and deployment platform
- **Material-UI**: For comprehensive component library
- **pinyin-pro**: For excellent Chinese romanization library

### Inspiration

- **DuChinese**: Reading-focused learning approach
- **Skritter**: Character writing methodology
- **Anki**: Spaced repetition implementation
- **Pleco**: Comprehensive dictionary features

### Contributors

See GitHub contributors list for all code contributors.

---

## 📝 Quick Reference

### Most Common Commands

```bash
# Development
npm run dev                    # Start main app
cd lesson-builder && npm run dev  # Start lesson builder

# Testing
npm run test                   # Unit tests
npm run test:e2e              # E2E tests
npm run test:a11y             # Accessibility tests

# Build
npm run build:with-types      # Production build with type checking

# Quality
npm run lint                   # Check code quality
npm run format                 # Format code
npm run type-check            # Validate TypeScript
```

### Key URLs (Local Development)

- Main App: http://localhost:5173
- Lesson Builder: http://localhost:5174 (when running)
- Vitest UI: http://localhost:51204/__vitest__/
- Playwright Report: http://localhost:9323 (after E2E tests)

### Important Directories

- Services: `src/services/`
- Components: `src/components/atoms|molecules|organisms|templates/`
- Types: `src/types/`
- Tests: `tests/unit|e2e|a11y/`
- Lessons: `public/lessons/`
- Docs: `docs/`

---

## 🔄 Continuous Integration & Deployment

### GitHub Actions (Future)

Planned workflows:
- **CI**: Lint, type-check, unit tests, E2E tests on PR
- **Deploy**: Automatic Vercel deployment on merge to main
- **Accessibility**: Automated a11y audits
- **Performance**: Lighthouse CI checks

### Vercel Deployment

**Main App**:
- Production: pinyinmate.vercel.app
- Preview: Auto-generated for each PR
- Build: `npm run build:with-types`
- Output: `dist/`

**Lesson Builder**:
- Production: lesson-builder.pinyinmate.vercel.app (or custom subdomain)
- Build: `npm run build` (from lesson-builder directory)
- Output: `lesson-builder/dist/`

**Environment Variables** (Vercel dashboard):
```
# Main App
VITE_APP_NAME=PinyinMate
VITE_APP_VERSION=1.0.0

# Lesson Builder
VITE_GITHUB_TOKEN=ghp_xxxxx
VITE_GITHUB_OWNER=mpklu
VITE_GITHUB_REPO=lesson-content
VITE_GITHUB_BRANCH=main
```

---

## 🎓 For Future Developers & AI Assistants

### Architecture Principles

1. **Services First**: All business logic in services, components are presentational
2. **Type Safety**: TypeScript everywhere, avoid `any` types
3. **Atomic Design**: Build from atoms up, compose components logically
4. **Schema-Driven**: Lesson data must conform to schema, validate early and often
5. **Graceful Degradation**: Handle service failures, provide fallbacks
6. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
7. **Performance**: Lazy load, cache aggressively, measure with Web Vitals

### Code Conventions

- **Naming**: PascalCase for components, camelCase for functions/variables
- **Files**: One component per file, co-locate types when possible
- **Exports**: Named exports preferred, default exports for lazy-loaded components
- **Comments**: JSDoc for public APIs, inline comments for complex logic
- **Imports**: Group by external → internal → relative, sorted alphabetically

### When Modifying Services

- **Update Interface**: Change service interface in service file
- **Update Coordinator**: Add/modify coordination logic if needed
- **Update Types**: Ensure TypeScript types match
- **Write Tests**: Unit tests for new logic, integration tests for flows
- **Document**: Update relevant docs (this file, COMPONENT_API.md)

### When Adding Features

1. **Define Requirements**: What problem does it solve?
2. **Design API**: Service interface and component props
3. **Implement Service**: Business logic with error handling
4. **Create Components**: UI layer with accessibility
5. **Add Tests**: Unit, integration, E2E as appropriate
6. **Update Docs**: Document usage and examples
7. **Performance Check**: Measure impact with Lighthouse

### Integration Checklist

New AI assistants or developers starting on this project should:

- [ ] Read README.md for project overview
- [ ] Review this SUMMARY.md for deep understanding
- [ ] Study schemas/lesson.schema.json for data structure
- [ ] Examine src/services/serviceCoordinator.ts for architecture
- [ ] Review src/router/index.tsx for routing patterns
- [ ] Check vite.config.ts for build configuration
- [ ] Run all tests (unit, E2E, a11y) to verify setup
- [ ] Build and preview production bundle
- [ ] Review open issues and discussions on GitHub

---

## 📌 Final Notes

This document provides a comprehensive overview of the PinyinMate project. It should serve as the **primary reference** for:

- **Onboarding new developers**: Understanding architecture and conventions
- **AI assistants (Copilot, etc.)**: Context for intelligent code suggestions
- **Project planning**: Current state and future directions
- **Troubleshooting**: Common issues and solutions
- **Contributing**: How to participate in development

**Keep this document updated** as the project evolves. Major architectural changes, new features, or significant refactorings should be reflected here.

**For questions or clarifications**, open a GitHub discussion or contact project maintainers.

---

**Last Updated**: November 29, 2025  
**Document Version**: 1.0  
**Project Version**: 1.0.0  
**Maintainer**: mpklu

**Happy coding! 加油！(jiā yóu - Keep going!)** 🚀
