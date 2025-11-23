// src/app/api/transcribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import { OpenAI } from 'openai';
// import { AssemblyAI } from 'assemblyai';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

// Validation schema
const TranscribeRequestSchema = z.object({
  videoPath: z.string(),
  provider: z.enum(['openai', 'assemblyai']).optional().default('openai'),
  language: z.string().optional(), // 'hi' for Hindi, 'en' for English, or 'auto' for detection
});

// Types
interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assemblyAIClient = process.env.ASSEMBLYAI_API_KEY
  ? new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    })
  : null;

/**
 * Extract audio from video file
 */
async function extractAudioFromVideo(
  videoPath: string,
  outputAudioPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputAudioPath)
      .audioCodec('libmp3lame')
      .audioFrequency(16000) // 16kHz for speech recognition
      .audioChannels(1) // Mono
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve();
      })
      .on('error', (err) => {
        console.error('Audio extraction error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Transcribe using OpenAI Whisper API
 */
async function transcribeWithOpenAI(
  audioPath: string,
  language?: string
): Promise<Caption[]> {
  try {
    console.log('Transcribing with OpenAI Whisper...');

    // Read audio file
    const audioFile = await fs.readFile(audioPath);
    const audioBlob = new File([audioFile], path.basename(audioPath), {
      type: 'audio/mp3',
    });

    // Call Whisper API with verbose response to get timestamps
    const transcription = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: language === 'auto' ? undefined : language, // undefined for auto-detection
    });

    console.log('OpenAI transcription completed');

    // Convert segments to Caption format
    const captions: Caption[] = [];
    
    if (transcription.segments) {
      transcription.segments.forEach((segment: any, index: number) => {
        captions.push({
          id: `caption_${index + 1}`,
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
        });
      });
    } else {
      // Fallback: Create single caption if no segments
      captions.push({
        id: 'caption_1',
        start: 0,
        end: 10,
        text: (transcription as any).text || '',
      });
    }

    return captions;
  } catch (error: any) {
    console.error('OpenAI transcription error:', error);
    throw new Error(`OpenAI transcription failed: ${error.message}`);
  }
}

/**
 * Transcribe using AssemblyAI
 */
async function transcribeWithAssemblyAI(
  audioPath: string,
  language?: string
): Promise<Caption[]> {
  try {
    if (!assemblyAIClient) {
      throw new Error('AssemblyAI API key not configured');
    }

    console.log('Transcribing with AssemblyAI...');

    // Upload audio file
    const audioFile = await fs.readFile(audioPath);
    const uploadUrl = await assemblyAIClient.files.upload(audioFile);

    // Configure transcription parameters
    const params: any = {
      audio_url: uploadUrl,
      language_detection: language === 'auto',
    };

    if (language && language !== 'auto') {
      params.language_code = language;
    }

    // Start transcription
    const transcript = await assemblyAIClient.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'AssemblyAI transcription failed');
    }

    console.log('AssemblyAI transcription completed');

    // Convert words to captions (group by sentences or time chunks)
    const captions: Caption[] = [];
    
    if (transcript.words && transcript.words.length > 0) {
      // Group words into caption segments (roughly 5 seconds or sentence boundaries)
      let currentCaption: TranscriptionSegment = {
        start: transcript.words[0].start / 1000, // Convert ms to seconds
        end: transcript.words[0].end / 1000,
        text: transcript.words[0].text,
      };

      for (let i = 1; i < transcript.words.length; i++) {
        const word = transcript.words[i];
        const wordStart = word.start / 1000;
        const wordEnd = word.end / 1000;
        
        // Create new caption if:
        // 1. Current caption is longer than 5 seconds
        // 2. Or if there's a significant pause (> 1 second)
        const shouldBreak =
          wordEnd - currentCaption.start > 5 ||
          wordStart - currentCaption.end > 1 ||
          word.text.match(/[.!?]$/); // Sentence ending

        if (shouldBreak) {
          captions.push({
            id: `caption_${captions.length + 1}`,
            start: currentCaption.start,
            end: currentCaption.end,
            text: currentCaption.text.trim(),
          });

          currentCaption = {
            start: wordStart,
            end: wordEnd,
            text: word.text,
          };
        } else {
          currentCaption.end = wordEnd;
          currentCaption.text += ' ' + word.text;
        }
      }

      // Add last caption
      if (currentCaption.text) {
        captions.push({
          id: `caption_${captions.length + 1}`,
          start: currentCaption.start,
          end: currentCaption.end,
          text: currentCaption.text.trim(),
        });
      }
    } else if (transcript.text) {
      // Fallback: Create single caption
      captions.push({
        id: 'caption_1',
        start: 0,
        end: 10,
        text: transcript.text,
      });
    }

    return captions;
  } catch (error: any) {
    console.error('AssemblyAI transcription error:', error);
    throw new Error(`AssemblyAI transcription failed: ${error.message}`);
  }
}

/**
 * Clean up temporary audio file
 */
async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log('Temporary audio file deleted:', filePath);
  } catch (error) {
    console.error('Failed to delete temporary file:', error);
  }
}

/**
 * POST handler - Transcribe video
 */
export async function POST(request: NextRequest) {
  let tempAudioPath: string | null = null;

  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = TranscribeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { videoPath, provider, language } = validationResult.data;

    // Check if API keys are configured
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured',
          message: 'Please add OPENAI_API_KEY to your environment variables',
        },
        { status: 500 }
      );
    }

    if (provider === 'assemblyai' && !process.env.ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'AssemblyAI API key not configured',
          message: 'Please add ASSEMBLYAI_API_KEY to your environment variables',
        },
        { status: 500 }
      );
    }

    // Verify video file exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    const fullVideoPath = path.join(uploadDir, videoPath);

    try {
      await fs.access(fullVideoPath);
    } catch {
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      );
    }

    // Extract audio from video
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    tempAudioPath = path.join(
      tempDir,
      `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`
    );

    console.log('Extracting audio from video...');
    await extractAudioFromVideo(fullVideoPath, tempAudioPath);

    // Transcribe using selected provider
    let captions: Caption[];
    
    if (provider === 'openai') {
      captions = await transcribeWithOpenAI(tempAudioPath, language);
    } else {
      captions = await transcribeWithAssemblyAI(tempAudioPath, language);
    }

    // Clean up temporary audio file
    await cleanupTempFile(tempAudioPath);
    tempAudioPath = null;

    // Return captions
    return NextResponse.json(
      {
        success: true,
        provider,
        captionsCount: captions.length,
        captions,
        message: 'Transcription completed successfully',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Transcription error:', error);

    // Clean up temp file if it exists
    if (tempAudioPath) {
      await cleanupTempFile(tempAudioPath);
    }

    // Handle specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'API configuration error',
          message: error.message,
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'API rate limit exceeded',
          message: 'Please try again later or check your API quota',
        },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Transcription failed',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET handler - Check transcription service status
export async function GET(request: NextRequest) {
  try {
    const status = {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        available: !!process.env.OPENAI_API_KEY,
      },
      assemblyai: {
        configured: !!process.env.ASSEMBLYAI_API_KEY,
        available: !!process.env.ASSEMBLYAI_API_KEY,
      },
    };

    return NextResponse.json(
      {
        success: true,
        services: status,
        defaultProvider: status.openai.available ? 'openai' : 'assemblyai',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to check service status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 300, // 5 minutes for Vercel Pro
};