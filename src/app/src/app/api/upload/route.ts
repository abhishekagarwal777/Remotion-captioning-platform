// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util'; 

// Configuration
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '500000000'); // 500MB default
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Types
interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  bitrate: number;
}

/**
 * Get video metadata using FFmpeg
 */
async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === 'video'
      );

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        codec: videoStream.codec_name || 'unknown',
        fps: eval(videoStream.r_frame_rate || '0') || 0,
        bitrate: metadata.format.bit_rate || 0,
      });
    });
  });
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Use first part of UUID
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  
  // Sanitize filename
  const sanitizedName = nameWithoutExt
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  
  return `${sanitizedName}_${timestamp}_${uuid}${ext}`;
}

/**
 * Validate file type
 */
function isValidFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

/**
 * Validate file size
 */
function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * POST handler - Upload video file
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('video') as File;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', message: 'Please upload a video file' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: `Allowed types: ${ALLOWED_TYPES.join(', ')}`,
          receivedType: file.type,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `Maximum file size: ${MAX_FILE_SIZE / 1000000}MB`,
          receivedSize: `${(file.size / 1000000).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    console.log('Uploading file:', file.name);
    console.log('File size:', (file.size / 1000000).toFixed(2), 'MB');
    console.log('File type:', file.type);

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log('File saved to:', filePath);

    // Get video metadata
    let metadata: VideoMetadata | null = null;
    try {
      metadata = await getVideoMetadata(filePath);
      console.log('Video metadata:', metadata);
    } catch (metadataError) {
      console.error('Failed to extract video metadata:', metadataError);
      // Continue without metadata - not critical
    }

    // Verify file was written successfully
    const fileStats = await stat(filePath);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Video uploaded successfully',
        file: {
          originalName: file.name,
          fileName: uniqueFilename,
          filePath: `/uploads/${uniqueFilename}`,
          size: fileStats.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
        metadata: metadata || undefined,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Upload error:', error);

    // Handle specific error types
    if (error.code === 'ENOSPC') {
      return NextResponse.json(
        {
          error: 'Insufficient storage',
          message: 'Server does not have enough disk space',
        },
        { status: 507 }
      );
    }

    if (error.code === 'EACCES') {
      return NextResponse.json(
        {
          error: 'Permission denied',
          message: 'Server does not have permission to write files',
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - List uploaded videos or get upload configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Return upload configuration
    if (action === 'config') {
      return NextResponse.json(
        {
          success: true,
          config: {
            maxFileSize: MAX_FILE_SIZE,
            maxFileSizeMB: MAX_FILE_SIZE / 1000000,
            allowedTypes: ALLOWED_TYPES,
            uploadDirectory: '/uploads',
          },
        },
        { status: 200 }
      );
    }

    // List uploaded files
    const fs = await import('fs/promises');
    
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });
    
    const files = await fs.readdir(UPLOAD_DIR);
    
    // Filter video files only
    const videoFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
    });

    // Get file stats for each video
    const videos = await Promise.all(
      videoFiles.map(async (file) => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = await stat(filePath);
        
        // Try to get metadata
        let metadata: VideoMetadata | null = null;
        try {
          metadata = await getVideoMetadata(filePath);
        } catch {
          // Ignore metadata errors
        }

        return {
          fileName: file,
          filePath: `/uploads/${file}`,
          size: stats.size,
          sizeMB: (stats.size / 1000000).toFixed(2),
          uploaded: stats.birthtime,
          modified: stats.mtime,
          metadata,
        };
      })
    );

    // Sort by upload date (newest first)
    videos.sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime());

    return NextResponse.json(
      {
        success: true,
        count: videos.length,
        videos,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error listing videos:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to list videos',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Delete uploaded video
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName parameter is required' },
        { status: 400 }
      );
    }

    // Security: Prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    const filePath = path.join(UPLOAD_DIR, fileName);

    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file
    const fs = await import('fs/promises');
    await fs.unlink(filePath);

    console.log('Deleted file:', fileName);

    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
        fileName,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to delete file',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
    responseLimit: false,
  },
};