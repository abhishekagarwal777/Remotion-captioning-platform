// src/hooks/useTranscription.ts

'use client';

import { useState, useCallback } from 'react';
import { Caption } from '@/types';

type TranscriptionProvider = 'openai' | 'assemblyai';

interface TranscriptionOptions {
  provider?: TranscriptionProvider;
  language?: string;
}

interface TranscriptionState {
  isTranscribing: boolean;
  progress: number;
  error: string | null;
  captions: Caption[];
}

interface TranscriptionResult {
  captions: Caption[];
  provider: TranscriptionProvider;
  captionsCount: number;
}

interface UseTranscriptionReturn {
  state: TranscriptionState;
  transcribe: (videoPath: string, options?: TranscriptionOptions) => Promise<Caption[]>;
  reset: () => void;
  checkServiceStatus: () => Promise<{
    openai: { configured: boolean; available: boolean };
    assemblyai: { configured: boolean; available: boolean };
    defaultProvider: TranscriptionProvider;
  }>;
}

/**
 * Custom hook for handling video transcription
 */
export const useTranscription = (): UseTranscriptionReturn => {
  const [state, setState] = useState<TranscriptionState>({
    isTranscribing: false,
    progress: 0,
    error: null,
    captions: [],
  });

  /**
   * Check transcription service status
   */
  const checkServiceStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to check service status');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Failed to check service status:', error);
      throw error;
    }
  }, []);

  /**
   * Transcribe video
   */
  const transcribe = useCallback(
    async (
      videoPath: string,
      options: TranscriptionOptions = {}
    ): Promise<Caption[]> => {
      const { provider = 'openai', language = 'auto' } = options;

      // Reset state
      setState({
        isTranscribing: true,
        progress: 10,
        error: null,
        captions: [],
      });

      try {
        // Update progress
        setState((prev) => ({ ...prev, progress: 20 }));

        // Call transcription API
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoPath,
            provider,
            language,
          }),
        });

        // Update progress
        setState((prev) => ({ ...prev, progress: 60 }));

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Transcription failed');
        }

        const data: TranscriptionResult = await response.json();

        // Update progress
        setState((prev) => ({ ...prev, progress: 90 }));

        // Validate captions
        if (!data.captions || data.captions.length === 0) {
          throw new Error('No captions were generated. The video might not contain any speech.');
        }

        // Complete
        setState({
          isTranscribing: false,
          progress: 100,
          error: null,
          captions: data.captions,
        });

        return data.captions;
      } catch (error: any) {
        console.error('Transcription error:', error);

        setState({
          isTranscribing: false,
          progress: 0,
          error: error.message || 'Failed to transcribe video',
          captions: [],
        });

        throw error;
      }
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isTranscribing: false,
      progress: 0,
      error: null,
      captions: [],
    });
  }, []);

  return {
    state,
    transcribe,
    reset,
    checkServiceStatus,
  };
};

export default useTranscription;