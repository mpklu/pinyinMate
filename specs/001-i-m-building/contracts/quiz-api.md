# Quiz Generation API Contract

## POST /api/quiz/generate

**Purpose**: Auto-generate quiz from annotation content

### Request
```typescript
interface QuizGenerateRequest {
  sourceAnnotationId: string;
  questionTypes: ('multiple-choice' | 'fill-in-blank' | 'matching' | 'audio-recognition')[];
  questionCount?: number; // default: 10
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
```

### Response
```typescript
interface QuizGenerateResponse {
  success: boolean;
  data: {
    quiz: Quiz;
    generationTime: number;
  };
  error?: string;
}
```

### Validation Rules
- `sourceAnnotationId` must reference existing annotation in session
- `questionTypes` must contain at least one valid type
- `questionCount` must be between 1 and 50
- Generated questions must have correct answers

### Error Responses
- 400: Invalid request parameters
- 404: Source annotation not found
- 422: Insufficient content for requested question count

### Example
```json
// Request
{
  "sourceAnnotationId": "ann_123",
  "questionTypes": ["multiple-choice", "fill-in-blank"],
  "questionCount": 5,
  "difficulty": "beginner"
}

// Response
{
  "success": true,
  "data": {
    "quiz": {
      "id": "quiz_456",
      "sourceAnnotationId": "ann_123",
      "questions": [
        {
          "id": "q1",
          "type": "multiple-choice",
          "prompt": "What is the pinyin for '你好'?",
          "options": ["nǐ hǎo", "nín hǎo", "nǐ hào", "ní hǎo"],
          "correctAnswer": "nǐ hǎo",
          "sourceSegmentId": "seg_1"
        },
        {
          "id": "q2",
          "type": "fill-in-blank",
          "prompt": "Fill in the blank: __ 世界 (Hello world)",
          "correctAnswer": "你好",
          "sourceSegmentId": "seg_1"
        }
      ],
      "type": "auto-generated",
      "createdAt": "2025-09-28T10:35:00Z",
      "metadata": {
        "difficulty": "beginner",
        "estimatedTime": 3
      }
    },
    "generationTime": 120
  }
}
```

## POST /api/quiz/submit

**Purpose**: Process quiz submission and return results

### Request
```typescript
interface QuizSubmitRequest {
  quizId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
}
```

### Response
```typescript
interface QuizSubmitResponse {
  success: boolean;
  data: {
    score: number; // percentage 0-100
    totalQuestions: number;
    correctAnswers: number;
    results: {
      questionId: string;
      correct: boolean;
      userAnswer: string | string[];
      correctAnswer: string | string[];
      explanation?: string;
    }[];
  };
  error?: string;
}
```

### Performance Requirements
- Quiz generation: <1s for standard annotations
- Answer validation: <100ms per submission
- Client-side processing (no server dependency)