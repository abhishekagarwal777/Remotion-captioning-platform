// src/types/caption.ts

/**
 * Type definitions for captions
 */

/**
 * Caption style types
 */
export type CaptionStyle = 'bottom-centered' | 'top-bar' | 'karaoke';

/**
 * Caption format types
 */
export type CaptionFormat = 'srt' | 'vtt' | 'json';

/**
 * Caption interface
 */
export interface Caption {
  id: string;
  start: number; // Start time in seconds
  end: number; // End time in seconds
  text: string;
}

/**
 * Caption with additional metadata
 */
export interface CaptionWithMetadata extends Caption {
  duration?: number;
  wordCount?: number;
  language?: string;
  speaker?: string;
}

/**
 * Caption segment for word-level timing (karaoke style)
 */
export interface CaptionWord {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

/**
 * Caption segment with words
 */
export interface CaptionSegment extends Caption {
  words?: CaptionWord[];
}

/**
 * Caption style configuration
 */
export interface CaptionStyleConfig {
  id: CaptionStyle;
  name: string;
  description: string;
  preview: string;
  features: string[];
  icon?: string;
}

/**
 * Caption validation result
 */
export interface CaptionValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Caption edit action
 */
export type CaptionEditAction =
  | 'add'
  | 'update'
  | 'delete'
  | 'duplicate'
  | 'merge'
  | 'split';

/**
 * Caption edit history entry
 */
export interface CaptionEditHistory {
  action: CaptionEditAction;
  timestamp: Date;
  captionId: string;
  previousValue?: Caption;
  newValue?: Caption;
}

/**
 * Caption export options
 */
export interface CaptionExportOptions {
  format: CaptionFormat;
  includeMetadata?: boolean;
  encoding?: 'utf-8' | 'utf-16';
  lineEndings?: 'lf' | 'crlf';
}

/**
 * Caption import options
 */
export interface CaptionImportOptions {
  format?: CaptionFormat; // Auto-detect if not provided
  validate?: boolean;
  sanitize?: boolean;
  mergeOverlapping?: boolean;
}

/**
 * Caption statistics
 */
export interface CaptionStatistics {
  totalCaptions: number;
  totalDuration: number;
  averageDuration: number;
  averageWordsPerCaption: number;
  longestCaption: Caption | null;
  shortestCaption: Caption | null;
  gaps: Array<{ start: number; end: number; duration: number }>;
  overlaps: Array<{ caption1: Caption; caption2: Caption }>;
}

/**
 * Caption search options
 */
export interface CaptionSearchOptions {
  query: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
}

/**
 * Caption search result
 */
export interface CaptionSearchResult {
  caption: Caption;
  matchIndex: number;
  matchLength: number;
  context: string;
}

/**
 * Caption language detection result
 */
export interface CaptionLanguageDetection {
  language: string;
  confidence: number;
  alternatives?: Array<{ language: string; confidence: number }>;
}

/**
 * Caption timing adjustment
 */
export interface CaptionTimingAdjustment {
  offset: number; // Seconds to shift all captions
  scale?: number; // Scale factor for duration (1.0 = no change)
}

/**
 * Caption style preset
 */
export interface CaptionStylePreset {
  id: string;
  name: string;
  style: CaptionStyle;
  fontSize?: number;
  fontWeight?: number;
  backgroundColor?: string;
  textColor?: string;
  position?: 'top' | 'center' | 'bottom';
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Caption rendering options
 */
export interface CaptionRenderOptions {
  style: CaptionStyle;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textColor?: string;
  backgroundColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  padding?: number;
  borderRadius?: number;
  maxWidth?: string;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  animation?: {
    fadeIn?: boolean;
    fadeOut?: boolean;
    slideIn?: boolean;
    slideOut?: boolean;
    duration?: number;
  };
}

/**
 * Caption batch operation
 */
export interface CaptionBatchOperation {
  operation: 'update' | 'delete' | 'adjust-timing';
  captionIds: string[];
  data?: Partial<Caption> | CaptionTimingAdjustment;
}

/**
 * Caption filter options
 */
export interface CaptionFilterOptions {
  minDuration?: number;
  maxDuration?: number;
  minWords?: number;
  maxWords?: number;
  language?: string;
  speaker?: string;
  textContains?: string;
  timeRange?: { start: number; end: number };
}

/**
 * Type guard to check if caption is valid
 */
export function isValidCaption(caption: any): caption is Caption {
  return (
    typeof caption === 'object' &&
    caption !== null &&
    typeof caption.id === 'string' &&
    typeof caption.start === 'number' &&
    typeof caption.end === 'number' &&
    typeof caption.text === 'string' &&
    caption.start >= 0 &&
    caption.end > caption.start &&
    caption.text.trim().length > 0
  );
}

/**
 * Type guard to check if caption has words
 */
export function isCaptionSegment(caption: any): caption is CaptionSegment {
  return (
    isValidCaption(caption) &&
    'words' in caption &&
    Array.isArray(caption.words)
  );
}

export default {
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
  isValidCaption,
  isCaptionSegment,
};