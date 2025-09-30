# Data Model

## Core Entities

### TextAnnotation
```typescript
interface TextAnnotation {
  id: string;
  originalText: string;
  segments: TextSegment[];
  createdAt: Date;
  metadata: {
    title?: string;
    source?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}
```

**Purpose**: Represents processed Chinese text with segmentation and annotations
**Lifecycle**: Created from user input, exists only in session memory
**Validation Rules**:
- originalText must contain at least one Chinese character
- segments array must not be empty after processing
- id must be unique within session

### TextSegment
```typescript
interface TextSegment {
  id: string;
  text: string;
  pinyin: string;
  toneMarks: string;
  definition?: string;
  audioUrl?: string;
  position: {
    start: number;
    end: number;
  };
}
```

**Purpose**: Individual Chinese word/character with linguistic annotations
**Relationships**: Belongs to TextAnnotation
**Validation Rules**:
- text must be valid Chinese characters
- pinyin must match standard pinyin format
- position indices must be valid within parent text

### Quiz
```typescript
interface Quiz {
  id: string;
  sourceAnnotationId: string;
  questions: QuizQuestion[];
  type: 'auto-generated' | 'static';
  createdAt: Date;
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
  };
}
```

**Purpose**: Assessment content generated from annotations
**Lifecycle**: Generated from TextAnnotation, temporary session data
**Relationships**: References TextAnnotation via sourceAnnotationId

### QuizQuestion
```typescript
interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'matching' | 'audio-recognition';
  prompt: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation?: string;
  sourceSegmentId: string;
}
```

**Purpose**: Individual question within a quiz
**Relationships**: Belongs to Quiz, references TextSegment
**Validation Rules**:
- type must be one of supported quiz types
- options required for multiple-choice type
- correctAnswer must match expected format for question type

### Flashcard
```typescript
interface Flashcard {
  id: string;
  front: string; // Chinese text
  back: {
    pinyin: string;
    definition: string;
    example?: string;
  };
  sourceSegmentId?: string;
  srsData: SRSScheduling;
  tags: string[];
}
```

**Purpose**: Individual learning unit for spaced repetition
**Relationships**: May reference TextSegment if generated from annotation
**Lifecycle**: Session-only, SRS data resets on page refresh

### SRSScheduling
```typescript
interface SRSScheduling {
  interval: number; // days
  repetition: number;
  easeFactor: number;
  dueDate: Date;
  lastReviewed?: Date;
  quality?: number; // 0-5 scale from last review
}
```

**Purpose**: Spaced repetition algorithm data
**Constraints**: All data is session-only, resets on page refresh

### FlashcardDeck
```typescript
interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  cards: Flashcard[];
  sourceType: 'annotation' | 'library' | 'import';
  sourceId?: string;
  createdAt: Date;
  metadata: {
    cardCount: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
  };
}
```

**Purpose**: Collection of related flashcards
**Relationships**: Contains multiple Flashcards
**Validation Rules**:
- name must be non-empty
- cardCount must match actual cards array length

### LibraryContent
```typescript
interface LibraryContent {
  id: string;
  type: 'book' | 'lesson' | 'section';
  title: string;
  content: string;
  parentId?: string; // for hierarchical structure
  children?: LibraryContent[];
  metadata: {
    level: number; // depth in hierarchy
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadingTime: number; // minutes
  };
  tags: string[];
}
```

**Purpose**: Static Chinese learning content organized hierarchically
**Lifecycle**: Built into app, immutable at runtime
**Relationships**: Self-referential hierarchy (book → lesson → section)
**Constraints**: Maximum depth of 3 levels (per constitution)

### ExportFormat
```typescript
interface ExportRequest {
  type: 'pdf' | 'anki' | 'quizlet';
  content: FlashcardDeck | Quiz | TextAnnotation;
  options: {
    includeAudio?: boolean;
    includeDefinitions?: boolean;
    format?: 'simple' | 'detailed';
  };
}

interface ExportResult {
  success: boolean;
  data?: Blob | string;
  filename: string;
  error?: string;
}
```

**Purpose**: Export functionality data structures
**Lifecycle**: Temporary objects for export operations

## State Management

### Session State
```typescript
interface SessionState {
  currentAnnotation?: TextAnnotation;
  activeQuiz?: Quiz;
  flashcardQueue: Flashcard[];
  currentDeck?: FlashcardDeck;
  srsQueue: Flashcard[]; // sorted by due date
  preferences: {
    showPinyin: boolean;
    showDefinitions: boolean;
    enableToneColors: boolean;
    enableAudio: boolean;
  };
}
```

**Purpose**: Manages temporary session data and user preferences
**Constraints**: All data lost on page refresh, no persistence

### UI State
```typescript
interface UIState {
  loading: boolean;
  error?: string;
  currentRoute: string;
  modalOpen?: string;
  sidebarOpen: boolean;
}
```

**Purpose**: Manages application UI state
**Lifecycle**: Temporary, resets on navigation/refresh

## Data Flow Patterns

### Text Processing Flow
1. User inputs Chinese text
2. Text segmentation via jieba-js
3. Pinyin generation for each segment
4. TextAnnotation creation with segments
5. Optional quiz/flashcard generation

### SRS Flow (Session-Only)
1. Flashcard presentation based on SRS algorithm
2. User response quality (0-5 scale)
3. SRS data recalculation
4. Queue reordering for next session
5. All data discarded on page refresh

### Export Flow
1. User selects export format and content
2. Client-side format conversion
3. File generation (PDF, Anki package, CSV)
4. Browser download trigger

## Validation Rules

### Input Validation
- Chinese text input: Must contain at least one CJK character
- Audio recognition: Must have valid audio input
- Quiz answers: Must match expected format per question type

### Business Rules
- Maximum 3 primary actions per screen (constitution compliance)
- Navigation depth ≤ 3 levels
- Touch targets ≥ 44px (mobile accessibility)
- Page load time < 3 seconds

### Error States
- Invalid Chinese text: Show format guidance
- Audio playback failure: Fall back to text-only mode
- Export failure: Retry mechanism with error details
- Large text processing: Progress indication and chunking