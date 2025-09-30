# Audio Service Contract

**Service**: AudioService  
**Purpose**: Provide text-to-speech audio playback for Chinese text content

## Interface Definition

```typescript
interface AudioService {
  playText(text: string, language?: string): Promise<void>;
  prepareAudio(text: string, language?: string): Promise<string>;
  stopPlayback(): void;
  isPlaying(): boolean;
  isSupported(): boolean;
  getVoices(): SpeechSynthesisVoice[];
  setVoice(voiceId: string): void;
  setRate(rate: number): void;
  setPitch(pitch: number): void;
}
```

## Data Contracts

### AudioPlaybackOptions
```typescript
interface AudioPlaybackOptions {
  language: string;    // Default: 'zh-CN'
  rate: number;        // Speed: 0.1-10 (default: 1.0)
  pitch: number;       // Pitch: 0-2 (default: 1.0)
  volume: number;      // Volume: 0-1 (default: 1.0)
  voiceId?: string;    // Specific voice selection
}

interface AudioState {
  isPlaying: boolean;
  currentText?: string;
  duration?: number;
  currentTime?: number;
}
```

## Method Contracts

### playText(text, language)
**Purpose**: Immediately play text-to-speech audio for given text

**Input**: 
- `text: string` - Chinese text to speak
- `language?: string` - Language code (default: 'zh-CN')

**Output**: `Promise<void>`

**Behavior**:
1. Stop any current playback
2. Create SpeechSynthesisUtterance with text
3. Apply current voice settings (rate, pitch, volume)
4. Start playback using Web Speech API
5. Promise resolves when playback completes

**Error Handling**:
- Web Speech API not supported: Throw UnsupportedError
- Empty text: Resolve immediately without playback
- Playback interruption: Resolve gracefully
- Voice not available: Use default system voice

### prepareAudio(text, language)
**Purpose**: Pre-generate audio URL for later playback (optimization)

**Input**: 
- `text: string` - Text to prepare
- `language?: string` - Language code

**Output**: `Promise<string>` - Audio URL or identifier

**Behavior**:
1. Create SpeechSynthesisUtterance
2. Apply current settings
3. Generate audio blob (if supported by browser)
4. Create object URL for audio blob
5. Return URL for later use

**Error Handling**:
- Browser doesn't support audio blob creation: Return text as fallback
- Generation failure: Return empty string
- Memory limits: Clean up old URLs

### stopPlayback()
**Purpose**: Stop any currently playing audio

**Input**: None  
**Output**: `void`

**Behavior**:
1. Call speechSynthesis.cancel()
2. Reset playback state
3. Clean up any pending operations

**Error Handling**:
- No active playback: No-op, return silently
- API not available: No-op

### isPlaying()
**Purpose**: Check if audio is currently playing

**Input**: None  
**Output**: `boolean`

**Behavior**:
1. Check speechSynthesis.speaking state
2. Return current playback status

### isSupported()
**Purpose**: Check if Web Speech API is available

**Input**: None  
**Output**: `boolean`

**Behavior**:
1. Check for speechSynthesis global
2. Check for SpeechSynthesisUtterance constructor
3. Return availability status

### getVoices()
**Purpose**: Get available Chinese voices

**Input**: None  
**Output**: `SpeechSynthesisVoice[]`

**Behavior**:
1. Call speechSynthesis.getVoices()
2. Filter for Chinese language voices (zh, zh-CN, zh-TW)
3. Return available voices

**Error Handling**:
- No voices available: Return empty array
- API not supported: Return empty array

### setVoice(voiceId)
**Purpose**: Set preferred voice for playback

**Input**: `voiceId: string` - Voice identifier  
**Output**: `void`

**Behavior**:
1. Find voice by ID in available voices
2. Set as current voice for new utterances
3. Store preference in localStorage

**Error Handling**:
- Voice not found: Use default system voice
- Invalid voiceId: Ignore and keep current settings

### setRate(rate)
**Purpose**: Set speech rate (speed)

**Input**: `rate: number` - Speed multiplier (0.1-10)  
**Output**: `void`

**Behavior**:
1. Clamp rate to valid range
2. Store for future utterances
3. Save preference to localStorage

### setPitch(pitch)  
**Purpose**: Set speech pitch

**Input**: `pitch: number` - Pitch multiplier (0-2)  
**Output**: `void`

**Behavior**:
1. Clamp pitch to valid range
2. Store for future utterances
3. Save preference to localStorage

## Browser Compatibility

### Supported Browsers
- Chrome 33+: Full support
- Safari 7+: Full support  
- Firefox 49+: Full support
- Edge 14+: Full support

### Fallback Strategy
1. Check `isSupported()` before using
2. Provide visual feedback when audio unavailable
3. Show Chinese text prominently as fallback
4. Display "Audio not available" message

## Performance Considerations

### Memory Management
- Limit concurrent audio preparations
- Clean up blob URLs after use
- Maximum 10 prepared audio URLs in memory

### Network Optimization
- No network requests (uses local TTS)
- Offline capability maintained
- No external audio file dependencies

### Latency Optimization
- Audio preparation for predictable content
- Cache voice selection per session
- Immediate playback for short text (<50 characters)

## Configuration Options

### Default Settings
```typescript
const DEFAULT_AUDIO_CONFIG = {
  language: 'zh-CN',
  rate: 1.0,
  pitch: 1.0, 
  volume: 1.0,
  voicePreference: 'female' // when multiple voices available
};
```

### User Preferences
Store in localStorage:
- Preferred voice ID
- Speech rate setting
- Pitch setting
- Audio enabled/disabled state

## Error Types

```typescript
interface AudioServiceError extends Error {
  code: 'UNSUPPORTED' | 'PLAYBACK_FAILED' | 'VOICE_NOT_FOUND' | 'INVALID_TEXT';
  text?: string;
  voiceId?: string;
}
```

## Integration Points

### With LessonService
- Receive text segments for audio preparation
- Provide playback for flashcard pronunciation
- Support quiz audio recognition questions

### With UI Components
- AudioButton component integration
- Playback state management
- Error state communication

## Test Scenarios

1. **Play Chinese text successfully**
2. **Handle unsupported browsers gracefully**
3. **Stop playback mid-speech**
4. **Prepare audio URLs for optimization**
5. **Switch between different Chinese voices**
6. **Adjust speech rate and pitch**
7. **Handle empty or invalid text**
8. **Maintain preferences across sessions**
9. **Performance within latency constraints**
10. **Memory cleanup for prepared audio**