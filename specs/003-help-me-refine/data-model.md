# Data Model: Enhanced Interactive Lesson Learning Experience

**Generated**: 2025-09-30  
**Feature Branch**: `003-help-me-refine`  
**Phase**: Phase 1 Design  

## Data Model Overview

This document defines the key entities and their relationships for the enhanced interactive lesson learning experience. The model extends existing lesson schema while maintaining backward compatibility.

---

## Core Entities

### 1. EnhancedLesson
**Purpose**: Extended lesson entity with processing and study capabilities  
**Source**: Enhanced from existing `Lesson` interface in `src/types/lesson.ts`

```typescript
interface EnhancedLesson extends Lesson {
  id: string;
  title: string;
  content: string;
  metadata: LessonMetadata;
  
  // Enhanced processing results
  processedContent?: ProcessedLessonContent;
  studyProgress?: LessonStudyProgress;
  studyMaterials?: LessonStudyMaterials;
}
```

**Validation Rules**:
- `id`: Required, unique identifier
- `title`: Required, 1-200 characters
- `content`: Required, 1-50000 characters (from schema)
- `metadata`: Required, must contain source and vocabulary
- All fields must pass existing schema validation

**State Transitions**:
- `unprocessed` → `processing` → `ready` → `studying` → `completed`

---

### 2. ProcessedLessonContent  
**Purpose**: Lesson content enhanced with segmentation, pinyin, and audio preparation  
**Derived**: From research decision on text processing integration

```typescript
interface ProcessedLessonContent {
  segments: TextSegmentWithAudio[];
  vocabularyMap: Map<string, VocabularyEntryWithPinyin>;
  totalSegments: number;
  processingTimestamp: Date;
  pinyinGenerated: boolean;
  audioReady: boolean;
}
```

**Validation Rules**:
- `segments`: Required array, 1-1000 segments
- `vocabularyMap`: Required, derived from metadata.vocabulary
- `processingTimestamp`: Required, tracks cache validity
- Generated data must be consistent with source content

**Relationships**:
- Belongs to one `EnhancedLesson`
- Contains multiple `TextSegmentWithAudio`
- References `VocabularyEntryWithPinyin` entries

---

### 3. TextSegmentWithAudio
**Purpose**: Individual text segment with pinyin and audio capabilities  
**Source**: Enhanced from existing `TextSegment` interface

```typescript
interface TextSegmentWithAudio extends TextSegment {
  id: string;
  text: string;
  pinyin: string;
  segmentType: 'sentence' | 'vocabulary' | 'punctuation';
  
  // Audio integration
  audioId?: string;
  audioReady: boolean;
  audioError?: string;
  
  // Vocabulary highlighting
  vocabularyWords: VocabularyReference[];
  clickable: boolean;
}
```

**Validation Rules**:
- `text`: Required, 1-500 characters per segment  
- `pinyin`: Generated automatically, must match text
- `segmentType`: Required enum value
- `audioId`: Optional, generated on demand
- Vocabulary words must exist in lesson vocabulary

**Relationships**:
- Belongs to one `ProcessedLessonContent`
- References multiple `VocabularyReference` entries

---

### 4. VocabularyEntryWithPinyin
**Purpose**: Enhanced vocabulary entry with pinyin and study metadata  
**Source**: Enhanced from existing `VocabularyEntry` interface  

```typescript
interface VocabularyEntryWithPinyin extends VocabularyEntry {
  word: string;
  definition: string;
  
  // Enhanced fields
  pinyin: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  frequency: number; // frequency in lesson content
  
  // Study integration
  studyCount: number;
  lastStudied?: Date;
  masteryLevel: number; // 0-100
}
```

**Validation Rules**:
- `word`: Required, 1-50 characters, Chinese characters only
- `definition`: Required, 1-500 characters
- `pinyin`: Auto-generated, must be valid pinyin
- `frequency`: Calculated automatically from content analysis
- `masteryLevel`: 0-100 integer range

**Relationships**:
- Referenced by multiple `TextSegmentWithAudio`
- Used in `LessonStudyMaterials` generation

---

### 5. LessonStudyProgress
**Purpose**: Track user progress through lesson study session  
**Source**: From FR-009 progress tracking requirement

```typescript
interface LessonStudyProgress {
  lessonId: string;
  userId?: string; // Optional for anonymous users
  
  // Progress tracking
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // seconds
  
  // Content progress
  segmentsViewed: Set<string>;
  vocabularyStudied: Set<string>;
  audioPlayed: Set<string>;
  
  // Study session data
  sessionCount: number;
  lastSessionAt: Date;
}
```

**Validation Rules**:
- `lessonId`: Required, must reference valid lesson
- `status`: Required enum value
- `timeSpent`: Non-negative integer
- `sessionCount`: Positive integer
- All timestamps must be valid dates

**State Transitions**:
- `not-started` → `in-progress` → `completed`
- Can reset from `completed` to `in-progress` for review

**Relationships**:
- Belongs to one `EnhancedLesson`
- Persisted via SessionContext and localStorage

---

### 6. LessonStudyMaterials
**Purpose**: Generated study materials (flashcards and quizzes) from lesson content  
**Source**: From FR-005, FR-006 study tools generation requirements

```typescript
interface LessonStudyMaterials {
  lessonId: string;
  generatedAt: Date;
  
  // Flashcard generation
  flashcards?: LessonFlashcard[];
  flashcardCount: number;
  
  // Quiz generation  
  quizzes?: LessonQuiz[];
  quizCount: number;
  
  // Generation status
  flashcardsReady: boolean;
  quizzesReady: boolean;
  generationErrors?: string[];
}
```

**Validation Rules**:
- `lessonId`: Required, must reference valid lesson
- `flashcardCount`: 0-50 flashcards per lesson
- `quizCount`: 0-20 quizzes per lesson
- Generation timestamps must be after lesson creation
- At least one study material type must be available

**Relationships**:
- Belongs to one `EnhancedLesson`
- Contains multiple `LessonFlashcard` and `LessonQuiz` entities
- Integrates with existing FlashcardService and QuizService

---

### 7. LessonFlashcard
**Purpose**: Flashcard generated from lesson vocabulary  
**Source**: Enhanced from existing `LessonFlashcard` type

```typescript
interface LessonFlashcard extends LessonFlashcard {
  id: string;
  lessonId: string;
  vocabularyEntry: VocabularyEntryWithPinyin;
  
  // Flashcard content
  frontSide: FlashcardSide;
  backSide: FlashcardSide;
  cardType: 'hanzi-to-pinyin' | 'hanzi-to-definition' | 'audio-to-hanzi';
  
  // SRS integration
  srsData: SRSCardData;
  difficulty: number;
  
  // Generation metadata
  generatedAt: Date;
  sourceSegments: string[]; // Reference to segments containing this word
}
```

**Validation Rules**:
- `vocabularyEntry`: Must exist in lesson vocabulary
- `cardType`: Required enum value
- `difficulty`: 1-5 integer range
- `sourceSegments`: Must reference valid lesson segments
- SRS data must be valid for existing SRS system

**Relationships**:
- Belongs to one `LessonStudyMaterials`
- References one `VocabularyEntryWithPinyin`
- Integrates with existing SRS system

---

### 8. LessonQuiz
**Purpose**: Quiz generated from lesson content and vocabulary  
**Source**: Enhanced from existing `LessonQuizQuestion` type

```typescript
interface LessonQuiz {
  id: string;
  lessonId: string;
  title: string;
  
  // Quiz content
  questions: LessonQuizQuestion[];
  questionCount: number;
  quizType: 'vocabulary' | 'pronunciation' | 'comprehension';
  
  // Quiz settings
  timeLimit?: number; // seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Generation metadata
  generatedAt: Date;
  sourceContent: string[]; // Reference to lesson content used
}
```

**Validation Rules**:
- `questions`: 3-20 questions per quiz
- `quizType`: Required enum value
- `timeLimit`: Optional, 30-1800 seconds if specified
- `difficulty`: Must match lesson difficulty or be specified
- All questions must be valid and unique

**Relationships**:
- Belongs to one `LessonStudyMaterials`
- Contains multiple `LessonQuizQuestion` entities
- Uses content from associated `EnhancedLesson`

---

## Entity Relationships Diagram

```
EnhancedLesson (1)
├── ProcessedLessonContent (1)
│   └── TextSegmentWithAudio (many)
│       └── VocabularyReference (many)
├── LessonStudyProgress (1)
├── LessonStudyMaterials (1)
│   ├── LessonFlashcard (many)
│   └── LessonQuiz (many)
│       └── LessonQuizQuestion (many)
└── VocabularyEntryWithPinyin (many)
```

## Data Storage Strategy

### Persistent Storage
- **EnhancedLesson**: Extends existing lesson storage, loaded from JSON files
- **VocabularyEntryWithPinyin**: Generated from lesson metadata.vocabulary
- **LessonStudyMaterials**: Cached in localStorage for offline access

### Session Storage  
- **ProcessedLessonContent**: Generated runtime data, cached for performance
- **LessonStudyProgress**: Real-time progress, persisted to localStorage
- **TextSegmentWithAudio**: Runtime processing results, cached

### Memory Only
- **Audio synthesis results**: Generated on-demand via Web Speech API
- **Pinyin generation**: Cached after first generation
- **UI state**: Component state, not persisted

## Data Migration Strategy

### Backward Compatibility
- Existing `Lesson` entities remain fully compatible
- Enhanced features are opt-in and additive
- Validation utilities handle both old and new formats

### Migration Path
1. Load existing lesson using current `LessonService`
2. Enhance with new processing capabilities as needed
3. Generate additional metadata on first study session
4. Preserve original lesson data integrity

## Performance Considerations

### Caching Strategy
- **ProcessedLessonContent**: Cache after first processing
- **VocabularyEntryWithPinyin**: Cache pinyin generation results  
- **Audio preparation**: Lazy load and cache audio synthesis
- **Study materials**: Generate once, cache indefinitely

### Memory Management
- Large lessons: Process content in chunks
- Audio cleanup: Release audio resources after playback
- Progress tracking: Batch localStorage updates
- Cache invalidation: Clear on lesson updates

---

**Dependencies**: This data model integrates with existing types from `src/types/lesson.ts`, `src/types/flashcard.ts`, and `src/types/quiz.ts` while extending their capabilities for enhanced lesson learning experience.