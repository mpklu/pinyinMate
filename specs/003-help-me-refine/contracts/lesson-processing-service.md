# Lesson Processing Service Contract

**Service**: Enhanced Lesson Processing Service  
**Purpose**: Process raw lesson content into enhanced, interactive learning format  
**Extends**: Existing `LessonService` interface

## Interface Definition

```typescript
interface EnhancedLessonProcessingService {
  /**
   * Process lesson content with text segmentation, pinyin generation, and audio preparation
   */
  processLesson(
    lesson: Lesson,
    options: LessonProcessingOptions
  ): Promise<ProcessedLessonContent>;

  /**
   * Generate vocabulary entries with pinyin and frequency analysis  
   */
  processVocabulary(
    lesson: Lesson,
    content: ProcessedLessonContent
  ): Promise<VocabularyEntryWithPinyin[]>;

  /**
   * Validate processed lesson content against schema
   */
  validateProcessedContent(
    content: ProcessedLessonContent
  ): Promise<ValidationResult>;

  /**
   * Get processing status for lesson
   */
  getProcessingStatus(lessonId: string): Promise<ProcessingStatus>;
}
```

## Request/Response Schemas

### ProcessLessonRequest
```typescript
interface ProcessLessonRequest {
  lesson: Lesson;
  options: LessonProcessingOptions;
}

interface LessonProcessingOptions {
  segmentationMode: 'sentence' | 'phrase' | 'character';
  generatePinyin: boolean;
  prepareAudio: boolean;
  maxSegments?: number;
  vocabularyEnhancement: boolean;
}
```

### ProcessLessonResponse
```typescript
interface ProcessLessonResponse {
  success: boolean;
  processedContent: ProcessedLessonContent;
  processingTime: number;
  warnings: string[];
  errors?: string[];
}

interface ProcessedLessonContent {
  segments: TextSegmentWithAudio[];
  vocabularyMap: Map<string, VocabularyEntryWithPinyin>;
  totalSegments: number;
  processingTimestamp: Date;
  pinyinGenerated: boolean;
  audioReady: boolean;
}
```

### VocabularyProcessingRequest
```typescript
interface VocabularyProcessingRequest {
  lesson: Lesson;
  processedContent: ProcessedLessonContent;
  options: {
    calculateFrequency: boolean;
    generatePinyin: boolean;
    analyzeDifficulty: boolean;
  };
}
```

### VocabularyProcessingResponse
```typescript
interface VocabularyProcessingResponse {
  success: boolean;
  vocabularyEntries: VocabularyEntryWithPinyin[];
  processingStats: {
    totalWords: number;
    newPinyinGenerated: number;
    frequencyCalculated: number;
  };
  errors?: string[];
}
```

## Error Responses

```typescript
interface ProcessingError {
  code: 'INVALID_LESSON' | 'SEGMENTATION_FAILED' | 'PINYIN_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: {
    field?: string;
    expectedFormat?: string;
    receivedValue?: any;
  };
}
```

## Validation Rules

### Input Validation
- `lesson`: Must pass existing lesson schema validation
- `lesson.content`: 1-50000 characters, required
- `lesson.metadata.vocabulary`: Valid vocabulary array  
- `options.maxSegments`: 1-1000 if specified
- `segmentationMode`: Must be valid enum value

### Output Validation
- `segments`: 1-1000 segments per lesson
- `vocabularyMap`: Must contain all lesson vocabulary words
- `processingTimestamp`: Must be current or recent timestamp
- All pinyin must be valid romanization

## Performance Requirements

- **Processing Time**: < 2 seconds for lessons up to 5000 characters
- **Memory Usage**: < 50MB per lesson processing
- **Concurrent Processing**: Support up to 5 simultaneous lesson processing
- **Cache Validity**: Processed content valid for 24 hours

## Dependencies

- **PinyinService**: For pinyin generation
- **TextSegmentationService**: For content segmentation  
- **Lesson Schema Validation**: For input/output validation
- **Performance Monitoring**: For processing metrics