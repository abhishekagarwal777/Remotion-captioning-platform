// src/types/index.ts

/**
 * Central export file for all type definitions
 */

// Caption types
export type {
  Caption,
  CaptionStyle,
  CaptionFormat,
  CaptionWithMetadata,
  CaptionWord,
  CaptionSegment,
  CaptionStyleConfig,
  CaptionValidationResult,
  CaptionEditAction,
  CaptionEditHistory,
  CaptionExportOptions,
  CaptionImportOptions,
  CaptionStatistics,
  CaptionSearchOptions,
  CaptionSearchResult,
  CaptionLanguageDetection,
  CaptionTimingAdjustment,
  CaptionStylePreset,
  CaptionRenderOptions,
  CaptionBatchOperation,
  CaptionFilterOptions,
} from './caption';

export { isValidCaption, isCaptionSegment } from './caption';

// Video types
export type {
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
} from './video';

export { isValidVideoMetadata, isValidVideoFile } from './video';

// Common types used across the application
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ProcessingProgress {
  stage: string;
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number; // seconds
}

export type FileType = 'video' | 'audio' | 'caption' | 'image' | 'document';

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface StorageInfo {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export type Language = 
  | 'en' 
  | 'es' 
  | 'fr' 
  | 'de' 
  | 'it' 
  | 'pt' 
  | 'ru' 
  | 'ja' 
  | 'ko' 
  | 'zh' 
  | 'ar' 
  | 'hi' 
  | 'nl' 
  | 'pl' 
  | 'tr' 
  | 'vi' 
  | 'th';

export interface UserPreferences {
  theme: ThemeMode;
  language: Language;
  defaultCaptionStyle: CaptionStyle;
  defaultTranscriptionProvider: 'openai' | 'assemblyai';
  autoSave: boolean;
  notifications: boolean;
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SearchOptions {
  query: string;
  fields?: string[];
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type Alignment = 'left' | 'center' | 'right';

export type VerticalAlignment = 'top' | 'middle' | 'bottom';

export interface TextStyle {
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  color: string;
  textAlign: Alignment;
  lineHeight: number;
}

export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

export interface NameValuePair<T = any> {
  name: string;
  value: T;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DialogOptions {
  title: string;
  content: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onClose?: () => void;
}

// Utility types
export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type PromiseType<T> = T extends Promise<infer U> ? U : never;

export type FunctionType<T extends (...args: any[]) => any> = T extends (
  ...args: infer A
) => infer R
  ? (...args: A) => R
  : never;

// Export everything
export default {
  // Types are exported individually above
};