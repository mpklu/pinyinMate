# Data Model: Enhanced Library and Lesson System

**Date**: September 29, 2025  
**Feature**: Enhanced Library and Lesson System  
**Phase**: 1 - Design

## Core Entities

### Library
Represents a collection source (local or remote) containing multiple lessons.

```typescript
interface Library {
  id: string;                    // Unique identifier (e.g., "local", "hsk-official")
  name: string;                  // Display name (e.g., "Local Lessons", "HSK Official")
  description?: string;          // Optional description
  source: 'local' | 'remote';   // Source type
  url?: string;                  // Remote manifest URL (required if remote)
  enabled: boolean;              // User toggle state
  lastUpdated?: Date;           // Last successful fetch (remote only)
  lessons: Lesson[];            // Contained lessons
  metadata: LibraryMetadata;    // Additional library info
}

interface LibraryMetadata {
  totalLessons: number;
  difficultyLevels: string[];   // Available difficulty levels
  categories: string[];         // Available lesson categories
  version?: string;             // Remote source version
}
```

**Relationships**:
- One Library contains many Lessons
- Libraries are independent (no cross-references)

**Validation Rules**:
- `id` must be unique across all libraries
- `url` required when `source` is 'remote'
- `lessons` array must contain valid Lesson objects

### Lesson
Core learning unit containing Chinese text content and optional vocabulary.

```typescript
interface Lesson {
  id: string;                   // Unique within library (e.g., "greetings")
  title: string;                // Display title
  description: string;          // Lesson description
  content: string;              // Chinese text content
  metadata: LessonMetadata;     // Lesson metadata
  vocabulary?: VocabularyEntry[]; // Optional vocabulary list
  grammarPoints?: string[];     // Optional grammar explanations
  culturalNotes?: string[];     // Optional cultural context
}

interface LessonMetadata {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];               // Searchable tags
  characterCount: number;       // Text length metric
  estimatedTime: number;        // Minutes to complete
  book?: string;                // Optional book reference
  series?: string;              // Optional series reference
  src: string;                  // Source library identifier
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
}
```

**Relationships**:
- One Lesson belongs to one Library (via `metadata.src`)
- One Lesson contains many VocabularyEntry objects

**Validation Rules**:
- `content` must not be empty
- `metadata.src` must match parent Library `id`
- `vocabulary` entries must have unique `word` values within lesson
- `characterCount` should match actual `content` length

**State Transitions**:
- Created → Loaded → Ready for Study
- No persistent state changes (lessons are immutable)

### VocabularyEntry
Individual vocabulary word with Chinese characters and English definition.

```typescript
interface VocabularyEntry {
  word: string;                 // Chinese characters
  definition: string;           // English definition
  partOfSpeech?: string;        // Optional grammatical category
  // Note: pinyin generated at runtime, not stored
}
```

**Relationships**:
- Many VocabularyEntry objects belong to one Lesson
- No relationships between vocabulary entries

**Validation Rules**:
- `word` must contain Chinese characters
- `definition` must not be empty
- `word` must be unique within parent lesson

### Flashcard
Study tool generated from vocabulary entries for spaced repetition practice.

```typescript
interface Flashcard {
  id: string;                   // Generated unique ID
  lessonId: string;            // Parent lesson reference
  front: FlashcardSide;        // Chinese word side
  back: FlashcardSide;         // Translation + pinyin side
  metadata: FlashcardMetadata; // Card metadata
}

interface FlashcardSide {
  content: string;             // Main text content
  audioContent?: string;       // Audio text (for TTS)
  auxiliaryText?: string;      // Additional text (pinyin, etc.)
}

interface FlashcardMetadata {
  sourceWord: string;          // Original vocabulary word
  partOfSpeech?: string;       // Grammatical category
  createdAt: Date;            // Generation timestamp
}
```

**Relationships**:
- Many Flashcards generated from one Lesson
- Each Flashcard maps to one VocabularyEntry

**Validation Rules**:
- `lessonId` must reference valid lesson
- `front.content` must match vocabulary `word`
- `back.content` must match vocabulary `definition`

**State Transitions**:
- Generated → Displayed → Flipped → Audio Played

### QuizQuestion
Generated assessment item based on lesson vocabulary and content.

```typescript
interface QuizQuestion {
  id: string;                           // Generated unique ID
  lessonId: string;                    // Parent lesson reference
  type: QuizQuestionType;              // Question format
  question: string;                    // Question prompt
  correctAnswer: string;               // Correct response
  options?: string[];                  // Multiple choice options
  audioPrompt?: string;                // Audio recognition prompt
  metadata: QuizQuestionMetadata;      // Question metadata
}

type QuizQuestionType = 'multiple-choice' | 'fill-blank' | 'audio-recognition';

interface QuizQuestionMetadata {
  sourceWord?: string;         // Vocabulary word source (if applicable)
  difficulty: number;          // Difficulty rating (1-5)
  createdAt: Date;            // Generation timestamp
  tags: string[];             // Question categories
}
```

**Relationships**:
- Many QuizQuestions generated from one Lesson
- QuizQuestions may map to VocabularyEntry objects

**Validation Rules**:
- `lessonId` must reference valid lesson
- `options` required when `type` is 'multiple-choice'
- `audioPrompt` required when `type` is 'audio-recognition'
- `correctAnswer` must be included in `options` for multiple choice

**State Transitions**:
- Generated → Presented → Answered → Scored

### Collection
Organizational grouping of lessons within a library (derived entity).

```typescript
interface Collection {
  name: string;                // Collection name (e.g., "Beginner", "HSK 1")
  lessons: Lesson[];          // Lessons in this collection
  criteria: CollectionCriteria; // Grouping criteria
}

interface CollectionCriteria {
  difficulty?: string;         // Filter by difficulty level
  tags?: string[];            // Filter by tags
  book?: string;              // Filter by book reference
  series?: string;            // Filter by series reference
}
```

**Relationships**:
- Collections are derived views of Library lessons
- One Collection contains many Lessons (filtered view)

**Validation Rules**:
- Collection criteria must match at least one lesson
- Lessons in collection must satisfy all criteria

## Entity Relationships Diagram

```
Library (1) ──── (many) Lesson
                     │
                     ├── (many) VocabularyEntry
                     │
                     ├── (generates) → (many) Flashcard
                     │
                     └── (generates) → (many) QuizQuestion

Collection ← (derived from) ── Lesson (filtered view)
```

## Data Flow Patterns

### Lesson Loading Flow
```
1. LibraryService.loadLibraries()
2. For each enabled remote source:
   - Fetch manifest.json
   - Parse lessons array
   - Validate lesson structure
   - Create Library with Lessons
3. Load local lessons from public/lessons/
4. Merge all libraries into unified collection
5. Generate Collections based on metadata
```

### Study Session Flow
```
1. User selects Lesson from Library
2. LessonService.prepareLesson(lessonId)
3. Generate runtime pinyin for vocabulary
4. Segment content into sentences for audio
5. Create flashcards from vocabulary
6. Generate quiz questions from vocabulary + content
7. Present lesson content with study options
```

### Audio Generation Flow
```
1. TextSegmentationService.segmentBySentence(content)
2. For each sentence:
   - PinyinService.generatePinyin(sentence)
   - AudioService.prepareTTS(sentence)
3. Cache audio URLs for playback
```

## Storage Strategy

### Static Data
- **Location**: `public/lessons/` (local), remote URIs (remote)
- **Format**: JSON files following Lesson interface
- **Caching**: Browser cache for remote sources

### Runtime Data
- **Location**: Browser memory + localStorage
- **Data**: User preferences, study progress, enabled sources
- **Persistence**: localStorage for session data

### Generated Data
- **Location**: Browser memory only
- **Data**: Pinyin, flashcards, quiz questions, audio URLs
- **Lifecycle**: Generated per session, not persisted

## Performance Considerations

### Memory Management
- Lazy load lesson content (not all lessons in memory)
- Cache pinyin generation results per session
- Limit concurrent audio generation requests

### Network Optimization
- Batch remote manifest requests
- Implement retry logic with exponential backoff
- Cache successful responses with TTL

### Computational Efficiency  
- Pre-calculate character counts during parsing
- Debounce audio generation for rapid navigation
- Use Web Workers for heavy text processing (if needed)

## Data Validation Schema

```typescript
// Runtime validation using Zod or similar
const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  metadata: z.object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    src: z.string().min(1),
    // ... other metadata fields
  }),
  vocabulary: z.array(VocabularyEntrySchema).optional(),
});
```

## Migration Considerations

### Existing Lesson Format
Current lessons in `public/lessons/` follow similar structure but may need:
- Addition of `metadata.src` field
- Vocabulary format normalization
- Removal of audio data (if present)

### Backward Compatibility
- Support both old and new lesson formats during transition
- Provide migration utility for existing lesson files
- Gradual rollout of new features without breaking existing content