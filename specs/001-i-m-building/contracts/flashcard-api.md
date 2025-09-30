# Flashcard API Contract

## POST /api/flashcards/generate

**Purpose**: Generate flashcards from annotation content

### Request
```typescript
interface FlashcardGenerateRequest {
  sourceAnnotationId: string;
  includeDefinitions: boolean;
  includeExamples: boolean;
  cardLimit?: number; // default: 20
}
```

### Response
```typescript
interface FlashcardGenerateResponse {
  success: boolean;
  data: {
    deck: FlashcardDeck;
    generationTime: number;
  };
  error?: string;
}
```

## GET /api/flashcards/srs-queue

**Purpose**: Get current SRS queue for session

### Response
```typescript
interface SRSQueueResponse {
  success: boolean;
  data: {
    queue: Flashcard[];
    totalDue: number;
    nextReviewTime?: Date;
  };
  error?: string;
}
```

## POST /api/flashcards/review

**Purpose**: Submit flashcard review result and update SRS

### Request
```typescript
interface FlashcardReviewRequest {
  cardId: string;
  quality: number; // 0-5 scale (0=total blackout, 5=perfect response)
  responseTime?: number; // milliseconds
}
```

### Response
```typescript
interface FlashcardReviewResponse {
  success: boolean;
  data: {
    nextReview: Date;
    interval: number; // days
    updatedCard: Flashcard;
  };
  error?: string;
}
```

### SRS Algorithm Details
- Based on SuperMemo SM-2 algorithm
- Session-only implementation (resets on page refresh)
- Quality scale: 0-5 where 0-2 triggers repeat, 3-5 advances interval
- Initial interval: 1 day, then follows algorithm progression

### Example
```json
// Generate Request
{
  "sourceAnnotationId": "ann_123",
  "includeDefinitions": true,
  "includeExamples": false,
  "cardLimit": 10
}

// Generate Response
{
  "success": true,
  "data": {
    "deck": {
      "id": "deck_789",
      "name": "Sample Text Flashcards",
      "cards": [
        {
          "id": "card_1",
          "front": "你好",
          "back": {
            "pinyin": "nǐ hǎo",
            "definition": "hello",
            "example": "你好，很高兴见到你。"
          },
          "sourceSegmentId": "seg_1",
          "srsData": {
            "interval": 1,
            "repetition": 0,
            "easeFactor": 2.5,
            "dueDate": "2025-09-29T10:30:00Z"
          },
          "tags": ["greeting", "basic"]
        }
      ],
      "sourceType": "annotation",
      "sourceId": "ann_123",
      "createdAt": "2025-09-28T10:40:00Z",
      "metadata": {
        "cardCount": 1,
        "difficulty": "beginner",
        "tags": ["greeting"]
      }
    },
    "generationTime": 80
  }
}
```