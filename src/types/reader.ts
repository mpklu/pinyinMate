/**
 * Reader Mode Types
 * Type definitions for the enhanced reading experience
 */

// Reader mode themes for comfortable reading
export type ReaderTheme = 
  | 'default'    // Standard light theme
  | 'dark'       // Dark mode for low-light reading
  | 'sepia'      // Warm sepia for reduced eye strain
  | 'highContrast'; // High contrast for accessibility

// Pinyin display modes
export type PinyinDisplayMode = 
  | 'hidden'     // No pinyin shown
  | 'toneMarks'  // Pinyin with tone marks (mā, má, mǎ, mà)
  | 'numbers';   // Pinyin with tone numbers (ma1, ma2, ma3, ma4)

// Auto-scroll speed settings
export type AutoScrollSpeed = 
  | 0.75         // Slower reading pace
  | 1.0          // Normal reading pace  
  | 1.25;        // Faster reading pace

// Reader mode state interface
export interface ReaderState {
  /** Whether reader mode is currently active */
  isActive: boolean;
  
  /** Current reading theme */
  theme: ReaderTheme;
  
  /** Pinyin display setting */
  pinyinMode: PinyinDisplayMode;
  
  /** Whether tone colors are enabled */
  showToneColors: boolean;
  
  /** Auto-scroll configuration */
  autoScroll: {
    /** Whether auto-scroll is enabled */
    enabled: boolean;
    /** Current scroll speed multiplier */
    speed: AutoScrollSpeed;
    /** Whether scrolling is currently paused */
    paused: boolean;
  };
  
  /** Current reading progress */
  progress: {
    /** Current segment index being viewed */
    currentSegmentIndex: number;
    /** Total number of segments */
    totalSegments: number;
    /** Reading progress as percentage (0-100) */
    progressPercentage: number;
  };
}

// Reader preferences that persist across sessions
export interface ReaderPreferences {
  /** Preferred theme */
  defaultTheme: ReaderTheme;
  /** Preferred pinyin mode */
  defaultPinyinMode: PinyinDisplayMode;
  /** Whether to show tone colors by default */
  defaultShowToneColors: boolean;
  /** Default auto-scroll speed */
  defaultAutoScrollSpeed: AutoScrollSpeed;
  /** Font size preference (0.8 - 1.5) */
  fontSize: number;
  /** Line height preference (1.2 - 2.0) */
  lineHeight: number;
}

// Enhanced text segment for reader mode
export interface ReaderSegment {
  /** Unique segment identifier */
  id: string;
  /** Chinese text content */
  text: string;
  /** Pinyin with tone marks */
  pinyin?: string;
  /** Pinyin with tone numbers */
  pinyinNumbers?: string;
  /** Segment position in original text */
  position: {
    start: number;
    end: number;
  };
  /** Whether this segment is currently being read */
  isActive?: boolean;
  /** Whether audio is available for this segment */
  hasAudio?: boolean;
  /** Whether this segment has been read */
  hasBeenRead?: boolean;
  /** Vocabulary words found in this segment */
  vocabularyReferences?: Array<{
    word: string;
    definition: string;
    startIndex: number;
    endIndex: number;
  }>;
}

// Props for reader components
export interface ReaderControlsProps {
  /** Current reader state */
  readerState: ReaderState;
  /** Current reader preferences */
  readerPreferences: ReaderPreferences;
  /** Callback when reader mode is toggled */
  onToggleReaderMode: () => void;
  /** Callback when theme changes */
  onThemeChange: (theme: ReaderTheme) => void;
  /** Callback when pinyin mode changes */
  onPinyinModeChange: (mode: PinyinDisplayMode) => void;
  /** Callback when tone colors toggle */
  onToggleToneColors: () => void;
  /** Callback when auto-scroll toggles */
  onToggleAutoScroll: () => void;
  /** Callback when auto-scroll speed changes */
  onAutoScrollSpeedChange: (speed: AutoScrollSpeed) => void;
  /** Callback when font size changes */
  onFontSizeChange: (fontSize: number) => void;
}

export interface ReadingSegmentProps {
  /** Segment data to display */
  segment: ReaderSegment;
  /** Current reader theme */
  theme: ReaderTheme;
  /** Pinyin display mode */
  pinyinMode: PinyinDisplayMode;
  /** Whether to show tone colors */
  showToneColors: boolean;
  /** Font size multiplier */
  fontSize: number;
  /** Line height multiplier */
  lineHeight: number;
  /** Whether this segment is currently active/highlighted */
  isActive?: boolean;
  /** Whether audio is currently playing for this segment */
  isPlaying?: boolean;
  /** Callback when segment is clicked */
  onClick?: (segmentId: string) => void;
  /** Callback when audio play is requested */
  onPlayAudio?: (segmentId: string, text: string) => void;
  /** Callback when vocabulary is clicked */
  onVocabularyClick?: (word: string, definition: string) => void;
}

export interface ReaderViewProps {
  /** Segments to display */
  segments: ReaderSegment[];
  /** Current reader state */
  readerState: ReaderState;
  /** Font size multiplier */
  fontSize: number;
  /** Line height multiplier */
  lineHeight: number;
  /** Currently playing audio segment ID */
  playingAudioId?: string;
  /** Callback when segment is selected */
  onSegmentSelect: (segmentId: string, index: number) => void;
  /** Callback when audio play is requested */
  onPlayAudio: (segmentId: string, text: string) => void;
  /** Callback when reading progress changes */
  onProgressChange: (segmentIndex: number) => void;
}

// Action types for reader state management
export type ReaderAction =
  | { type: 'TOGGLE_READER_MODE' }
  | { type: 'SET_THEME'; payload: ReaderTheme }
  | { type: 'SET_PINYIN_MODE'; payload: PinyinDisplayMode }
  | { type: 'TOGGLE_TONE_COLORS' }
  | { type: 'TOGGLE_AUTO_SCROLL' }
  | { type: 'SET_AUTO_SCROLL_SPEED'; payload: AutoScrollSpeed }
  | { type: 'PAUSE_AUTO_SCROLL' }
  | { type: 'RESUME_AUTO_SCROLL' }
  | { type: 'SET_CURRENT_SEGMENT'; payload: number }
  | { type: 'UPDATE_PROGRESS'; payload: { currentSegmentIndex: number; totalSegments: number } }
  | { type: 'MARK_SEGMENT_READ'; payload: string };