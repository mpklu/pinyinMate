/**
 * Lesson Library Service
 * Manages loading and caching of lesson content from local and remote sources
 */

import type {
  ContentManifest,
  LessonCategory,
  LessonContent,
  LessonReference,
  SearchQuery,
  LessonSearchResult,
  CachedLesson,
  CacheStats,
  LoadingState,
  LessonValidationResult,
  RemoteSource,
} from '../types/library';

// Cache implementation using session storage
class LessonCache {
  private cache = new Map<string, CachedLesson>();
  private readonly maxSize = 100 * 1024 * 1024; // 100MB
  private readonly defaultTtl = 3600000; // 1 hour

  get(lessonId: string): LessonContent | null {
    const cached = this.cache.get(lessonId);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt.getTime()) {
      this.cache.delete(lessonId);
      return null;
    }

    // Update access tracking
    cached.accessCount++;
    cached.lastAccessed = new Date();
    
    return cached.content;
  }

  set(lessonId: string, content: LessonContent, ttl = this.defaultTtl): void {
    const now = new Date();
    const cached: CachedLesson = {
      content,
      cachedAt: now,
      expiresAt: new Date(now.getTime() + ttl),
      accessCount: 1,
      lastAccessed: now,
    };

    // Remove old entry if exists
    this.cache.delete(lessonId);
    
    // Check size limit and evict if necessary
    this.evictIfNeeded();
    
    this.cache.set(lessonId, cached);
  }

  private evictIfNeeded(): void {
    const currentSize = this.getCurrentSize();
    if (currentSize < this.maxSize) return;

    // Sort by last accessed (LRU eviction)
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime()
    );

    // Remove oldest entries until we're under the limit
    let sizeToRemove = currentSize - this.maxSize * 0.8; // Remove to 80% capacity
    for (const [key, cached] of entries) {
      if (sizeToRemove <= 0) break;
      
      const entrySize = this.estimateSize(cached.content);
      this.cache.delete(key);
      sizeToRemove -= entrySize;
    }
  }

  private getCurrentSize(): number {
    let totalSize = 0;
    for (const cached of this.cache.values()) {
      totalSize += this.estimateSize(cached.content);
    }
    return totalSize;
  }

  private estimateSize(content: LessonContent): number {
    // Rough estimation of content size in bytes
    return JSON.stringify(content).length * 2; // UTF-16 characters
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    const items = Array.from(this.cache.values());
    if (items.length === 0) {
      return {
        totalItems: 0,
        totalSize: 0,
        hitRate: 0,
        oldestItem: new Date(),
        newestItem: new Date(),
      };
    }

    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0);
    const totalRequests = totalAccess; // Simplified hit rate calculation

    return {
      totalItems: items.length,
      totalSize: this.getCurrentSize(),
      hitRate: totalRequests > 0 ? (totalAccess / totalRequests) * 100 : 0,
      oldestItem: new Date(Math.min(...items.map(item => item.cachedAt.getTime()))),
      newestItem: new Date(Math.max(...items.map(item => item.cachedAt.getTime()))),
    };
  }
}

// Rate limiter for remote requests
class RateLimiter {
  private requests = new Map<string, number[]>();

  canMakeRequest(sourceId: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get request timestamps for this source
    const sourceRequests = this.requests.get(sourceId) || [];
    
    // Remove old requests outside the window
    const validRequests = sourceRequests.filter(timestamp => timestamp > windowStart);
    
    // Update the map
    this.requests.set(sourceId, validRequests);
    
    return validRequests.length < limit;
  }

  recordRequest(sourceId: string): void {
    const now = Date.now();
    const sourceRequests = this.requests.get(sourceId) || [];
    sourceRequests.push(now);
    this.requests.set(sourceId, sourceRequests);
  }
}

// Content validation utilities
const validateLessonContent = (content: unknown): LessonValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || typeof content !== 'object') {
    errors.push('Content must be an object');
    return { isValid: false, errors, warnings };
  }

  const lesson = content as Record<string, unknown>;

  // Required fields
  if (!lesson.id || typeof lesson.id !== 'string') {
    errors.push('Lesson must have a valid id');
  }

  if (!lesson.title || typeof lesson.title !== 'string') {
    errors.push('Lesson must have a valid title');
  }

  if (!lesson.content || typeof lesson.content !== 'string') {
    errors.push('Lesson must have content text');
  }

  if (!lesson.metadata || typeof lesson.metadata !== 'object') {
    errors.push('Lesson must have metadata');
  } else {
    const metadata = lesson.metadata as Record<string, unknown>;
    
    if (!metadata.difficulty || !['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty as string)) {
      errors.push('Lesson must have a valid difficulty level');
    }

    if (!Array.isArray(metadata.tags)) {
      warnings.push('Lesson should have tags array');
    }

    if (typeof metadata.characterCount !== 'number' || metadata.characterCount <= 0) {
      warnings.push('Lesson should have a valid character count');
    }

    if (!Array.isArray(metadata.vocabulary)) {
      warnings.push('Lesson should have vocabulary array');
    }
  }

  // Content length validation
  const lessonContent = lesson.content as string;
  if (lessonContent && typeof lessonContent === 'string' && lessonContent.length > 10000) {
    warnings.push('Lesson content is very long and may impact performance');
  }

  // Chinese character validation
  if (lessonContent && typeof lessonContent === 'string') {
    const chineseRegex = /[\u4e00-\u9fff]/g;
    const chineseChars = (lessonContent.match(chineseRegex) || []).length;
    if (chineseChars === 0) {
      warnings.push('Lesson content does not contain Chinese characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Main service class
export class LessonLibraryService {
  private cache = new LessonCache();
  private rateLimiter = new RateLimiter();
  private manifest: ContentManifest | null = null;
  private loadingStates = new Map<string, LoadingState>();

  /**
   * Load the content manifest
   */
  async loadManifest(): Promise<ContentManifest> {
    if (this.manifest) {
      return this.manifest;
    }

    try {
      this.setLoadingState('manifest', { isLoading: true, stage: 'fetching' });

      const response = await fetch('/lessons/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status} ${response.statusText}`);
      }

      const manifestData = await response.json();
      
      // Convert date strings to Date objects
      manifestData.lastUpdated = new Date(manifestData.lastUpdated);
      
      this.manifest = manifestData;
      this.setLoadingState('manifest', { isLoading: false });
      
      return this.manifest!;
    } catch (error) {
      this.setLoadingState('manifest', { 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load manifest'
      });
      throw error;
    }
  }

  /**
   * Get all lesson categories
   */
  async getCategories(): Promise<LessonCategory[]> {
    const manifest = await this.loadManifest();
    return manifest.categories;
  }

  /**
   * Load a specific lesson by ID
   */
  async loadLesson(lessonId: string): Promise<LessonContent> {
    // Check cache first
    const cached = this.cache.get(lessonId);
    if (cached) {
      return cached;
    }

    // Find lesson reference in manifest
    const manifest = await this.loadManifest();
    let lessonRef: LessonReference | null = null;

    for (const cat of manifest.categories) {
      const found = cat.lessons.find(lesson => lesson.id === lessonId);
      if (found) {
        lessonRef = found;
        break;
      }
    }

    if (!lessonRef) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    try {
      this.setLoadingState(lessonId, { isLoading: true, stage: 'fetching' });

      let content: LessonContent;

      if (lessonRef.source.type === 'local') {
        content = await this.loadLocalLesson(lessonRef);
      } else {
        content = await this.loadRemoteLesson(lessonRef, manifest.remoteSources || []);
      }

      // Validate content
      this.setLoadingState(lessonId, { isLoading: true, stage: 'validating' });
      const validation = validateLessonContent(content);
      
      if (!validation.isValid) {
        throw new Error(`Invalid lesson content: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn(`Lesson ${lessonId} validation warnings:`, validation.warnings);
      }

      // Cache the content
      this.setLoadingState(lessonId, { isLoading: true, stage: 'caching' });
      const cacheDuration = lessonRef.source.cacheDuration || manifest.settings?.cacheDuration || 3600000;
      this.cache.set(lessonId, content, cacheDuration);

      this.setLoadingState(lessonId, { isLoading: false });
      return content;

    } catch (error) {
      this.setLoadingState(lessonId, { 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load lesson'
      });
      throw error;
    }
  }

  /**
   * Load lesson from a URI directly
   */
  async loadLessonFromUri(uri: string): Promise<LessonContent> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to load lesson from ${uri}: ${response.status} ${response.statusText}`);
      }

      const content = await response.json();
      
      // Validate content
      const validation = validateLessonContent(content);
      if (!validation.isValid) {
        throw new Error(`Invalid lesson content from ${uri}: ${validation.errors.join(', ')}`);
      }

      return content;
    } catch (error) {
      throw new Error(`Failed to load lesson from URI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search lessons based on query
   */
  async searchLessons(query: SearchQuery): Promise<LessonSearchResult[]> {
    const categories = await this.getCategories();
    const results: LessonSearchResult[] = [];

    for (const category of categories) {
      for (const lesson of category.lessons) {
        const score = this.calculateRelevanceScore(lesson, query);
        if (score > 0) {
          results.push({
            lesson,
            category: category.name,
            relevanceScore: score,
            matchedFields: this.getMatchedFields(lesson, query),
          });
        }
      }
    }

    // Sort by relevance score (descending)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get cached lessons
   */
  async getCachedLessons(): Promise<LessonContent[]> {
    // This is a simplified implementation - in a real scenario,
    // we'd need to expose the cache keys somehow
    return [];
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * Get loading state for a resource
   */
  getLoadingState(resourceId: string): LoadingState {
    return this.loadingStates.get(resourceId) || { isLoading: false };
  }

  /**
   * Validate lesson content
   */
  validateLessonContent(content: unknown): LessonValidationResult {
    return validateLessonContent(content);
  }

  // Private methods

  private async loadLocalLesson(lessonRef: LessonReference): Promise<LessonContent> {
    if (!lessonRef.source.path) {
      throw new Error('Local lesson source must have a path');
    }

    const response = await fetch(lessonRef.source.path);
    if (!response.ok) {
      throw new Error(`Failed to load local lesson: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async loadRemoteLesson(lessonRef: LessonReference, remoteSources: RemoteSource[]): Promise<LessonContent> {
    if (!lessonRef.source.url) {
      throw new Error('Remote lesson source must have a URL');
    }

    // Find the remote source configuration
    const remoteSource = remoteSources.find(src => lessonRef.source.url?.includes(src.baseUrl));

    // Check rate limiting
    if (remoteSource?.rateLimit) {
      const canRequest = this.rateLimiter.canMakeRequest(
        remoteSource.id,
        remoteSource.rateLimit.requests,
        remoteSource.rateLimit.windowMs
      );

      if (!canRequest) {
        throw new Error(`Rate limit exceeded for source: ${remoteSource.name}`);
      }
    }

    // Prepare request headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...remoteSource?.headers,
      ...lessonRef.source.headers,
    };

    const response = await fetch(lessonRef.source.url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to load remote lesson: ${response.status} ${response.statusText}`);
    }

    // Record the request for rate limiting
    if (remoteSource) {
      this.rateLimiter.recordRequest(remoteSource.id);
    }

    return response.json();
  }

  private calculateRelevanceScore(lesson: LessonReference, query: SearchQuery): number {
    let score = 0;

    // Text search in title and description
    if (query.text) {
      const searchText = query.text.toLowerCase();
      if (lesson.title.toLowerCase().includes(searchText)) {
        score += 10;
      }
      if (lesson.description?.toLowerCase().includes(searchText)) {
        score += 5;
      }
      if (lesson.metadata.tags.some(tag => tag.toLowerCase().includes(searchText))) {
        score += 3;
      }
    }

    // Difficulty filter
    if (query.difficulty && !query.difficulty.includes(lesson.metadata.difficulty)) {
      return 0; // Exclude if difficulty doesn't match
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      const matchedTags = lesson.metadata.tags.filter(tag => query.tags!.includes(tag));
      if (matchedTags.length === 0) {
        return 0; // Exclude if no tags match
      }
      score += matchedTags.length * 2;
    }

    // Character count range
    if (query.minCharacterCount && lesson.metadata.characterCount < query.minCharacterCount) {
      return 0;
    }
    if (query.maxCharacterCount && lesson.metadata.characterCount > query.maxCharacterCount) {
      return 0;
    }

    return score;
  }

  private getMatchedFields(lesson: LessonReference, query: SearchQuery): string[] {
    const matched: string[] = [];

    if (query.text) {
      const searchText = query.text.toLowerCase();
      if (lesson.title.toLowerCase().includes(searchText)) {
        matched.push('title');
      }
      if (lesson.description?.toLowerCase().includes(searchText)) {
        matched.push('description');
      }
      if (lesson.metadata.tags.some(tag => tag.toLowerCase().includes(searchText))) {
        matched.push('tags');
      }
    }

    if (query.difficulty?.includes(lesson.metadata.difficulty)) {
      matched.push('difficulty');
    }

    if (query.tags && lesson.metadata.tags.some(tag => query.tags!.includes(tag))) {
      matched.push('tags');
    }

    return matched;
  }

  private setLoadingState(resourceId: string, state: LoadingState): void {
    this.loadingStates.set(resourceId, state);
  }
}

// Export singleton instance
export const lessonLibraryService = new LessonLibraryService();

export default lessonLibraryService;