# Edit Existing Lesson Feature - Design Document

**Feature**: Pull and Edit Existing Lessons  
**Version**: 1.0  
**Date**: November 29, 2025  
**Status**: Design Phase

---

## Executive Summary

Currently, the Lesson Builder only supports creating new lessons. Users need the ability to pull existing lessons from GitHub repositories, edit them, and republish. This document outlines a comprehensive design for implementing this capability while maintaining the current creation workflow.

---

## User Stories

### Primary User Stories

1. **As a content creator**, I want to search and browse existing lessons so that I can find content that needs updating.

2. **As an educator**, I want to load an existing lesson into the editor so that I can fix errors or improve content.

3. **As a contributor**, I want to update vocabulary entries in published lessons so that translations stay accurate.

4. **As a maintainer**, I want to see lesson edit history so that I can track changes over time.

5. **As a user**, I want the edit workflow to feel similar to the creation workflow so that I don't need to learn new patterns.

---

## Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Lesson Builder App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Mode       │         │   Lesson     │                      │
│  │  Selector    │────────▶│   Browser    │                      │
│  │ [New/Edit]   │         │  Component   │                      │
│  └──────────────┘         └──────┬───────┘                      │
│                                   │                              │
│                                   │ Select Lesson                │
│                                   ▼                              │
│                          ┌────────────────┐                      │
│                          │  Lesson Form   │                      │
│                          │   (Unified)    │                      │
│                          └────────┬───────┘                      │
│                                   │                              │
│                    ┌──────────────┼──────────────┐              │
│                    ▼              ▼              ▼              │
│            ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│            │ Metadata │   │ Content  │   │Vocabulary│          │
│            │   Form   │   │  Editor  │   │ Manager  │          │
│            └──────────┘   └──────────┘   └──────────┘          │
│                                   │                              │
│                                   │ Save/Publish                 │
│                                   ▼                              │
│                          ┌────────────────┐                      │
│                          │ GitHub Service │                      │
│                          │  (with diff)   │                      │
│                          └────────────────┘                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ API Calls
                                   ▼
                          ┌────────────────┐
                          │     GitHub     │
                          │   Repository   │
                          └────────────────┘
```

---

## Component Design

### 1. Mode Selector (New Component)

**Purpose**: Toggle between "Create New" and "Edit Existing" modes.

**Location**: `lesson-builder/src/components/ModeSelector.tsx`

**UI Design**:
```
┌────────────────────────────────────────┐
│  ○ Create New Lesson                   │
│  ● Edit Existing Lesson                │
└────────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface ModeSelectorProps {
  mode: 'create' | 'edit';
  onChange: (mode: 'create' | 'edit') => void;
  disabled?: boolean;
}
```

**State Management**:
- Stored in App-level state
- Persisted in localStorage
- Triggers different UI flows

---

### 2. Lesson Browser (New Component)

**Purpose**: Browse, search, and select existing lessons from GitHub.

**Location**: `lesson-builder/src/components/LessonBrowser.tsx`

**UI Design**:
```
┌──────────────────────────────────────────────────────────────┐
│  Lesson Browser                                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Source: [Local ▼] [LSCS Depot] [Other]                    │
│                                                               │
│  Search: [____________] 🔍    Filters: [Difficulty ▼] [📊]  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📚 Beginner (23 lessons)                                    │
│  ┌────────────────────────────────────────────────┐         │
│  │ ✏️ Basic Greetings                             │  Edit   │
│  │    23 characters • 15 min • 5 vocab            │         │
│  │    Tags: greetings, basic                      │         │
│  │    Last updated: 2025-11-15                    │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │ ✏️ Family Members                              │  Edit   │
│  │    68 characters • 20 min • 12 vocab           │         │
│  │    Tags: family, relationships                 │         │
│  │    Last updated: 2025-10-03                    │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  📚 Intermediate (15 lessons)                                │
│  ...                                                          │
│                                                               │
│  [Load More]                                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface LessonBrowserProps {
  onLessonSelect: (lesson: Lesson, source: LessonSource) => void;
  onClose?: () => void;
}

interface LessonSource {
  type: 'local' | 'remote';
  sourceId: string;
  sourceName: string;
  path: string;
  url?: string;
}

interface LessonListItem {
  lesson: Lesson;
  source: LessonSource;
  metadata: {
    lastModified: string;
    size: number;
    author?: string;
  };
}
```

**Features**:
- Multi-source support (local manifest + remote sources)
- Real-time search (by title, tags, content)
- Filtering (by difficulty, LSCS level, tags)
- Sorting (by date, title, character count)
- Pagination for large lesson sets
- Preview on hover/click
- Quick stats display

---

### 3. Lesson Form (Enhanced)

**Purpose**: Unified form for both creating and editing lessons.

**Location**: `lesson-builder/src/components/LessonForm.tsx` (existing, to be enhanced)

**New Props**:
```typescript
interface LessonFormProps {
  mode: 'create' | 'edit';
  initialLesson?: Lesson;
  lessonSource?: LessonSource;
}
```

**Enhanced UI Elements**:

**Edit Mode Header**:
```
┌──────────────────────────────────────────────────────────────┐
│  Editing: Basic Greetings                                    │
│  Source: LSCS Depot (lessons/level1/greetings.json)         │
│  Last updated: 2025-11-15 by GitHub User                    │
│  [View on GitHub]  [Revert Changes]                         │
└──────────────────────────────────────────────────────────────┘
```

**Action Bar Changes**:
```
┌──────────────────────────────────────────────────────────────┐
│  [< Back to Browser]                                         │
│                                                               │
│  [Save Draft]  [Preview Changes]  [Update on GitHub]        │
│                                                               │
│  Changes: 3 fields modified • 2 vocabulary added             │
└──────────────────────────────────────────────────────────────┘
```

---

### 4. Change Tracker (New Component)

**Purpose**: Show diff between original and edited lesson.

**Location**: `lesson-builder/src/components/ChangeTracker.tsx`

**UI Design**:
```
┌──────────────────────────────────────────────────────────────┐
│  Changes Preview                                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Modified Fields:                                            │
│                                                               │
│  📝 Title:                                                   │
│     - Basic Greetings                                        │
│     + Basic Greetings and Introductions                      │
│                                                               │
│  📝 Content:                                                 │
│     [Show diff]                                              │
│                                                               │
│  📝 Vocabulary:                                              │
│     + Added: "介绍" (introduce)                              │
│     + Added: "名字" (name)                                   │
│     ~ Modified: "你好" - updated definition                  │
│     - Removed: "再见" (goodbye)                              │
│                                                               │
│  📝 Tags:                                                    │
│     + Added: "introductions"                                 │
│                                                               │
│  Commit Message:                                             │
│  [Update lesson with new vocabulary and content]             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface ChangeTrackerProps {
  original: Lesson;
  modified: Lesson;
  onCommitMessageChange: (message: string) => void;
}

interface LessonDiff {
  fieldsChanged: string[];
  vocabularyAdded: VocabularyEntry[];
  vocabularyRemoved: VocabularyEntry[];
  vocabularyModified: VocabularyDiff[];
  contentDiff?: string; // Unified diff format
  metadataDiff: Record<string, { old: any; new: any }>;
}
```

---

## Service Layer Design

### 1. GitHub Fetch Service (New)

**Location**: `lesson-builder/src/services/githubFetchService.ts`

**Purpose**: Fetch lessons and manifests from GitHub.

**API Interface**:
```typescript
export interface GitHubFetchService {
  // Fetch manifest from a remote source
  fetchManifest(sourceUrl: string): Promise<RemoteManifest>;
  
  // Fetch a single lesson by path
  fetchLesson(owner: string, repo: string, path: string): Promise<Lesson>;
  
  // Search lessons across repositories
  searchLessons(query: string, filters?: SearchFilters): Promise<LessonListItem[]>;
  
  // Get lesson file metadata (last modified, author, etc.)
  getLessonMetadata(owner: string, repo: string, path: string): Promise<LessonFileMetadata>;
  
  // List all lessons from a source
  listLessonsFromSource(sourceConfig: RemoteSourceConfig): Promise<LessonListItem[]>;
}

export interface SearchFilters {
  difficulty?: DifficultyLevel[];
  lscsLevel?: string[];
  tags?: string[];
  minCharacterCount?: number;
  maxCharacterCount?: number;
  dateModifiedAfter?: Date;
}

export interface LessonFileMetadata {
  sha: string;
  size: number;
  lastModified: Date;
  author?: string;
  commitMessage?: string;
  url: string;
}
```

**Implementation Details**:

```typescript
// Fetch a single lesson
export async function fetchLesson(
  owner: string, 
  repo: string, 
  path: string
): Promise<Lesson> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': token ? `token ${token}` : '',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lesson: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Decode base64 content
  const content = atob(data.content.replace(/\n/g, ''));
  const lesson: Lesson = JSON.parse(content);
  
  return lesson;
}

// Fetch manifest and parse lessons
export async function fetchManifest(sourceUrl: string): Promise<RemoteManifest> {
  const response = await fetch(sourceUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.statusText}`);
  }
  
  const manifest = await response.json();
  return manifest;
}

// List lessons with metadata
export async function listLessonsFromSource(
  sourceConfig: RemoteSourceConfig
): Promise<LessonListItem[]> {
  const manifest = await fetchManifest(sourceConfig.url);
  
  const lessonItems: LessonListItem[] = [];
  
  for (const category of manifest.categories || []) {
    for (const lessonRef of category.lessons || []) {
      const lesson = await fetchLesson(
        sourceConfig.owner,
        sourceConfig.repo,
        lessonRef.source.path
      );
      
      const metadata = await getLessonMetadata(
        sourceConfig.owner,
        sourceConfig.repo,
        lessonRef.source.path
      );
      
      lessonItems.push({
        lesson,
        source: {
          type: 'remote',
          sourceId: sourceConfig.id,
          sourceName: sourceConfig.name,
          path: lessonRef.source.path,
          url: sourceConfig.url,
        },
        metadata,
      });
    }
  }
  
  return lessonItems;
}
```

---

### 2. Lesson Diff Service (New)

**Location**: `lesson-builder/src/services/lessonDiffService.ts`

**Purpose**: Calculate differences between lesson versions.

**API Interface**:
```typescript
export interface LessonDiffService {
  // Calculate full diff between two lessons
  calculateDiff(original: Lesson, modified: Lesson): LessonDiff;
  
  // Generate human-readable summary
  getDiffSummary(diff: LessonDiff): string;
  
  // Generate commit message from diff
  generateCommitMessage(diff: LessonDiff): string;
  
  // Check if lesson has meaningful changes
  hasChanges(diff: LessonDiff): boolean;
}
```

**Implementation**:
```typescript
export function calculateDiff(original: Lesson, modified: Lesson): LessonDiff {
  const diff: LessonDiff = {
    fieldsChanged: [],
    vocabularyAdded: [],
    vocabularyRemoved: [],
    vocabularyModified: [],
    metadataDiff: {},
  };
  
  // Check basic fields
  const fieldsToCheck: (keyof Lesson)[] = ['title', 'description', 'content'];
  for (const field of fieldsToCheck) {
    if (original[field] !== modified[field]) {
      diff.fieldsChanged.push(field);
    }
  }
  
  // Check metadata
  const metadataFields: (keyof LessonMetadata)[] = [
    'difficulty', 'tags', 'source', 'book', 'estimatedTime'
  ];
  
  for (const field of metadataFields) {
    if (JSON.stringify(original.metadata[field]) !== JSON.stringify(modified.metadata[field])) {
      diff.metadataDiff[field] = {
        old: original.metadata[field],
        new: modified.metadata[field],
      };
    }
  }
  
  // Vocabulary diff
  const originalVocab = new Map(original.metadata.vocabulary.map(v => [v.word, v]));
  const modifiedVocab = new Map(modified.metadata.vocabulary.map(v => [v.word, v]));
  
  // Find added
  for (const [word, entry] of modifiedVocab) {
    if (!originalVocab.has(word)) {
      diff.vocabularyAdded.push(entry);
    }
  }
  
  // Find removed
  for (const [word, entry] of originalVocab) {
    if (!modifiedVocab.has(word)) {
      diff.vocabularyRemoved.push(entry);
    }
  }
  
  // Find modified
  for (const [word, newEntry] of modifiedVocab) {
    const oldEntry = originalVocab.get(word);
    if (oldEntry && oldEntry.definition !== newEntry.definition) {
      diff.vocabularyModified.push({
        word,
        oldDefinition: oldEntry.definition,
        newDefinition: newEntry.definition,
      });
    }
  }
  
  return diff;
}

export function generateCommitMessage(diff: LessonDiff): string {
  const parts: string[] = [];
  
  if (diff.fieldsChanged.includes('content')) {
    parts.push('Update lesson content');
  }
  
  if (diff.vocabularyAdded.length > 0) {
    parts.push(`Add ${diff.vocabularyAdded.length} vocabulary items`);
  }
  
  if (diff.vocabularyRemoved.length > 0) {
    parts.push(`Remove ${diff.vocabularyRemoved.length} vocabulary items`);
  }
  
  if (diff.vocabularyModified.length > 0) {
    parts.push(`Update ${diff.vocabularyModified.length} vocabulary definitions`);
  }
  
  if (diff.fieldsChanged.includes('title')) {
    parts.push('Update title');
  }
  
  return parts.length > 0 
    ? `feat(lesson): ${parts.join(', ')}` 
    : 'chore(lesson): Minor updates';
}
```

---

### 3. Enhanced GitHub Service

**Location**: `lesson-builder/src/services/githubService.ts` (existing, to be enhanced)

**New Methods**:
```typescript
// Update existing lesson with diff tracking
export async function updateLessonOnGitHub(
  lesson: Lesson,
  lscsLevel: LSCSLevel,
  originalSha: string,
  commitMessage?: string
): Promise<GitHubCommitResponse> {
  // Similar to publishLessonToGitHub but includes SHA for updates
  // and custom commit message
}

// Get file SHA (needed for updates)
export async function getFileSha(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  // Fetch file metadata and return SHA
}

// Preview changes before committing
export async function previewUpdate(
  original: Lesson,
  modified: Lesson
): Promise<LessonDiff> {
  // Calculate and return diff
}
```

---

## State Management Design

### Enhanced Builder State

**Location**: `lesson-builder/src/types/builder.ts` (to be enhanced)

**Additional State Properties**:
```typescript
export interface LessonBuilderState {
  // ... existing properties ...
  
  // Edit mode properties
  mode: 'create' | 'edit';
  originalLesson?: Lesson;        // For change tracking
  lessonSource?: LessonSource;    // Where lesson came from
  originalSha?: string;            // GitHub SHA for updates
  
  // Browser state
  browserOpen: boolean;
  availableLessons: LessonListItem[];
  lessonSearchQuery: string;
  lessonFilters: SearchFilters;
  
  // Change tracking
  hasUnsavedChanges: boolean;
  lastSavedVersion?: Lesson;
}
```

### Hook Enhancements

**Location**: `lesson-builder/src/hooks/useLessonBuilder.ts` (to be enhanced)

**New Methods**:
```typescript
export const useLessonBuilder = () => {
  // ... existing methods ...
  
  // Mode management
  const switchMode = useCallback((mode: 'create' | 'edit') => {
    setState(prev => ({ ...prev, mode }));
  }, []);
  
  // Load existing lesson
  const loadLesson = useCallback((
    lesson: Lesson, 
    source: LessonSource, 
    sha?: string
  ) => {
    setState(prev => ({
      ...prev,
      mode: 'edit',
      originalLesson: lesson,
      lessonSource: source,
      originalSha: sha,
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      difficulty: lesson.metadata.difficulty,
      lscsLevel: lesson.metadata.lscsLevel || getDefaultLSCSLevel(lesson.metadata.difficulty),
      tags: lesson.metadata.tags,
      source: lesson.metadata.source,
      book: lesson.metadata.book,
      estimatedTime: lesson.metadata.estimatedTime,
      vocabulary: lesson.metadata.vocabulary,
      isDirty: false,
    }));
  }, []);
  
  // Check for changes
  const hasChanges = useCallback((): boolean => {
    if (!state.originalLesson) return true; // New lesson
    
    const currentLesson = generateLesson();
    const diff = calculateDiff(state.originalLesson, currentLesson);
    
    return hasChanges(diff);
  }, [state]);
  
  // Revert to original
  const revertChanges = useCallback(() => {
    if (state.originalLesson) {
      loadLesson(
        state.originalLesson, 
        state.lessonSource!, 
        state.originalSha
      );
    }
  }, [state.originalLesson, state.lessonSource, state.originalSha, loadLesson]);
  
  // Update on GitHub (instead of publish)
  const updateLesson = useCallback(async () => {
    if (!state.originalLesson || !state.lessonSource || !validation.isValid) {
      return;
    }
    
    try {
      const lesson = generateLesson();
      const diff = calculateDiff(state.originalLesson, lesson);
      const commitMessage = generateCommitMessage(diff);
      
      await updateLessonOnGitHub(
        lesson,
        state.lscsLevel as LSCSLevel,
        state.originalSha!,
        commitMessage
      );
      
      // Update original lesson to current state
      setState(prev => ({
        ...prev,
        originalLesson: lesson,
        isDirty: false,
        publishStatus: {
          isPublishing: false,
          lastPublishSuccess: true,
        },
      }));
    } catch (error) {
      // Handle error
    }
  }, [state, validation]);
  
  return {
    // ... existing returns ...
    switchMode,
    loadLesson,
    hasChanges,
    revertChanges,
    updateLesson,
  };
};
```

---

## UI/UX Flow

### User Journey: Editing an Existing Lesson

1. **Entry Point**:
   - User opens Lesson Builder
   - Sees mode selector: "Create New" / "Edit Existing"
   - Selects "Edit Existing"

2. **Lesson Selection**:
   - Lesson Browser appears
   - User can:
     - Choose source (Local, LSCS Depot, etc.)
     - Search by title, tags, or content
     - Filter by difficulty, LSCS level
     - Sort by date, title, character count
   - Click "Edit" on a lesson card

3. **Load Lesson**:
   - Loading indicator appears
   - Lesson data fetched from GitHub
   - Form populated with lesson data
   - Edit mode header shows lesson info and source

4. **Edit Content**:
   - User modifies any fields (title, content, vocabulary)
   - Real-time validation continues
   - Change indicator shows "3 fields modified"
   - Auto-save to localStorage (as draft)

5. **Preview Changes**:
   - User clicks "Preview Changes"
   - Change Tracker modal appears
   - Shows diff with color coding:
     - Green: Added
     - Red: Removed
     - Yellow: Modified
   - Auto-generated commit message (editable)

6. **Update Lesson**:
   - User clicks "Update on GitHub"
   - Confirmation dialog with change summary
   - Update pushed to GitHub with proper SHA
   - Success message with link to view on GitHub

7. **Post-Update**:
   - Original lesson updated to reflect changes
   - "Dirty" flag cleared
   - User can continue editing or return to browser

### User Journey: Creating a New Lesson

- Unchanged from current workflow
- Mode selector set to "Create New"
- Form starts empty
- "Publish to GitHub" button (not "Update")

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create `githubFetchService.ts`
- [ ] Implement `fetchLesson()` and `fetchManifest()`
- [ ] Create `lessonDiffService.ts`
- [ ] Implement diff calculation logic
- [ ] Enhance `LessonBuilderState` types
- [ ] Add mode management to `useLessonBuilder`

### Phase 2: UI Components (Week 2)
- [ ] Create `ModeSelector.tsx`
- [ ] Create `LessonBrowser.tsx` with basic listing
- [ ] Enhance `LessonForm.tsx` for edit mode
- [ ] Add edit mode header and action bar
- [ ] Implement lesson loading flow

### Phase 3: Change Tracking (Week 3)
- [ ] Create `ChangeTracker.tsx`
- [ ] Implement diff visualization
- [ ] Add commit message generation
- [ ] Integrate with GitHub update flow
- [ ] Add revert functionality

### Phase 4: Advanced Features (Week 4)
- [ ] Add search and filtering to browser
- [ ] Implement lesson preview
- [ ] Add conflict detection
- [ ] Add version history view (stretch goal)
- [ ] Optimize performance for large lesson sets

### Phase 5: Testing & Polish (Week 5)
- [ ] Unit tests for services
- [ ] Integration tests for edit flow
- [ ] E2E tests for complete workflow
- [ ] Documentation updates
- [ ] User feedback and refinement

---

## Technical Considerations

### 1. GitHub API Rate Limiting

**Problem**: Fetching many lessons could hit rate limits.

**Solutions**:
- Implement caching layer (localStorage + TTL)
- Paginate lesson browser (load 20 at a time)
- Use conditional requests (ETags)
- Show rate limit status in UI

```typescript
interface CachedLesson {
  lesson: Lesson;
  cachedAt: number;
  etag?: string;
  ttl: number; // Time to live in ms
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedLesson(path: string): Lesson | null {
  const cached = localStorage.getItem(`lesson-cache-${path}`);
  if (!cached) return null;
  
  const { lesson, cachedAt, ttl }: CachedLesson = JSON.parse(cached);
  
  if (Date.now() - cachedAt > ttl) {
    localStorage.removeItem(`lesson-cache-${path}`);
    return null;
  }
  
  return lesson;
}
```

### 2. Merge Conflicts

**Problem**: Lesson may have been updated by another user.

**Solutions**:
- Check SHA before update (GitHub will reject if mismatch)
- Show conflict message with options:
  - Pull latest version and retry
  - Force update (override)
  - Merge manually
- Store both versions in localStorage
- Provide side-by-side comparison

```typescript
export async function updateLessonSafely(
  lesson: Lesson,
  expectedSha: string
): Promise<UpdateResult> {
  try {
    return await updateLessonOnGitHub(lesson, expectedSha);
  } catch (error) {
    if (error.message.includes('SHA mismatch')) {
      // Conflict detected
      const latestLesson = await fetchLesson(/* ... */);
      const latestSha = await getFileSha(/* ... */);
      
      return {
        success: false,
        conflict: true,
        localVersion: lesson,
        remoteVersion: latestLesson,
        remoteSha: latestSha,
      };
    }
    throw error;
  }
}
```

### 3. Large Lesson Sets

**Problem**: Loading hundreds of lessons is slow.

**Solutions**:
- Virtual scrolling in lesson browser
- Load manifests in background (Web Workers)
- Progressive enhancement (load on scroll)
- Filter lessons server-side when possible

### 4. Offline Support

**Problem**: Users may lose internet during editing.

**Solutions**:
- Continue using localStorage auto-save
- Queue updates when offline
- Show offline indicator
- Sync when connection restored

### 5. Multi-Source Complexity

**Problem**: Different sources may have different structures.

**Solutions**:
- Normalize lesson format in fetch service
- Handle missing fields gracefully
- Show source-specific metadata
- Allow source-specific filters

---

## Security Considerations

### 1. Authentication

- Use environment variable tokens (existing pattern)
- Never expose tokens in client code
- Use Vercel environment variables for production

### 2. Authorization

- Check write permissions before showing edit option
- Validate lesson ownership if multi-user
- Respect repository branch protection rules

### 3. Input Validation

- Sanitize lesson content before saving
- Validate against schema before update
- Prevent injection attacks in search

### 4. Rate Limiting

- Respect GitHub API rate limits
- Implement exponential backoff
- Show clear error messages

---

## Testing Strategy

### Unit Tests

```typescript
// Test diff calculation
describe('lessonDiffService', () => {
  it('should detect vocabulary additions', () => {
    const original = createLesson({ vocabulary: [/* ... */] });
    const modified = createLesson({ vocabulary: [/* ... more items */] });
    
    const diff = calculateDiff(original, modified);
    
    expect(diff.vocabularyAdded.length).toBe(2);
  });
  
  it('should generate appropriate commit messages', () => {
    const diff = createDiff({ vocabularyAdded: [/* ... */] });
    
    const message = generateCommitMessage(diff);
    
    expect(message).toContain('Add 2 vocabulary items');
  });
});

// Test GitHub fetch
describe('githubFetchService', () => {
  it('should fetch and decode lesson content', async () => {
    mockFetch({ content: btoa(JSON.stringify(mockLesson)) });
    
    const lesson = await fetchLesson('owner', 'repo', 'path');
    
    expect(lesson.id).toBe(mockLesson.id);
  });
});
```

### Integration Tests

```typescript
describe('Edit Lesson Flow', () => {
  it('should load lesson from GitHub', async () => {
    render(<App />);
    
    // Switch to edit mode
    fireEvent.click(screen.getByText('Edit Existing'));
    
    // Select lesson
    await waitFor(() => screen.getByText('Basic Greetings'));
    fireEvent.click(screen.getByText('Edit'));
    
    // Verify form populated
    expect(screen.getByLabelText('Title')).toHaveValue('Basic Greetings');
  });
  
  it('should track and display changes', async () => {
    // ... load lesson ...
    
    // Make change
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Title' }
    });
    
    // Check change indicator
    expect(screen.getByText(/1 field modified/)).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
test('complete edit workflow', async ({ page }) => {
  await page.goto('/lesson-builder');
  
  // Switch to edit mode
  await page.click('text=Edit Existing');
  
  // Search for lesson
  await page.fill('[placeholder="Search lessons..."]', 'greetings');
  await page.click('text=Basic Greetings >> text=Edit');
  
  // Modify content
  await page.fill('[name="title"]', 'Advanced Greetings');
  
  // Preview changes
  await page.click('text=Preview Changes');
  await expect(page.locator('text=Modified Fields:')).toBeVisible();
  
  // Update
  await page.click('text=Update on GitHub');
  await expect(page.locator('text=updated successfully')).toBeVisible();
});
```

---

## Documentation Updates

### Files to Update

1. **lesson-builder/README.md**
   - Add section on editing lessons
   - Update screenshots
   - Add workflow diagram

2. **lesson-builder/SOFTWARE_REQUIREMENTS.md**
   - Update scope to include editing
   - Add new user stories
   - Update constraints

3. **SUMMARY.md**
   - Update Lesson Builder section
   - Add edit workflow description
   - Update feature list

### New Documentation

1. **EDIT_EXISTING_LESSON_GUIDE.md** (User guide)
   - How to find lessons
   - How to make edits
   - How to preview changes
   - How to handle conflicts

2. **API.md** (Developer reference)
   - GitHub fetch service API
   - Lesson diff service API
   - Enhanced hook methods

---

## Success Metrics

### User Experience
- Time to find and load a lesson < 5 seconds
- Edit workflow feels familiar to create workflow
- Zero data loss from conflicts
- Clear feedback on all actions

### Performance
- Lesson browser loads in < 2 seconds
- Search results appear in < 1 second
- Diff calculation completes in < 500ms
- Update pushes to GitHub in < 3 seconds

### Quality
- 90%+ unit test coverage for new services
- Zero critical bugs in edit flow
- All edge cases handled gracefully
- Comprehensive error messages

---

## Future Enhancements

### Short-term
- Version history viewer
- Side-by-side diff view
- Batch editing (multiple lessons)
- Template creation from existing lessons

### Long-term
- Collaborative editing (real-time)
- Pull request workflow (approval process)
- Automated conflict resolution
- AI-powered suggestions for improvements
- Integration with translation services
- Lesson analytics (view count, study time)

---

## Appendix

### Example: Complete Edit Flow Code

```typescript
// User clicks "Edit" on lesson in browser
const handleLessonEdit = async (lessonItem: LessonListItem) => {
  try {
    // Show loading
    setLoading(true);
    
    // Fetch full lesson (may only have metadata from browser)
    const lesson = await fetchLesson(
      lessonItem.source.owner,
      lessonItem.source.repo,
      lessonItem.source.path
    );
    
    // Get SHA for updates
    const sha = await getFileSha(
      lessonItem.source.owner,
      lessonItem.source.repo,
      lessonItem.source.path
    );
    
    // Load into form
    loadLesson(lesson, lessonItem.source, sha);
    
    // Close browser
    setBrowserOpen(false);
    
  } catch (error) {
    showError('Failed to load lesson: ' + error.message);
  } finally {
    setLoading(false);
  }
};

// User clicks "Update on GitHub"
const handleUpdate = async () => {
  try {
    // Validate
    if (!validation.isValid) {
      showError('Please fix validation errors');
      return;
    }
    
    // Check for changes
    const currentLesson = generateLesson();
    const diff = calculateDiff(originalLesson!, currentLesson);
    
    if (!hasChanges(diff)) {
      showInfo('No changes to save');
      return;
    }
    
    // Show preview
    const confirmed = await showChangePreview(diff);
    if (!confirmed) return;
    
    // Update
    setPublishing(true);
    const result = await updateLessonOnGitHub(
      currentLesson,
      lscsLevel,
      originalSha!,
      customCommitMessage || generateCommitMessage(diff)
    );
    
    if (result.success) {
      showSuccess('Lesson updated successfully!');
      
      // Update state
      setOriginalLesson(currentLesson);
      setOriginalSha(result.sha);
      setDirty(false);
    }
    
  } catch (error) {
    if (error.conflict) {
      handleConflict(error);
    } else {
      showError('Failed to update: ' + error.message);
    }
  } finally {
    setPublishing(false);
  }
};
```

---

## Conclusion

This design provides a comprehensive solution for editing existing lessons in the Lesson Builder while maintaining the simplicity and usability of the current creation workflow. The phased implementation approach allows for iterative development and testing, ensuring a robust and user-friendly feature.

**Key Benefits**:
- Unified UI for create and edit workflows
- Comprehensive change tracking and preview
- Safe updates with conflict detection
- Multi-source lesson browsing
- Maintains all existing functionality

**Next Steps**:
1. Review and approve design
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on user feedback

---

**Document Version**: 1.0  
**Author**: GitHub Copilot  
**Date**: November 29, 2025  
**Status**: Ready for Review
