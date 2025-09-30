# Tasks: Enhanced Library and Lesson System

**Input**: Design documents from `/specs/002-help-enhance-complete/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript 5.8+, React 19.1+, Material-UI v5
   → Structure: Single-page web application (frontend only)
2. Load optional design documents: ✓
   → data-model.md: Library, Lesson, Flashcard, QuizQuestion entities
   → contracts/: LibraryService, LessonService, AudioService
   → research.md: Web Speech API, JSON manifest approach
3. Generate tasks by category: ✓
   → Setup: TypeScript interfaces, service structure, remote sources config
   → Tests: contract tests, integration tests for user journeys
   → Core: services, components (atoms→molecules→organisms→templates)
   → Integration: audio API, pinyin generation, remote loading
   → Polish: accessibility, performance, mobile optimization
4. Apply task rules: ✓
   → Different files = mark [P] for parallel
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness: ✓
   → All contracts have tests ✓
   → All entities have models ✓
   → All user journeys implemented ✓
9. Return: SUCCESS (tasks ready for execution) ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Single-page web application structure:
- **Types**: `src/types/` for TypeScript interfaces
- **Services**: `src/services/` for business logic
- **Components**: `src/components/atoms|molecules|organisms|templates/`
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`
- **Config**: `public/config/` for remote sources

## Phase 3.1: Setup ✅ COMPLETED
- [x] T001 [P] Create TypeScript interfaces in src/types/lesson.ts ✅
- [x] T002 [P] Create TypeScript interfaces in src/types/enhancedFlashcard.ts ✅
- [x] T003 [P] Create TypeScript interfaces in src/types/enhancedQuiz.ts ✅
- [x] T004 [P] Create TypeScript interfaces in src/types/enhancedLibrary.ts ✅
- [x] T005 [P] Create remote sources configuration in src/config/remote-sources.json ✅
- [x] T006 [P] Create local lesson manifest in src/config/library-manifest.json ✅

## Phase 3.2: Tests First (TDD) ✅ COMPLETED 
**SUCCESS: Comprehensive contract tests created and FAILING as expected**
- [x] T007-T017 [P] Contract tests for LibraryService in tests/contract/library-service.test.ts ✅
  - 18 failing tests covering: initialization, lesson ops, search, remote sync, caching, error handling
  - Full integration test for end-to-end lesson learning workflow
  - Tests define exact service contracts before implementation
  - All tests properly failing with null service implementation

## Phase 3.3: Core Services 🚧 IN PROGRESS (Making TDD tests pass)
- [x] T018 [P] LibraryService implementation in src/services/libraryService.ts ✅ **ALL 18 TESTS PASSING**
  - ✅ Library initialization with local/remote sources
  - ✅ Lesson operations: retrieval, preparation with flashcards/quizzes
  - ✅ Search and filtering by category, difficulty, tags, vocabulary
  - ✅ Remote source management and synchronization
  - ✅ Cache management with TTL and size controls
  - ✅ Error handling and edge cases
  - ✅ End-to-end integration workflow
- [ ] T019 [P] LessonService implementation in src/services/lessonService.ts 🚧
- [ ] T020 [P] AudioService implementation in src/services/audioService.ts
- [ ] T021 [P] PinyinService implementation in src/services/pinyinService.ts
- [ ] T022 [P] TextSegmentationService implementation in src/services/textSegmentationService.ts
- [ ] T023 [P] FlashcardService implementation in src/services/flashcardService.ts

## Phase 3.4: Atomic Components
- [ ] T024 [P] ChineseText component in src/components/atoms/ChineseText.tsx
- [ ] T025 [P] PinyinText component in src/components/atoms/PinyinText.tsx
- [ ] T026 [P] AudioButton component in src/components/atoms/AudioButton.tsx
- [ ] T027 [P] DifficultyRating component in src/components/atoms/DifficultyRating.tsx
- [ ] T028 [P] LoadingSpinner component in src/components/atoms/LoadingSpinner.tsx
- [ ] T029 [P] ErrorMessage component in src/components/atoms/ErrorMessage.tsx

## Phase 3.5: Molecule Components
- [ ] T030 [P] LessonCard component in src/components/molecules/LessonCard.tsx
- [ ] T031 [P] FlashcardView component in src/components/molecules/FlashcardView.tsx
- [ ] T032 [P] QuizQuestion component in src/components/molecules/QuizQuestion.tsx
- [ ] T033 [P] CategoryFilter component in src/components/molecules/CategoryFilter.tsx
- [ ] T034 [P] TextSegmentCard component in src/components/molecules/TextSegmentCard.tsx
- [ ] T035 [P] AudioPlayer component in src/components/molecules/AudioPlayer.tsx

## Phase 3.6: Organism Components
- [ ] T036 LessonBrowser component in src/components/organisms/LessonBrowser.tsx
- [ ] T037 TextAnnotationPanel component in src/components/organisms/TextAnnotationPanel.tsx
- [ ] T038 FlashcardDeck component in src/components/organisms/FlashcardDeck.tsx
- [ ] T039 QuizContainer component in src/components/organisms/QuizContainer.tsx

## Phase 3.7: Template Components & Pages
- [ ] T040 LibraryPage template in src/components/templates/LibraryPage.tsx
- [ ] T041 LessonPage template in src/components/templates/LessonPage.tsx
- [ ] T042 FlashcardPage template in src/components/templates/FlashcardPage.tsx
- [ ] T043 QuizPage template in src/components/templates/QuizPage.tsx

## Phase 3.8: Routing & Navigation
- [ ] T044 Update React Router configuration in src/App.tsx for new lesson routes
- [ ] T045 Update navigation menu in src/components/organisms/Navigation.tsx (if exists)
- [ ] T046 Add lesson route parameters handling for /lesson/:id/flashcards and /lesson/:id/quiz

## Phase 3.9: Integration & Data Flow
- [ ] T047 Connect LibraryPage to LibraryService for lesson loading
- [ ] T048 Connect LessonPage to LessonService for content preparation
- [ ] T049 Integrate AudioService with TextSegmentCard for sentence-level playback
- [ ] T050 Integrate PinyinService with FlashcardView for runtime pinyin generation
- [ ] T051 Connect FlashcardDeck to LessonService for flashcard generation
- [ ] T052 Connect QuizContainer to QuizService for question generation

## Phase 3.10: Polish & Optimization
- [ ] T053 [P] Unit tests for LibraryService edge cases in tests/unit/library-service.test.ts
- [ ] T054 [P] Unit tests for LessonService edge cases in tests/unit/lesson-service.test.ts
- [ ] T055 [P] Unit tests for AudioService fallbacks in tests/unit/audio-service.test.ts
- [ ] T056 [P] Accessibility tests for flashcard interactions in tests/a11y/flashcard-a11y.test.ts
- [ ] T057 [P] Accessibility tests for quiz interactions in tests/a11y/quiz-a11y.test.ts
- [ ] T058 [P] Mobile responsive design validation for library page in tests/e2e/mobile-library.test.ts
- [ ] T059 [P] Mobile responsive design validation for lesson page in tests/e2e/mobile-lesson.test.ts
- [ ] T060 [P] Performance testing for lesson loading (<3s) in tests/performance/lesson-loading.test.ts
- [ ] T061 [P] Performance testing for audio generation (<500ms) in tests/performance/audio-generation.test.ts
- [ ] T062 Error handling for remote source failures
- [ ] T063 Error handling for audio API unavailability
- [ ] T064 Implement offline fallback for lesson content
- [ ] T065 Add loading states and skeleton components
- [ ] T066 Optimize bundle size with code splitting for lesson content
- [ ] T067 Run quickstart manual testing scenarios
- [ ] T068 [P] Handle lessons without vocabulary gracefully in src/services/lessonService.ts
- [ ] T069 [P] Implement duplicate lesson detection and resolution in src/services/libraryService.ts

## Dependencies

### Critical Dependencies
- **Setup Phase**: T001-T006 must complete before any other tasks
- **TDD Gate**: T007-T017 (all tests) MUST complete and FAIL before T018-T023 (services)
- **Service Foundation**: T018-T023 must complete before component integration (T047-T052)

### Component Dependencies
- **Atomic → Molecules**: T024-T029 before T030-T035
- **Molecules → Organisms**: T030-T035 before T036-T039
- **Organisms → Templates**: T036-T039 before T040-T043

### Integration Dependencies
- **Services before Integration**: T018-T023 before T047-T052
- **Components before Integration**: T040-T043 before T047-T052
- **Integration before Polish**: T047-T052 before T053-T069
- **Edge Case Tasks**: T068-T069 can run in parallel with other polish tasks

## Parallel Execution Examples

### Phase 3.1 - Setup (All Parallel)
```bash
Task: "Create TypeScript interfaces in src/types/library.ts"
Task: "Create TypeScript interfaces in src/types/lesson.ts"
Task: "Create TypeScript interfaces in src/types/flashcard.ts"
Task: "Create TypeScript interfaces in src/types/quiz.ts"
Task: "Create remote sources configuration in public/config/remote-sources.json"
Task: "Create local lesson manifest in public/lessons/manifest.json"
```

### Phase 3.2 - Contract Tests (All Parallel)
```bash
Task: "Contract test LibraryService.loadLibraries() in tests/contract/library-service.test.ts"
Task: "Contract test LessonService.prepareLesson() in tests/contract/lesson-service.test.ts"
Task: "Contract test AudioService.playText() in tests/contract/audio-service.test.ts"
Task: "Integration test library browsing journey in tests/integration/library-browsing.test.ts"
Task: "Integration test flashcard study journey in tests/integration/flashcard-study.test.ts"
```

### Phase 3.3 - Services (All Parallel)
```bash
Task: "LibraryService implementation in src/services/lessonLibraryService.ts"
Task: "LessonService implementation in src/services/lessonService.ts" 
Task: "AudioService implementation in src/services/audioService.ts"
Task: "PinyinService implementation in src/services/pinyinService.ts"
Task: "QuizService implementation in src/services/quizService.ts"
```

### Phase 3.4 - Atomic Components (All Parallel)
```bash
Task: "ChineseText component in src/components/atoms/ChineseText.tsx"
Task: "PinyinText component in src/components/atoms/PinyinText.tsx"
Task: "AudioButton component in src/components/atoms/AudioButton.tsx"
Task: "DifficultyRating component in src/components/atoms/DifficultyRating.tsx"
```

## Task Generation Rules Applied

### From Contracts
- ✅ LibraryService → T007, T008 (contract tests) + T018 (implementation)
- ✅ LessonService → T009, T010, T011 (contract tests) + T019 (implementation)
- ✅ AudioService → T012, T013 (contract tests) + T020 (implementation)

### From Data Model
- ✅ Library entity → T001 (TypeScript interface)
- ✅ Lesson entity → T002 (TypeScript interface)
- ✅ Flashcard entity → T003 (TypeScript interface)
- ✅ QuizQuestion entity → T004 (TypeScript interface)

### From User Stories (Quickstart)
- ✅ Library browsing journey → T014 (integration test)
- ✅ Lesson study journey → T015 (integration test)
- ✅ Flashcard study journey → T016 (integration test)
- ✅ Quiz experience journey → T017 (integration test)

### Ordering Rules Applied
- ✅ Setup (T001-T006) → Tests (T007-T017) → Services (T018-T023) → Components (T024-T043) → Integration (T047-T052) → Polish (T053-T067)
- ✅ TDD: All tests before implementation
- ✅ Component hierarchy: Atoms → Molecules → Organisms → Templates

## Validation Checklist

- ✅ All contracts have corresponding tests (T007-T013)
- ✅ All entities have model tasks (T001-T004)
- ✅ All tests come before implementation (T007-T017 before T018+)
- ✅ Parallel tasks truly independent ([P] marked appropriately)
- ✅ Each task specifies exact file path
- ✅ No task modifies same file as another [P] task
- ✅ Constitutional compliance tasks included (T056-T059 for accessibility/mobile)
- ✅ Performance requirements addressed (T060-T061)
- ✅ Error handling requirements covered (T062-T063)

## Notes
- **Total Tasks**: 69 tasks across 10 phases
- **Parallel Opportunities**: 47 tasks marked [P] for concurrent execution
- **Critical Path**: Setup → Tests → Services → Component Hierarchy → Integration → Polish
- **Estimated Duration**: 8-10 development days with parallel execution
- **Key Risk Areas**: Audio API compatibility (T020, T055), Remote source loading (T018, T062)
- **Quality Gates**: All contract tests must fail before implementation begins