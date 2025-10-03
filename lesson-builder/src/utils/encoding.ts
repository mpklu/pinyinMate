/**
 * Utility functions for proper encoding/decoding with GitHub API
 */

/**
 * Convert UTF-8 string to base64 for GitHub API
 * Handles Chinese characters correctly
 */
export function utf8ToBase64(str: string): string {
  // Convert string to UTF-8 bytes, then to base64
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

/**
 * Convert base64 to UTF-8 string from GitHub API
 * Handles Chinese characters correctly
 */
export function base64ToUtf8(base64: string): string {
  // Decode base64 to bytes, then to UTF-8 string
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Validate if a string contains valid UTF-8 encoded Chinese characters
 */
export function isValidChineseContent(content: string): boolean {
  try {
    // Check if content contains Chinese characters
    const chineseRegex = /[\u4e00-\u9fff]/;
    return chineseRegex.test(content);
  } catch {
    return false;
  }
}

/**
 * Format JSON with proper indentation for readability
 */
export function formatJSONForGitHub(obj: any): string {
  return JSON.stringify(obj, null, 2);
}