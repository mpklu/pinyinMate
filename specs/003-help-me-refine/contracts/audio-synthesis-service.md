# Audio Synthesis Service Contract

**Service**: Enhanced Audio Synthesis Service  
**Purpose**: Provide Chinese text-to-speech for lesson content with segment-level audio  
**Extends**: Existing `AudioService` interface

## Interface Definition

```typescript
interface EnhancedAudioSynthesisService {
  /**
   * Generate audio for lesson text segments
   */
  synthesizeLessonAudio(
    segments: TextSegmentWithAudio[],
    options: AudioSynthesisOptions
  ): Promise<AudioSynthesisResult>;

  /**
   * Generate audio for individual vocabulary word
   */
  synthesizeVocabularyAudio(
    word: string,
    pinyin: string,
    options: AudioSynthesisOptions
  ): Promise<VocabularyAudioResult>;

  /**
   * Play audio for specific segment or vocabulary
   */
  playSegmentAudio(
    segmentId: string,
    options?: AudioPlaybackOptions
  ): Promise<AudioPlaybackResult>;

  /**
   * Get audio synthesis capabilities and status
   */
  getAudioCapabilities(): Promise<AudioCapabilities>;

  /**
   * Preload audio for lesson segments
   */
  preloadLessonAudio(
    lessonId: string,
    segments: TextSegmentWithAudio[]
  ): Promise<PreloadResult>;
}
```

## Request/Response Schemas

### AudioSynthesisRequest
```typescript
interface AudioSynthesisRequest {
  segments: TextSegmentWithAudio[];
  options: AudioSynthesisOptions;
}

interface AudioSynthesisOptions {
  voice: 'male' | 'female' | 'auto';
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  language: 'zh-CN' | 'zh-TW';
  quality: 'low' | 'medium' | 'high';
  cacheAudio: boolean;
}
```

### AudioSynthesisResponse
```typescript
interface AudioSynthesisResult {
  success: boolean;
  audioSegments: AudioSegmentResult[];
  synthesisTime: number;
  cachedCount: number;
  errors?: AudioSynthesisError[];
}

interface AudioSegmentResult {
  segmentId: string;
  audioId: string;
  audioUrl?: string; // Blob URL for playback
  duration: number; // milliseconds
  synthesisTime: number;
  cached: boolean;
}
```

### VocabularyAudioRequest
```typescript
interface VocabularyAudioRequest {
  word: string;
  pinyin: string; 
  options: AudioSynthesisOptions;
}
```

### VocabularyAudioResponse
```typescript
interface VocabularyAudioResult {
  success: boolean;
  word: string;
  audioId: string;
  audioUrl?: string;
  duration: number;
  synthesisTime: number;
  error?: string;
}
```

### AudioPlaybackRequest
```typescript
interface AudioPlaybackRequest {
  segmentId: string;
  options?: AudioPlaybackOptions;
}

interface AudioPlaybackOptions {
  startTime?: number; // milliseconds
  endTime?: number; // milliseconds
  loop?: boolean;
  volume?: number; // 0.0 - 1.0
  onEnd?: () => void;
  onError?: (error: string) => void;
}
```

### AudioPlaybackResponse
```typescript
interface AudioPlaybackResult {
  success: boolean;
  playbackId: string;
  duration: number;
  playing: boolean;
  error?: string;
}
```

## Capabilities and Status

### AudioCapabilities
```typescript
interface AudioCapabilities {
  webSpeechAvailable: boolean;
  supportedLanguages: string[];
  supportedVoices: VoiceInfo[];
  maxTextLength: number;
  supportsCaching: boolean;
  supportsPreload: boolean;
}

interface VoiceInfo {
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  quality: 'low' | 'medium' | 'high';
}
```

### PreloadRequest
```typescript
interface PreloadRequest {
  lessonId: string;
  segments: TextSegmentWithAudio[];
  priority: 'high' | 'medium' | 'low';
}
```

### PreloadResponse
```typescript
interface PreloadResult {
  success: boolean;
  lessonId: string;
  preloadedCount: number;
  totalSegments: number;
  preloadTime: number;
  errors?: string[];
}
```

## Error Handling

```typescript
interface AudioSynthesisError {
  code: 'WEB_SPEECH_UNAVAILABLE' | 'TEXT_TOO_LONG' | 'INVALID_LANGUAGE' | 'SYNTHESIS_FAILED' | 'PLAYBACK_ERROR';
  message: string;
  segmentId?: string;
  details?: {
    textLength?: number;
    maxLength?: number;
    browserSupport?: boolean;
  };
}
```

## Validation Rules

### Input Validation
- `segments`: Must be valid `TextSegmentWithAudio` array
- `word`: 1-50 characters, Chinese characters only
- `pinyin`: Must be valid pinyin romanization
- `speed`: 0.5-2.0 range, default 1.0
- `pitch`: 0.5-2.0 range, default 1.0
- `volume`: 0.0-1.0 range, default 1.0

### Output Validation
- `audioUrl`: Must be valid Blob URL when provided
- `duration`: Positive number in milliseconds
- `synthesisTime`: Non-negative processing time
- Audio quality must match requested quality level

## Performance Requirements

- **Synthesis Time**: < 500ms per text segment under 100 characters
- **Memory Usage**: < 10MB audio cache per lesson
- **Concurrent Playback**: Support up to 3 simultaneous audio streams
- **Cache Duration**: Audio cache valid for 1 hour
- **Preload Time**: < 2 seconds for lessons up to 20 segments

## Browser Compatibility

### Web Speech API Support
- **Chrome**: Full support with high-quality Chinese voices
- **Firefox**: Limited support, fallback to basic synthesis  
- **Safari**: Partial support, may require user interaction
- **Mobile**: Variable support, test on target devices

### Fallback Strategy
- Primary: Web Speech API with Chinese language pack
- Fallback: Basic browser TTS with phonetic approximation
- Error: Silent mode with visual-only feedback

## Dependencies

- **Web Speech API**: Browser native text-to-speech
- **TextSegmentationService**: For audio segment preparation
- **PinyinService**: For pronunciation validation
- **Performance Monitoring**: For synthesis metrics
- **Error Handling Service**: For graceful failure management