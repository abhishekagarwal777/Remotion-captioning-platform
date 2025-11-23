// src/lib/utils/file-handler.ts

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility functions for handling file operations
 */

/**
 * Supported video MIME types
 */
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/mpeg',
  'video/x-matroska',
] as const;

/**
 * Supported audio MIME types
 */
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/flac',
] as const;

/**
 * Supported caption file extensions
 */
export const SUPPORTED_CAPTION_EXTENSIONS = ['.srt', '.vtt', '.json'] as const;

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  VIDEO: 500 * 1024 * 1024, // 500MB
  AUDIO: 100 * 1024 * 1024, // 100MB
  CAPTION: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Validate file type
 */
export function isValidVideoType(mimeType: string): boolean {
  return SUPPORTED_VIDEO_TYPES.includes(mimeType as any);
}

/**
 * Validate audio type
 */
export function isValidAudioType(mimeType: string): boolean {
  return SUPPORTED_AUDIO_TYPES.includes(mimeType as any);
}

/**
 * Validate caption file extension
 */
export function isValidCaptionFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return SUPPORTED_CAPTION_EXTENSIONS.includes(ext as any);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, fileType: 'video' | 'audio' | 'caption'): boolean {
  const maxSize = MAX_FILE_SIZES[fileType.toUpperCase() as keyof typeof MAX_FILE_SIZES];
  return size > 0 && size <= maxSize;
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // First part of UUID
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  
  // Sanitize filename (remove special characters)
  const sanitizedName = nameWithoutExt
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  
  const prefixStr = prefix ? `${prefix}_` : '';
  return `${prefixStr}${sanitizedName}_${timestamp}_${uuid}${ext}`;
}

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  return filename
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    .trim();
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file as buffer
 */
export async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

/**
 * Read file as text
 */
export async function readFileAsText(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  return await fs.readFile(filePath, encoding);
}

/**
 * Write buffer to file
 */
export async function writeBufferToFile(filePath: string, buffer: Buffer): Promise<void> {
  await fs.writeFile(filePath, buffer);
}

/**
 * Write text to file
 */
export async function writeTextToFile(filePath: string, text: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  await fs.writeFile(filePath, text, encoding);
}

/**
 * Copy file
 */
export async function copyFile(source: string, destination: string): Promise<void> {
  await fs.copyFile(source, destination);
}

/**
 * Move file
 */
export async function moveFile(source: string, destination: string): Promise<void> {
  await fs.rename(source, destination);
}

/**
 * Delete file
 */
export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}

/**
 * Get file stats
 */
export async function getFileInfo(filePath: string): Promise<{
  size: number;
  created: Date;
  modified: Date;
  isFile: boolean;
  isDirectory: boolean;
}> {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
  };
}

/**
 * Create directory if it doesn't exist
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * List files in directory
 */
export async function listFiles(dirPath: string, extension?: string): Promise<string[]> {
  const files = await fs.readdir(dirPath);
  
  if (extension) {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    return files.filter(file => path.extname(file).toLowerCase() === ext);
  }
  
  return files;
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const ext = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
    // Video
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    
    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    
    // Caption
    '.srt': 'text/plain',
    '.vtt': 'text/vtt',
    '.json': 'application/json',
    
    // Text
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Validate file path to prevent directory traversal attacks
 */
export function isValidPath(filePath: string): boolean {
  // Check for directory traversal attempts
  if (filePath.includes('..')) return false;
  if (filePath.includes('\0')) return false;
  
  // Normalize path and check it doesn't go outside base directory
  const normalized = path.normalize(filePath);
  if (normalized.startsWith('..')) return false;
  
  return true;
}

/**
 * Get safe file path within a base directory
 */
export function getSafePath(baseDir: string, filename: string): string | null {
  const sanitized = sanitizeFilename(filename);
  
  if (!isValidPath(sanitized)) {
    return null;
  }
  
  const safePath = path.join(baseDir, path.basename(sanitized));
  
  // Ensure path is within base directory
  if (!safePath.startsWith(path.resolve(baseDir))) {
    return null;
  }
  
  return safePath;
}

/**
 * Calculate directory size
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;
  
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      }
    }
  } catch (error) {
    console.error(`Error calculating directory size: ${dirPath}`, error);
  }
  
  return totalSize;
}

/**
 * Clean up old files in directory
 */
export async function cleanupOldFiles(
  dirPath: string,
  maxAgeMs: number
): Promise<number> {
  const now = Date.now();
  let deletedCount = 0;
  
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        const age = now - stats.mtimeMs;
        
        if (age > maxAgeMs) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning up old files: ${dirPath}`, error);
  }
  
  return deletedCount;
}

/**
 * Convert File object to Buffer (for browser File API)
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get temporary file path
 */
export function getTempFilePath(filename: string, tempDir: string = '/tmp'): string {
  const uniqueName = generateUniqueFilename(filename, 'temp');
  return path.join(tempDir, uniqueName);
}

/**
 * Validate and sanitize upload
 */
export interface ValidateUploadOptions {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions?: string[];
}

export function validateUpload(
  file: { name: string; size: number; type: string },
  options: ValidateUploadOptions
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > options.maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${formatFileSize(options.maxSize)}`,
    };
  }
  
  // Check MIME type
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
    };
  }
  
  // Check extension if provided
  if (options.allowedExtensions) {
    const ext = getFileExtension(file.name);
    if (!options.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${options.allowedExtensions.join(', ')}`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Stream file to response (for downloads)
 */
export async function streamFile(
  filePath: string,
  res: any,
  options?: { filename?: string; contentType?: string }
): Promise<void> {
  const stats = await fs.stat(filePath);
  const filename = options?.filename || path.basename(filePath);
  const contentType = options?.contentType || getMimeTypeFromExtension(filename);
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', stats.size);
  
  const fileBuffer = await fs.readFile(filePath);
  res.send(fileBuffer);
}

export default {
  isValidVideoType,
  isValidAudioType,
  isValidCaptionFile,
  isValidFileSize,
  formatFileSize,
  generateUniqueFilename,
  sanitizeFilename,
  getFileExtension,
  getFilenameWithoutExtension,
  fileExists,
  readFileAsBuffer,
  readFileAsText,
  writeBufferToFile,
  writeTextToFile,
  copyFile,
  moveFile,
  deleteFile,
  getFileInfo,
  ensureDirectory,
  listFiles,
  getMimeTypeFromExtension,
  isValidPath,
  getSafePath,
  getDirectorySize,
  cleanupOldFiles,
  fileToBuffer,
  getTempFilePath,
  validateUpload,
  streamFile,
};