// Enhanced library service interfaces for the Library Management System
// Service contracts for library management, synchronization, and caching

import type { 
  LessonLibrary, 
  LibrarySource, 
  Lesson,
  PreparedLesson,
  LessonCache,
  LessonLoadOptions 
} from './lesson';

// Main library service interface
export interface LibraryService {
  // Library management
  initialize(): Promise<void>;
  getAvailableLibraries(): Promise<LessonLibrary[]>;
  getLibraryById(id: string): Promise<LessonLibrary | null>;
  refreshLibrary(libraryId: string): Promise<void>;
  
  // Lesson operations  
  getLessons(libraryId?: string): Promise<Lesson[]>;
  getLessonById(lessonId: string, libraryId?: string): Promise<Lesson | null>;
  prepareLessonForLearning(lessonId: string, options: LessonLoadOptions): Promise<PreparedLesson>;
  
  // Search and filtering
  searchLessons(query: string, filters?: LessonSearchFilters): Promise<Lesson[]>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;
  getLessonsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Lesson[]>;
  
  // Remote source management
  addRemoteSource(source: LibrarySource): Promise<void>;
  removeRemoteSource(sourceId: string): Promise<void>;
  syncRemoteSource(sourceId: string): Promise<SyncResult>;
  syncAllRemoteSources(): Promise<SyncResult[]>;
  
  // Cache management
  clearCache(): Promise<void>;
  getCacheStatus(): Promise<CacheStatus>;
  setCacheConfig(config: CacheConfig): Promise<void>;
}

// Configuration for library service
export interface LibraryConfig {
  remoteSources: LibrarySource[];         // Configured remote sources
  defaultCacheExpiry: number;             // Default cache TTL in seconds
  maxCacheSize: number;                   // Maximum cached lessons
  autoSync: boolean;                      // Enable automatic synchronization
  syncInterval: number;                   // Auto-sync interval in minutes
  defaultFeatures: string[];             // Default lesson features to load
  offlineMode: boolean;                   // Enable offline-first mode
}

// Remote source configuration
export interface RemoteSourceConfig {
  url: string;                            // Remote manifest URL
  authentication?: {                      // Optional authentication
    type: 'bearer' | 'apikey' | 'basic';
    credentials: Record<string, string>;
  };
  syncInterval: number;                   // Sync frequency in minutes
  retryAttempts: number;                  // Failed request retries
  timeout: number;                        // Request timeout in seconds
  headers?: Record<string, string>;       // Additional HTTP headers
}

// Synchronization status and results
export interface SyncStatus {
  sourceId: string;                       // Library source ID
  lastSync: Date | null;                  // Last successful sync
  nextSync: Date | null;                  // Next scheduled sync
  status: 'idle' | 'syncing' | 'error' | 'disabled';
  errorMessage?: string;                  // Last error message if any
  lessonsAdded: number;                   // New lessons in last sync
  lessonsUpdated: number;                 // Updated lessons in last sync
  lessonsRemoved: number;                 // Removed lessons in last sync
}

export interface SyncResult {
  sourceId: string;                       // Source that was synced
  success: boolean;                       // Whether sync succeeded
  timestamp: Date;                        // Sync completion time
  duration: number;                       // Sync duration in milliseconds
  lessonsProcessed: number;               // Total lessons processed
  lessonsAdded: number;                   // New lessons added
  lessonsUpdated: number;                 // Existing lessons updated
  lessonsRemoved: number;                 // Lessons removed
  errors: SyncError[];                    // Any errors encountered
}

export interface SyncError {
  type: 'network' | 'parsing' | 'validation' | 'storage';
  message: string;                        // Error description
  lessonId?: string;                      // Affected lesson (if applicable)
  timestamp: Date;                        // When error occurred
}

// Cache management
export interface CacheConfig {
  maxSize: number;                        // Maximum cached items
  defaultTTL: number;                     // Default time-to-live in seconds
  cleanupInterval: number;                // Cache cleanup frequency in minutes
  persistToDisk: boolean;                 // Whether to persist cache across sessions
  compressionEnabled: boolean;            // Enable cache compression
}

export interface CacheStatus {
  totalItems: number;                     // Number of cached items
  totalSize: number;                      // Total cache size in bytes
  oldestItem: Date | null;                // Oldest cached item timestamp
  newestItem: Date | null;                // Newest cached item timestamp
  hitRate: number;                        // Cache hit rate percentage
  memoryUsage: number;                    // Memory usage in bytes
}

export interface CacheEntry extends LessonCache {
  accessCount: number;                    // Number of times accessed
  lastAccessed: Date;                     // Last access timestamp
  size: number;                           // Entry size in bytes
}

// Search and filtering
export interface LessonSearchFilters {
  categories?: string[];                  // Filter by categories
  difficulties?: ('beginner' | 'intermediate' | 'advanced')[];
  tags?: string[];                        // Filter by tags
  libraries?: string[];                   // Filter by library sources
  features?: string[];                    // Filter by supported features
  estimatedTime?: {                       // Filter by lesson duration
    min?: number;
    max?: number;
  };
  hasVocabulary?: boolean;                // Filter lessons with vocabulary
  dateRange?: {                           // Filter by creation/update date
    start?: Date;
    end?: Date;
  };
}

export interface SearchResult {
  lessons: Lesson[];                      // Matching lessons
  totalCount: number;                     // Total matches (for pagination)
  facets: SearchFacets;                   // Available filter options
  searchTime: number;                     // Search duration in milliseconds
}

export interface SearchFacets {
  categories: FacetCount[];               // Available categories with counts
  difficulties: FacetCount[];             // Available difficulties with counts  
  tags: FacetCount[];                     // Available tags with counts
  libraries: FacetCount[];                // Available libraries with counts
  features: FacetCount[];                 // Available features with counts
}

export interface FacetCount {
  value: string;                          // Facet value
  count: number;                          // Number of items with this value
}

// Library management events  
export type LibraryEvent = 
  | { type: 'library-added'; library: LessonLibrary }
  | { type: 'library-updated'; library: LessonLibrary }
  | { type: 'library-removed'; libraryId: string }
  | { type: 'lesson-added'; lesson: Lesson; libraryId: string }
  | { type: 'lesson-updated'; lesson: Lesson; libraryId: string }
  | { type: 'lesson-removed'; lessonId: string; libraryId: string }
  | { type: 'sync-started'; sourceId: string }
  | { type: 'sync-completed'; result: SyncResult }
  | { type: 'sync-failed'; sourceId: string; error: SyncError }
  | { type: 'cache-cleared' }
  | { type: 'cache-full'; evictedCount: number };

export type LibraryEventListener = (event: LibraryEvent) => void;

// Extended library service with event support
export interface EnhancedLibraryService extends LibraryService {
  // Event management
  addEventListener(listener: LibraryEventListener): void;
  removeEventListener(listener: LibraryEventListener): void;
  
  // Statistics and analytics
  getLibraryStats(): Promise<LibraryStats>;
  getLessonStats(lessonId: string): Promise<LessonStats>;
  
  // Bulk operations
  importLessons(lessons: Lesson[], libraryId: string): Promise<void>;
  exportLibrary(libraryId: string, format: 'json' | 'csv'): Promise<string>;
  
  // Health checks
  validateLibrary(libraryId: string): Promise<ValidationResult>;
  repairLibrary(libraryId: string): Promise<RepairResult>;
}

export interface LibraryStats {
  totalLibraries: number;                 // Number of libraries
  totalLessons: number;                   // Total lessons across all libraries
  lessonsByDifficulty: Record<string, number>; // Lessons grouped by difficulty
  lessonsByCategory: Record<string, number>;   // Lessons grouped by category
  averageLessonTime: number;              // Average estimated completion time
  cacheHitRate: number;                   // Overall cache performance
  lastSyncTimes: Record<string, Date>;    // Last sync time per source
}

export interface LessonStats {
  timesAccessed: number;                  // How often lesson was loaded
  averageCompletionTime: number;          // Average time users spend
  flashcardsGenerated: number;            // Number of flashcards created
  quizzesGenerated: number;               // Number of quizzes created
  lastAccessed: Date;                     // Most recent access
}

export interface ValidationResult {
  valid: boolean;                         // Whether library is valid
  errors: ValidationError[];              // Validation errors found
  warnings: ValidationWarning[];          // Non-critical issues
}

export interface ValidationError {
  type: 'missing-data' | 'invalid-format' | 'broken-reference';
  message: string;                        // Error description
  path?: string;                          // Data path where error occurred
  lessonId?: string;                      // Affected lesson if applicable
}

export interface ValidationWarning {
  type: 'deprecated-field' | 'missing-optional' | 'performance';
  message: string;                        // Warning description
  suggestion?: string;                    // Suggested fix
}

export interface RepairResult {
  success: boolean;                       // Whether repair succeeded
  repairsPerformed: number;               // Number of fixes applied
  repairActions: RepairAction[];          // Details of what was repaired
}

export interface RepairAction {
  type: 'field-added' | 'field-updated' | 'reference-fixed' | 'data-cleaned';
  description: string;                    // What was repaired
  lessonId?: string;                      // Affected lesson if applicable
}