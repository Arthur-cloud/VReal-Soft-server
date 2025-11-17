import * as crypto from 'crypto';

/**
 * Generates a random string for public links
 * @param length - Length of the generated string
 * @returns Random URL-safe string
 */
export function generatePublicLink(length = 24): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

/**
 * Sanitizes filename to prevent path traversal attacks
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Generates unique filename with UUID
 * @param originalName - Original file name
 * @returns Unique filename with extension
 */
export function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split('.').pop();
  const uuid = crypto.randomUUID();
  return extension ? `${uuid}.${extension}` : uuid;
}

/**
 * Formats file size to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Checks if folder is descendant of another folder
 * Used to prevent circular dependencies
 * @param folderId - Folder to check
 * @param parentId - Potential parent folder
 * @param getFolderById - Function to retrieve folder by ID
 * @returns Promise<boolean> - True if circular dependency detected
 */
export async function isCircularDependency(
  folderId: string,
  parentId: string,
  getFolderById: (id: string) => Promise<{ parentId?: string } | undefined>,
): Promise<boolean> {
  if (folderId === parentId) {
    return true;
  }

  let currentFolder = await getFolderById(parentId);
  const visited = new Set<string>([folderId]);

  while (currentFolder?.parentId) {
    if (visited.has(currentFolder.parentId)) {
      return true;
    }
    visited.add(currentFolder.parentId);
    currentFolder = await getFolderById(currentFolder.parentId);
  }

  return false;
}
