// src/hooks/useVideoRender.ts

'use client';

import { useState, useCallback } from 'react';
import { Caption, CaptionStyle } from '@/types';

interface RenderOptions {
  videoPath: string;
  captions: Caption[];
  style: CaptionStyle;
  outputFileName?: string;
}

interface RenderedVideo {
  outputFileName: string;
  downloadUrl: string;
  fileSize: number;
}

interface RenderState {
  isRendering: boolean;
  progress: number;
  error: string | null;
  stage: 'idle' | 'bundling' | 'rendering' | 'finalizing' | 'completed';
  renderedVideo: RenderedVideo | null;
}

interface UseVideoRenderReturn {
  state: RenderState;
  render: (options: RenderOptions) => Promise<RenderedVideo>;
  reset: () => void;
  listRenderedVideos: () => Promise<any[]>;
  deleteRenderedVideo: (fileName: string) => Promise<void>;
}

/**
 * Custom hook for handling video rendering with Remotion
 */
export const useVideoRender = (): UseVideoRenderReturn => {
  const [state, setState] = useState<RenderState>({
    isRendering: false,
    progress: 0,
    error: null,
    stage: 'idle',
    renderedVideo: null,
  });

  /**
   * List rendered videos
   */
  const listRenderedVideos = useCallback(async () => {
    try {
      const response = await fetch('/api/render');

      if (!response.ok) {
        throw new Error('Failed to list rendered videos');
      }

      const data = await response.json();
      return data.videos;
    } catch (error: any) {
      console.error('Failed to list rendered videos:', error);
      throw error;
    }
  }, []);

  /**
   * Delete rendered video
   */
  const deleteRenderedVideo = useCallback(async (fileName: string) => {
    try {
      const response = await fetch(`/api/render?fileName=${fileName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete rendered video');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Failed to delete rendered video:', error);
      throw error;
    }
  }, []);

  /**
   * Render video with captions
   */
  const render = useCallback(
    async (options: RenderOptions): Promise<RenderedVideo> => {
      const { videoPath, captions, style, outputFileName } = options;

      // Validate inputs
      if (!videoPath) {
        throw new Error('Video path is required');
      }

      if (!captions || captions.length === 0) {
        throw new Error('At least one caption is required');
      }

      // Reset state
      setState({
        isRendering: true,
        progress: 0,
        error: null,
        stage: 'bundling',
        renderedVideo: null,
      });

      try {
        // Stage 1: Bundling (0-20%)
        setState((prev) => ({
          ...prev,
          stage: 'bundling',
          progress: 10,
        }));

        // Simulate bundling progress
        await new Promise((resolve) => setTimeout(resolve, 500));
        setState((prev) => ({ ...prev, progress: 20 }));

        // Stage 2: Rendering (20-80%)
        setState((prev) => ({
          ...prev,
          stage: 'rendering',
          progress: 30,
        }));

        // Call render API
        const response = await fetch('/api/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoPath,
            captions,
            style,
            outputFileName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Rendering failed');
        }

        // Simulate rendering progress
        const progressInterval = setInterval(() => {
          setState((prev) => {
            if (prev.progress >= 75) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, progress: prev.progress + 5 };
          });
        }, 1000);

        const data = await response.json();
        clearInterval(progressInterval);

        // Stage 3: Finalizing (80-100%)
        setState((prev) => ({
          ...prev,
          stage: 'finalizing',
          progress: 85,
        }));

        await new Promise((resolve) => setTimeout(resolve, 500));
        setState((prev) => ({ ...prev, progress: 95 }));

        // Validate response
        if (!data.success || !data.downloadUrl) {
          throw new Error('Invalid response from render API');
        }

        const renderedVideo: RenderedVideo = {
          outputFileName: data.outputFileName,
          downloadUrl: data.downloadUrl,
          fileSize: data.fileSize,
        };

        // Stage 4: Completed
        setState({
          isRendering: false,
          progress: 100,
          error: null,
          stage: 'completed',
          renderedVideo,
        });

        return renderedVideo;
      } catch (error: any) {
        console.error('Render error:', error);

        setState({
          isRendering: false,
          progress: 0,
          error: error.message || 'Failed to render video',
          stage: 'idle',
          renderedVideo: null,
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
      isRendering: false,
      progress: 0,
      error: null,
      stage: 'idle',
      renderedVideo: null,
    });
  }, []);

  return {
    state,
    render,
    reset,
    listRenderedVideos,
    deleteRenderedVideo,
  };
};

export default useVideoRender;