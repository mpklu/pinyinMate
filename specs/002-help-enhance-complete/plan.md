
# Implementation Plan: Enhanced Library and Lesson System

**Branch**: `002-help-enhance-complete` | **Date**: September 29, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-help-enhance-complete/spec.md`

## Execut**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/tasks command)Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Enhanced library and lesson system enabling Chinese language learners to browse organized collections from local/remote sources, study content with sentence-level audio pronunciation, and practice with interactive flashcards and multi-modal quizzes. Supports predefined remote URI sources with toggle controls, linear flashcard navigation, and simplified lesson data format focusing on content and vocabulary.

## Technical Context
**Language/Version**: TypeScript 5.8+ with React 19.1+  
**Primary Dependencies**: Material-UI v5, React Router v7, pinyin-pro v3, jsPDF v3, Web Speech API  
**Storage**: Static JSON files (local/remote), browser localStorage for settings/progress  
**Testing**: Vitest + React Testing Library + Playwright E2E + jest-axe for accessibility  
**Target Platform**: Web browsers (mobile-first responsive design)
**Project Type**: Single-page web application (frontend only)  
**Performance Goals**: <3s initial load, <1s navigation, sentence-level audio latency <500ms  
**Constraints**: Mobile-first design (320px+), WCAG 2.1 AA compliance, offline-capable lesson storage  
**Scale/Scope**: ~10-50 lessons per library, 5-10 remote sources, 100+ vocabulary words per lesson

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Mobile-First Responsive Design: ✅ PASS
- Library/lesson pages designed mobile-first (320px+)
- Touch targets for flashcard flips, audio buttons, navigation
- No horizontal scrolling in lesson content display

### II. Simplicity UX: ✅ PASS  
- Library page: Browse → Select → Start (3 actions max)
- Lesson page: Content → FlashCards → Quiz (3 primary modes)
- Navigation depth: Library → Lesson → Study Mode (3 levels max)

### III. Performance Standards: ✅ PASS
- Static JSON lesson loading supports <3s initial load
- Sentence-level audio chunking supports <1s navigation
- Code splitting planned for lesson content modules

### IV. Accessibility Compliance: ✅ PASS
- Semantic HTML for lesson content structure
- Keyboard navigation for flashcards and quiz interactions
- Screen reader support for Chinese text with pinyin
- Audio playback controls accessible via keyboard

### V. Component Architecture: ✅ PASS
- Atomic design: Library → LessonCard → FlashcardView → AudioButton
- Single responsibility: separate components for content, flashcards, quizzes
- TypeScript interfaces for Lesson, Flashcard, QuizQuestion entities

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── components/
│   ├── atoms/           # AudioButton, ChineseText, etc.
│   ├── molecules/       # LessonCard, FlashcardView, QuizQuestion, etc.
│   ├── organisms/       # LessonBrowser, FlashcardDeck, QuizContainer
│   └── templates/       # LibraryPage, LessonPage, FlashcardPage, QuizPage
├── services/
│   ├── lessonLibraryService.ts    # Local/remote lesson loading
│   ├── audioService.ts            # Text-to-speech integration
│   ├── pinyinService.ts           # Runtime pinyin generation
│   ├── quizService.ts             # Quiz question generation
│   └── textSegmentationService.ts # Sentence-level text chunking
├── types/
│   ├── library.ts       # Library, Collection types
│   ├── lesson.ts        # Lesson, Vocabulary types
│   ├── flashcard.ts     # Flashcard types
│   └── quiz.ts          # QuizQuestion types
├── hooks/
│   └── useSession.ts    # Progress tracking, settings
└── context/
    └── SessionContext.tsx

public/
├── lessons/
│   ├── manifest.json    # Local lesson library registry
│   ├── beginner/        # Existing lesson files
│   └── intermediate/    # Existing lesson files
└── config/
    └── remote-sources.json  # Predefined URI list

tests/
├── contract/            # API contract tests for lesson loading
├── integration/         # User journey tests
└── unit/               # Component and service tests
```

**Structure Decision**: Single-page web application structure leveraging the existing atomic design component architecture. The lesson library system extends current services while maintaining separation of concerns between data loading, processing, and presentation components.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Contract-driven development: Each service contract → test suite task [P]
- Data model tasks: TypeScript interfaces and validation schemas [P]
- Service implementation: LibraryService, LessonService, AudioService
- Component tasks: Library browser, lesson viewer, flashcard deck, quiz interface
- Integration tasks: User journey validation from quickstart scenarios

**Ordering Strategy**:
1. **Foundation Layer** [P]: Type definitions, data models, validation schemas
2. **Service Layer**: Contract tests → Service implementations → Service integration
3. **Component Layer**: Atomic components → Molecules → Organisms → Templates
4. **Integration Layer**: User journey tests → Performance validation → Accessibility compliance
5. **Polish Layer**: Error handling refinement, mobile optimization, audio fallbacks

**Dependency Management**:
- Mark [P] for parallel execution (independent files/interfaces)
- Sequential dependencies: Services before components, tests before implementations
- Critical path: LibraryService → LessonService → UI components

**Constitutional Compliance Tasks**:
- Mobile-first responsive design validation
- Accessibility testing with jest-axe
- Performance budget compliance verification
- Component architecture review

**Estimated Task Breakdown**:
```
Foundation:     8 tasks (types, models, validation)
Services:      12 tasks (3 services × 4 tasks each)
Components:    15 tasks (4 templates + 11 supporting components)
Integration:    8 tasks (user journeys, performance, a11y)
Polish:         5 tasks (error handling, mobile, audio)
Total:         48 tasks
```

**Risk Mitigation**:
- Audio API compatibility testing prioritized early
- Remote source handling isolated and testable
- Flashcard/quiz generation as separate, parallel workstreams
- Progressive enhancement for audio features

**Quality Gates**:
- Each service must pass contract tests before UI integration
- Mobile-first design verified at component level
- Performance benchmarks validated before user testing
- Accessibility compliance verified with automated tools

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation in progress (atomic components completed)
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
