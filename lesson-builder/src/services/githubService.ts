import type { Lesson, GitHubCommitResponse } from '../types';
import type { LSCSLevel } from '../utils/lscsMapping';
import { generateRemoteManifest, updateRemoteManifestWithLesson, validateRemoteManifest, type RemoteManifest } from '../utils/remoteManifestGenerator';
import { utf8ToBase64 } from '../utils/encoding';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Publish a lesson to GitHub repository using LSCS level structure
 */
export async function publishLessonToGitHub(lesson: Lesson, lscsLevel: LSCSLevel): Promise<GitHubCommitResponse> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    throw new Error('GitHub configuration is missing. Please check environment variables.');
  }

  // Determine file path based on LSCS level
  const filePath = `lessons/${lscsLevel}/${lesson.id}.json`;
  
  // Generate commit message
  const commitMessage = generateCommitMessage(lesson);
  
  // Prepare lesson file content (add LSCS level to metadata)
  const lessonWithLSCS = {
    ...lesson,
    metadata: {
      ...lesson.metadata,
      lscsLevel,
      updatedAt: new Date().toISOString()
    }
  };
  const content = JSON.stringify(lessonWithLSCS, null, 2);
  const encodedContent = utf8ToBase64(content);
  
  try {
    // Check if file already exists to get SHA for updates
    let sha: string | undefined;
    try {
      const existingResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (existingResponse.ok) {
        const existingFile = await existingResponse.json();
        sha = existingFile.sha;
      }
    } catch {
      // File doesn't exist, which is fine for new lessons
    }
    
    // Create or update the file
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch: branch,
          ...(sha && { sha }), // Include SHA if updating existing file
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API error: ${error.message || response.statusText}`);
    }
    
    const result = await response.json();
    
    // Update manifest after successful lesson upload
    try {
      await updateRepositoryManifest(lesson, lscsLevel);
    } catch (manifestError) {
      console.warn('Lesson uploaded successfully but manifest update failed:', manifestError);
    }
    
    return {
      success: true,
      sha: result.content.sha,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate descriptive commit message
 */
function generateCommitMessage(lesson: Lesson): string {
  const { title, metadata } = lesson;
  const primaryTags = metadata.tags.slice(0, 3).join(', ');
  const contentPreview = lesson.content.slice(0, 50);
  
  return `Add lesson: ${title} (${metadata.difficulty})

- Topic: ${primaryTags}
- Vocabulary: ${metadata.vocabulary.length} words
- Character count: ${metadata.characterCount}
- Estimated time: ${metadata.estimatedTime} minutes

Content: ${contentPreview}${lesson.content.length > 50 ? '...' : ''}`;
}

/**
 * Update repository manifest.json with new lesson
 */
async function updateRepositoryManifest(lesson: Lesson, lscsLevel: LSCSLevel): Promise<void> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  
  if (!token || !owner || !repo) {
    throw new Error('GitHub configuration is missing for manifest update.');
  }

  const manifestPath = 'manifest.json';
  
  try {
    // Get existing manifest
    let existingManifest: RemoteManifest | null = null;
    let manifestSha: string | undefined;
    
    try {
      const manifestResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${manifestPath}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (manifestResponse.ok) {
        const manifestFile = await manifestResponse.json();
        manifestSha = manifestFile.sha;
        // Properly decode base64 content with UTF-8 support
        const base64Content = manifestFile.content.replace(/\n/g, '');
        const manifestContent = decodeURIComponent(
          atob(base64Content)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        existingManifest = JSON.parse(manifestContent);
        
        if (!validateRemoteManifest(existingManifest)) {
          throw new Error('Existing manifest has invalid structure');
        }
      }
    } catch {
      // Manifest doesn't exist or is invalid, we'll create a new one
    }
    
    // Update or create manifest
    const updatedManifest = existingManifest 
      ? updateRemoteManifestWithLesson(existingManifest, lesson, lscsLevel)
      : generateRemoteManifest([lesson]);
    
    // Upload updated manifest
    const manifestContent = JSON.stringify(updatedManifest, null, 2);
    const encodedManifestContent = utf8ToBase64(manifestContent);
    
    const manifestUpdateResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${manifestPath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update manifest: Add/update lesson ${lesson.id} (${lesson.title})`,
          content: encodedManifestContent,
          branch,
          ...(manifestSha && { sha: manifestSha }),
        }),
      }
    );
    
    if (!manifestUpdateResponse.ok) {
      const error = await manifestUpdateResponse.json();
      throw new Error(`Manifest update failed: ${error.message || manifestUpdateResponse.statusText}`);
    }
    
  } catch (error) {
    console.error('Error updating repository manifest:', error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function updateManifest(lesson: Lesson): Promise<void> {
  console.warn('updateManifest is deprecated, use publishLessonToGitHub with lscsLevel parameter');
  // Try to determine LSCS level from lesson metadata or use default
  const lscsLevel = (lesson.metadata as any).lscsLevel || getDefaultLSCSLevelForDifficulty(lesson.metadata.difficulty);
  await updateRepositoryManifest(lesson, lscsLevel as LSCSLevel);
}

/**
 * Helper to get default LSCS level for a difficulty
 */
function getDefaultLSCSLevelForDifficulty(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'level1';
    case 'intermediate': return 'level3';
    case 'advanced': return 'level6';
    default: return 'level1';
  }
}