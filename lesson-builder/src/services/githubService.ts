import type { Lesson, GitHubCommitResponse } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Publish a lesson to GitHub repository
 */
export async function publishLessonToGitHub(lesson: Lesson): Promise<GitHubCommitResponse> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    throw new Error('GitHub configuration is missing. Please check environment variables.');
  }

  // Determine file path based on difficulty
  const filePath = `lessons/${lesson.metadata.difficulty}/${lesson.id}.json`;
  
  // Generate commit message
  const commitMessage = generateCommitMessage(lesson);
  
  // Prepare file content
  const content = JSON.stringify(lesson, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(content)));
  
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
    } catch (error) {
      // File doesn't exist, which is fine
      console.log('File does not exist yet, creating new file');
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
export async function updateManifest(lesson: Lesson): Promise<void> {
  // This would update the manifest.json file to include the new lesson
  // Implementation depends on the manifest structure
  console.log('Manifest update not implemented yet for lesson:', lesson.id);
}