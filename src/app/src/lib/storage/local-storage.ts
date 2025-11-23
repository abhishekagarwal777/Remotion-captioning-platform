// src/lib/storage/local-storage.ts

import fs from 'fs/promises';
import path from 'path';

/**
 * Local storage manager for server-side file operations
 */

// Storage directories
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp');

/**
 * Ensure a directory exists, create if it doesn't
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Initialize all storage directories
 */
export async function initializeStorage(): Promise<void> {
  await ensureDir(UPLOAD_DIR);
  await ensureDir(OUTPUT_DIR);
  await ensureDir(TEMP_DIR);
}

/**
 * Save file to upload directory
 */
export async function saveUploadedFile(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  await ensureDir(UPLOAD_DIR);
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Get file from upload directory
 */
export async function getUploadedFile(fileName: string): Promise<Buffer> {
  const filePath = path.join(UPLOAD_DIR, fileName);
  return await fs.readFile(filePath);
}

/**
 * Check if uploaded file exists
 */
export async function uploadedFileExists(fileName: string): Promise<boolean> {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(fileName: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.unlink(filePath);
}

/**
 * List all uploaded files
 */
export async function listUploadedFiles(): Promise<string[]> {
  await ensureDir(UPLOAD_DIR);
  const files = await fs.readdir(UPLOAD_DIR);
  return files.filter((file) => !file.startsWith('.'));
}

/**
 * Save rendered video to output directory
 */
export async function saveRenderedVideo(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  await ensureDir(OUTPUT_DIR);
  const filePath = path.join(OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Get rendered video from output directory
 */
export async function getRenderedVideo(fileName: string): Promise<Buffer> {
  const filePath = path.join(OUTPUT_DIR, fileName);
  return await fs.readFile(filePath);
}

/**
 * Check if rendered video exists
 */
export async function renderedVideoExists(fileName: string): Promise<boolean> {
  try {
    const filePath = path.join(OUTPUT_DIR, fileName);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete rendered video
 */
export async function deleteRenderedVideo(fileName: string): Promise<void> {
  const filePath = path.join(OUTPUT_DIR, fileName);
  await fs.unlink(filePath);
}

/**
 * List all rendered videos
 */
export async function listRenderedVideos(): Promise<string[]> {
  await ensureDir(OUTPUT_DIR);
  const files = await fs.readdir(OUTPUT_DIR);
  return files.filter((file) => !file.startsWith('.'));
}

/**
 * Save temporary file
 */
export async function saveTempFile(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  await ensureDir(TEMP_DIR);
  const filePath = path.join(TEMP_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Get temporary file
 */
export async function getTempFile(fileName: string): Promise<Buffer> {
  const filePath = path.join(TEMP_DIR, fileName);
  return await fs.readFile(filePath);
}

/**
 * Delete temporary file
 */
export async function deleteTempFile(fileName: string): Promise<void> {
  const filePath = path.join(TEMP_DIR, fileName);
  await fs.unlink(filePath);
}

/**
 * Clean up old temporary files (older than 1 hour)
 */
export async function cleanupTempFiles(): Promise<number> {
  await ensureDir(TEMP_DIR);
  const files = await fs.readdir(TEMP_DIR);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);
    try {
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > oneHour) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    } catch (error) {
      console.error(`Failed to clean up temp file: ${file}`, error);
    }
  }

  return deletedCount;
}

/**
 * Get file size
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string): Promise<{
  size: number;
  created: Date;
  modified: Date;
}> {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

/**
 * Copy file
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  await fs.copyFile(sourcePath, destinationPath);
}

/**
 * Move file
 */
export async function moveFile(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  await fs.rename(sourcePath, destinationPath);
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  uploads: { count: number; totalSize: number };
  outputs: { count: number; totalSize: number };
  temp: { count: number; totalSize: number };
}> {
  await initializeStorage();

  const calculateDirStats = async (dirPath: string) => {
    const files = await fs.readdir(dirPath);
    let totalSize = 0;
    let count = 0;

    for (const file of files) {
      if (file.startsWith('.')) continue;
      const filePath = path.join(dirPath, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
          count++;
        }
      } catch (error) {
        console.error(`Failed to stat file: ${file}`, error);
      }
    }

    return { count, totalSize };
  };

  const [uploads, outputs, temp] = await Promise.all([
    calculateDirStats(UPLOAD_DIR),
    calculateDirStats(OUTPUT_DIR),
    calculateDirStats(TEMP_DIR),
  ]);

  return { uploads, outputs, temp };
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Clean up old files (older than specified days)
 */
export async function cleanupOldFiles(
  directory: string,
  daysOld: number
): Promise<number> {
  await ensureDir(directory);
  const files = await fs.readdir(directory);
  const now = Date.now();
  const maxAge = daysOld * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    if (file.startsWith('.')) continue;

    const filePath = path.join(directory, file);
    try {
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`Deleted old file: ${file} (${daysOld} days old)`);
      }
    } catch (error) {
      console.error(`Failed to clean up file: ${file}`, error);
    }
  }

  return deletedCount;
}

/**
 * Get disk space usage for a directory
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;

  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      }
    } catch (error) {
      console.error(`Failed to stat: ${filePath}`, error);
    }
  }

  return totalSize;
}

/**
 * Validate file path to prevent directory traversal
 */
export function isValidFileName(fileName: string): boolean {
  // Check for directory traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }

  // Check for null bytes
  if (fileName.includes('\0')) {
    return false;
  }

  // Check filename length
  if (fileName.length > 255) {
    return false;
  }

  return true;
}

/**
 * Get safe file path (prevents directory traversal)
 */
export function getSafeFilePath(baseDir: string, fileName: string): string | null {
  if (!isValidFileName(fileName)) {
    return null;
  }

  const safePath = path.join(baseDir, path.basename(fileName));
  
  // Ensure the resolved path is within the base directory
  if (!safePath.startsWith(baseDir)) {
    return null;
  }

  return safePath;
}

// Export directory paths
export const STORAGE_PATHS = {
  UPLOAD_DIR,
  OUTPUT_DIR,
  TEMP_DIR,
} as const;