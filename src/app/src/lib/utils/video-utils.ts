// src/lib/utils/video-utils.ts

import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import path from 'path';

/**
 * Utility functions for video processing
 */

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  bitrate: number;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  format?: string;
  size?: number;
}

export interface VideoInfo {
  format: {
    duration: number;
    size: number;
    bit_rate: number;
    format_name: string;
    format_long_name: string;
  };
  streams: Array<{
    codec_type: string;
    codec_name: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
    channels?: number;
    sample_rate?: string;
  }>;
}

/**
 * Get video metadata using FFprobe
 */
export async function getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get video metadata: ${err.message}`));
        return;
      }

      try {
        const videoStream = metadata.streams.find(
          (stream) => stream.codec_type === 'video'
        );

        const audioStream = metadata.streams.find(
          (stream) => stream.codec_type === 'audio'
        );

        if (!videoStream) {
          reject(new Error('No video stream found in file'));
          return;
        }

        // Calculate FPS
        let fps = 0;
        if (videoStream.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
          fps = den ? num / den : 0;
        }

        const result: VideoMetadata = {
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          codec: videoStream.codec_name || 'unknown',
          fps: fps || 0,
          bitrate: metadata.format.bit_rate || 0,
          format: metadata.format.format_name,
          size: metadata.format.size,
        };

        // Add audio info if available
        if (audioStream) {
          result.audioCodec = audioStream.codec_name;
          result.audioChannels = audioStream.channels;
          result.audioSampleRate = parseInt(audioStream.sample_rate || '0', 10);
        }

        resolve(result);
      } catch (error: any) {
        reject(new Error(`Failed to parse video metadata: ${error.message}`));
      }
    });
  });
}

/**
 * Extract audio from video file
 */
export async function extractAudio(
  videoPath: string,
  outputPath: string,
  format: 'mp3' | 'wav' | 'aac' = 'mp3'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(videoPath).output(outputPath);

    // Configure audio settings based on format
    if (format === 'mp3') {
      command
        .audioCodec('libmp3lame')
        .audioFrequency(16000) // 16kHz for speech recognition
        .audioChannels(1); // Mono
    } else if (format === 'wav') {
      command
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1);
    } else if (format === 'aac') {
      command
        .audioCodec('aac')
        .audioFrequency(16000)
        .audioChannels(1);
    }

    command
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Audio extraction error:', err);
        reject(new Error(`Failed to extract audio: ${err.message}`));
      })
      .run();
  });
}

/**
 * Generate video thumbnail
 */
export async function generateThumbnail(
  videoPath: string,
  outputPath: string,
  timeInSeconds: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1280x720',
      })
      .on('end', () => {
        console.log('Thumbnail generated');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Thumbnail generation error:', err);
        reject(new Error(`Failed to generate thumbnail: ${err.message}`));
      });
  });
}

/**
 * Generate multiple thumbnails (sprite sheet)
 */
export async function generateThumbnails(
  videoPath: string,
  outputDir: string,
  count: number = 10
): Promise<string[]> {
  const metadata = await getVideoMetadata(videoPath);
  const duration = metadata.duration;
  const interval = duration / (count + 1);

  const timestamps: number[] = [];
  for (let i = 1; i <= count; i++) {
    timestamps.push(i * interval);
  }

  return new Promise((resolve, reject) => {
    const filenames: string[] = [];

    ffmpeg(videoPath)
      .screenshots({
        timestamps,
        filename: 'thumb_%i.png',
        folder: outputDir,
        size: '320x180',
      })
      .on('filenames', (names) => {
        filenames.push(...names.map(name => path.join(outputDir, name)));
      })
      .on('end', () => {
        console.log('Thumbnails generated');
        resolve(filenames);
      })
      .on('error', (err) => {
        console.error('Thumbnails generation error:', err);
        reject(new Error(`Failed to generate thumbnails: ${err.message}`));
      });
  });
}

/**
 * Convert video format
 */
export async function convertVideo(
  inputPath: string,
  outputPath: string,
  options?: {
    codec?: string;
    videoBitrate?: string;
    audioBitrate?: string;
    resolution?: string;
    fps?: number;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath).output(outputPath);

    if (options?.codec) {
      command.videoCodec(options.codec);
    }

    if (options?.videoBitrate) {
      command.videoBitrate(options.videoBitrate);
    }

    if (options?.audioBitrate) {
      command.audioBitrate(options.audioBitrate);
    }

    if (options?.resolution) {
      command.size(options.resolution);
    }

    if (options?.fps) {
      command.fps(options.fps);
    }

    command
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('Video conversion completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Video conversion error:', err);
        reject(new Error(`Failed to convert video: ${err.message}`));
      })
      .run();
  });
}

/**
 * Trim video
 */
export async function trimVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .on('end', () => {
        console.log('Video trimming completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Video trimming error:', err);
        reject(new Error(`Failed to trim video: ${err.message}`));
      })
      .run();
  });
}

/**
 * Merge/concatenate videos
 */
export async function mergeVideos(
  inputPaths: string[],
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (inputPaths.length === 0) {
      reject(new Error('No input videos provided'));
      return;
    }

    const command = ffmpeg();

    inputPaths.forEach(inputPath => {
      command.input(inputPath);
    });

    command
      .on('end', () => {
        console.log('Videos merged successfully');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Video merge error:', err);
        reject(new Error(`Failed to merge videos: ${err.message}`));
      })
      .mergeToFile(outputPath);
  });
}

/**
 * Add watermark to video
 */
export async function addWatermark(
  videoPath: string,
  watermarkPath: string,
  outputPath: string,
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' = 'bottomRight'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const positions = {
      topLeft: '10:10',
      topRight: 'W-w-10:10',
      bottomLeft: '10:H-h-10',
      bottomRight: 'W-w-10:H-h-10',
    };

    ffmpeg(videoPath)
      .input(watermarkPath)
      .complexFilter([
        `[1:v]scale=100:-1[watermark]`,
        `[0:v][watermark]overlay=${positions[position]}`,
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('Watermark added successfully');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Watermark error:', err);
        reject(new Error(`Failed to add watermark: ${err.message}`));
      })
      .run();
  });
}

/**
 * Get video duration
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  const metadata = await getVideoMetadata(videoPath);
  return metadata.duration;
}

/**
 * Get video resolution
 */
export async function getVideoResolution(videoPath: string): Promise<{ width: number; height: number }> {
  const metadata = await getVideoMetadata(videoPath);
  return {
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Check if video has audio
 */
export async function hasAudio(videoPath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const hasAudioStream = metadata.streams.some(
        (stream) => stream.codec_type === 'audio'
      );

      resolve(hasAudioStream);
    });
  });
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse duration string (HH:MM:SS or MM:SS) to seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }

  return 0;
}

/**
 * Get video aspect ratio
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);

  return `${width / divisor}:${height / divisor}`;
}

/**
 * Calculate video bitrate recommendation
 */
export function calculateRecommendedBitrate(
  width: number,
  height: number,
  fps: number
): string {
  const pixels = width * height;
  const factor = fps > 30 ? 1.2 : 1.0;

  // Simple bitrate calculation based on resolution
  let bitrate: number;

  if (pixels >= 3840 * 2160) {
    // 4K
    bitrate = 20000 * factor;
  } else if (pixels >= 2560 * 1440) {
    // 2K
    bitrate = 10000 * factor;
  } else if (pixels >= 1920 * 1080) {
    // 1080p
    bitrate = 5000 * factor;
  } else if (pixels >= 1280 * 720) {
    // 720p
    bitrate = 2500 * factor;
  } else {
    // SD
    bitrate = 1000 * factor;
  }

  return `${Math.round(bitrate)}k`;
}

/**
 * Validate video file
 */
export async function validateVideo(videoPath: string): Promise<{
  valid: boolean;
  errors: string[];
  metadata?: VideoMetadata;
}> {
  const errors: string[] = [];

  try {
    const metadata = await getVideoMetadata(videoPath);

    // Check duration
    if (metadata.duration <= 0) {
      errors.push('Video has no duration or is corrupted');
    }

    // Check dimensions
    if (metadata.width <= 0 || metadata.height <= 0) {
      errors.push('Invalid video dimensions');
    }

    // Check codec
    if (!metadata.codec || metadata.codec === 'unknown') {
      errors.push('Unknown or unsupported video codec');
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata,
    };
  } catch (error: any) {
    errors.push(`Failed to validate video: ${error.message}`);
    return {
      valid: false,
      errors,
    };
  }
}

export default {
  getVideoMetadata,
  extractAudio,
  generateThumbnail,
  generateThumbnails,
  convertVideo,
  trimVideo,
  mergeVideos,
  addWatermark,
  getVideoDuration,
  getVideoResolution,
  hasAudio,
  formatDuration,
  parseDuration,
  getAspectRatio,
  calculateRecommendedBitrate,
  validateVideo,
};