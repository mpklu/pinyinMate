/**
 * Runtime Manifest Builder Service
 * 
 * Generates library manifest from public/lessons/ directory at runtime
 * to maintain single source of truth principle.
 */

import type { EnhancedLesson } from '../types';

export interface RuntimeManifest {
  version: string;
  name: string;
  description: string;
  lastUpdated: string;
  totalLessons: number;
  categories: string[];
  supportedFeatures: string[];
  lessons: EnhancedLesson[];
}

export class ManifestBuilderService {
  private cache: RuntimeManifest | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Build library manifest from public/lessons/ at runtime
   */
  async buildRuntimeManifest(): Promise<RuntimeManifest> {
    // Return cached version if still valid
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_TTL) {
      console.log('Returning cached manifest with', this.cache.lessons.length, 'lessons');
      return this.cache;
    }

    try {
      // Load the public manifest first to get structure
      const publicManifestResponse = await fetch('/lessons/manifest.json');
      if (!publicManifestResponse.ok) {
        throw new Error(`Failed to load public manifest: ${publicManifestResponse.status}`);
      }
      
      const publicManifest = await publicManifestResponse.json();
      
      // Collect all lessons from all categories
      const allLessons: EnhancedLesson[] = [];
      const categories = new Set<string>();
      
      for (const category of publicManifest.categories) {
        categories.add(category.id);
        
        for (const lessonRef of category.lessons) {
          try {
            // Load the actual lesson content
            console.log(`Loading lesson ${lessonRef.id} from path: ${lessonRef.source.path}`);
            const lessonResponse = await fetch(lessonRef.source.path);
            if (!lessonResponse.ok) {
              console.error(`Failed to load lesson ${lessonRef.id}: ${lessonResponse.status} from ${lessonRef.source.path}`);
              continue;
            }
            
            const lessonData = await lessonResponse.json();
            console.log(`Raw lesson data for ${lessonRef.id}:`, { 
              id: lessonData.id, 
              title: lessonData.title,
              hasMetadata: !!lessonData.metadata,
              hasVocabulary: !!(lessonData.metadata?.vocabulary)
            });
            
            // Transform to EnhancedLesson format
            const enhancedLesson: EnhancedLesson = {
              id: lessonData.id,
              title: lessonData.title,
              description: lessonData.description,
              content: lessonData.content,
              metadata: {
                difficulty: lessonData.metadata.difficulty,
                tags: lessonData.metadata.tags || [],
                characterCount: lessonData.metadata.characterCount || lessonData.content.length,
                source: lessonData.metadata.source || "PinyinMate Sample Content",
                book: lessonData.metadata.book || null,
                vocabulary: lessonData.metadata.vocabulary || [],
                grammarPoints: lessonData.metadata.grammarPoints || [],
                culturalNotes: lessonData.metadata.culturalNotes || [],
                estimatedTime: lessonRef.metadata.estimatedTime || 15,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            };
            
            allLessons.push(enhancedLesson);
            console.log(`✅ Successfully loaded lesson: ${enhancedLesson.id} - ${enhancedLesson.title} (total so far: ${allLessons.length})`);
          } catch (error) {
            console.error(`❌ Error loading lesson ${lessonRef.id}:`, error);
          }
        }
      }

      // Build runtime manifest
      const runtimeManifest: RuntimeManifest = {
        version: publicManifest.version || "1.0.0",
        name: "Enhanced Chinese Learning Library",
        description: "Comprehensive library system supporting local and remote lesson sources",
        lastUpdated: new Date().toISOString(),
        totalLessons: allLessons.length,
        categories: Array.from(categories),
        supportedFeatures: [
          "flashcards",
          "quizzes", 
          "audio",
          "segmentation",
          "pinyin",
          "vocabulary"
        ],
        lessons: allLessons
      };

      // Cache the result
      this.cache = runtimeManifest;
      this.cacheTimestamp = Date.now();
      
      console.log(`🎉 Runtime manifest built with ${runtimeManifest.lessons.length} lessons:`);
      runtimeManifest.lessons.forEach((lesson, index) => {
        console.log(`  ${index + 1}. ${lesson.id}: ${lesson.title} (${lesson.metadata.difficulty})`);
      });
      
      return runtimeManifest;
    } catch (error) {
      console.error('Failed to build runtime manifest:', error);
      throw error;
    }
  }

  /**
   * Get a specific lesson by ID
   */
  async getLesson(lessonId: string): Promise<EnhancedLesson | null> {
    const manifest = await this.buildRuntimeManifest();
    return manifest.lessons.find(lesson => lesson.id === lessonId) || null;
  }

  /**
   * Get lessons by category
   */
  async getLessonsByCategory(category: string): Promise<EnhancedLesson[]> {
    const manifest = await this.buildRuntimeManifest();
    return manifest.lessons.filter(lesson => 
      lesson.metadata.difficulty === category || 
      lesson.metadata.tags.includes(category)
    );
  }

  /**
   * Search lessons by query
   */
  async searchLessons(query: string): Promise<EnhancedLesson[]> {
    const manifest = await this.buildRuntimeManifest();
    const lowerQuery = query.toLowerCase();
    
    return manifest.lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(lowerQuery) ||
      lesson.description.toLowerCase().includes(lowerQuery) ||
      lesson.content.includes(query) || // Keep Chinese characters case-sensitive
      lesson.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Clear the cache to force rebuild on next request
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { cached: boolean; age: number; ttl: number } {
    return {
      cached: this.cache !== null,
      age: this.cache ? Date.now() - this.cacheTimestamp : 0,
      ttl: this.CACHE_TTL
    };
  }
}

// Export singleton instance
export const manifestBuilder = new ManifestBuilderService();

// Clear cache on module load during development
if (process.env.NODE_ENV === 'development') {
  manifestBuilder.clearCache();
  console.log('ManifestBuilder: Cache cleared for development');
}