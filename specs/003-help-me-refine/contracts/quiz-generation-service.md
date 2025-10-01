# Quiz Generation Service Contract

**Service**: Lesson Quiz Generation Service  
**Purpose**: Generate vocabulary and pronunciation quizzes from lesson content  
**Extends**: Existing `QuizService` interface

## Interface Definition

```typescript
interface LessonQuizGenerationService {
  /**
   * Generate quiz from lesson content and vocabulary
   */
  generateQuizFromLesson(
    lesson: EnhancedLesson,
    options: QuizGenerationOptions
  ): Promise<QuizGenerationResult>;

  /**
   * Generate specific quiz questions from vocabulary
   */
  generateVocabularyQuestions(
    vocabularyEntries: VocabularyEntryWithPinyin[],
    questionTypes: QuizQuestionType[],
    count: number
  ): Promise<QuestionGenerationResult>;

  /**
   * Generate pronunciation-based quiz questions
   */
  generatePronunciationQuestions(
    lesson: EnhancedLesson,
    options: PronunciationQuizOptions
  ): Promise<QuestionGenerationResult>;

  /**
   * Validate quiz generation request
   */
  validateQuizRequest(
    request: QuizGenerationRequest
  ): Promise<ValidationResult>;

  /**
   * Get available quiz question templates
   */
  getQuizTemplates(): Promise<QuizTemplate[]>;
}
```

## Request/Response Schemas

### QuizGenerationRequest
```typescript
interface QuizGenerationRequest {
  lesson: EnhancedLesson;
  options: QuizGenerationOptions;
}

interface QuizGenerationOptions {
  questionTypes: QuizQuestionType[];
  questionCount: number; // 3-20
  difficulty: DifficultyLevel;
  includeAudio: boolean;
  timeLimit?: number; // seconds, 30-1800
  shuffleOptions: boolean;
  preventRepeat: boolean;
  focusVocabulary?: string[]; // specific words to focus on
}

type QuizQuestionType = 
  | 'multiple-choice-definition'
  | 'multiple-choice-pinyin'
  | 'multiple-choice-audio'
  | 'fill-in-blank'
  | 'audio-recognition'
  | 'pronunciation-match';
```

### QuizGenerationResponse
```typescript
interface QuizGenerationResult {
  success: boolean;
  quiz: LessonQuiz;
  generationStats: QuizGenerationStats; 
  generatedAt: Date;
  errors?: QuizGenerationError[];
}

interface QuizGenerationStats {
  totalQuestions: number;
  byQuestionType: Record<QuizQuestionType, number>;
  vocabularyWordsUsed: number;
  audioQuestionsGenerated: number;
  generationTime: number;
  difficultyDistribution: Record<DifficultyLevel, number>;
}
```

### VocabularyQuestionRequest
```typescript
interface VocabularyQuestionRequest {
  vocabularyEntries: VocabularyEntryWithPinyin[];
  questionTypes: QuizQuestionType[];
  count: number;
  options: {
    difficulty: DifficultyLevel;
    includeDistractions: boolean;
    distractionCount: number; // 2-5 for multiple choice
  };
}
```

### PronunciationQuizRequest
```typescript
interface PronunciationQuizRequest {
  lesson: EnhancedLesson;
  options: PronunciationQuizOptions;
}

interface PronunciationQuizOptions {
  questionCount: number;
  includeAudioSynthesis: boolean;
  includeToneMarks: boolean;
  focusOnDifficultSounds: boolean;
  audioQuality: 'low' | 'medium' | 'high';
}
```

### QuizValidationRequest
```typescript
interface QuizValidationRequest {
  lesson: EnhancedLesson;
  options: QuizGenerationOptions;
}
```

### QuizValidationResponse
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  estimatedQuestionCount: number;
  availableQuestionTypes: QuizQuestionType[];
}
```

## Quiz Data Structures  

### LessonQuiz
```typescript
interface LessonQuiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  
  // Quiz content
  questions: LessonQuizQuestion[];
  questionCount: number;
  quizType: 'vocabulary' | 'pronunciation' | 'mixed';
  
  // Quiz settings
  timeLimit?: number; // seconds
  difficulty: DifficultyLevel;
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  
  // Metadata
  generatedAt: Date;
  sourceContent: string[]; // lesson content references
  vocabularyUsed: string[]; // vocabulary words used
  audioEnabled: boolean;
}
```

### LessonQuizQuestion
```typescript
interface LessonQuizQuestion {
  id: string;
  quizId: string;
  questionType: QuizQuestionType;
  
  // Question content
  questionText: string;
  questionAudio?: string; // audio ID for pronunciation questions
  correctAnswer: string;
  possibleAnswers: string[]; // for multiple choice
  
  // Context and hints
  context?: string; // lesson context where word appears
  hint?: string;
  explanation?: string; // shown after answer
  
  // Metadata
  vocabularyWord?: string; // source vocabulary
  difficulty: number; // 1-5
  points: number;
  timeLimit?: number; // question-specific time limit
  
  // Audio data
  audioOptions?: AudioQuestionData[];
}

interface AudioQuestionData {
  audioId: string;
  text: string;
  isCorrect: boolean;
}
```

### QuizTemplate
```typescript
interface QuizTemplate {
  id: string;
  questionType: QuizQuestionType;
  name: string;
  description: string;
  
  // Template content
  questionTemplate: string;
  answerTemplate: string;
  explanationTemplate?: string;
  
  // Requirements
  requiresAudio: boolean;
  requiresMultipleChoice: boolean;
  minDistractions: number;
  maxDistractions: number;
  
  // Difficulty settings
  difficulty: DifficultyLevel;
  pointValue: number;
}
```

## Question Generation Results

### QuestionGenerationResult
```typescript
interface QuestionGenerationResult {
  success: boolean;
  questions: LessonQuizQuestion[];
  generatedCount: number;
  requestedCount: number;
  generationTime: number;
  errors?: QuestionGenerationError[];
}
```

## Error Handling

```typescript
interface QuizGenerationError {
  code: 'INSUFFICIENT_VOCABULARY' | 'INVALID_QUESTION_TYPE' | 'AUDIO_GENERATION_FAILED' | 'TEMPLATE_ERROR' | 'VALIDATION_FAILED';
  message: string;
  questionType?: QuizQuestionType;
  vocabularyWord?: string;
  details?: {
    requiredVocabularyCount?: number;
    availableVocabularyCount?: number;
    templateId?: string;
    audioCapability?: boolean;
  };
}

interface QuestionGenerationError {
  code: 'DISTRACTION_GENERATION_FAILED' | 'INSUFFICIENT_CONTENT' | 'AUDIO_SYNTHESIS_ERROR';
  message: string;
  questionId?: string;
  vocabularyWord?: string;
}
```

## Validation Rules

### Input Validation
- `lesson`: Must be valid `EnhancedLesson` with vocabulary
- `questionCount`: 3-20 range, default 10
- `questionTypes`: At least one valid question type
- `timeLimit`: 30-1800 seconds if specified
- `difficulty`: Valid difficulty level
- Audio questions require Web Speech API capability

### Output Validation
- Each question must have unique ID
- Correct answer must be in possible answers for multiple choice
- Audio questions must have valid audio references
- Question difficulty must be appropriate for lesson level
- All questions must be solvable with lesson content

### Content Validation
- Multiple choice questions need 2-5 distractions
- Distractions must be plausible but incorrect
- Audio content must be generated successfully
- Question text must be clear and unambiguous

## Performance Requirements

- **Generation Time**: < 5 seconds for 10-question quiz
- **Memory Usage**: < 30MB for quiz generation and storage
- **Audio Generation**: < 2 seconds per audio question
- **Concurrent Generation**: Support up to 3 simultaneous quiz requests

## Question Generation Strategies

### Vocabulary-Based Questions
1. **Multiple Choice Definition**: Present Chinese word, choose English definition
2. **Multiple Choice Pinyin**: Present Chinese word, choose correct pinyin
3. **Fill in Blank**: Present definition, fill in Chinese word
4. **Audio Recognition**: Play pronunciation, choose matching word

### Pronunciation-Based Questions  
1. **Audio to Pinyin**: Play audio, choose correct pinyin transcription
2. **Pinyin to Audio**: Show pinyin, choose correct pronunciation
3. **Tone Recognition**: Focus on tone mark accuracy
4. **Sound Discrimination**: Distinguish similar-sounding words

### Context-Based Questions
1. Use lesson content for question context
2. Generate questions from vocabulary usage in lesson
3. Create fill-in-blank from lesson sentences
4. Test comprehension of vocabulary in context

## Distraction Generation

### Multiple Choice Distractions
- **Semantic**: Words with similar meanings
- **Phonetic**: Words with similar pronunciation  
- **Visual**: Characters with similar appearance
- **Category**: Words from same semantic category
- **Random**: Plausible but unrelated options

### Quality Assurance
- Distractions must be grammatically appropriate
- Avoid obvious incorrect answers
- Ensure only one clearly correct answer
- Test distraction effectiveness with difficulty metrics

## Audio Integration

### Audio Question Types
- Pronunciation recognition from lesson vocabulary
- Audio synthesis for vocabulary pronunciation
- Comparative pronunciation questions
- Tone discrimination exercises

### Audio Requirements
- Use existing AudioSynthesisService
- Generate high-quality Chinese pronunciation
- Support multiple voice options
- Cache audio for offline quiz taking

## Dependencies

- **Enhanced Lesson Processing**: For vocabulary and content extraction
- **Audio Synthesis Service**: For pronunciation-based questions  
- **Existing Quiz Service**: For base quiz functionality
- **Template Engine**: For question content generation
- **Validation Service**: For quiz content validation
- **Performance Monitoring**: For generation metrics