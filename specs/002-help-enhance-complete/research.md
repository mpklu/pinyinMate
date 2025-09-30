# Research: Enhanced Library and Lesson System

**Date**: September 29, 2025  
**Feature**: Enhanced Library and Lesson System  
**Phase**: 0 - Research

## Research Scope

Based on the Technical Context, all key technologies and approaches are well-defined with no NEEDS CLARIFICATION items. This research focuses on validating best practices for the identified technologies and integration patterns.

## Key Research Areas

### 1. Remote Lesson Source Management

**Decision**: JSON manifest-based approach with predefined URI list and toggle controls

**Rationale**: 
- Aligns with user requirement for "predefined list with enable/disable toggles only"
- Simplifies security model (no arbitrary URL input)
- Enables curated content quality control
- Supports offline fallback with cached manifests

**Alternatives Considered**:
- Manual URL entry: Rejected due to security concerns and UX complexity
- File upload configuration: Rejected due to increased cognitive load
- Dynamic discovery: Rejected due to content quality concerns

**Implementation Approach**:
```typescript
// public/config/remote-sources.json
{
  "sources": [
    {
      "id": "hsk-official",
      "name": "HSK Official Lessons",
      "url": "https://api.hsk.example.com/lessons/manifest.json",
      "enabled": true,
      "description": "Official HSK curriculum lessons"
    }
  ]
}
```

### 2. Sentence-Level Audio Segmentation

**Decision**: Runtime text segmentation using Chinese punctuation markers with Web Speech API

**Rationale**:
- Supports user requirement for "sentence-by-sentence" audio playback
- No pre-processing required in lesson data (keeps data simple)
- Works with existing `pinyin-pro` library for text analysis
- Web Speech API provides consistent cross-browser support

**Alternatives Considered**:
- Paragraph-level chunking: Rejected per user clarification
- Pre-segmented audio files: Rejected to maintain simple lesson data format
- Manual segment markers: Rejected due to content creation complexity

**Implementation Approach**:
```typescript
// Segment Chinese text by sentence boundaries
const segmentText = (text: string): string[] => {
  return text.split(/[。！？；]/).filter(segment => segment.trim().length > 0);
};
```

### 3. Multi-Modal Quiz Generation

**Decision**: Rule-based question generation supporting multiple choice, fill-in-the-blank, and audio recognition

**Rationale**:
- Covers user requirement for "multiple choice + fill-in-the-blank + audio recognition"
- Leverages existing vocabulary data structure
- No external AI dependencies required
- Deterministic and predictable question quality

**Alternatives Considered**:
- AI-generated questions: Rejected due to consistency and offline requirements
- Single question type: Rejected per user clarification
- Manual question authoring: Rejected to maintain simple lesson data format

**Implementation Approach**:
```typescript
interface QuizQuestion {
  type: 'multiple-choice' | 'fill-blank' | 'audio-recognition';
  question: string;
  options?: string[];
  correctAnswer: string;
  audioPrompt?: string;
}
```

### 4. Flashcard Navigation Pattern

**Decision**: Linear navigation with next/previous controls only

**Rationale**:
- Matches user requirement for "linear only (next/previous buttons, no skipping)"
- Simplifies cognitive load (constitution principle II)
- Ensures complete vocabulary coverage
- Reduces implementation complexity

**Alternatives Considered**:
- Grid view navigation: Rejected per user clarification
- Adaptive ordering: Rejected per user clarification
- Jump-to-card functionality: Rejected per user clarification

**Implementation Approach**:
```typescript
interface FlashcardDeckState {
  cards: Flashcard[];
  currentIndex: number;
  totalCards: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
}
```

### 5. Error Handling for Remote Sources

**Decision**: Fail-fast with user notification and source exclusion

**Rationale**:
- Matches user requirement to "show error message and skip that source entirely"
- Prevents degraded user experience from partial failures
- Clear user feedback about unavailable content
- Maintains app stability with working sources

**Alternatives Considered**:
- Retry mechanisms: Rejected per user clarification
- Stale content fallback: Rejected per user clarification
- Silent failure: Rejected due to poor UX

**Implementation Approach**:
```typescript
interface LibraryLoadResult {
  successfulSources: Library[];
  failedSources: SourceError[];
  totalAttempted: number;
}
```

## Technology Integration Validation

### React 19 + Material-UI v5 Compatibility
- **Status**: ✅ Confirmed compatible
- **Evidence**: Current project successfully uses React 19.1.1 with MUI 7.3.2
- **Implementation note**: Use MUI's responsive breakpoints for mobile-first design

### TypeScript 5.8+ Strict Mode
- **Status**: ✅ Confirmed configured
- **Evidence**: `tsconfig.json` shows strict mode enabled
- **Implementation note**: All new types defined with strict interfaces

### Web Speech API Cross-Browser Support
- **Status**: ✅ Confirmed sufficient for target platforms
- **Evidence**: Chrome, Safari, Firefox support with graceful degradation
- **Implementation note**: Provide visual fallback when audio unavailable

### Performance Budget Compliance
- **Status**: ✅ Design supports performance goals
- **Evidence**: JSON-based lesson loading, code splitting ready, no heavy dependencies
- **Implementation note**: Lazy load lesson content, cache pinyin generation results

## Research Conclusions

All technical approaches validated as feasible within constitutional constraints. No additional research required - ready for Phase 1 design.

## Open Questions Resolved

1. ❓ **Remote source authentication**: Not required - all sources assumed public
2. ❓ **Lesson data versioning**: Out of scope - simple static files sufficient  
3. ❓ **Offline lesson caching**: Leverages browser cache, no explicit caching layer needed
4. ❓ **Audio synthesis quality**: Web Speech API sufficient for pronunciation guidance

**Status**: ✅ Research complete - All unknowns resolved