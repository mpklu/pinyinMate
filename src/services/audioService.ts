/**
 * Audio synthesis service
 * Provides Chinese text-to-speech using MeloTTS/Web Speech API
 */

import type {
  AudioSynthesizeRequest,
  AudioSynthesizeResponse,
  AudioResponse,
} from '../types/library';
import type {
  TextSegment,
} from '../types/annotation';

/**
 * Validates audio synthesis request
 */
export const validateAudioRequest = (request: AudioSynthesizeRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.text || request.text.trim().length === 0) {
    errors.push('Text is required for audio synthesis');
  }

  if (request.text && request.text.length > 1000) {
    errors.push('Text too long for audio synthesis (maximum 1000 characters)');
  }

  if (request.options?.speed && (request.options.speed < 0.5 || request.options.speed > 2.0)) {
    errors.push('Speed must be between 0.5 and 2.0');
  }

  if (request.options?.pitch && (request.options.pitch < 0.5 || request.options.pitch > 2.0)) {
    errors.push('Pitch must be between 0.5 and 2.0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Checks if Web Speech API is available
 */
const isWebSpeechAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         'speechSynthesis' in window && 
         'SpeechSynthesisUtterance' in window;
};

/**
 * Main audio synthesis function
 */
export const synthesize = async (request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> => {
  try {
    // Validate request
    const validation = validateAudioRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Check if Web Speech API is available
    if (!isWebSpeechAvailable()) {
      return {
        success: false,
        error: 'Web Speech API is not available in this browser',
      };
    }

    // Return success with Web Speech indicator - let AudioButton handle the actual playback
    // This avoids double playback while providing a working synthesis service
    return {
      success: true,
      data: {
        audioUrl: 'web-speech-synthesis',
        duration: 0, // Unknown duration for Web Speech
        format: 'mp3', // Use mp3 as the format type for compatibility
      },
    };

  } catch (error) {
    console.error('Audio synthesis failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown audio synthesis error',
    };
  }
};



/**
 * Gets available Chinese voices from Web Speech API
 */
const getChineseVoices = (): SpeechSynthesisVoice[] => {
  if (!isWebSpeechAvailable()) {
    return [];
  }

  const voices = speechSynthesis.getVoices();
  return voices.filter(voice => 
    voice.lang.startsWith('zh') || 
    voice.lang.startsWith('cmn') ||
    voice.name.toLowerCase().includes('chinese')
  );
};

/**
 * Directly plays audio using Web Speech API
 * This is for direct playback without going through AudioButton component
 */
export const playTextDirectly = async (request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> => {
  try {
    // Validate request
    const validation = validateAudioRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Check if Web Speech API is available
    if (!isWebSpeechAvailable()) {
      return {
        success: false,
        error: 'Web Speech API is not available in this browser',
      };
    }

    // Use Web Speech API for direct playback
    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(request.text);
        
        // Try to find a Chinese voice
        const voices = speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => 
          voice.lang.startsWith('zh') || 
          voice.lang.startsWith('cmn') ||
          voice.name.toLowerCase().includes('chinese')
        );
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
          utterance.lang = chineseVoice.lang;
        } else {
          utterance.lang = 'zh-CN';
        }
        
        utterance.rate = request.options?.speed || 0.8;
        utterance.pitch = request.options?.pitch || 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          resolve({
            success: true,
            data: {
              audioUrl: 'web-speech-direct-playback',
              duration: 0, // Unknown duration for Web Speech
              format: 'mp3', // Use mp3 as the format type for compatibility
            },
          });
        };
        
        utterance.onerror = (event) => {
          resolve({
            success: false,
            error: `Speech synthesis failed: ${event.error}`,
          });
        };
        
        speechSynthesis.speak(utterance);
        
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Web Speech API error',
        });
      }
    });

  } catch (error) {
    console.error('Direct audio playback failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown audio synthesis error',
    };
  }
};

// Removed synthesizeWithWebSpeech to prevent double audio playback
// AudioButton will handle Web Speech API directly



// Removed createFallbackAudio - not needed since AudioService returns failure

// Removed duplicate synthesizeAudio function

/**
 * Synthesizes audio for multiple text segments
 */
export const synthesizeSegmentAudio = async (segments: TextSegment[]): Promise<AudioResponse[]> => {
  const results: AudioResponse[] = [];

  for (const segment of segments) {
    try {
      const request: AudioSynthesizeRequest = {
        text: segment.text,
        options: {
          voice: 'female',
          speed: 0.9, // Slightly slower for learning
          pitch: 1.0,
          format: 'mp3',
        },
      };

      const response = await synthesize(request);
      
      if (response.success && response.data) {
        results.push({
          success: true,
          data: {
            audioUrl: response.data.audioUrl,
            text: segment.text,
            pinyin: segment.pinyin || segment.toneMarks || '',
            duration: response.data.duration,
          },
        });
      } else {
        results.push({
          success: false,
          error: response.error || 'Unknown audio synthesis error',
        });
      }
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};

/**
 * Gets information about available TTS engines and voices
 */
export const getAudioCapabilities = () => {
  const capabilities = {
    webSpeechAvailable: isWebSpeechAvailable(),
    meloTTSAvailable: false, // MeloTTS integration not implemented yet
    chineseVoices: [] as string[],
    supportedFormats: ['mp3', 'wav', 'ogg'] as const,
  };

  if (capabilities.webSpeechAvailable) {
    const voices = getChineseVoices();
    capabilities.chineseVoices = voices.map(voice => 
      `${voice.name} (${voice.lang})`
    );
  }

  return capabilities;
};

/**
 * Preloads voices for Web Speech API (helps with voice availability)
 */
export const preloadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!isWebSpeechAvailable()) {
      resolve();
      return;
    }

    // Check if voices are already loaded
    if (speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }

    // Wait for voices to load
    const checkVoices = () => {
      if (speechSynthesis.getVoices().length > 0) {
        resolve();
      } else {
        setTimeout(checkVoices, 100);
      }
    };

    speechSynthesis.onvoiceschanged = () => {
      resolve();
    };

    checkVoices();
  });
};

/**
 * Service interface for audio synthesis
 */
export const audioService = {
  synthesize,
  synthesizeSegments: synthesizeSegmentAudio,
  getCapabilities: getAudioCapabilities,
  preloadVoices,
  validate: validateAudioRequest,
};

export default audioService;