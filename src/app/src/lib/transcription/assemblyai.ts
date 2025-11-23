// src/lib/transcription/assemblyai.ts

import { AssemblyAI, Transcript } from 'assemblyai';
import fs from 'fs/promises';
import { Caption } from '@/types';

/**
 * AssemblyAI transcription service
 */

// Initialize AssemblyAI client
let assemblyAIClient: AssemblyAI | null = null;

/**
 * Initialize AssemblyAI client
 */
export function initializeAssemblyAI(): AssemblyAI {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error('ASSEMBLYAI_API_KEY is not configured');
  }

  if (!assemblyAIClient) {
    assemblyAIClient = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    });
  }

  return assemblyAIClient;
}

/**
 * Check if AssemblyAI is configured
 */
export function isAssemblyAIConfigured(): boolean {
  return !!process.env.ASSEMBLYAI_API_KEY;
}

/**
 * Transcribe audio file using AssemblyAI
 */
export async function transcribeWithAssemblyAI(
  audioFilePath: string,
  language?: string
): Promise<Caption[]> {
  try {
    const client = initializeAssemblyAI();

    console.log('Starting AssemblyAI transcription...');
    console.log('Audio file:', audioFilePath);

    // Read audio file
    const audioBuffer = await fs.readFile(audioFilePath);

    // Upload audio file to AssemblyAI
    console.log('Uploading audio file to AssemblyAI...');
    const uploadUrl = await client.files.upload(audioBuffer);
    console.log('Audio uploaded:', uploadUrl);

    // Configure transcription parameters
    const transcriptionConfig: any = {
      audio_url: uploadUrl,
      language_detection: language === 'auto' || !language,
      speaker_labels: false, // Can be enabled for speaker diarization
      punctuate: true,
      format_text: true,
    };

    // Set specific language if provided
    if (language && language !== 'auto') {
      transcriptionConfig.language_code = language;
    }

    // Start transcription
    console.log('Starting transcription...');
    const transcript = await client.transcripts.transcribe(transcriptionConfig);

    // Check for errors
    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'AssemblyAI transcription failed');
    }

    console.log('Transcription completed successfully');
    console.log('Detected language:', transcript.language_code);

    // Convert to captions
    const captions = convertAssemblyAIToCaptions(transcript);

    console.log(`Generated ${captions.length} caption segments`);

    return captions;
  } catch (error: any) {
    console.error('AssemblyAI transcription error:', error);
    throw new Error(`AssemblyAI transcription failed: ${error.message}`);
  }
}

/**
 * Convert AssemblyAI transcript to Caption format
 */
function convertAssemblyAIToCaptions(transcript: Transcript): Caption[] {
  const captions: Caption[] = [];

  if (!transcript.words || transcript.words.length === 0) {
    // Fallback: Use full text if no word-level timing
    if (transcript.text) {
      captions.push({
        id: 'caption_1',
        start: 0,
        end: 10,
        text: transcript.text,
      });
    }
    return captions;
  }

  // Group words into caption segments
  // Strategy: Group by time chunks (max 5 seconds) or sentence boundaries
  let currentSegment: {
    start: number;
    end: number;
    words: string[];
  } | null = null;

  const MAX_SEGMENT_DURATION = 5; // seconds
  const MAX_WORDS_PER_SEGMENT = 12;

  for (let i = 0; i < transcript.words.length; i++) {
    const word = transcript.words[i];
    
    if (!word.start || !word.end || !word.text) continue;

    const wordStart = word.start / 1000; // Convert ms to seconds
    const wordEnd = word.end / 1000;

    // Initialize first segment
    if (!currentSegment) {
      currentSegment = {
        start: wordStart,
        end: wordEnd,
        words: [word.text],
      };
      continue;
    }

    // Calculate if we should create a new segment
    const segmentDuration = wordEnd - currentSegment.start;
    const wordCount = currentSegment.words.length;
    const timeSinceLastWord = wordStart - currentSegment.end;
    const isEndOfSentence = word.text.match(/[.!?]$/);
    const isLongPause = timeSinceLastWord > 1.0; // 1 second pause

    // Create new segment if:
    // 1. Segment is too long (duration or word count)
    // 2. End of sentence
    // 3. Long pause between words
    const shouldBreak =
      segmentDuration > MAX_SEGMENT_DURATION ||
      wordCount >= MAX_WORDS_PER_SEGMENT ||
      (isEndOfSentence && wordCount >= 5) ||
      isLongPause;

    if (shouldBreak) {
      // Save current segment
      captions.push({
        id: `caption_${captions.length + 1}`,
        start: currentSegment.start,
        end: currentSegment.end,
        text: currentSegment.words.join(' ').trim(),
      });

      // Start new segment
      currentSegment = {
        start: wordStart,
        end: wordEnd,
        words: [word.text],
      };
    } else {
      // Add word to current segment
      currentSegment.end = wordEnd;
      currentSegment.words.push(word.text);
    }
  }

  // Add last segment
  if (currentSegment && currentSegment.words.length > 0) {
    captions.push({
      id: `caption_${captions.length + 1}`,
      start: currentSegment.start,
      end: currentSegment.end,
      text: currentSegment.words.join(' ').trim(),
    });
  }

  return captions;
}

/**
 * Get supported languages for AssemblyAI
 */
export function getAssemblyAILanguages(): string[] {
  return [
    'en', // English (Global)
    'en_au', // English (Australia)
    'en_uk', // English (UK)
    'en_us', // English (US)
    'es', // Spanish
    'fr', // French
    'de', // German
    'it', // Italian
    'pt', // Portuguese
    'nl', // Dutch
    'hi', // Hindi
    'ja', // Japanese
    'zh', // Chinese
    'fi', // Finnish
    'ko', // Korean
    'pl', // Polish
    'ru', // Russian
    'tr', // Turkish
    'uk', // Ukrainian
    'vi', // Vietnamese
  ];
}

/**
 * Transcribe with speaker diarization (identify different speakers)
 */
export async function transcribeWithSpeakers(
  audioFilePath: string,
  language?: string
): Promise<{
  captions: Caption[];
  speakers: Map<string, string[]>;
}> {
  try {
    const client = initializeAssemblyAI();

    console.log('Starting AssemblyAI transcription with speaker diarization...');

    const audioBuffer = await fs.readFile(audioFilePath);
    const uploadUrl = await client.files.upload(audioBuffer);

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      language_detection: language === 'auto' || !language,
      speaker_labels: true, // Enable speaker diarization
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    // Convert to captions with speaker labels
    const captions: Caption[] = [];
    const speakers = new Map<string, string[]>();

    if (transcript.utterances) {
      transcript.utterances.forEach((utterance, index) => {
        const caption: Caption = {
          id: `caption_${index + 1}`,
          start: utterance.start / 1000,
          end: utterance.end / 1000,
          text: utterance.text,
        };

        captions.push(caption);

        // Track speaker utterances
        const speaker = utterance.speaker || 'Unknown';
        if (!speakers.has(speaker)) {
          speakers.set(speaker, []);
        }
        speakers.get(speaker)!.push(utterance.text);
      });
    }

    return { captions, speakers };
  } catch (error: any) {
    console.error('Speaker diarization error:', error);
    throw new Error(`Speaker diarization failed: ${error.message}`);
  }
}

/**
 * Get transcript summary using AssemblyAI
 */
export async function getTranscriptSummary(
  audioFilePath: string
): Promise<{
  summary: string;
  captions: Caption[];
}> {
  try {
    const client = initializeAssemblyAI();

    console.log('Generating transcript summary...');

    const audioBuffer = await fs.readFile(audioFilePath);
    const uploadUrl = await client.files.upload(audioBuffer);

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      summarization: true,
      summary_model: 'informative',
      summary_type: 'bullets',
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    const captions = convertAssemblyAIToCaptions(transcript);
    const summary = transcript.summary || 'No summary available';

    return { summary, captions };
  } catch (error: any) {
    console.error('Summary generation error:', error);
    throw new Error(`Summary generation failed: ${error.message}`);
  }
}

/**
 * Detect language of audio file
 */
export async function detectLanguage(
  audioFilePath: string
): Promise<string> {
  try {
    const client = initializeAssemblyAI();

    console.log('Detecting audio language...');

    const audioBuffer = await fs.readFile(audioFilePath);
    const uploadUrl = await client.files.upload(audioBuffer);

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      language_detection: true,
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Language detection failed');
    }

    return transcript.language_code || 'unknown';
  } catch (error: any) {
    console.error('Language detection error:', error);
    throw new Error(`Language detection failed: ${error.message}`);
  }
}

/**
 * Check AssemblyAI service health
 */
export async function checkAssemblyAIHealth(): Promise<{
  available: boolean;
  configured: boolean;
  message: string;
}> {
  const configured = isAssemblyAIConfigured();

  if (!configured) {
    return {
      available: false,
      configured: false,
      message: 'AssemblyAI API key not configured',
    };
  }

  try {
    // Try to initialize client
    initializeAssemblyAI();

    return {
      available: true,
      configured: true,
      message: 'AssemblyAI service is available',
    };
  } catch (error: any) {
    return {
      available: false,
      configured: true,
      message: `AssemblyAI service error: ${error.message}`,
    };
  }
}

export default {
  transcribeWithAssemblyAI,
  transcribeWithSpeakers,
  getTranscriptSummary,
  detectLanguage,
  checkAssemblyAIHealth,
  getAssemblyAILanguages,
  isAssemblyAIConfigured,
};