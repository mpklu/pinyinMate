/**
 * GitHub Fetch Service
 * Fetches lessons and manifests from GitHub repositories
 */

import type { Lesson } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export interface RemoteSourceConfig {
  id: string;
  name: string;
  owner: string;
  repo: string;
  branch?: string;
  url: string;
}

export interface LessonSource {
  type: 'local' | 'remote';
  sourceId: string;
  sourceName: string;
  path: string;
  url?: string;
}

export interface LessonFileMetadata {
  sha: string;
  size: number;
  lastModified: Date;
  author?: string;
  commitMessage?: string;
  url: string;
}

export interface LessonListItem {
  lesson: Lesson;
  source: LessonSource;
  metadata: LessonFileMetadata;
}

export interface RemoteManifest {
  version: string;
  lastUpdated: string;
  categories: ManifestCategory[];
}

export interface ManifestCategory {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  lessons: ManifestLessonRef[];
}

export interface ManifestLessonRef {
  id: string;
  title: string;
  description?: string;
  source: {
    type: string;
    path: string;
  };
  metadata?: {
    difficulty?: string;
    tags?: string[];
    characterCount?: number;
    estimatedTime?: number;
  };
}

export interface SearchFilters {
  difficulty?: string[];
  lscsLevel?: string[];
  tags?: string[];
  minCharacterCount?: number;
  maxCharacterCount?: number;
  dateModifiedAfter?: Date;
}

/**
 * Fetch a single lesson from GitHub
 */
export async function fetchLesson(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<Lesson> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `token ${token}` }),
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lesson: ${response.statusText}`);
  }

  const data = await response.json();

  // Decode base64 content
  const content = atob(data.content.replace(/\n/g, ''));
  const lesson: Lesson = JSON.parse(content);

  return lesson;
}

/**
 * Fetch manifest from a URL
 */
export async function fetchManifest(sourceUrl: string): Promise<RemoteManifest> {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.statusText}`);
  }

  const manifest = await response.json();
  return manifest;
}

/**
 * Get file metadata including SHA (needed for updates)
 */
export async function getLessonMetadata(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<LessonFileMetadata> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `token ${token}` }),
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file metadata: ${response.statusText}`);
  }

  const data = await response.json();

  // Get commit info for the file
  const commitsUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?path=${path}&per_page=1`;
  let commitInfo: any = null;

  try {
    const commitResponse = await fetch(commitsUrl, {
      headers: {
        ...(token && { Authorization: `token ${token}` }),
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (commitResponse.ok) {
      const commits = await commitResponse.json();
      if (commits.length > 0) {
        commitInfo = commits[0];
      }
    }
  } catch {
    // Continue without commit info
  }

  return {
    sha: data.sha,
    size: data.size,
    lastModified: commitInfo?.commit?.author?.date
      ? new Date(commitInfo.commit.author.date)
      : new Date(),
    author: commitInfo?.commit?.author?.name,
    commitMessage: commitInfo?.commit?.message,
    url: data.html_url,
  };
}

/**
 * Get file SHA (lightweight version of getLessonMetadata)
 */
export async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string | null> {
  try {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `token ${token}` }),
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.sha;
  } catch {
    return null;
  }
}

/**
 * List lessons from a remote source
 */
export async function listLessonsFromSource(
  sourceConfig: RemoteSourceConfig
): Promise<LessonListItem[]> {
  try {
    const manifest = await fetchManifest(sourceConfig.url);
    const lessonItems: LessonListItem[] = [];

    for (const category of manifest.categories || []) {
      for (const lessonRef of category.lessons || []) {
        try {
          // Fetch full lesson
          const lesson = await fetchLesson(
            sourceConfig.owner,
            sourceConfig.repo,
            lessonRef.source.path,
            sourceConfig.branch
          );

          // Get metadata
          const metadata = await getLessonMetadata(
            sourceConfig.owner,
            sourceConfig.repo,
            lessonRef.source.path,
            sourceConfig.branch
          );

          lessonItems.push({
            lesson,
            source: {
              type: 'remote',
              sourceId: sourceConfig.id,
              sourceName: sourceConfig.name,
              path: lessonRef.source.path,
              url: sourceConfig.url,
            },
            metadata,
          });
        } catch (error) {
          console.warn(
            `Failed to fetch lesson ${lessonRef.id}:`,
            error instanceof Error ? error.message : 'Unknown error'
          );
          // Continue with other lessons
        }
      }
    }

    return lessonItems;
  } catch (error) {
    console.error('Failed to list lessons from source:', error);
    throw error;
  }
}

/**
 * Search lessons with filters
 */
export function filterLessons(
  lessons: LessonListItem[],
  query: string,
  filters?: SearchFilters
): LessonListItem[] {
  let filtered = lessons;

  // Text search
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.lesson.title.toLowerCase().includes(lowerQuery) ||
        item.lesson.description.toLowerCase().includes(lowerQuery) ||
        item.lesson.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        item.lesson.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Apply filters
  if (filters) {
    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter((item) =>
        filters.difficulty!.includes(item.lesson.metadata.difficulty)
      );
    }

    if (filters.lscsLevel && filters.lscsLevel.length > 0) {
      filtered = filtered.filter(
        (item) =>
          item.lesson.metadata.lscsLevel &&
          filters.lscsLevel!.includes(item.lesson.metadata.lscsLevel)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((item) =>
        filters.tags!.some((tag) => item.lesson.metadata.tags.includes(tag))
      );
    }

    if (filters.minCharacterCount !== undefined) {
      filtered = filtered.filter(
        (item) => item.lesson.metadata.characterCount >= filters.minCharacterCount!
      );
    }

    if (filters.maxCharacterCount !== undefined) {
      filtered = filtered.filter(
        (item) => item.lesson.metadata.characterCount <= filters.maxCharacterCount!
      );
    }

    if (filters.dateModifiedAfter) {
      filtered = filtered.filter(
        (item) => item.metadata.lastModified >= filters.dateModifiedAfter!
      );
    }
  }

  return filtered;
}

/**
 * Cache interface for reducing API calls
 */
interface CachedLesson {
  lesson: Lesson;
  cachedAt: number;
  etag?: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'lesson-cache-';

/**
 * Get cached lesson if available and not expired
 */
export function getCachedLesson(path: string): Lesson | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${path}`);
    if (!cached) return null;

    const { lesson, cachedAt }: CachedLesson = JSON.parse(cached);

    if (Date.now() - cachedAt > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_PREFIX}${path}`);
      return null;
    }

    return lesson;
  } catch {
    return null;
  }
}

/**
 * Cache a lesson
 */
export function cacheLesson(path: string, lesson: Lesson, etag?: string): void {
  try {
    const cached: CachedLesson = {
      lesson,
      cachedAt: Date.now(),
      etag,
    };
    localStorage.setItem(`${CACHE_PREFIX}${path}`, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache lesson:', error);
  }
}

/**
 * Clear all cached lessons
 */
export function clearLessonCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear lesson cache:', error);
  }
}
