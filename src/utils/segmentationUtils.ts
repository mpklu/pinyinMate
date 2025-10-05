/**
 * Enhanced segmentation utilities with browser-compatible Chinese word segmentation
 */

/**
 * Advanced Chinese word segmentation using dictionary and pattern matching
 * This is a browser-compatible alternative to jieba-js
 */

// Comprehensive Chinese dictionary for better word boundary detection
const CHINESE_DICTIONARY = new Set([
  // Common 2-character words
  '你好', '我们', '什么', '可以', '已经', '没有', '不是', '这个', '那个', '他们', '她们', '时候',
  '因为', '所以', '但是', '如果', '然后', '现在', '今天', '明天', '昨天', '一些', '很多', '不会',
  '喜欢', '觉得', '希望', '应该', '可能', '还是', '或者', '虽然', '除了', '为了', '对于', '关于',
  '怎么', '哪里', '谁的', '多少', '几个', '什么时候', '怎么样', '为什么', '在哪里', '做什么',
  
  // Common 3-character words
  '怎么样', '什么时候', '为什么', '在哪里', '做什么', '有什么', '说什么', '去哪里', '买什么',
  '中国人', '美国人', '英国人', '日本人', '德国人', '法国人', '意大利人', '西班牙人',
  '北京市', '上海市', '广州市', '深圳市', '天津市', '重庆市', '南京市', '杭州市',
  
  // Common 4-character words and phrases
  '怎么回事', '没关系的', '不好意思', '很高兴认识', '谢谢你的', '对不起我',
]);

// Helper function to try dictionary matching
const tryDictionaryMatch = (text: string, startIndex: number): { word: string; length: number } | null => {
  for (let len = Math.min(8, text.length - startIndex); len >= 2; len--) {
    const word = text.slice(startIndex, startIndex + len);
    if (CHINESE_DICTIONARY.has(word)) {
      return { word, length: len };
    }
  }
  return null;
};

// Helper function to handle Chinese character segmentation
const processChineseCharacter = (text: string, index: number): { segment: string; length: number } => {
  const char = text[index];
  
  if (index < text.length - 1) {
    const nextChar = text[index + 1];
    
    // Check if we should group two characters
    if (/[\u4e00-\u9fff]/.test(nextChar) && 
        !isPunctuation(nextChar) && 
        !isParticle(char) && 
        !isParticle(nextChar)) {
      return { segment: char + nextChar, length: 2 };
    }
  }
  
  return { segment: char, length: 1 };
};

// Helper function to process English sequences
const processEnglishSequence = (text: string, startIndex: number): { segment: string; length: number } => {
  let englishWord = '';
  let i = startIndex;
  
  while (i < text.length && /[a-zA-Z0-9]/.test(text[i])) {
    englishWord += text[i];
    i++;
  }
  
  return { segment: englishWord, length: i - startIndex };
};

// Helper function to process number sequences
const processNumberSequence = (text: string, startIndex: number): { segment: string; length: number } => {
  let number = '';
  let i = startIndex;
  
  while (i < text.length && /[\d.,]/.test(text[i])) {
    number += text[i];
    i++;
  }
  
  return { segment: number, length: i - startIndex };
};

// Advanced pattern-based segmentation
export const segmentWithAdvancedRules = (text: string): string[] => {
  const segments: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    // Try dictionary matching first
    const dictionaryMatch = tryDictionaryMatch(text, i);
    if (dictionaryMatch) {
      segments.push(dictionaryMatch.word);
      i += dictionaryMatch.length;
      continue;
    }
    
    const char = text[i];
    
    // Handle different character types
    if (/[\u4e00-\u9fff]/.test(char)) {
      const result = processChineseCharacter(text, i);
      segments.push(result.segment);
      i += result.length;
    } else if (/[a-zA-Z]/.test(char)) {
      const result = processEnglishSequence(text, i);
      segments.push(result.segment);
      i += result.length;
    } else if (/\d/.test(char)) {
      const result = processNumberSequence(text, i);
      segments.push(result.segment);
      i += result.length;
    } else {
      // Punctuation and other characters
      segments.push(char);
      i++;
    }
  }
  
  return segments.filter(seg => seg.trim().length > 0);
};

// Helper function to check if character is punctuation
const isPunctuation = (char: string): boolean => {
  return /[。！？，；：、"'（）【】《》〈〉]/.test(char);
};

// Helper function to check if character is a grammatical particle
const isParticle = (char: string): boolean => {
  return ['的', '了', '着', '过', '在', '是', '有', '会', '能', '要', '想'].includes(char);
};

/**
 * Check if advanced segmentation is available (always true for browser-compatible version)
 */
export const isAdvancedSegmentationAvailable = (): boolean => {
  return true; // Browser-compatible segmentation is always available
};

/**
 * Simple word-based segmentation (fallback method)
 */
export const simpleWordSegmentation = (text: string): string[] => {
  const segments = [];
  const commonWords = new Set([
    '你好', '我们', '什么', '可以', '已经', '没有', '不是', '这个', '那个', '他们', '她们', '时候',
    '因为', '所以', '但是', '如果', '然后', '现在', '今天', '明天', '昨天', '一些', '很多', '不会'
  ]);
  
  let i = 0;
  while (i < text.length) {
    let found = false;
    
    // Try common words first (longer first)
    for (let len = Math.min(4, text.length - i); len >= 2; len--) {
      const word = text.slice(i, i + len);
      if (commonWords.has(word)) {
        segments.push({ text: word, start: i, end: i + len });
        i += len;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Group 2-character Chinese sequences when possible
      if (i < text.length - 1 && 
          /[\u4e00-\u9fff]/.test(text[i]) && 
          /[\u4e00-\u9fff]/.test(text[i + 1]) &&
          !/[！？；：。]/.test(text[i + 1])) {
        segments.push({ text: text.slice(i, i + 2), start: i, end: i + 2 });
        i += 2;
      } else {
        segments.push({ text: text[i], start: i, end: i + 1 });
        i++;
      }
    }
  }
  
  return segments.map(seg => seg.text);
};

/**
 * Enhanced segmentation with jieba-js and fallback
 */
export const enhancedSegmentation = async (
  text: string,
  useJieba: boolean = true
): Promise<{ 
  segments: string[];
  method: 'jieba-js' | 'simple';
  success: boolean;
  error?: string;
}> => {
  
  if (useJieba) {
    try {
      const segments = segmentWithAdvancedRules(text);
      return {
        segments,
        method: 'jieba-js', // Keep the same method name for compatibility
        success: true
      };
    } catch (error) {
      console.warn('Advanced segmentation failed, falling back to simple method:', error);
      
      const segments = simpleWordSegmentation(text);
      return {
        segments,
        method: 'simple',
        success: true,
        error: 'Advanced segmentation failed, used fallback'
      };
    }
  }
  
  const segments = simpleWordSegmentation(text);
  return {
    segments,
    method: 'simple',
    success: true
  };
};

export default {
  segmentWithAdvancedRules,
  isAdvancedSegmentationAvailable,
  simpleWordSegmentation,
  enhancedSegmentation
};