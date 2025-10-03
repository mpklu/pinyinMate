import type { 
  LibrarySource, 
  SourceLessonEntry, 
  LoadingState, 
  SourceLoadResult,
  PaginatedLessons,
  SearchFilters 
} from '../types/library';
import type { Lesson } from '../types/lesson';

/**
 * Service for managing both local and remote lesson sources
 */
export class LibrarySourceService {
  private readonly sources: Map<string, LibrarySource> = new Map();
  private readonly sourceLessons: Map<string, SourceLessonEntry[]> = new Map();
  private readonly loadingStates: Map<string, LoadingState> = new Map();
  private readonly cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  /**
   * Initialize the service with sources from config
   */
  async initialize(): Promise<void> {
    try {
      // Load remote sources configuration
      const remoteSourcesResponse = await fetch('/src/config/remote-sources.json');
      const remoteSourcesConfig = await remoteSourcesResponse.json();
      
      // Convert config format to LibrarySource format
      for (const sourceConfig of remoteSourcesConfig.sources) {
        const librarySource: LibrarySource = {
          id: sourceConfig.id,
          name: sourceConfig.config.name,
          type: sourceConfig.type,
          description: sourceConfig.config.description,
          enabled: sourceConfig.enabled,
          priority: sourceConfig.priority,
          metadata: {
            version: sourceConfig.config.metadata.version,
            lastUpdated: sourceConfig.config.metadata.lastUpdated,
            totalLessons: sourceConfig.config.metadata.totalLessons,
            categories: sourceConfig.config.metadata.categories,
            supportedFeatures: sourceConfig.config.metadata.supportedFeatures,
            organization: sourceConfig.config.metadata.organization,
            levelSystem: sourceConfig.config.metadata.levelSystem,
          },
          config: {
            manifestPath: sourceConfig.config.manifestPath,
            url: sourceConfig.config.url,
            syncInterval: sourceConfig.config.syncInterval,
            authentication: sourceConfig.config.authentication,
          }
        };
        
        this.sources.set(sourceConfig.id, librarySource);
        this.loadingStates.set(sourceConfig.id, { isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize library sources:', error);
    }
  }

  /**
   * Get all available sources
   */
  getSources(): LibrarySource[] {
    return Array.from(this.sources.values())
      .filter(source => source.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get a specific source by ID
   */
  getSource(sourceId: string): LibrarySource | undefined {
    return this.sources.get(sourceId);
  }

  /**
   * Get loading state for a source
   */
  getLoadingState(sourceId: string): LoadingState {
    return this.loadingStates.get(sourceId) || { isLoading: false };
  }

  /**
   * Load lessons from a source (local or remote)
   */
  async loadSourceLessons(sourceId: string, refresh = false): Promise<SourceLoadResult> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }

    // Check cache first (unless refresh is requested)
    if (!refresh && this.sourceLessons.has(sourceId)) {
      return {
        source,
        lessons: this.sourceLessons.get(sourceId)!,
        loadingState: this.getLoadingState(sourceId)
      };
    }

    // Set loading state
    this.loadingStates.set(sourceId, { isLoading: true });

    try {
      let lessons: SourceLessonEntry[];
      
      if (source.type === 'local') {
        lessons = await this.loadLocalLessons(source);
      } else {
        lessons = await this.loadRemoteLessons(source);
      }

      // Cache the results
      this.sourceLessons.set(sourceId, lessons);
      
      // Update source metadata
      source.metadata.totalLessons = lessons.length;
      source.metadata.lastUpdated = new Date().toISOString();
      
      this.loadingStates.set(sourceId, { 
        isLoading: false, 
        lastLoaded: new Date().toISOString() 
      });

      return { source, lessons, loadingState: this.getLoadingState(sourceId) };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.loadingStates.set(sourceId, { 
        isLoading: false, 
        error: errorMessage 
      });
      
      throw error;
    }
  }

  /**
   * Load lessons from local manifest
   */
  private async loadLocalLessons(source: LibrarySource): Promise<SourceLessonEntry[]> {
    const manifestPath = source.config.manifestPath || '/public/lessons/manifest.json';
    
    try {
      const response = await fetch(manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load local manifest: ${response.status}`);
      }
      
      const manifest = await response.json();
      const lessons: SourceLessonEntry[] = [];

      // Extract lessons from all categories
      for (const category of manifest.categories || []) {
        for (const lesson of category.lessons || []) {
          lessons.push({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            difficulty: lesson.metadata.difficulty,
            lscsLevel: lesson.metadata.lscsLevel,
            tags: lesson.metadata.tags || [],
            characterCount: lesson.metadata.characterCount || 0,
            estimatedTime: lesson.metadata.estimatedTime || 15,
            createdAt: lesson.metadata.createdAt || new Date().toISOString(),
            updatedAt: lesson.metadata.updatedAt || new Date().toISOString(),
            source: {
              type: 'local',
              path: lesson.source.path
            }
          });
        }
      }

      return lessons;
    } catch (error) {
      console.error('Error loading local lessons:', error);
      throw new Error(`Failed to load local lessons: ${error}`);
    }
  }

  /**
   * Load lessons from remote manifest
   */
  private async loadRemoteLessons(source: LibrarySource): Promise<SourceLessonEntry[]> {
    if (!source.config.url) {
      throw new Error('Remote source URL not configured');
    }

    try {
      const response = await fetch(source.config.url);
      if (!response.ok) {
        throw new Error(`Failed to load remote manifest: ${response.status}`);
      }
      
      const manifest = await response.json();
      const lessons: SourceLessonEntry[] = [];

      // Extract lessons from all categories
      for (const category of manifest.categories || []) {
        for (const lesson of category.lessons || []) {
          lessons.push({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            difficulty: lesson.metadata.difficulty,
            lscsLevel: lesson.metadata.lscsLevel,
            tags: lesson.metadata.tags || [],
            characterCount: lesson.metadata.characterCount || 0,
            estimatedTime: lesson.metadata.estimatedTime || 15,
            createdAt: lesson.metadata.createdAt || new Date().toISOString(),
            updatedAt: lesson.metadata.updatedAt || new Date().toISOString(),
            source: {
              type: 'remote',
              path: lesson.source.path
            }
          });
        }
      }

      return lessons;
    } catch (error) {
      console.error('Error loading remote lessons:', error);
      throw new Error(`Failed to load remote lessons: ${error}`);
    }
  }

  /**
   * Search and filter lessons from a source with pagination
   */
  async searchLessons(
    sourceId: string,
    filters: SearchFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedLessons> {
    // Ensure lessons are loaded
    await this.loadSourceLessons(sourceId);
    
    const allLessons = this.sourceLessons.get(sourceId) || [];
    
    // Apply filters
    const filteredLessons = allLessons.filter(lesson => 
      this.matchesTextQuery(lesson, filters.query) &&
      this.matchesDifficulty(lesson, filters.difficulty) &&
      this.matchesLscsLevel(lesson, filters.lscsLevel) &&
      this.matchesTags(lesson, filters.tags) &&
      this.matchesTimeRange(lesson, filters.estimatedTimeRange)
    );

    // Sort by title for consistent ordering
    filteredLessons.sort((a, b) => a.title.localeCompare(b.title));

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLessons = filteredLessons.slice(startIndex, endIndex);
    
    return {
      lessons: paginatedLessons,
      totalCount: filteredLessons.length,
      hasMore: endIndex < filteredLessons.length,
      nextPage: endIndex < filteredLessons.length ? page + 1 : undefined
    };
  }

  private matchesTextQuery(lesson: SourceLessonEntry, query?: string): boolean {
    if (!query) return true;
    
    const queryLower = query.toLowerCase();
    const titleMatch = lesson.title.toLowerCase().includes(queryLower);
    const descMatch = lesson.description.toLowerCase().includes(queryLower);
    
    return titleMatch || descMatch;
  }

  private matchesDifficulty(lesson: SourceLessonEntry, difficulties?: string[]): boolean {
    if (!difficulties || difficulties.length === 0) return true;
    return difficulties.includes(lesson.difficulty);
  }

  private matchesLscsLevel(lesson: SourceLessonEntry, levels?: string[]): boolean {
    if (!levels || levels.length === 0) return true;
    return lesson.lscsLevel ? levels.includes(lesson.lscsLevel) : false;
  }

  private matchesTags(lesson: SourceLessonEntry, tags?: string[]): boolean {
    if (!tags || tags.length === 0) return true;
    
    return tags.some(tag => 
      lesson.tags.some(lessonTag => 
        lessonTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  private matchesTimeRange(lesson: SourceLessonEntry, timeRange?: [number, number]): boolean {
    if (!timeRange) return true;
    
    const [minTime, maxTime] = timeRange;
    return lesson.estimatedTime >= minTime && lesson.estimatedTime <= maxTime;
  }

  /**
   * Load a specific lesson content
   */
  async loadLesson(sourceId: string, lessonId: string): Promise<Lesson> {
    const lessons = this.sourceLessons.get(sourceId) || [];
    const lessonEntry = lessons.find(l => l.id === lessonId);
    
    if (!lessonEntry) {
      throw new Error(`Lesson not found: ${lessonId} in source ${sourceId}`);
    }

    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }

    // Construct full URL for lesson content
    let lessonUrl: string;
    
    if (source.type === 'local') {
      lessonUrl = lessonEntry.source.path;
    } else {
      // For remote sources, construct URL from base URL
      const baseUrl = source.config.url?.replace('/manifest.json', '');
      lessonUrl = `${baseUrl}/${lessonEntry.source.path}`;
    }

    try {
      const response = await fetch(lessonUrl);
      if (!response.ok) {
        throw new Error(`Failed to load lesson: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading lesson content:', error);
      throw new Error(`Failed to load lesson content: ${error}`);
    }
  }

  /**
   * Refresh a specific source
   */
  async refreshSource(sourceId: string): Promise<void> {
    await this.loadSourceLessons(sourceId, true);
  }

  /**
   * Clear cache for all sources
   */
  clearCache(): void {
    this.sourceLessons.clear();
    this.cache.clear();
    
    // Reset loading states
    for (const sourceId of this.sources.keys()) {
      this.loadingStates.set(sourceId, { isLoading: false });
    }
  }
}

// Singleton instance
export const librarySourceService = new LibrarySourceService();