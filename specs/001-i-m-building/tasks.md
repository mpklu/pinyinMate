# Tasks: Chinese Learning Web App for Kids

**Input**: Design documents from `/Users/kunlu/Projects/misc/learn-chinese/specs/001-i-m-building/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `src/` at repository root (pure frontend SPA)
- **Tests**: `tests/` at repository root
- React + TypeScript + Material-UI + Vite architecture

## Phase 3.1: Setup
- [x] T001 Create React + TypeScript project structure with Vite
- [x] T002 Initialize React 18+ project with Material-UI v5, jieba-js, jsPDF dependencies
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript strict mode
- [x] T004 [P] Setup Vitest + React Testing Library for unit tests
- [x] T005 [P] Configure Playwright for E2E tests with mobile viewports (320px, 768px, 1024px)
- [x] T006 [P] Project directory structure: src/{components,pages,services,types,utils}/
- [x] T007 [P] Development server validation and hot reload testing

## Phase 3.2: Contract Tests
- [x] T008 [P] Text annotation contract test for input→segmentation→pinyin→definitions in tests/contract/text-annotation.test.ts
- [x] T009 [P] Quiz contract test for segments→questions→answers→scoring in tests/contract/quiz-api.test.ts
- [x] T010 [P] Flashcard contract test for segments→SRS→scheduling→review in tests/contract/flashcard-api.test.ts
- [x] T011 [P] Export contract test for processed_text→formats(PDF,Anki,Quizlet) in tests/contract/export-api.test.ts
- [x] T012 [P] Audio contract test for text→pinyin→audio_synthesis→playback in tests/contract/audio-api.test.ts

### Integration Tests (User Journeys)
- [x] T013 [P] User journey test: Text input + annotation + vocab extraction in tests/integration/text-annotation.test.ts
- [x] T014 [P] User journey test: Quiz generation + completion + scoring in tests/integration/quiz-generation.test.ts
- [x] T015 [P] User journey test: Flashcard creation + SRS review + progress in tests/integration/flashcard-study.test.ts
- [x] T016 [P] User journey test: Library browsing + text selection + annotation in tests/integration/library-browsing.test.ts
- [x] T017 [P] User journey test: Export workflow + format generation + download in tests/integration/export-workflow.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### TypeScript Types & Interfaces
- [x] T018 [P] Core text processing types (TextSegment, ProcessedText, etc.) in src/types/textTypes.ts
- [x] T019 [P] Quiz and flashcard types (Question, Card, SRSData, etc.) in src/types/studyTypes.ts
- [x] T020 [P] Export format types (ExportFormat, ExportData, etc.) in src/types/exportTypes.ts
- [x] T021 [P] Audio and UI state types (AudioState, UIPreferences, etc.) in src/types/uiTypes.ts

### Core Services (Business Logic)
- [x] T022 [P] Chinese text segmentation service using jieba-js in src/services/textSegmentationService.ts
- [x] T023 [P] Pinyin generation service in src/services/pinyinService.ts
- [x] T024 [P] Quiz generation service in src/services/quizGenerationService.ts
- [x] T025 [P] SRS algorithm service (session-only) in src/services/srsService.ts
- [x] T026 [P] Audio synthesis service (MeloTTS + Web Speech API fallback) in src/services/audioService.ts
- [x] T027 [P] Export service (PDF, Anki, Quizlet formats) in src/services/exportService.ts

### React Components - Atoms (MUI-based)
- [x] T028 [P] ChineseText component with tone coloring in src/components/atoms/ChineseText.tsx
- [x] T029 [P] PinyinText component with toggle visibility in src/components/atoms/PinyinText.tsx
- [x] T030 [P] AudioButton component with playback controls in src/components/atoms/AudioButton.tsx
- [x] T031 [P] DifficultyRating component (0-5 scale) in src/components/atoms/DifficultyRating.tsx

### React Components - Molecules
- [x] T032 [P] TextSegmentCard component (Chinese + pinyin + definition) in src/components/molecules/TextSegmentCard.tsx
- [x] T033 [P] QuizQuestion component (multiple types support) in src/components/molecules/QuizQuestion.tsx
- [x] T034 [P] FlashcardView component (front/back flip) in src/components/molecules/FlashcardView.tsx
- [x] T035 [P] ExportOptions component (format selection) in src/components/molecules/ExportOptions.tsx

### React Components - Organisms
- [ ] T036 TextAnnotationPanel component (input + processing + results) in src/components/organisms/TextAnnotationPanel.tsx
- [ ] T037 ReaderView component (text + toggles + navigation) in src/components/organisms/ReaderView.tsx
- [ ] T038 QuizInterface component (questions + progress + results) in src/components/organisms/QuizInterface.tsx
- [ ] T039 FlashcardDeck component (SRS queue + study interface) in src/components/organisms/FlashcardDeck.tsx

### Pages and Routing
- [x] T040 React Router setup and navigation in src/App.tsx
- [x] T041 Home page component in src/pages/HomePage.tsx
- [x] T042 Annotation page component in src/pages/AnnotationPage.tsx
- [ ] T043 Reader page component in src/pages/ReaderPage.tsx
- [x] T044 Quiz page component in src/pages/QuizPage.tsx
- [x] T045 Flashcards page component in src/pages/FlashcardsPage.tsx
- [x] T046 Library page component in src/pages/LibraryPage.tsx

## Phase 3.4: Integration & State Management
- [x] T047 React Context for session state management in src/context/SessionContext.tsx
- [ ] T048 React Context for UI preferences (toggles, theme) in src/context/PreferencesContext.tsx
- [ ] T049 Custom hooks for text processing workflows in src/hooks/useTextProcessing.ts
- [ ] T050 Custom hooks for SRS flashcard management in src/hooks/useFlashcards.ts
- [x] T051 Material-UI theme configuration (mobile-first, accessibility) in src/theme/theme.ts
- [ ] T052 Static Chinese library content integration in public/library/

## Phase 3.5: Polish & Validation
- [ ] T053 [P] Unit tests for core services in tests/unit/services/
- [ ] T054 [P] Unit tests for React components in tests/unit/components/
- [ ] T055 [P] Performance optimization: code splitting and lazy loading
- [ ] T056 [P] Bundle size analysis and optimization
- [ ] T057 [P] Responsive design validation (320px, 768px, 1024px+ breakpoints)
- [ ] T058 [P] Accessibility audit with axe-core (WCAG 2.1 AA compliance)
- [ ] T059 [P] Touch target validation (minimum 44px targets)
- [ ] T060 [P] Keyboard navigation testing across all components
- [ ] T061 [P] Screen reader compatibility testing
- [ ] T062 [P] Performance testing: <3s load time, <1s navigation
- [ ] T063 [P] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] T064 [P] Mobile device testing on real devices
- [ ] T065 Error boundary implementation and error handling
- [ ] T066 Update documentation and README.md
- [ ] T067 [P] Verify no authentication components or flows exist (FR-013 validation)

## Dependencies

### Critical Path
- Setup (T001-T007) before everything
- Contract tests (T008-T012) before service implementation (T022-T027)
- Integration tests (T013-T017) before page implementation (T040-T046)
- Types (T018-T021) before services and components
- Services (T022-T027) before components that use them
- Atoms (T028-T031) before molecules (T032-T035)
- Molecules (T032-T035) before organisms (T036-T039)
- Components before pages (T036-T039 before T040-T046)
- Core implementation before integration (T047-T052)
- Everything before polish (T053-T066)

### Specific Dependencies
- T022 (segmentation) blocks T036 (annotation panel)
- T023 (pinyin) blocks T032 (segment card)
- T024 (quiz generation) blocks T038 (quiz interface)
- T025 (SRS) blocks T039 (flashcard deck)
- T026 (audio) blocks T030 (audio button)
- T027 (export) blocks T035 (export options)
- T040 (routing) blocks all page components (T041-T046)
- T047-T048 (contexts) needed by T049-T050 (hooks)

## Parallel Execution Examples

### Phase 3.2 Contract Tests (can run together)
```bash
# Launch T008-T012 together:
npm run test -- tests/contract/text-annotation.test.ts &
npm run test -- tests/contract/quiz-api.test.ts &
npm run test -- tests/contract/flashcard-api.test.ts &
npm run test -- tests/contract/export-api.test.ts &
npm run test -- tests/contract/audio-api.test.ts &
wait
```

### Phase 3.3 Services (can run together after types)
```bash
# Launch T022-T027 together after T018-T021:
# Implement textSegmentationService.ts
# Implement pinyinService.ts  
# Implement quizGenerationService.ts
# Implement srsService.ts
# Implement audioService.ts
# Implement exportService.ts
```

### Phase 3.5 Polish Tasks (can run together)
```bash
# Launch T053-T064 together:
npm run test:unit &
npm run lighthouse &
npm run test:a11y &
npm run test:performance &
npm run test:mobile &
wait
```

## Validation Checklist
*GATE: Checked before completion*

- [ ] All 5 contracts have corresponding tests (T008-T012)
- [ ] All 4 main entities have type definitions (T018-T021) 
- [ ] All 6 core services implemented (T022-T027)
- [ ] All 5 user journeys have integration tests (T013-T017)
- [ ] All components follow Material-UI + accessibility patterns
- [ ] Mobile-first responsive design validated
- [ ] Performance budget met (<3s load, <1s navigation)
- [ ] WCAG 2.1 AA compliance verified
- [ ] Cross-browser compatibility confirmed

## Constitutional Compliance Verification
- [ ] Maximum 3 primary actions per screen maintained
- [ ] Navigation depth ≤ 3 levels enforced
- [ ] Touch targets ≥ 44px validated
- [ ] No horizontal scrolling confirmed
- [ ] Component architecture follows single responsibility
- [ ] TypeScript strict mode compliance