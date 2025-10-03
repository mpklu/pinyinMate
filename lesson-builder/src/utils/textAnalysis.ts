import type { TextAnalysisResult, SuggestedVocabEntry } from '../types';

/**
 * Analyze Chinese text and extract vocabulary suggestions
 */
export async function analyzeChineseText(text: string): Promise<TextAnalysisResult> {
  const characterCount = countChineseCharacters(text);
  const suggestedVocabulary = await extractVocabularyFromText(text);
  
  return {
    characterCount,
    suggestedVocabulary,
  };
}

/**
 * Count Chinese characters in text
 */
export function countChineseCharacters(text: string): number {
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const matches = text.match(chineseRegex);
  return matches ? matches.length : 0;
}

/**
 * Extract vocabulary words from Chinese text with frequency analysis
 */
async function extractVocabularyFromText(text: string): Promise<SuggestedVocabEntry[]> {
  // Simple character-based extraction for now
  // In a more sophisticated implementation, this would use jieba or similar
  
  const words = new Map<string, number>();
  
  // Extract 2-4 character combinations that are likely to be words
  for (let i = 0; i < text.length; i++) {
    for (let len = 2; len <= 4 && i + len <= text.length; len++) {
      const word = text.slice(i, i + len);
      
      // Only consider sequences that are all Chinese characters
      if (/^[\u4e00-\u9fff]+$/.test(word)) {
        words.set(word, (words.get(word) || 0) + 1);
      }
    }
  }
  
  // Convert to suggested vocabulary entries
  const suggestions: SuggestedVocabEntry[] = [];
  
  for (const [word, frequency] of words.entries()) {
    if (frequency >= 1 && word.length >= 2) {
      suggestions.push({
        word,
        definition: '', // Would be filled by dictionary API
        frequency,
        confidence: calculateConfidence(word, frequency),
        isSelected: false,
      });
    }
  }
  
  // Sort by frequency and confidence
  suggestions.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return b.confidence - a.confidence;
  });
  
  // Return top 20 suggestions
  return suggestions.slice(0, 20);
}

/**
 * Calculate confidence score for a vocabulary word
 */
function calculateConfidence(word: string, frequency: number): number {
  // Simple heuristic: longer words with higher frequency get higher confidence
  const lengthBonus = word.length * 0.1;
  const frequencyScore = Math.min(frequency / 10, 1);
  
  return Math.min(frequencyScore + lengthBonus, 1);
}

/**
 * Segment Chinese text into sentences
 */
export function segmentIntoSentences(text: string): string[] {
  // Split on common Chinese punctuation
  const sentences = text
    .split(/[。！？；]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return sentences;
}

/**
 * Estimate lesson difficulty based on text complexity
 */
export function estimateDifficulty(text: string): 'beginner' | 'intermediate' | 'advanced' {
  const charCount = countChineseCharacters(text);
  const sentences = segmentIntoSentences(text);
  const avgSentenceLength = sentences.length > 0 ? charCount / sentences.length : 0;
  
  // Simple heuristic based on character count and sentence complexity
  if (charCount < 50 && avgSentenceLength < 10) {
    return 'beginner';
  } else if (charCount < 200 && avgSentenceLength < 20) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}