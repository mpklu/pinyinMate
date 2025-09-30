# Export API Contract

## POST /api/export/pdf

**Purpose**: Export content as PDF format

### Request
```typescript
interface PDFExportRequest {
  contentType: 'flashcards' | 'quiz' | 'annotation';
  contentId: string;
  options: {
    includeAudio?: boolean;
    includeAnswers?: boolean; // for quizzes
    layout?: 'cards' | 'list' | 'booklet';
    pageSize?: 'A4' | 'Letter' | 'A5';
  };
}
```

### Response
```typescript
interface PDFExportResponse {
  success: boolean;
  data: {
    filename: string;
    blob: Blob;
    size: number; // bytes
  };
  error?: string;
}
```

## POST /api/export/anki

**Purpose**: Export flashcards in Anki (.apkg) format

### Request
```typescript
interface AnkiExportRequest {
  deckId: string;
  options: {
    includeAudio?: boolean;
    includeTags?: boolean;
    deckName?: string;
  };
}
```

### Response
```typescript
interface AnkiExportResponse {
  success: boolean;
  data: {
    filename: string;
    blob: Blob;
    cardCount: number;
  };
  error?: string;
}
```

## POST /api/export/quizlet

**Purpose**: Export flashcards in Quizlet import format (CSV)

### Request
```typescript
interface QuizletExportRequest {
  deckId: string;
  options: {
    includeDefinitions?: boolean;
    includeExamples?: boolean;
    delimiter?: string; // default: ","
  };
}
```

### Response
```typescript
interface QuizletExportResponse {
  success: boolean;
  data: {
    filename: string;
    csvContent: string;
    cardCount: number;
  };
  error?: string;
}
```

### Format Specifications

#### Anki Package (.apkg)
- SQLite database with Anki schema
- Card fields: Front (Chinese), Back (Pinyin + Definition)
- Optional audio files embedded
- Deck metadata included

#### Quizlet CSV Format
```csv
Front,Back
你好,"nǐ hǎo - hello"
世界,"shì jiè - world"
```

### Example
```json
// PDF Export Request
{
  "contentType": "flashcards",
  "contentId": "deck_789",
  "options": {
    "includeAudio": false,
    "layout": "cards",
    "pageSize": "A4"
  }
}

// PDF Export Response
{
  "success": true,
  "data": {
    "filename": "chinese-flashcards-2025-09-28.pdf",
    "blob": "[Blob object]",
    "size": 245760
  }
}
```

### Performance Requirements
- PDF generation: <3s for up to 100 cards
- Anki export: <2s for up to 500 cards  
- Quizlet CSV: <1s for any deck size
- Client-side processing (no server dependency)