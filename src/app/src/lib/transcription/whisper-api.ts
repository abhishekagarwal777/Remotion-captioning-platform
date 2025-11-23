// src/lib/transcription/whisper-api.ts

import { OpenAI } from 'openai';
import fs from 'fs/promises';
import { Caption } from '@/types';

/**
 * OpenAI Whisper transcription service
 */

// Initialize OpenAI client
let openAIClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
export function initializeOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (!openAIClient) {
    openAIClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openAIClient;
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Transcribe audio file using OpenAI Whisper
 */
export async function transcribeWithWhisper(
  audioFilePath: string,
  language?: string
): Promise<Caption[]> {
  try {
    const client = initializeOpenAI();

    console.log('Starting OpenAI Whisper transcription...');
    console.log('Audio file:', audioFilePath);

    // Read audio file
    const audioBuffer = await fs.readFile(audioFilePath);
    
    // Create File object from buffer
    const audioFile = new File([audioBuffer], audioFilePath.split('/').pop() || 'audio.mp3', {
      type: 'audio/mpeg',
    });

    console.log('Calling Whisper API...');

    // Transcribe with verbose JSON to get timestamps
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: language === 'auto' ? undefined : language,
    });

    console.log('Whisper transcription completed');
    console.log('Detected language:', (transcription as any).language);

    // Convert to captions
    const captions = convertWhisperToCaptions(transcription);

    console.log(`Generated ${captions.length} caption segments`);

    return captions;
  } catch (error: any) {
    console.error('Whisper transcription error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.status === 413) {
      throw new Error('Audio file is too large. Maximum size is 25MB.');
    }
    
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}

/**
 * Convert Whisper transcription to Caption format
 */
function convertWhisperToCaptions(transcription: any): Caption[] {
  const captions: Caption[] = [];

  // Check if we have segments with timestamps
  if (transcription.segments && transcription.segments.length > 0) {
    transcription.segments.forEach((segment: any, index: number) => {
      // Skip segments with no text
      if (!segment.text || segment.text.trim().length === 0) {
        return;
      }

      captions.push({
        id: `caption_${index + 1}`,
        start: segment.start,
        end: segment.end,
        text: segment.text.trim(),
      });
    });
  } else if (transcription.text) {
    // Fallback: Create single caption if no segments
    captions.push({
      id: 'caption_1',
      start: 0,
      end: 10,
      text: transcription.text.trim(),
    });
  }

  return captions;
}

/**
 * Transcribe with word-level timestamps (for karaoke-style captions)
 */
export async function transcribeWithWordTimestamps(
  audioFilePath: string,
  language?: string
): Promise<Caption[]> {
  try {
    const client = initializeOpenAI();

    console.log('Starting Whisper transcription with word timestamps...');

    const audioBuffer = await fs.readFile(audioFilePath);
    const audioFile = new File([audioBuffer], audioFilePath.split('/').pop() || 'audio.mp3', {
      type: 'audio/mpeg',
    });

    // Note: OpenAI's Whisper API doesn't directly support word-level timestamps
    // We use segment-level and can split by words manually
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: language === 'auto' ? undefined : language,
    });

    // Convert segments to word-level captions
    const captions: Caption[] = [];

    if (transcription.segments && transcription.segments.length > 0) {
      transcription.segments.forEach((segment: any, segmentIndex: number) => {
        const words = segment.text.trim().split(/\s+/);
        const segmentDuration = segment.end - segment.start;
        const wordDuration = segmentDuration / words.length;

        words.forEach((word: string, wordIndex: number) => {
          const wordStart = segment.start + (wordIndex * wordDuration);
          const wordEnd = wordStart + wordDuration;

          captions.push({
            id: `caption_${segmentIndex}_${wordIndex}`,
            start: wordStart,
            end: wordEnd,
            text: word,
          });
        });
      });
    }

    return captions;
  } catch (error: any) {
    console.error('Word-level transcription error:', error);
    throw new Error(`Word-level transcription failed: ${error.message}`);
  }
}

/**
 * Translate audio to English using Whisper
 */
export async function translateToEnglish(
  audioFilePath: string
): Promise<Caption[]> {
  try {
    const client = initializeOpenAI();

    console.log('Starting Whisper translation to English...');

    const audioBuffer = await fs.readFile(audioFilePath);
    const audioFile = new File([audioBuffer], audioFilePath.split('/').pop() || 'audio.mp3', {
      type: 'audio/mpeg',
    });

    // Use translation endpoint (always outputs English)
    const translation = await client.audio.translations.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    console.log('Whisper translation completed');

    // Convert to captions
    const captions = convertWhisperToCaptions(translation);

    return captions;
  } catch (error: any) {
    console.error('Whisper translation error:', error);
    throw new Error(`Whisper translation failed: ${error.message}`);
  }
}

/**
 * Get simple transcription (text only, no timestamps)
 */
export async function getSimpleTranscription(
  audioFilePath: string,
  language?: string
): Promise<string> {
  try {
    const client = initializeOpenAI();

    console.log('Getting simple transcription...');

    const audioBuffer = await fs.readFile(audioFilePath);
    const audioFile = new File([audioBuffer], audioFilePath.split('/').pop() || 'audio.mp3', {
      type: 'audio/mpeg',
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
      language: language === 'auto' ? undefined : language,
    });

    return transcription as unknown as string;
  } catch (error: any) {
    console.error('Simple transcription error:', error);
    throw new Error(`Simple transcription failed: ${error.message}`);
  }
}

/**
 * Get supported languages for Whisper
 */
export function getWhisperLanguages(): string[] {
  return [
    'af', 'ar', 'hy', 'az', 'be', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da',
    'nl', 'en', 'et', 'fi', 'fr', 'gl', 'de', 'el', 'he', 'hi', 'hu', 'is',
    'id', 'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'mr', 'mi',
    'ne', 'no', 'fa', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sw',
    'sv', 'tl', 'ta', 'th', 'tr', 'uk', 'ur', 'vi', 'cy'
  ];
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'cs': 'Czech',
    'ro': 'Romanian',
    'uk': 'Ukrainian',
    'el': 'Greek',
    'he': 'Hebrew',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fa': 'Persian',
    'ur': 'Urdu',
    'bn': 'Bengali',
  };

  return languageMap[code] || code.toUpperCase();
}

/**
 * Check OpenAI service health
 */
export async function checkOpenAIHealth(): Promise<{
  available: boolean;
  configured: boolean;
  message: string;
}> {
  const configured = isOpenAIConfigured();

  if (!configured) {
    return {
      available: false,
      configured: false,
      message: 'OpenAI API key not configured',
    };
  }

  try {
    // Try to initialize client
    const client = initializeOpenAI();

    // Test with a simple API call (list models)
    await client.models.list();

    return {
      available: true,
      configured: true,
      message: 'OpenAI service is available',
    };
  } catch (error: any) {
    return {
      available: false,
      configured: true,
      message: `OpenAI service error: ${error.message}`,
    };
  }
}

/**
 * Estimate transcription cost (approximate)
 */
export function estimateTranscriptionCost(audioFileSizeMB: number): number {
  // OpenAI Whisper pricing: $0.006 per minute (as of 2024)
  // Rough estimate: 1MB ≈ 1 minute of audio
  const estimatedMinutes = audioFileSizeMB;
  const costPerMinute = 0.006;
  return estimatedMinutes * costPerMinute;
}

export default {
  transcribeWithWhisper,
  transcribeWithWordTimestamps,
  translateToEnglish,
  getSimpleTranscription,
  getWhisperLanguages,
  getLanguageName,
  checkOpenAIHealth,
  estimateTranscriptionCost,
  isOpenAIConfigured,
};