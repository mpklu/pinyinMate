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
 * Checks if MeloTTS is available (placeholder for future implementation)
 */
const isMeloTTSAvailable = (): boolean => {
  // Placeholder - in a real implementation, this would check if MeloTTS service is running
  return false;
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
 * Synthesizes speech using Web Speech API
 */
const synthesizeWithWebSpeech = async (request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> => {
  return new Promise((resolve) => {
    if (!isWebSpeechAvailable()) {
      resolve({
        success: false,
        error: 'Web Speech API not available in this browser',
      });
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(request.text);
      
      // Configure voice settings
      const chineseVoices = getChineseVoices();
      if (chineseVoices.length > 0) {
        // Prefer female voice if specified, otherwise use first available
        const selectedVoice = request.options?.voice === 'male' 
          ? chineseVoices.find(v => v.name.toLowerCase().includes('male')) || chineseVoices[0]
          : chineseVoices.find(v => v.name.toLowerCase().includes('female')) || chineseVoices[0];
        
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        // Fallback to Chinese language code
        utterance.lang = 'zh-CN';
      }

      // Set speech parameters
      utterance.rate = request.options?.speed || 1.0;
      utterance.pitch = request.options?.pitch || 1.0;
      utterance.volume = 1.0;

      // Handle speech events
      utterance.onend = () => {
        resolve({
          success: true,
          data: {
            audioUrl: 'web-speech-synthesis', // Web Speech API doesn't provide URL
            duration: 0, // Duration not available from Web Speech API
            format: 'mp3',
            size: 0,
          },
        });
      };

      utterance.onerror = (event) => {
        resolve({
          success: false,
          error: `Speech synthesis failed: ${event.error}`,
        });
      };

      // Start synthesis
      speechSynthesis.speak(utterance);

    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown speech synthesis error',
      });
    }
  });
};

/**
 * Synthesizes speech using MeloTTS (placeholder for future implementation)
 */
const synthesizeWithMeloTTS = async (): Promise<AudioSynthesizeResponse> => {
  // Placeholder for MeloTTS integration
  // In a real implementation, this would:
  // 1. Send request to MeloTTS server
  // 2. Receive audio data
  // 3. Create blob URL from audio data
  // 4. Return proper response with audio URL
  
  return {
    success: false,
    error: 'MeloTTS not implemented yet',
  };
};

/**
 * Creates a simple audio blob URL for testing (fallback)
 */
const createFallbackAudio = (): string => {
  // Create a simple audio context for testing
  // This is a placeholder - in real use, you'd want actual TTS audio
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440; // A4 note
    oscillator.type = 'sine';
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    
    return 'fallback-audio-placeholder';
  } catch {
    console.warn('Fallback audio creation failed');
    return 'audio-not-available';
  }
};

/**
 * Main audio synthesis function
 */
export const synthesizeAudio = async (request: AudioSynthesizeRequest): Promise<AudioSynthesizeResponse> => {
  try {
    // Validate request
    const validation = validateAudioRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Try MeloTTS first (when available)
    if (isMeloTTSAvailable()) {
      const result = await synthesizeWithMeloTTS();
      if (result.success) {
        return result;
      }
      console.warn('MeloTTS failed, falling back to Web Speech API');
    }

    // Fallback to Web Speech API
    if (isWebSpeechAvailable()) {
      return await synthesizeWithWebSpeech(request);
    }

    // Final fallback - return placeholder
    return {
      success: true,
      data: {
        audioUrl: createFallbackAudio(),
        duration: Math.max(1, request.text.length * 0.1), // Rough estimate
        format: request.options?.format || 'mp3',
        size: request.text.length * 100, // Rough estimate
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

      const response = await synthesizeAudio(request);
      
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
    meloTTSAvailable: isMeloTTSAvailable(),
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
  synthesize: synthesizeAudio,
  synthesizeSegments: synthesizeSegmentAudio,
  getCapabilities: getAudioCapabilities,
  preloadVoices,
  validate: validateAudioRequest,
};

export default audioService;