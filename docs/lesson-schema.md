# Lesson Schema Documentation

**Version**: 1.0  
**Last Updated**: September 30, 2025  
**Compatibility**: PinyinMate v1.0+

## Overview

This document defines the standardized JSON schema for lessons in the PinyinMate Chinese learning application. All lessons, whether from local sources or remote library sources, must conform to this schema to ensure compatibility and proper functionality.

## Schema Definition

### Root Level Structure

```json
{
  "id": "string",
  "title": "string", 
  "description": "string",
  "content": "string",
  "metadata": "LessonMetadata"
}
```

### LessonMetadata Structure

```json
{
  "difficulty": "beginner" | "intermediate" | "advanced",
  "tags": ["string"],
  "characterCount": "number",
  "source": "string",
  "book": "string | null",
  "vocabulary": ["VocabularyEntry"],
  "estimatedTime": "number",
  "createdAt": "ISO 8601 datetime string",
  "updatedAt": "ISO 8601 datetime string"
}
```

### VocabularyEntry Structure

```json
{
  "word": "string",
  "definition": "string"
}
```

**Note**: `pinyin` and `partOfSpeech` are generated at runtime using the pinyin-pro library and should not be included in the static lesson data.



## Field Specifications

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | string | Unique lesson identifier | Must be unique within library, alphanumeric + hyphens |
| `title` | string | Display title of the lesson | 1-100 characters |
| `description` | string | Brief description of lesson content | 1-500 characters |
| `content` | string | Main Chinese text content | 1-10,000 characters |
| `metadata` | object | Lesson metadata object | See LessonMetadata spec |

### Metadata Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `difficulty` | enum | Lesson difficulty level | "beginner", "intermediate", "advanced" |
| `tags` | array | Searchable topic tags | Array of strings, 1-50 tags |
| `characterCount` | number | Number of Chinese characters | Positive integer |
| `source` | string | Content source attribution | Publisher, URL, or source identifier |
| `book` | string\|null | Textbook reference if applicable | Book title or null |
| `vocabulary` | array | List of vocabulary entries | Array of VocabularyEntry objects |
| `estimatedTime` | number | Study time in minutes | Positive integer |
| `createdAt` | string | Creation timestamp | ISO 8601 format |
| `updatedAt` | string | Last modification timestamp | ISO 8601 format |



## Example Lesson

```json
{
  "id": "family",
  "title": "Family Members",
  "description": "Learn to talk about family members in Chinese",
  "content": "这是我的家庭。我有爸爸、妈妈、哥哥和妹妹。我爱我的家人。我们一起住在上海。",
  "metadata": {
    "difficulty": "beginner",
    "tags": ["family", "relationships", "basic", "home"],
    "characterCount": 68,
    "source": "PinyinMate Sample Content",
    "book": null,
    "vocabulary": [
      {
        "word": "这是",
        "definition": "this is"
      },
      {
        "word": "家庭",
        "definition": "family"
      },
      {
        "word": "有",
        "definition": "to have"
      }
    ],
    "estimatedTime": 20,
    "createdAt": "2025-09-29T12:00:00Z",
    "updatedAt": "2025-09-29T12:00:00Z"
  }
}
```

## Validation Rules

### Content Validation
- Chinese content must contain valid Unicode Chinese characters
- Vocabulary words must appear in the lesson content (recommended but not enforced)
- Character count should match actual content length

### Metadata Validation
- `difficulty` must be one of the three specified values
- `tags` array cannot be empty
- `estimatedTime` should be realistic (5-120 minutes typical range)
- `source` cannot be empty string
- `vocabulary` array can be empty but must be present

### Audio Validation (if present)
- Audio segments must not overlap
- Segment timestamps must be within audio duration
- All segment text should correspond to content

## Remote Library Integration

Remote library sources must provide lessons that conform exactly to this schema. The system will validate incoming lessons against these specifications.

### Remote Source Requirements
1. **Content-Type**: `application/json`
2. **Schema Compliance**: All lessons must validate against this schema
3. **Character Encoding**: UTF-8
4. **Source Attribution**: Must provide accurate `source` field
5. **Vocabulary Consistency**: Vocabulary should reflect lesson content

### Error Handling
Lessons that fail schema validation will be:
- Logged with specific validation errors
- Excluded from the lesson library
- Reported in sync status for remote sources

## TypeScript Interface

```typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  metadata: LessonMetadata;
}

interface LessonMetadata {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  characterCount: number;
  source: string;
  book: string | null;
  vocabulary: VocabularyEntry[];
  estimatedTime: number;
  createdAt: string; // ISO 8601
  updatedAt: string;  // ISO 8601
}

interface VocabularyEntry {
  word: string;
  definition: string;
}
```

## Migration Notes

### From Previous Versions
- Removed `pinyin` field from vocabulary entries (generated at runtime)
- Removed `partOfSpeech` field from vocabulary entries (not needed)
- Added `source` field to metadata (required)
- Added `book` field to metadata (optional, can be null)

### Backward Compatibility
Lessons with the old schema will be automatically migrated during library loading, with default values assigned to new required fields.

## Best Practices

### Content Creation
1. Keep lessons focused on specific topics
2. Include relevant vocabulary that appears in content
3. Provide meaningful cultural context
4. Use accurate difficulty classifications
5. Include comprehensive grammar point explanations

### Source Attribution
1. Always provide clear source attribution
2. Include book references for textbook content
3. Use consistent source naming conventions
4. Respect copyright and attribution requirements

### Vocabulary Selection
1. Focus on key words students need to understand content
2. Avoid overwhelming lessons with too many vocabulary items
3. Prioritize high-frequency, useful vocabulary
4. Ensure definitions are clear and contextually appropriate

## Changelog

### Version 1.0 (September 30, 2025)
- Initial schema definition
- Added `source` and `book` metadata fields
- Removed `pinyin` and `partOfSpeech` from vocabulary
- Established validation rules and best practices
