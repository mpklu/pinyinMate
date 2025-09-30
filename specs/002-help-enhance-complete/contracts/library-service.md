# Library Service Contract

**Service**: LibraryService  
**Purpose**: Load and manage lesson libraries from local and remote sources

## Interface Definition

```typescript
interface LibraryService {
  loadLibraries(): Promise<LibraryLoadResult>;
  getEnabledSources(): RemoteSource[];
  toggleSource(sourceId: string, enabled: boolean): Promise<void>;
  refreshRemoteSource(sourceId: string): Promise<Library>;
  getLibraryById(id: string): Library | null;
  searchLessons(query: string): Lesson[];
  getLessonCollections(libraryId: string): Collection[];
}
```

## Data Contracts

### LibraryLoadResult
```typescript
interface LibraryLoadResult {
  libraries: Library[];
  failedSources: SourceError[];
  totalSources: number;
  successCount: number;
}

interface SourceError {
  sourceId: string;
  sourceName: string;
  error: string;
  timestamp: Date;
}
```

### RemoteSource
```typescript
interface RemoteSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  description: string;
}
```

## Method Contracts

### loadLibraries()
**Purpose**: Load all enabled libraries (local + remote)

**Input**: None  
**Output**: `Promise<LibraryLoadResult>`

**Behavior**:
1. Load local lessons from `public/lessons/manifest.json`
2. Load remote source configuration from `public/config/remote-sources.json`
3. For each enabled remote source:
   - Fetch manifest from remote URL
   - Parse and validate lesson data
   - Create Library object
4. Return combined results with error details

**Error Handling**:
- Network failures: Log error, skip source, continue with others
- Invalid JSON: Log parsing error, skip source
- Schema validation: Log validation errors, skip invalid lessons

### toggleSource(sourceId, enabled)
**Purpose**: Enable or disable a remote lesson source

**Input**: 
- `sourceId: string` - Remote source identifier
- `enabled: boolean` - New enabled state

**Output**: `Promise<void>`

**Behavior**:
1. Update source configuration in localStorage
2. If disabling: Remove library from active libraries
3. If enabling: Trigger refresh of that source
4. Persist configuration change

**Error Handling**:
- Invalid sourceId: Throw error
- Network failure during refresh: Update enabled state but log error

### refreshRemoteSource(sourceId)
**Purpose**: Force refresh of a specific remote source

**Input**: `sourceId: string`  
**Output**: `Promise<Library>`

**Behavior**:
1. Fetch latest manifest from remote URL
2. Parse and validate lesson data
3. Update existing library or create new one
4. Return updated library

**Error Handling**:
- Network failure: Throw error with details
- Invalid data: Throw validation error
- Timeout: Throw timeout error after 10 seconds

### searchLessons(query)
**Purpose**: Search across all libraries for matching lessons

**Input**: `query: string` - Search term  
**Output**: `Lesson[]` - Matching lessons

**Behavior**:
1. Search lesson titles, descriptions, and tags
2. Case-insensitive matching
3. Return results sorted by relevance
4. Limit to 50 results max

**Error Handling**:
- Empty query: Return empty array
- Invalid characters: Sanitize and continue

## API Endpoints (if applicable)

### GET /api/libraries
**Purpose**: Get all available libraries

**Response**: `LibraryLoadResult`

**Status Codes**:
- 200: Success
- 500: Server error

### GET /api/libraries/{id}/lessons
**Purpose**: Get lessons for specific library

**Response**: `Lesson[]`

**Status Codes**:
- 200: Success
- 404: Library not found
- 500: Server error

## Validation Rules

### Remote Manifest Format
```json
{
  "library": {
    "id": "string (required)",
    "name": "string (required)",
    "description": "string (optional)",
    "version": "string (optional)"
  },
  "lessons": [
    {
      "id": "string (required)",
      "title": "string (required)",
      "description": "string (required)",
      "content": "string (required, min 1 char)",
      "metadata": {
        "difficulty": "beginner|intermediate|advanced (required)",
        "tags": "string[] (required)",
        "characterCount": "number (required)",
        "estimatedTime": "number (required)",
        "src": "string (required)",
        "createdAt": "ISO date string (required)",
        "updatedAt": "ISO date string (required)"
      },
      "vocabulary": [
        {
          "word": "string (required)",
          "definition": "string (required)",
          "partOfSpeech": "string (optional)"
        }
      ],
      "grammarPoints": "string[] (optional)",
      "culturalNotes": "string[] (optional)"
    }
  ]
}
```

## Performance Constraints

- Library loading must complete within 5 seconds
- Individual source timeout: 10 seconds
- Maximum concurrent remote requests: 3
- Cache TTL for remote sources: 1 hour
- Maximum lessons per library: 1000

## Security Considerations

- Remote URLs must be HTTPS only
- Validate all input JSON against schema
- Sanitize search queries to prevent XSS
- Rate limit remote source requests
- No user-provided URLs (predefined sources only)

## Error Response Format

```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
```

## Test Scenarios

1. **Load local libraries successfully**
2. **Load remote libraries with network success**
3. **Handle remote source failures gracefully**
4. **Toggle source states correctly**
5. **Search functionality works across libraries**
6. **Invalid JSON handling**
7. **Network timeout handling**
8. **Concurrent request limiting**