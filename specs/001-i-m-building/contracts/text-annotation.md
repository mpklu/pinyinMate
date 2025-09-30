# Text Annotation API Contract

## POST /api/annotate

**Purpose**: Process Chinese text input and return segmented, annotated text

### Request
```typescript
interface AnnotateRequest {
  text: string;
  options?: {
    includeDefinitions?: boolean;
    includeToneMarks?: boolean;
    includeAudio?: boolean;
  };
}
```

### Response
```typescript
interface AnnotateResponse {
  success: boolean;
  data: {
    annotation: TextAnnotation;
    processingTime: number;
  };
  error?: string;
}
```

### Validation Rules
- `text` must contain at least one Chinese character (CJK Unicode range)
- `text` length must be ≤ 10,000 characters (performance constraint)
- Invalid characters are filtered, not rejected

### Error Responses
- 400: Invalid input format
- 413: Text too long (>10,000 characters)
- 500: Processing failure

### Example
```json
// Request
{
  "text": "你好世界",
  "options": {
    "includeDefinitions": true,
    "includeToneMarks": true
  }
}

// Response
{
  "success": true,
  "data": {
    "annotation": {
      "id": "ann_123",
      "originalText": "你好世界",
      "segments": [
        {
          "id": "seg_1",
          "text": "你好",
          "pinyin": "nǐ hǎo",
          "toneMarks": "nǐ hǎo",
          "definition": "hello",
          "position": { "start": 0, "end": 2 }
        },
        {
          "id": "seg_2", 
          "text": "世界",
          "pinyin": "shì jiè",
          "toneMarks": "shì jiè",
          "definition": "world",
          "position": { "start": 2, "end": 4 }
        }
      ],
      "createdAt": "2025-09-28T10:30:00Z",
      "metadata": {
        "title": "Sample Text",
        "difficulty": "beginner"
      }
    },
    "processingTime": 45
  }
}
```

### Performance Requirements
- Response time: <500ms for texts up to 1000 characters
- Response time: <2s for texts up to 10,000 characters
- Client-side processing (no server dependency)