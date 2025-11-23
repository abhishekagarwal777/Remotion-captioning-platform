// src/types/video.ts

/**
 * Type definitions for video processing
 */

/**
 * Video metadata interface
 */
export interface VideoMetadata {
  duration: number; // Duration in seconds
  width: number;
  height: number;
  codec: string;
  fps: number;
  bitrate: number;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  format?: string;
  size?: number; // File size in bytes
}

/**
 * Video file information
 */
export interface VideoFile {
  originalName: string;
  fileName: string;
  filePath: string;
  size: number;
  type: string;
  uploadedAt: string;
  metadata?: VideoMetadata;
}

/**
 * Video upload status
 */
export type VideoUploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

/**
 * Video upload state
 */
export interface VideoUploadState {
  status: VideoUploadStatus;
  progress: number; // 0-100
  error: string | null;
  file: VideoFile | null;
}

/**
 * Video resolution preset
 */
export interface VideoResolution {
  name: string;
  width: number;
  height: number;
  bitrate: string;
}

/**
 * Video codec options
 */
export type VideoCodec = 'h264' | 'h265' | 'vp8' | 'vp9';

/**
 * Audio codec options
 */
export type AudioCodec = 'aac' | 'mp3' | 'opus' | 'vorbis';

/**
 * Video conversion options
 */
export interface VideoConversionOptions {
  codec?: VideoCodec;
  resolution?: { width: number; height: number };
  fps?: number;
  videoBitrate?: string;
  audioBitrate?: string;
  audioCodec?: AudioCodec;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Video trim options
 */
export interface VideoTrimOptions {
  startTime: number; // Seconds
  endTime: number; // Seconds
}

/**
 * Video rendering status
 */
export type VideoRenderStatus = 'idle' | 'bundling' | 'rendering' | 'finalizing' | 'completed' | 'error';

/**
 * Video rendering state
 */
export interface VideoRenderState {
  status: VideoRenderStatus;
  progress: number; // 0-100
  error: string | null;
  stage: string;
  outputFile: string | null;
}

/**
 * Video rendering options
 */
export interface VideoRenderOptions {
  videoPath: string;
  captions: any[]; // Caption array
  style: string; // Caption style
  outputFileName?: string;
  codec?: VideoCodec;
  videoBitrate?: string;
  audioBitrate?: string;
  concurrency?: number;
  timeout?: number;
}

/**
 * Video quality preset
 */
export interface VideoQualityPreset {
  id: string;
  name: string;
  description: string;
  resolution: { width: number; height: number };
  videoBitrate: string;
  audioBitrate: string;
  codec: VideoCodec;
  fps: number;
}

/**
 * Video export options
 */
export interface VideoExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'avi';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  includeAudio: boolean;
  watermark?: {
    imagePath: string;
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
    opacity?: number;
    scale?: number;
  };
}

/**
 * Video processing job
 */
export interface VideoProcessingJob {
  id: string;
  type: 'upload' | 'transcode' | 'render' | 'trim' | 'merge';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFile: string;
  outputFile?: string;
  options?: any;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Video thumbnail options
 */
export interface VideoThumbnailOptions {
  time?: number; // Time in seconds to capture thumbnail
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp';
  quality?: number; // 0-100
}

/**
 * Video analysis result
 */
export interface VideoAnalysis {
  hasAudio: boolean;
  hasVideo: boolean;
  duration: number;
  keyframes: number[];
  scenes: Array<{ start: number; end: number }>;
  audioLevels?: number[];
  motionData?: any;
}

/**
 * Video validation result
 */
export interface VideoValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: VideoMetadata;
}

/**
 * Video aspect ratio
 */
export interface VideoAspectRatio {
  ratio: string; // e.g., "16:9"
  decimal: number; // e.g., 1.777...
  width: number;
  height: number;
}

/**
 * Video stream information
 */
export interface VideoStream {
  index: number;
  codecType: 'video' | 'audio' | 'subtitle';
  codecName: string;
  width?: number;
  height?: number;
  frameRate?: number;
  bitrate?: number;
  duration?: number;
  channels?: number;
  sampleRate?: number;
}

/**
 * Video merge options
 */
export interface VideoMergeOptions {
  inputVideos: string[];
  outputPath: string;
  transition?: {
    type: 'fade' | 'dissolve' | 'none';
    duration?: number; // Seconds
  };
  resolution?: { width: number; height: number };
  codec?: VideoCodec;
}

/**
 * Video watermark options
 */
export interface VideoWatermarkOptions {
  imagePath: string;
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
  opacity?: number; // 0-1
  scale?: number; // Scale factor
  margin?: { x: number; y: number };
}

/**
 * Video playback state
 */
export interface VideoPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isBuffering: boolean;
  error: string | null;
}

/**
 * Video player controls
 */
export interface VideoPlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  skipForward: (seconds: number) => void;
  skipBackward: (seconds: number) => void;
}

/**
 * Type guard to check if video metadata is valid
 */
export function isValidVideoMetadata(metadata: any): metadata is VideoMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    typeof metadata.duration === 'number' &&
    typeof metadata.width === 'number' &&
    typeof metadata.height === 'number' &&
    typeof metadata.codec === 'string' &&
    metadata.duration > 0 &&
    metadata.width > 0 &&
    metadata.height > 0
  );
}

/**
 * Type guard to check if video file is valid
 */
export function isValidVideoFile(file: any): file is VideoFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    typeof file.originalName === 'string' &&
    typeof file.fileName === 'string' &&
    typeof file.filePath === 'string' &&
    typeof file.size === 'number' &&
    typeof file.type === 'string' &&
    file.size > 0
  );
}

export default {
  VideoMetadata,
  VideoFile,
  VideoUploadStatus,
  VideoUploadState,
  VideoResolution,
  VideoCodec,
  AudioCodec,
  VideoConversionOptions,
  VideoTrimOptions,
  VideoRenderStatus,
  VideoRenderState,
  VideoRenderOptions,
  VideoQualityPreset,
  VideoExportOptions,
  VideoProcessingJob,
  VideoThumbnailOptions,
  VideoAnalysis,
  VideoValidationResult,
  VideoAspectRatio,
  VideoStream,
  VideoMergeOptions,
  VideoWatermarkOptions,
  VideoPlaybackState,
  VideoPlayerControls,
  isValidVideoMetadata,
  isValidVideoFile,
};