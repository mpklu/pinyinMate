# Lesson Library System Architecture

## Overview

The lesson library system provides a unified interface for accessing Chinese learning content from multiple sources:
- Local static files bundled with the application
- Remote content loaded from URIs (with caching)
- Dynamic lesson organization with metadata-driven categorization

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│ LibraryPage │ LessonBrowser │ LessonCard │ CategoryFilter   │
├─────────────────────────────────────────────────────────────┤
│                  Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│           LessonLibraryService                              │
│  ┌─────────────────┬──────────────────┬──────────────────┐  │
│  │  LocalLoader    │   RemoteLoader   │   CacheManager   │  │
│  │                 │                  │                  │  │
│  │ • Static files  │ • HTTP fetch     │ • Session cache  │  │
│  │ • JSON parsing  │ • Error handling │ • Expiration     │  │
│  │ • Validation    │ • Retry logic    │ • Cleanup        │  │
│  └─────────────────┴──────────────────┴──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Local Assets     │              Remote Sources             │
│                   │                                         │
│  /public/lessons/ │         https://api.example.com/        │
│  ├── manifest.json│         https://cdn.example.com/        │
│  ├── beginner/    │         Custom JSON APIs                │
│  ├── intermediate/│         GitHub repositories             │
│  └── advanced/    │         Educational platforms           │
└─────────────────────────────────────────────────────────────┘
```

## Data Structures

### Content Manifest
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-09-29T12:00:00Z",
  "categories": [
    {
      "id": "beginner",
      "name": "Beginner Lessons",
      "description": "Basic Chinese texts for beginners",
      "difficulty": "beginner",
      "lessons": [
        {
          "id": "greetings",
          "title": "Basic Greetings",
          "description": "Learn common Chinese greetings",
          "source": {
            "type": "local",
            "path": "/lessons/beginner/greetings.json"
          },
          "metadata": {
            "characterCount": 45,
            "vocabulary": ["你好", "再见", "谢谢"],
            "estimatedTime": 15,
            "tags": ["greetings", "basic", "conversation"]
          }
        }
      ]
    }
  ],
  "remoteSources": [
    {
      "id": "hsk1",
      "name": "HSK Level 1 Texts",
      "baseUrl": "https://api.chineselearning.com/hsk1/",
      "authRequired": false,
      "rateLimit": {
        "requests": 100,
        "windowMs": 3600000
      }
    }
  ]
}
```

### Lesson Content Format
```json
{
  "id": "greetings",
  "title": "Basic Greetings",
  "content": "你好！我是李明。很高兴认识你。",
  "metadata": {
    "difficulty": "beginner",
    "tags": ["greetings", "introductions"],
    "vocabulary": [
      {
        "word": "你好",
        "pinyin": "nǐ hǎo",
        "definition": "hello"
      },
      {
        "word": "很高兴",
        "pinyin": "hěn gāo xìng",
        "definition": "very happy"
      }
    ],
    "grammarPoints": [
      "Basic greetings structure",
      "Self-introduction pattern"
    ],
    "culturalNotes": [
      "Chinese people often ask 'Have you eaten?' as a greeting"
    ]
  },
  "audio": {
    "url": "/audio/greetings.mp3",
    "segments": [
      {"start": 0, "end": 2.5, "text": "你好！"},
      {"start": 3.0, "end": 6.2, "text": "我是李明。"}
    ]
  }
}
```

## Service Implementation

### Core Service: LessonLibraryService

```typescript
interface LessonLibraryService {
  // Library management
  loadManifest(): Promise<ContentManifest>;
  getCategories(): Promise<LessonCategory[]>;
  searchLessons(query: SearchQuery): Promise<LessonSearchResult[]>;
  
  // Content loading
  loadLesson(lessonId: string): Promise<LessonContent>;
  loadLessonFromUri(uri: string): Promise<LessonContent>;
  
  // Cache management
  getCachedLessons(): Promise<LessonContent[]>;
  clearCache(): Promise<void>;
  
  // Validation
  validateLessonContent(content: unknown): LessonValidationResult;
}
```

### Content Sources

#### 1. Local Static Files
- **Location**: `/public/lessons/`
- **Organization**: Category-based folders
- **Loading**: Direct fetch from bundled assets
- **Benefits**: Fast loading, offline support, version control

#### 2. Remote URIs
- **Protocols**: HTTP/HTTPS, GitHub raw files, CDN endpoints
- **Caching**: Session-based with configurable expiration
- **Error Handling**: Retry logic, fallback to cache, graceful degradation
- **Benefits**: Dynamic content, easy updates, external integrations

## Component Architecture

### LessonBrowser (Organism)
- Displays lesson categories and lessons
- Handles search and filtering
- Manages loading states and errors
- Supports both grid and list views

### LessonCard (Molecule)  
- Shows lesson preview with metadata
- Displays difficulty, estimated time, tags
- Has action buttons (start lesson, preview)
- Shows loading indicator for remote content

### CategoryFilter (Molecule)
- Allows filtering by difficulty, tags, content type
- Shows lesson counts per category
- Supports search functionality
- Maintains filter state

## Loading Strategy

### Progressive Loading
1. **Manifest First**: Load content manifest to show available lessons
2. **Metadata Display**: Show lesson cards with cached metadata
3. **On-Demand Content**: Load full lesson content when user selects
4. **Background Prefetch**: Preload popular/recent lessons

### Caching Strategy
```typescript
interface CacheStrategy {
  // Cache levels
  manifest: 'persistent';      // Never expires during session
  metadata: 'session';         // Expires on tab close
  content: 'lru';             // Least Recently Used eviction
  audio: 'optional';          // User-controlled caching
  
  // Cache limits
  maxContentItems: 50;
  maxAudioFiles: 10;
  maxCacheSize: '100MB';
}
```

## Error Handling

### Loading Failures
- **Network errors**: Show cached content or fallback message
- **Parse errors**: Validate content and show specific error details
- **Missing content**: Graceful degradation with alternative suggestions
- **Rate limiting**: Queue requests and show loading indicators

### Content Validation
```typescript
interface ValidationRules {
  required: ['id', 'title', 'content'];
  maxContentLength: 10000;
  allowedTags: string[];
  difficultyLevels: ['beginner', 'intermediate', 'advanced'];
  audioFormats: ['mp3', 'wav', 'ogg'];
}
```

## Configuration

### Environment Variables
```env
# Local content
VITE_LESSONS_PATH=/public/lessons
VITE_MANIFEST_FILE=manifest.json

# Remote sources
VITE_REMOTE_SOURCES_ENABLED=true
VITE_CACHE_DURATION=3600000
VITE_MAX_CONCURRENT_REQUESTS=5

# Performance
VITE_PRELOAD_POPULAR_LESSONS=true
VITE_BACKGROUND_SYNC=false
```

### Content Management
- **Local content**: Managed through build process, version controlled
- **Remote content**: Configured via manifest, supports multiple providers
- **Hybrid approach**: Critical content local, extended content remote

## Implementation Plan

### Phase 1: Core Infrastructure
1. Define TypeScript interfaces for all data structures
2. Implement LessonLibraryService with local file support
3. Create basic content manifest structure
4. Add content validation utilities

### Phase 2: Remote Content Support  
1. Add RemoteLoader with HTTP fetch capabilities
2. Implement caching system with session storage
3. Add retry logic and error handling
4. Create content source configuration system

### Phase 3: User Interface
1. Build LessonBrowser component with category display
2. Create LessonCard with metadata and actions
3. Add search and filtering capabilities
4. Implement loading states and error boundaries

### Phase 4: Enhancement
1. Add audio content support
2. Implement background prefetching
3. Add content analytics and usage tracking
4. Create admin tools for content management

This architecture provides a robust foundation for the lesson library system while maintaining flexibility for future enhancements and content sources.