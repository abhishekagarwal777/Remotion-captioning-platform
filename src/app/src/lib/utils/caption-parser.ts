// src/lib/utils/caption-parser.ts

import { Caption } from '@/types';

/**
 * Utility functions for parsing and formatting caption files
 */

/**
 * Parse SRT (SubRip) format to Caption array
 */
export function parseSRT(srtContent: string): Caption[] {
  const captions: Caption[] = [];
  
  // Split by double newlines (caption blocks)
  const blocks = srtContent.trim().split(/\n\s*\n/);

  blocks.forEach((block, blockIndex) => {
    const lines = block.trim().split('\n');
    
    // Need at least 3 lines: index, timestamp, text
    if (lines.length < 3) {
      return;
    }

    // Line 0: Index (e.g., "1")
    // Line 1: Timestamp (e.g., "00:00:00,000 --> 00:00:05,000")
    // Line 2+: Caption text
    
    const timeLine = lines[1];
    const textLines = lines.slice(2);
    
    // Parse timestamp line
    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );
    
    if (!timeMatch) {
      console.warn(`Invalid timestamp format in block ${blockIndex + 1}`);
      return;
    }

    // Extract start time
    const startHours = parseInt(timeMatch[1], 10);
    const startMinutes = parseInt(timeMatch[2], 10);
    const startSeconds = parseInt(timeMatch[3], 10);
    const startMs = parseInt(timeMatch[4], 10);
    const start = startHours * 3600 + startMinutes * 60 + startSeconds + startMs / 1000;

    // Extract end time
    const endHours = parseInt(timeMatch[5], 10);
    const endMinutes = parseInt(timeMatch[6], 10);
    const endSeconds = parseInt(timeMatch[7], 10);
    const endMs = parseInt(timeMatch[8], 10);
    const end = endHours * 3600 + endMinutes * 60 + endSeconds + endMs / 1000;

    // Combine text lines (handling multi-line captions)
    const text = textLines.join(' ').trim();

    if (text) {
      captions.push({
        id: `caption_${blockIndex + 1}`,
        start,
        end,
        text,
      });
    }
  });

  return captions;
}

/**
 * Generate SRT format from Caption array
 */
export function generateSRT(captions: Caption[]): string {
  return captions
    .map((caption, index) => {
      const startTime = formatSRTTime(caption.start);
      const endTime = formatSRTTime(caption.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    })
    .join('\n');
}

/**
 * Format time in seconds to SRT format (HH:MM:SS,mmm)
 */
export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
    .toString()
    .padStart(3, '0')}`;
}

/**
 * Parse VTT (WebVTT) format to Caption array
 */
export function parseVTT(vttContent: string): Caption[] {
  const captions: Caption[] = [];
  
  // Remove WEBVTT header
  const content = vttContent.replace(/^WEBVTT\s*\n\s*\n?/i, '');
  
  // Split by double newlines
  const blocks = content.trim().split(/\n\s*\n/);

  blocks.forEach((block, blockIndex) => {
    const lines = block.trim().split('\n');
    
    if (lines.length < 2) {
      return;
    }

    // VTT can have optional cue identifier
    let timeLineIndex = 0;
    let textStartIndex = 1;

    // Check if first line is a cue identifier (doesn't contain -->)
    if (!lines[0].includes('-->')) {
      timeLineIndex = 1;
      textStartIndex = 2;
    }

    const timeLine = lines[timeLineIndex];
    const textLines = lines.slice(textStartIndex);
    
    // Parse timestamp (VTT uses . instead of , for milliseconds)
    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/
    );
    
    if (!timeMatch) {
      console.warn(`Invalid VTT timestamp format in block ${blockIndex + 1}`);
      return;
    }

    // Extract times (same as SRT)
    const startHours = parseInt(timeMatch[1], 10);
    const startMinutes = parseInt(timeMatch[2], 10);
    const startSeconds = parseInt(timeMatch[3], 10);
    const startMs = parseInt(timeMatch[4], 10);
    const start = startHours * 3600 + startMinutes * 60 + startSeconds + startMs / 1000;

    const endHours = parseInt(timeMatch[5], 10);
    const endMinutes = parseInt(timeMatch[6], 10);
    const endSeconds = parseInt(timeMatch[7], 10);
    const endMs = parseInt(timeMatch[8], 10);
    const end = endHours * 3600 + endMinutes * 60 + endSeconds + endMs / 1000;

    // Remove VTT tags (e.g., <c>, <v>, etc.)
    const text = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (text) {
      captions.push({
        id: `caption_${blockIndex + 1}`,
        start,
        end,
        text,
      });
    }
  });

  return captions;
}

/**
 * Generate VTT format from Caption array
 */
export function generateVTT(captions: Caption[]): string {
  let vtt = 'WEBVTT\n\n';
  
  captions.forEach((caption, index) => {
    const startTime = formatVTTTime(caption.start);
    const endTime = formatVTTTime(caption.end);
    vtt += `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n\n`;
  });

  return vtt;
}

/**
 * Format time in seconds to VTT format (HH:MM:SS.mmm)
 */
export function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
    .toString()
    .padStart(3, '0')}`;
}

/**
 * Parse JSON format to Caption array
 */
export function parseJSON(jsonContent: string): Caption[] {
  try {
    const data = JSON.parse(jsonContent);
    
    // Handle array of captions
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: item.id || `caption_${index + 1}`,
        start: item.start || 0,
        end: item.end || 0,
        text: item.text || '',
      }));
    }
    
    // Handle object with captions property
    if (data.captions && Array.isArray(data.captions)) {
      return data.captions.map((item: any, index: number) => ({
        id: item.id || `caption_${index + 1}`,
        start: item.start || 0,
        end: item.end || 0,
        text: item.text || '',
      }));
    }
    
    throw new Error('Invalid JSON format');
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new Error('Failed to parse JSON captions');
  }
}

/**
 * Generate JSON format from Caption array
 */
export function generateJSON(captions: Caption[]): string {
  return JSON.stringify({ captions }, null, 2);
}

/**
 * Detect caption file format
 */
export function detectFormat(content: string): 'srt' | 'vtt' | 'json' | 'unknown' {
  const trimmed = content.trim();
  
  // Check for WEBVTT header
  if (trimmed.startsWith('WEBVTT')) {
    return 'vtt';
  }
  
  // Check for JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check for SRT format (starts with number, has --> in first few lines)
  const lines = trimmed.split('\n').slice(0, 5);
  if (lines.some(line => line.includes('-->'))) {
    return 'srt';
  }
  
  return 'unknown';
}

/**
 * Auto-parse caption file based on detected format
 */
export function parseAuto(content: string): Caption[] {
  const format = detectFormat(content);
  
  switch (format) {
    case 'srt':
      return parseSRT(content);
    case 'vtt':
      return parseVTT(content);
    case 'json':
      return parseJSON(content);
    default:
      throw new Error('Unknown caption format');
  }
}

/**
 * Validate caption array
 */
export function validateCaptions(captions: Caption[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(captions)) {
    errors.push('Captions must be an array');
    return { valid: false, errors };
  }

  if (captions.length === 0) {
    errors.push('Caption array is empty');
    return { valid: false, errors };
  }

  captions.forEach((caption, index) => {
    // Check required fields
    if (!caption.id) {
      errors.push(`Caption ${index + 1}: Missing id`);
    }
    
    if (typeof caption.start !== 'number') {
      errors.push(`Caption ${index + 1}: Invalid start time`);
    }
    
    if (typeof caption.end !== 'number') {
      errors.push(`Caption ${index + 1}: Invalid end time`);
    }
    
    if (!caption.text || caption.text.trim().length === 0) {
      errors.push(`Caption ${index + 1}: Empty text`);
    }

    // Check time validity
    if (caption.start < 0) {
      errors.push(`Caption ${index + 1}: Start time cannot be negative`);
    }
    
    if (caption.end <= caption.start) {
      errors.push(`Caption ${index + 1}: End time must be after start time`);
    }

    // Check overlap with next caption
    if (index < captions.length - 1) {
      const nextCaption = captions[index + 1];
      if (caption.end > nextCaption.start) {
        errors.push(
          `Caption ${index + 1} overlaps with caption ${index + 2}`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge overlapping or consecutive captions
 */
export function mergeCaptions(
  captions: Caption[],
  maxGap: number = 0.5
): Caption[] {
  if (captions.length === 0) return [];

  const merged: Caption[] = [];
  let current = { ...captions[0] };

  for (let i = 1; i < captions.length; i++) {
    const next = captions[i];
    const gap = next.start - current.end;

    // Merge if gap is small enough
    if (gap <= maxGap) {
      current.end = next.end;
      current.text += ' ' + next.text;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Split long captions into smaller segments
 */
export function splitLongCaptions(
  captions: Caption[],
  maxDuration: number = 5,
  maxWords: number = 12
): Caption[] {
  const split: Caption[] = [];

  captions.forEach((caption, captionIndex) => {
    const duration = caption.end - caption.start;
    const words = caption.text.split(/\s+/);

    // No need to split
    if (duration <= maxDuration && words.length <= maxWords) {
      split.push(caption);
      return;
    }

    // Split by words
    const wordsPerSegment = Math.ceil(words.length / Math.ceil(words.length / maxWords));
    const segmentDuration = duration / Math.ceil(words.length / wordsPerSegment);

    for (let i = 0; i < words.length; i += wordsPerSegment) {
      const segmentWords = words.slice(i, i + wordsPerSegment);
      const segmentIndex = Math.floor(i / wordsPerSegment);
      
      split.push({
        id: `${caption.id}_${segmentIndex + 1}`,
        start: caption.start + (segmentIndex * segmentDuration),
        end: Math.min(
          caption.start + ((segmentIndex + 1) * segmentDuration),
          caption.end
        ),
        text: segmentWords.join(' '),
      });
    }
  });

  return split;
}

/**
 * Adjust caption timing (shift all captions by offset)
 */
export function adjustTiming(captions: Caption[], offsetSeconds: number): Caption[] {
  return captions.map(caption => ({
    ...caption,
    start: Math.max(0, caption.start + offsetSeconds),
    end: Math.max(0, caption.end + offsetSeconds),
  }));
}

/**
 * Get caption at specific time
 */
export function getCaptionAtTime(captions: Caption[], time: number): Caption | null {
  return captions.find(caption => time >= caption.start && time <= caption.end) || null;
}

/**
 * Calculate total duration of captions
 */
export function getTotalDuration(captions: Caption[]): number {
  if (captions.length === 0) return 0;
  return Math.max(...captions.map(c => c.end));
}

export default {
  parseSRT,
  generateSRT,
  parseVTT,
  generateVTT,
  parseJSON,
  generateJSON,
  detectFormat,
  parseAuto,
  validateCaptions,
  mergeCaptions,
  splitLongCaptions,
  adjustTiming,
  getCaptionAtTime,
  getTotalDuration,
  formatSRTTime,
  formatVTTTime,
};