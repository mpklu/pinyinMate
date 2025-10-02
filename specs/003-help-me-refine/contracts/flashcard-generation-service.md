# Flashcard Generation Service Contract

**Service**: Lesson Flashcard Generation Service  
**Purpose**: Generate vocabulary flashcards from lesson content and vocabulary  
**Extends**: Existing flashcard interfaces

## Interface Definition

```typescript
interface LessonFlashcardGenerationService {
  /**
   * Generate flashcards from lesson vocabulary
   */
  generateFlashcardsFromLesson(
    lesson: EnhancedLesson,
    options: FlashcardGenerationOptions
  ): Promise<FlashcardGenerationResult>;

  /**
   * Generate flashcards from specific vocabulary entries
   */
  generateFlashcardsFromVocabulary(
    vocabularyEntries: VocabularyEntryWithPinyin[],
    options: FlashcardGenerationOptions
  ): Promise<FlashcardGenerationResult>;

  /**
   * Validate flashcard generation request
   */
  validateGenerationRequest(
    request: FlashcardGenerationRequest
  ): Promise<ValidationResult>;

  /**
   * Get available flashcard generation templates
   */
  getFlashcardTemplates(): Promise<FlashcardTemplate[]>;

  /**
   * Integrate generated flashcards with SRS system
   */
  integrateSRSFlashcards(
    flashcards: LessonFlashcard[],
    userId?: string
  ): Promise<SRSIntegrationResult>;
}
```

## Request/Response Schemas

### FlashcardGenerationRequest
```typescript
interface FlashcardGenerationRequest {
  lesson: EnhancedLesson;
  options: FlashcardGenerationOptions;
}

interface FlashcardGenerationOptions {
  cardTypes: FlashcardType[];
  maxCards: number; // 1-50
  difficultyFilter?: DifficultyLevel[];
  includeAudio: boolean;
  includePinyin: boolean;
  includeExamples: boolean;
  srsIntegration: boolean;
}

type FlashcardType = 
  | 'hanzi-to-pinyin'
  | 'hanzi-to-definition' 
  | 'pinyin-to-hanzi'
  | 'definition-to-hanzi'
  | 'audio-to-hanzi'
  | 'hanzi-to-audio';
```

### FlashcardGenerationResponse
```typescript
interface FlashcardGenerationResult {
  success: boolean;
  flashcards: LessonFlashcard[];
  generationStats: GenerationStats;
  generatedAt: Date;
  errors?: FlashcardGenerationError[];
}

interface GenerationStats {
  totalGenerated: number;
  byCardType: Record<FlashcardType, number>;
  vocabularyWordsUsed: number;
  generationTime: number;
  srsIntegrated: number;
}
```

### VocabularyFlashcardRequest
```typescript
interface VocabularyFlashcardRequest {
  vocabularyEntries: VocabularyEntryWithPinyin[];
  options: FlashcardGenerationOptions;
}
```

### FlashcardValidationRequest
```typescript
interface FlashcardValidationRequest {  
  lesson?: EnhancedLesson;
  vocabularyEntries?: VocabularyEntryWithPinyin[];
  options: FlashcardGenerationOptions;
}
```

### FlashcardValidationResponse
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  estimatedCardCount: number;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}
```

## Flashcard Data Structures

### LessonFlashcard
```typescript
interface LessonFlashcard {
  id: string;
  lessonId: string;
  vocabularyEntry: VocabularyEntryWithPinyin;
  
  // Card content
  frontSide: FlashcardSide;
  backSide: FlashcardSide;
  cardType: FlashcardType;
  
  // Metadata
  difficulty: number; // 1-5
  tags: string[];
  sourceSegmentIds: string[];
  
  // SRS integration
  srsData?: SRSCardData;
  
  // Generation metadata
  generatedAt: Date;
  template: string;
}

interface FlashcardSide {
  content: string;
  pinyin?: string;
  audioId?: string;
  imageUrl?: string;
  examples?: string[];
}
```

### FlashcardTemplate
```typescript
interface FlashcardTemplate {
  id: string;
  name: string;
  cardType: FlashcardType;
  frontTemplate: string;
  backTemplate: string;
  supportAudio: boolean;
  supportImages: boolean;
  difficulty: DifficultyLevel;
}
```

### SRSIntegrationRequest
```typescript
interface SRSIntegrationRequest {
  flashcards: LessonFlashcard[];
  userId?: string;
  deckName?: string;
  srsSettings?: SRSSettings;
}
```

### SRSIntegrationResponse
```typescript
interface SRSIntegrationResult {
  success: boolean;
  integratedCards: number;
  deckId?: string;
  srsSystemId: string;
  errors?: string[];
}
```

## Error Handling

```typescript
interface FlashcardGenerationError {
  code: 'INVALID_LESSON' | 'NO_VOCABULARY' | 'TEMPLATE_ERROR' | 'SRS_INTEGRATION_FAILED' | 'AUDIO_GENERATION_FAILED';
  message: string;
  vocabularyWord?: string;
  cardType?: FlashcardType;
  details?: {
    expectedVocabularyCount?: number;
    actualVocabularyCount?: number;
    templateId?: string;
  };
}
```

## Validation Rules

### Input Validation
- `lesson`: Must be valid `EnhancedLesson` with processed vocabulary
- `vocabularyEntries`: 1-50 entries, each with valid word and definition
- `maxCards`: 1-50 range, default 20
- `cardTypes`: At least one valid card type required
- Audio cards require Web Speech API capability

### Output Validation
- Generated flashcards must have unique IDs
- Each flashcard must reference valid vocabulary entry
- Card content must be non-empty and properly formatted
- SRS data must be compatible with existing SRS system
- All audio references must be valid

## Performance Requirements

- **Generation Time**: < 3 seconds for 20 flashcards
- **Memory Usage**: < 20MB for flashcard generation and storage
- **Concurrent Generation**: Support up to 3 simultaneous generation requests
- **SRS Integration**: < 1 second per flashcard for SRS system integration

## Flashcard Generation Strategies

### Vocabulary-Based Generation
1. Extract vocabulary from lesson metadata
2. Analyze vocabulary frequency and difficulty
3. Select high-priority vocabulary for flashcard creation
4. Generate multiple card types per vocabulary word
5. Apply difficulty filtering and card limits

### Content-Based Generation  
1. Analyze lesson content for key vocabulary usage
2. Generate contextual examples from lesson text
3. Create flashcards with lesson-specific context
4. Include audio from lesson pronunciation
5. Link flashcards to source content segments

### Template-Based Generation
1. Select appropriate templates based on card type
2. Populate templates with vocabulary data
3. Generate audio and visual content as needed
4. Apply consistent formatting and styling
5. Validate generated content against templates

## Integration Points

### SRS System Integration
- **Anki Export**: Support Anki deck format export
- **Internal SRS**: Integrate with existing SRS service
- **Progress Tracking**: Link with lesson study progress
- **Review Scheduling**: Support spaced repetition algorithms

### Audio Integration
- Use existing AudioSynthesisService for card audio
- Generate audio for both front and back sides
- Support audio-based flashcard types
- Cache audio for offline usage

## Dependencies

- **Enhanced Lesson Processing**: For vocabulary extraction
- **Audio Synthesis Service**: For flashcard audio generation
- **SRS Service**: For spaced repetition integration
- **Template Engine**: For flashcard content generation
- **Validation Service**: For content and format validation