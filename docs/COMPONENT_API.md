# Enhanced Interactive Lesson Learning Components API

## Overview

This document provides comprehensive API documentation for all components in the Enhanced Interactive Lesson Learning Experience. The components follow atomic design principles and are organized into atoms, molecules, organisms, and templates.

## Table of Contents

- [Atomic Components](#atomic-components)
- [Molecular Components](#molecular-components)
- [Organism Components](#organism-components)
- [Template Components](#template-components)
- [Usage Examples](#usage-examples)
- [Accessibility Features](#accessibility-features)
- [Performance Considerations](#performance-considerations)

## Atomic Components

### AudioSegmentButton

Interactive text segment with audio playback functionality.

**Props:**
```typescript
interface AudioSegmentButtonProps {
  segmentId: string;           // Unique identifier for the text segment
  text: string;                // Chinese text content
  pinyin?: string;             // Pinyin pronunciation
  audioReady: boolean;         // Whether audio is ready to play
  selected?: boolean;          // Whether the segment is currently selected/highlighted
  clickable?: boolean;         // Whether the segment is clickable
  onSegmentClick?: (segmentId: string) => void;  // Callback when segment is clicked
  onPlayAudio?: (segmentId: string) => void;     // Callback when audio play is requested
  tooltip?: string;            // Optional tooltip content
  size?: 'small' | 'medium' | 'large';  // Display size variant
}
```

**Usage:**
```jsx
<AudioSegmentButton
  segmentId="segment-1"
  text="你好"
  pinyin="nǐ hǎo"
  audioReady={true}
  onSegmentClick={(id) => console.log('Clicked:', id)}
  onPlayAudio={(id) => playAudio(id)}
  tooltip="Hello - greeting"
/>
```

**Accessibility:**
- Full keyboard navigation support
- Screen reader announcements for audio state
- ARIA labels for buttons and interactive elements
- Focus management

### VocabularyHighlight

Highlights vocabulary words within text segments with interactive popover definitions.

**Props:**
```typescript
interface VocabularyHighlightProps {
  word: string;                // The vocabulary word to highlight
  vocabularyEntry?: VocabularyEntryWithPinyin;  // Vocabulary entry with detailed information
  difficulty?: DifficultyLevel;    // Difficulty level for color coding
  active?: boolean;            // Whether the highlight is active/selected
  clickable?: boolean;         // Whether the vocabulary is clickable
  onVocabularyClick?: (word: string, entry?: VocabularyEntryWithPinyin) => void;
  variant?: 'underline' | 'background' | 'border';  // Display variant
  size?: 'small' | 'medium' | 'large';   // Size variant
  showPopover?: boolean;       // Show popover on hover
}
```

**Usage:**
```jsx
<VocabularyHighlight
  word="你好"
  vocabularyEntry={vocabularyData}
  difficulty="beginner"
  showPopover={true}
  onVocabularyClick={(word, entry) => showDefinition(word, entry)}
/>
```

### ProgressTracker

Visual progress indicator for lesson completion and study progress.

**Props:**
```typescript
interface ProgressTrackerProps {
  current: number;             // Current progress value
  total: number;               // Total progress value
  variant?: 'linear' | 'circular';  // Display variant
  showPercentage?: boolean;    // Show percentage text
  showLabel?: boolean;         // Show progress label
  label?: string;              // Custom progress label
  color?: 'primary' | 'secondary' | 'success';  // Color theme
  size?: 'small' | 'medium' | 'large';  // Size variant
}
```

### StudyToolButton

Action button for generating and accessing study tools (flashcards, quizzes).

**Props:**
```typescript
interface StudyToolButtonProps {
  toolType: StudyToolType;     // Type of study tool ('flashcard' | 'quiz')
  lessonId: string;            // Lesson identifier
  disabled?: boolean;          // Whether button is disabled
  loading?: boolean;           // Whether tool is being generated
  count?: number;              // Number of items (flashcards/questions)
  onGenerate?: (toolType: StudyToolType, lessonId: string) => void;
  onOpen?: (toolType: StudyToolType, lessonId: string) => void;
  variant?: 'contained' | 'outlined' | 'text';  // Button variant
  size?: 'small' | 'medium' | 'large';  // Button size
}
```

## Molecular Components

### TextSegmentDisplay

Interactive text display combining vocabulary highlighting and audio controls.

**Props:**
```typescript
interface TextSegmentDisplayProps {
  segment: TextSegmentWithAudio;      // The text segment to display
  vocabularyMap?: Map<string, VocabularyEntryWithPinyin>;  // Vocabulary entries for highlighting
  selected?: boolean;                 // Whether the segment is currently selected
  showPinyin?: boolean;              // Whether to show pinyin
  enableVocabularyHighlight?: boolean; // Whether to enable vocabulary highlighting
  onSegmentClick?: (segmentId: string) => void;
  onVocabularyClick?: (word: string, entry?: VocabularyEntryWithPinyin) => void;
  onPlayAudio?: (segmentId: string) => void;
}
```

### AudioControls

Comprehensive audio control panel with playback, speed, and progress controls.

**Props:**
```typescript
interface AudioControlsProps {
  audioUrl?: string;           // Audio source URL
  isPlaying?: boolean;         // Current playback state
  currentTime?: number;        // Current playback position
  duration?: number;           // Total audio duration
  playbackRate?: number;       // Playback speed (0.5 - 2.0)
  repeatMode?: RepeatMode;     // Repeat mode ('none' | 'one' | 'all')
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onSpeedChange?: (rate: number) => void;
  onRepeatModeChange?: (mode: RepeatMode) => void;
}
```

### StudyToolsPanel

Panel for generating and accessing flashcards and quizzes.

**Props:**
```typescript
interface StudyToolsPanelProps {
  lessonId: string;
  availableTools: StudyToolType[];
  onGenerateFlashcards?: (options: FlashcardGenerationOptions) => void;
  onGenerateQuiz?: (options: QuizGenerationOptions) => void;
  onOpenStudyTool?: (toolType: StudyToolType, lessonId: string) => void;
  generationStatus?: {
    [key in StudyToolType]?: 'idle' | 'generating' | 'completed' | 'error';
  };
}
```

### EnhancedLessonCard

Enhanced lesson card with preview functionality and action buttons.

**Props:**
```typescript
interface EnhancedLessonCardProps {
  lesson: EnhancedLesson;
  showPreview?: boolean;
  showActions?: boolean;
  onStartLesson?: (lessonId: string) => void;
  onPreviewLesson?: (lessonId: string) => void;
  onBookmarkLesson?: (lessonId: string) => void;
  compact?: boolean;
}
```

## Organism Components

### LessonContent

Main lesson study interface combining text, audio, and progress tracking.

**Props:**
```typescript
interface LessonContentProps {
  lesson: EnhancedLesson;
  progress: LessonStudyProgress;
  showPinyin?: boolean;
  enableVocabularyHighlight?: boolean;
  onProgressUpdate?: (progress: LessonStudyProgress) => void;
  onVocabularyClick?: (word: string, entry?: VocabularyEntryWithPinyin) => void;
  onSegmentComplete?: (segmentId: string) => void;
}
```

### LessonErrorBoundary

Error boundary component for graceful error handling.

**Props:**
```typescript
interface LessonErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}
```

## Template Components

### LessonPage

Complete lesson study page template with routing and state management.

**Features:**
- Full lesson loading and display
- Progress tracking and persistence
- Audio controls integration
- Error handling with boundaries
- Responsive design
- Accessibility compliance

## Usage Examples

### Basic Lesson Study Setup

```jsx
import { LessonPage, LessonErrorBoundary } from '../components';

function App() {
  return (
    <LessonErrorBoundary>
      <LessonPage />
    </LessonErrorBoundary>
  );
}
```

### Custom Lesson Content

```jsx
import { LessonContent, AudioControls, StudyToolsPanel } from '../components';

function CustomLessonView({ lesson, progress }) {
  return (
    <div>
      <LessonContent
        lesson={lesson}
        progress={progress}
        showPinyin={true}
        enableVocabularyHighlight={true}
        onProgressUpdate={handleProgressUpdate}
      />
      <AudioControls
        audioUrl={lesson.audioUrl}
        onPlay={handlePlay}
        onPause={handlePause}
      />
      <StudyToolsPanel
        lessonId={lesson.id}
        availableTools={['flashcard', 'quiz']}
        onGenerateFlashcards={handleFlashcardGeneration}
      />
    </div>
  );
}
```

## Accessibility Features

All components include:

- **Keyboard Navigation**: Full keyboard support with proper tab order
- **Screen Reader Support**: ARIA labels, descriptions, and live regions
- **Focus Management**: Proper focus handling and restoration
- **Color Contrast**: WCAG AA/AAA compliant color schemes
- **Language Support**: Proper lang attributes for Chinese/English content

### Keyboard Shortcuts

- `Enter/Space`: Activate buttons and interactive elements
- `Arrow Keys`: Navigate between segments/options
- `Escape`: Close popovers and modals
- `Tab/Shift+Tab`: Navigate focusable elements

## Performance Considerations

- **React.memo**: All components are memoized to prevent unnecessary re-renders
- **Code Splitting**: Components are lazy-loaded where appropriate
- **Virtual Scrolling**: Large lists use virtual scrolling for performance
- **Debounced Interactions**: User interactions are debounced to prevent excessive API calls
- **Bundle Optimization**: Tree-shaking enabled, only used components are bundled

### Performance Tips

1. Use `React.memo` for components with expensive renders
2. Implement virtual scrolling for large lesson lists
3. Debounce audio playback requests
4. Cache vocabulary data and lesson content
5. Use proper dependency arrays in `useCallback` and `useMemo`

## Type Definitions

All component props are fully typed with TypeScript. Import types from:

```typescript
import type {
  EnhancedLesson,
  LessonStudyProgress,
  VocabularyEntryWithPinyin,
  TextSegmentWithAudio,
  StudyToolType,
  FlashcardGenerationOptions,
  QuizGenerationOptions
} from '../types';
```

## Error Handling

Components include comprehensive error handling:

- Error boundaries for graceful failure recovery
- Loading states for async operations
- User-friendly error messages
- Retry mechanisms
- Development vs production error displays

## Testing

All components include:

- Unit tests with React Testing Library
- Accessibility testing with jest-axe
- Integration tests for user workflows
- Performance tests for large datasets
- Contract tests for service integration

Run tests with:
```bash
npm run test
npm run test:a11y
npm run test:integration
```