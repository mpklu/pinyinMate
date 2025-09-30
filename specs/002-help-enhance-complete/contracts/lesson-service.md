# Lesson Service Contract

**Service**: LessonService  
**Purpose**: Manage individual lesson content, prepare for study sessions

## Interface Definition

```typescript
interface LessonService {
  prepareLesson(lessonId: string, libraryId: string): Promise<PreparedLesson>;
  generateFlashcards(lesson: Lesson): Promise<Flashcard[]>;
  generateQuizQuestions(lesson: Lesson): Promise<QuizQuestion[]>;
  segmentContent(content: string): string[];
  generatePinyin(text: string): Promise<string>;
}
```

## Data Contracts

### PreparedLesson
```typescript
interface PreparedLesson {
  lesson: Lesson;
  contentSegments: ContentSegment[];
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  vocabularyWithPinyin: VocabularyEntryWithPinyin[];
}

interface ContentSegment {
  id: string;
  text: string;
  pinyin: string;
  audioUrl?: string;
  startIndex: number;
  endIndex: number;
}

interface VocabularyEntryWithPinyin extends VocabularyEntry {
  pinyin: string;
}
```

## Method Contracts

### prepareLesson(lessonId, libraryId)
**Purpose**: Prepare a lesson for study with all generated content

**Input**: 
- `lessonId: string` - Lesson identifier
- `libraryId: string` - Parent library identifier

**Output**: `Promise<PreparedLesson>`

**Behavior**:
1. Retrieve lesson from specified library
2. Segment content into sentences
3. Generate pinyin for all text segments
4. Generate pinyin for vocabulary entries
5. Create flashcards from vocabulary
6. Generate quiz questions from vocabulary and content
7. Prepare audio URLs for text-to-speech
8. Return complete prepared lesson

**Error Handling**:
- Lesson not found: Throw NotFoundError
- Invalid lesson data: Throw ValidationError
- Pinyin generation failure: Log warning, continue with Chinese text only
- Audio preparation failure: Log warning, continue without audio

### generateFlashcards(lesson)
**Purpose**: Create flashcard deck from lesson vocabulary

**Input**: `lesson: Lesson`  
**Output**: `Promise<Flashcard[]>`

**Behavior**:
1. Extract vocabulary entries from lesson
2. For each vocabulary entry:
   - Create front side with Chinese word
   - Create back side with English definition + pinyin
   - Generate unique flashcard ID
   - Set audio content for pronunciation
3. Return array of flashcards in lesson order

**Error Handling**:
- No vocabulary: Return empty array
- Pinyin generation failure: Use Chinese text only
- Invalid vocabulary entry: Skip entry, log warning

### generateQuizQuestions(lesson)
**Purpose**: Create quiz questions from lesson content and vocabulary

**Input**: `lesson: Lesson`  
**Output**: `Promise<QuizQuestion[]>`

**Behavior**:
1. Generate multiple choice questions from vocabulary (50%)
2. Generate fill-in-the-blank questions from content (30%)
3. Generate audio recognition questions from vocabulary (20%)
4. Randomize question order
5. Ensure minimum 5 questions per lesson
6. Maximum 20 questions per lesson

**Question Generation Rules**:
- Multiple choice: 4 options, 1 correct answer
- Fill-in-blank: Remove 1-2 characters from Chinese words
- Audio recognition: Play pronunciation, select correct characters

**Error Handling**:
- Insufficient vocabulary: Generate minimum questions possible
- Content too short: Focus on vocabulary questions
- Question generation failure: Skip question, continue with others

### segmentContent(content)
**Purpose**: Split Chinese text into sentence-level segments

**Input**: `content: string`  
**Output**: `string[]`

**Behavior**:
1. Split text on Chinese punctuation marks: 。！？；
2. Filter out empty segments
3. Trim whitespace from each segment
4. Return array of sentence strings

**Error Handling**:
- Empty content: Return empty array
- No punctuation: Return single segment with full content
- Invalid characters: Clean and continue

### generatePinyin(text)
**Purpose**: Generate pinyin romanization for Chinese text

**Input**: `text: string`  
**Output**: `Promise<string>`

**Behavior**:
1. Use `pinyin-pro` library for conversion
2. Include tone marks
3. Space-separate syllables
4. Handle mixed Chinese/English text
5. Cache results for session

**Error Handling**:
- Invalid characters: Return original text
- Library failure: Return original text
- Empty input: Return empty string

## Validation Rules

### Lesson Validation
- Lesson must have valid `id` and `content`
- Library must exist and contain the lesson
- Content must contain Chinese characters

### Flashcard Generation
- Minimum 1 vocabulary entry required
- Each flashcard must have front and back content
- Audio content must be valid Chinese text

### Quiz Question Validation
- Questions must have valid type
- Multiple choice must have 4 options
- Correct answer must be included in options
- Audio recognition must have valid pinyin

## Performance Constraints

- Lesson preparation must complete within 3 seconds
- Flashcard generation: <1 second per 20 cards
- Quiz generation: <2 seconds per lesson
- Pinyin generation: <100ms per sentence
- Content segmentation: <50ms per lesson

## Caching Strategy

### Session Cache
- Cache pinyin results for lesson duration
- Cache audio URLs until page refresh
- Cache prepared lessons for back navigation

### Storage Limits
- Maximum 50 prepared lessons in memory
- Clear cache on memory pressure
- Prioritize current lesson + 2 most recent

## Error Types

```typescript
interface LessonServiceError extends Error {
  code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'GENERATION_ERROR' | 'TIMEOUT';
  lessonId?: string;
  libraryId?: string;
  details?: any;
}
```

## Test Scenarios

1. **Prepare lesson with full vocabulary successfully**
2. **Handle lesson without vocabulary gracefully**
3. **Generate flashcards from vocabulary entries**
4. **Create all three quiz question types**
5. **Segment Chinese text correctly**
6. **Generate pinyin for mixed content**
7. **Handle invalid lesson data**
8. **Performance within time constraints**
9. **Cache pinyin results correctly**
10. **Error handling for missing lessons**