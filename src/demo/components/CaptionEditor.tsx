// src/components/CaptionEditor.tsx

'use client';

import React, { useState, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { Caption } from '@/types';

interface CaptionEditorProps {
  captions: Caption[];
  onCaptionsChange: (captions: Caption[]) => void;
  videoFile: File | null;
  isTranscribing: boolean;
  onTranscribe: (value: boolean) => void;
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({
  captions,
  onCaptionsChange,
  videoFile,
  isTranscribing,
  onTranscribe,
}) => {
  const { success, error: showError } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transcriptionProvider, setTranscriptionProvider] = useState<'openai' | 'assemblyai'>('openai');

  // Handle auto-generate captions
  const handleAutoGenerate = async () => {
    if (!videoFile) {
      showError('Please upload a video first');
      return;
    }

    onTranscribe(true);

    try {
      // First, upload the video if not already uploaded
      const formData = new FormData();
      formData.append('video', videoFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadData = await uploadResponse.json();
      const videoPath = uploadData.file.fileName;

      // Now transcribe
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoPath,
          provider: transcriptionProvider,
          language: 'auto', // Auto-detect language
        }),
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.message || 'Transcription failed');
      }

      const transcribeData = await transcribeResponse.json();
      
      onCaptionsChange(transcribeData.captions);
      success(`Generated ${transcribeData.captions.length} captions successfully!`);
      
    } catch (err: any) {
      console.error('Transcription error:', err);
      showError(err.message || 'Failed to generate captions');
    } finally {
      onTranscribe(false);
    }
  };

  // Add new caption
  const handleAddCaption = () => {
    const newCaption: Caption = {
      id: `caption_${Date.now()}`,
      start: captions.length > 0 ? captions[captions.length - 1].end : 0,
      end: captions.length > 0 ? captions[captions.length - 1].end + 3 : 3,
      text: 'New caption text',
    };
    onCaptionsChange([...captions, newCaption]);
    setEditingId(newCaption.id);
  };

  // Update caption
  const handleUpdateCaption = (id: string, field: keyof Caption, value: any) => {
    const updatedCaptions = captions.map((caption) =>
      caption.id === id ? { ...caption, [field]: value } : caption
    );
    onCaptionsChange(updatedCaptions);
  };

  // Delete caption
  const handleDeleteCaption = (id: string) => {
    const updatedCaptions = captions.filter((caption) => caption.id !== id);
    onCaptionsChange(updatedCaptions);
    success('Caption deleted');
  };

  // Duplicate caption
  const handleDuplicateCaption = (caption: Caption) => {
    const newCaption: Caption = {
      ...caption,
      id: `caption_${Date.now()}`,
      start: caption.end,
      end: caption.end + (caption.end - caption.start),
    };
    const index = captions.findIndex((c) => c.id === caption.id);
    const updatedCaptions = [
      ...captions.slice(0, index + 1),
      newCaption,
      ...captions.slice(index + 1),
    ];
    onCaptionsChange(updatedCaptions);
    success('Caption duplicated');
  };

  // Import captions from SRT file
  const handleImportSRT = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedCaptions = parseSRT(text);
      onCaptionsChange(importedCaptions);
      success(`Imported ${importedCaptions.length} captions`);
    } catch (err) {
      showError('Failed to import SRT file');
    }
  };

  // Export captions to SRT file
  const handleExportSRT = () => {
    if (captions.length === 0) {
      showError('No captions to export');
      return;
    }

    const srtContent = generateSRT(captions);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Captions exported as SRT');
  };

  // Format time for display (MM:SS.mmm)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caption Editor</CardTitle>
        <CardDescription>
          Generate captions automatically or edit them manually
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 items-center">
            <select
              value={transcriptionProvider}
              onChange={(e) => setTranscriptionProvider(e.target.value as 'openai' | 'assemblyai')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isTranscribing}
            >
              <option value="openai">OpenAI Whisper</option>
              <option value="assemblyai">AssemblyAI</option>
            </select>
            
            <Button
              onClick={handleAutoGenerate}
              loading={isTranscribing}
              disabled={!videoFile || isTranscribing}
              leftIcon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              {isTranscribing ? 'Generating...' : 'Auto-Generate Captions'}
            </Button>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={handleAddCaption}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Caption
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".srt"
              onChange={handleImportSRT}
              className="hidden"
            />
            <Button
              as="span"
              variant="ghost"
              size="md"
              leftIcon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              }
            >
              Import SRT
            </Button>
          </label>

          <Button
            variant="ghost"
            size="md"
            onClick={handleExportSRT}
            disabled={captions.length === 0}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            }
          >
            Export SRT
          </Button>
        </div>

        {/* Captions list */}
        {captions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No captions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by auto-generating captions or adding them manually.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {captions.map((caption, index) => (
              <div
                key={caption.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors bg-white"
              >
                <div className="flex items-start gap-3">
                  {/* Caption number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>

                  {/* Caption content */}
                  <div className="flex-1 space-y-3">
                    {/* Time inputs */}
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        type="number"
                        step="0.1"
                        value={caption.start}
                        onChange={(e) => handleUpdateCaption(caption.id, 'start', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Start"
                      />
                      <span className="text-gray-400">→</span>
                      <input
                        type="number"
                        step="0.1"
                        value={caption.end}
                        onChange={(e) => handleUpdateCaption(caption.id, 'end', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="End"
                      />
                      <span className="text-gray-500 ml-2">
                        ({formatTime(caption.start)} - {formatTime(caption.end)})
                      </span>
                    </div>

                    {/* Text input */}
                    <textarea
                      value={caption.text}
                      onChange={(e) => handleUpdateCaption(caption.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-noto-sans font-noto-devanagari resize-none"
                      rows={2}
                      placeholder="Enter caption text (supports Hinglish)"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleDuplicateCaption(caption)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="Duplicate"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCaption(caption.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Caption stats */}
        {captions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total captions: <span className="font-semibold text-gray-900">{captions.length}</span>
              {captions.length > 0 && (
                <>
                  {' • '}
                  Duration: <span className="font-semibold text-gray-900">
                    {formatTime(Math.max(...captions.map(c => c.end)))}
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to parse SRT format
function parseSRT(srtContent: string): Caption[] {
  const captions: Caption[] = [];
  const blocks = srtContent.trim().split('\n\n');

  blocks.forEach((block, index) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const textLines = lines.slice(2);
      
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      
      if (timeMatch) {
        const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
        
        captions.push({
          id: `caption_${index + 1}`,
          start,
          end,
          text: textLines.join(' ').trim(),
        });
      }
    }
  });

  return captions;
}

// Helper function to generate SRT format
function generateSRT(captions: Caption[]): string {
  return captions.map((caption, index) => {
    const startTime = formatSRTTime(caption.start);
    const endTime = formatSRTTime(caption.end);
    return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
  }).join('\n');
}

// Format time for SRT (HH:MM:SS,mmm)
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export default CaptionEditor;