// src/hooks/useVideoUpload.ts

'use client';

import { useState, useCallback } from 'react';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  bitrate: number;
}

interface UploadedFile {
  originalName: string;
  fileName: string;
  filePath: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadedFile | null;
  metadata: VideoMetadata | null;
}

interface UseVideoUploadReturn {
  state: UploadState;
  upload: (file: File) => Promise<UploadedFile>;
  reset: () => void;
  getUploadConfig: () => Promise<{
    maxFileSize: number;
    maxFileSizeMB: number;
    allowedTypes: string[];
  }>;
  listUploadedVideos: () => Promise<any[]>;
  deleteVideo: (fileName: string) => Promise<void>;
}

/**
 * Custom hook for handling video uploads
 */
export const useVideoUpload = (): UseVideoUploadReturn => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
    metadata: null,
  });

  /**
   * Get upload configuration
   */
  const getUploadConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/upload?action=config');

      if (!response.ok) {
        throw new Error('Failed to get upload config');
      }

      const data = await response.json();
      return data.config;
    } catch (error: any) {
      console.error('Failed to get upload config:', error);
      throw error;
    }
  }, []);

  /**
   * List uploaded videos
   */
  const listUploadedVideos = useCallback(async () => {
    try {
      const response = await fetch('/api/upload');

      if (!response.ok) {
        throw new Error('Failed to list videos');
      }

      const data = await response.json();
      return data.videos;
    } catch (error: any) {
      console.error('Failed to list videos:', error);
      throw error;
    }
  }, []);

  /**
   * Delete uploaded video
   */
  const deleteVideo = useCallback(async (fileName: string) => {
    try {
      const response = await fetch(`/api/upload?fileName=${fileName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Failed to delete video:', error);
      throw error;
    }
  }, []);

  /**
   * Upload video file
   */
  const upload = useCallback(async (file: File): Promise<UploadedFile> => {
    // Reset state
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      uploadedFile: null,
      metadata: null,
    });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('video', file);

      // Update progress
      setState((prev) => ({ ...prev, progress: 10 }));

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();

      // Promise wrapper for XHR
      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 80) + 10; // 10-90%
            setState((prev) => ({ ...prev, progress: percentComplete }));
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              
              // Update progress to 100%
              setState((prev) => ({ ...prev, progress: 100 }));

              resolve(data.file);
            } catch (error) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Send request
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      // Wait for upload to complete
      const uploadedFile = await uploadPromise;

      // Fetch metadata (if available in response)
      const response = await fetch('/api/upload');
      const videosData = await response.json();
      const videoWithMetadata = videosData.videos?.find(
        (v: any) => v.fileName === uploadedFile.fileName
      );

      // Update state with success
      setState({
        isUploading: false,
        progress: 100,
        error: null,
        uploadedFile,
        metadata: videoWithMetadata?.metadata || null,
      });

      return uploadedFile;
    } catch (error: any) {
      console.error('Upload error:', error);

      setState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Failed to upload video',
        uploadedFile: null,
        metadata: null,
      });

      throw error;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
      metadata: null,
    });
  }, []);

  return {
    state,
    upload,
    reset,
    getUploadConfig,
    listUploadedVideos,
    deleteVideo,
  };
};

export default useVideoUpload;