<p align="center">
  <img src="public/vite.svg" alt="PinyinMate" width="72" />
</p>

# PinyinMate

An open, schema‑driven Chinese learning platform built with React 19, TypeScript, and Vite. PinyinMate turns plain JSON lesson content into an interactive study experience with segmentation, pinyin annotation, audio, vocabulary tools, flashcards, quizzes, and progress tracking.

> All lesson data is validated against a JSON Schema and can come from local files or remote GitHub/content APIs. Services handle Chinese text processing, audio synthesis, translation, spaced repetition, exporting, and performance optimization.

<p align="center">
  <a href="https://pinyinmate.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="demo.gif" alt="PinyinMate live demo preview" />
  </a>
  <br />
</p>

---

## Table of Contents
- Overview
- Core Features
- Architecture at a Glance
- Repository Structure
- Getting Started
  - Quick Start
  - Running the Lesson Builder
  - Creating Your First Lesson
  - Testing & Quality
- Documentation
- Contributing
- License

---

## Overview
PinyinMate is designed for learners and content creators who want a transparent, extensible study workflow for Mandarin Chinese. Instead of hard‑coding content, lessons are defined as JSON files that pass a strict schema (`schemas/lesson.schema.json`). A service orchestration layer processes lessons into enriched, segment‑level study objects with pinyin, audio hooks, vocabulary cross‑references, and study tool generation.

The project is split into two parts:
1. Main App (`/src`) – Learner experience (browse, study, flashcards, quizzes)
2. Lesson Builder (`/lesson-builder`) – A companion tool (work‑in‑progress) for validating and authoring schema‑compliant lessons

---

## Core Features

### Lesson & Data Layer
- Schema‑driven lessons (validated against `schemas/lesson.schema.json`)
- Local & remote lesson manifests with priority, caching, and rate limiting
- Smart LRU + TTL caching for lesson content
- Automatic content validation & Chinese character heuristics

### Chinese Language Processing
- Text segmentation (sentence / phrase / character strategies)
- Pinyin generation via `pinyin-pro` (abstracted in `pinyinService`)
- Vocabulary enrichment (frequency, difficulty heuristics)
- Inline vocabulary highlighting & popovers

### Study Tools & Interactivity
- Flashcard generation (from processed vocabulary)
- Quiz generation (MCQ, fill‑in‑blank scaffolding)
- Study progress tracking (segment & lesson level)
- Export service (PDF / printable assets; see `exportService`)

### Audio & Translation
- Web Speech API integration with graceful fallbacks (`audioService` / `audioSynthesisService`)
- Per‑segment audio preparation hooks
- Multi‑provider translation service with fallback dictionary & batching (`translationService`)

### Architecture & Performance
- Service-based architecture with lazy dependency orchestration (`serviceCoordinator`)
- Separation of concerns: processing, segmentation, SRS, translation, manifest loading
- Manual chunking & lazy loading (see `vite.config.ts` and `src/utils/` patterns)

### Quality & Accessibility
- Unit tests (Vitest), E2E (Playwright), a11y tests (`@axe-core/react`)
- Type-safe domain models (`src/types/*`)
- Accessible interactive components (keyboard navigation, ARIA labeling)

### Extensibility
- Add new remote sources via `src/config/remote-sources.json`
- Extend schema to introduce metadata dimensions
- Plug in new translation / audio providers behind existing service contracts

---

## Architecture at a Glance
Core services live in `src/services/` and are orchestrated by `serviceCoordinator.ts`. Each service focuses on a vertical concern (library loading, processing, audio, SRS, translation, schema validation, exporting). Components follow an atomic design structure (`atoms → molecules → organisms → templates`). Routes preload services and inject processed lesson data through context (`SessionContext`).

High-level flow:
1. Manifest(s) loaded (local + optional remote) → unified lesson registry
2. User selects a lesson → lesson fetched & validated
3. Processing pipeline runs (segmentation → pinyin → vocabulary mapping → audio prep)
4. Enhanced lesson rendered with interactive components & study tools
5. Optional flashcards/quizzes generated on demand

---

## Repository Structure (excerpt)
```
public/lessons/           # Local lesson manifest + lesson JSON files
schemas/lesson.schema.json# Authoritative lesson schema
src/services/             # Core service layer (processing, audio, translation...)
src/components/           # Atomic design UI components
src/router/               # Route configuration + preload logic
src/context/SessionContext.tsx
lesson-builder/           # Separate app for authoring/validation (WIP)
docs/                     # In-depth guides & component API
```

See `docs/lesson-data-architecture.md` and `docs/COMPONENT_API.md` for deep dives.

---

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+

### Quick Start (Main App)
```bash
git clone https://github.com/mpklu/pinyinMate.git
cd pinyinMate
npm install
npm run dev
```
Then open: http://localhost:5173

### Run the Lesson Builder (optional companion)
```bash
cd lesson-builder
npm install   # first time only (kept separate for isolation)
npm run dev
```
Builder dev server will usually start at: http://localhost:5174 (Vite will confirm)

### Project Scripts
```bash
npm run dev              # Start main app
npm run build:with-types # Type-check + production build
npm run test             # Unit tests (Vitest)
npm run test:e2e         # Playwright E2E tests
npm run test:a11y        # Accessibility tests
npm run lint             # ESLint
npm run format:check     # Prettier check
```

### Creating Your First Lesson
1. Copy an existing lesson file from `public/lessons/beginner/`
2. Update fields to match the schema (`schemas/lesson.schema.json`)
3. Add the entry to `public/lessons/manifest.json` under the appropriate category
4. (Optional) Add vocabulary items to enable flashcards & quizzes
5. Reload the app; the new lesson should appear in the library

To source remote lessons, add a provider to `src/config/remote-sources.json` and ensure the remote manifest follows the documented structure.

### Validation
At runtime the `schemaValidation` service validates lesson structure. Failing lessons are skipped or surfaced with user-friendly error messages (see `errorHandler.ts`). For bulk authoring, the lesson builder will provide schema and structural validation (work in progress).

### Testing & Quality Gates
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run browser automation
npm run test:a11y    # Automated accessibility checks
npm run lint         # Static analysis
npm run build:with-types
```
Treat a passing build + lint + a11y + unit tests as your merge baseline.

### Optional Translation Providers
The translation service works out of the box with a fallback dictionary. To enable external APIs, supply credentials (e.g. Google / Azure) via environment variables and extend configuration inside `translationService.ts` (see `docs/translation-setup.md`).

---

## Documentation
Key guides:
- `docs/lesson-data-architecture.md` – Data flow, schema, caching, remote sources
- `docs/COMPONENT_API.md` – Component API (atoms → templates)
- `docs/github-lesson-publishing-guide.md` – Publish lessons to GitHub
- `docs/translation-setup.md` – Translation provider configuration
- `docs/vercel-deployment-guide.md` – Deployment notes

---

## Contributing
Contributions welcome! Suggested next areas:
- Enhanced lesson builder UI / validation UX
- Additional study tool types (dictation, cloze, spaced repetition tuning)
- Improved adaptive difficulty heuristics
- Additional translation/audio provider integrations

Please open an issue or discussion before large changes. Run the full quality gate locally before submitting a PR.

---

## License
This project is licensed under the MIT License – see `LICENSE` for details.

---

## Roadmap (Snapshot)
- [ ] Lesson Builder advanced validation & preview
- [ ] User progress persistence & profile export
- [ ] Offline PWA packaging
- [ ] Additional spaced repetition algorithms

---

## Acknowledgements
- Built with React, Vite, TypeScript, Material UI
- Pinyin generation powered by `pinyin-pro`
- Testing stack: Vitest, Playwright, axe-core

---
