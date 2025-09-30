# Audio API Contract

## POST /api/audio/synthesize

**Purpose**: Generate audio pronunciation for Chinese text

### Request
```typescript
interface AudioSynthesizeRequest {
  text: string;
  options?: {
    voice?: 'male' | 'female';
    speed?: number; // 0.5-2.0, default: 1.0
    pitch?: number; // 0.5-2.0, default: 1.0
  };
}
```

### Response
```typescript
interface AudioSynthesizeResponse {
  success: boolean;
  data: {
    audioUrl: string; // blob URL or data URL
    duration: number; // seconds
    format: 'mp3' | 'wav' | 'ogg';
  };
  error?: string;
}
```

## GET /api/audio/play/:segmentId

**Purpose**: Get audio for specific text segment

### Response
```typescript
interface AudioResponse {
  success: boolean;
  data: {
    audioUrl: string;
    text: string;
    pinyin: string;
    duration: number;
  };
  error?: string;
}
```

### Audio Implementation Details

#### Primary: MeloTTS Integration
- High-quality Chinese TTS with natural pronunciation
- Support for multiple Chinese voices
- Tone accuracy essential for language learning

#### Fallback: Web Speech API
- Browser-native speech synthesis
- Cross-platform compatibility
- Lower quality but universal support

#### Error Handling
- Audio synthesis failure: Fall back to text-only mode
- Network issues: Cache and retry mechanism
- Unsupported browsers: Graceful degradation

### Example
```json
// Synthesize Request
{
  "text": "你好世界",
  "options": {
    "voice": "female",
    "speed": 0.8,
    "pitch": 1.0
  }
}

// Synthesize Response
{
  "success": true,
  "data": {
    "audioUrl": "blob:https://app.com/audio/abc123",
    "duration": 2.5,
    "format": "mp3"
  }
}
```

### Performance Requirements
- Audio generation: <2s for short phrases (<10 characters)
- Audio playback: Start within 200ms of user interaction
- Client-side processing preferred (no server dependency)
- Fallback to browser TTS if MeloTTS unavailable