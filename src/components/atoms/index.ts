/**
 * Atomic Components Index
 * Exports all atomic components for easy importing
 */

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Card } from './Card';
export type { CardProps } from './Card';

export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

export { ErrorMessage } from './ErrorMessage';
export type { ErrorMessageProps } from './ErrorMessage';

export { LessonCard } from './LessonCard';

export { CategorySelector } from './CategorySelector';

export { LibrarySourceToggle } from './LibrarySourceToggle';

export { SyncStatusIndicator } from './SyncStatusIndicator';

export { AudioPlayButton } from './AudioPlayButton';

export { SegmentHighlight } from './SegmentHighlight';
export type { SegmentHighlightProps } from './SegmentHighlight';

export { VocabularyTooltip } from './VocabularyTooltip';
export type { VocabularyTooltipProps, VocabularyData } from './VocabularyTooltip';

export { default as ChineseText } from './ChineseText';
export type { ChineseTextProps } from './ChineseText';

export { default as PinyinText } from './PinyinText';
export type { PinyinTextProps } from './PinyinText';

export { default as AudioButton } from './AudioButton';
export type { AudioButtonProps } from './AudioButton';

export { default as DifficultyRating } from './DifficultyRating';
export type { DifficultyRatingProps, DifficultyLevel } from './DifficultyRating';

export { DifficultyBadge } from './DifficultyBadge';
export type { DifficultyLevel as BadgeDifficultyLevel } from './DifficultyBadge';

export { ReaderControls } from './ReaderControls';
export { ReadingSegment } from './ReadingSegment';

// Skeleton components for loading states
export { LessonCardSkeleton } from './LessonCardSkeleton';
export type { LessonCardSkeletonProps } from './LessonCardSkeleton';

export { FlashcardSkeleton } from './FlashcardSkeleton';
export type { FlashcardSkeletonProps } from './FlashcardSkeleton';

export { QuizSkeleton } from './QuizSkeleton';
export type { QuizSkeletonProps } from './QuizSkeleton';

export { TextSegmentSkeleton } from './TextSegmentSkeleton';
export type { TextSegmentSkeletonProps } from './TextSegmentSkeleton';

export { LibraryGridSkeleton } from './LibraryGridSkeleton';
export type { LibraryGridSkeletonProps } from './LibraryGridSkeleton';

// Enhanced Interactive Learning Components
export { default as AudioSegmentButton } from './AudioSegmentButton';
export type { AudioSegmentButtonProps } from './AudioSegmentButton';

export { default as VocabularyHighlight } from './VocabularyHighlight';
export type { VocabularyHighlightProps } from './VocabularyHighlight';

export { default as ProgressTracker } from './ProgressTracker';
export type { ProgressTrackerProps } from './ProgressTracker';

export { default as StudyToolButton } from './StudyToolButton';
export type { StudyToolButtonProps, StudyToolType } from './StudyToolButton';