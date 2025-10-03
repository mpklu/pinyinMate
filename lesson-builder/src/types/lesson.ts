// Lesson difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Vocabulary entry structure
export interface VocabularyEntry {
  word: string;        // Chinese word or phrase
  definition: string;  // English definition or translation
}

// Lesson metadata structure
export interface LessonMetadata {
  difficulty: DifficultyLevel;
  lscsLevel?: string;          // LSCS level for remote publishing (optional for backward compatibility)
  tags: string[];              // Searchable tags
  characterCount: number;      // Number of Chinese characters in content
  source: string;              // Content source attribution (publisher, URL, etc.)
  book: string | null;         // Textbook reference if applicable
  vocabulary: VocabularyEntry[]; // Vocabulary entries for the lesson
  estimatedTime: number;       // Minutes to complete
  createdAt: string;           // ISO 8601 format
  updatedAt: string;           // ISO 8601 format
}

// Main lesson structure
export interface Lesson {
  id: string;                   // Unique within library (e.g., "greetings")
  title: string;                // Display title
  description: string;          // Lesson description
  content: string;              // Chinese text content
  metadata: LessonMetadata;     // Lesson metadata (includes vocabulary)
}