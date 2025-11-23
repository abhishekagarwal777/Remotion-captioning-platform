"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import CaptionStyleSelector from "@/components/CaptionStyleSelector";
import VideoPreview from "@/components/VideoPreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Caption, CaptionStyle } from "@/lib/types";
import { Sparkles, Download, Video } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedStyle, setSelectedStyle] =
    useState<CaptionStyle>("bottom-centered");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setCaptions([]);
    setRenderedVideoUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        console.log("Upload response:", data); // ADD THIS
        console.log("Video URL:", data.url); // ADD THIS
        setVideoUrl(data.url);
      } else {
        alert("Failed to upload video");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setVideoUrl("");
    setCaptions([]);
    setRenderedVideoUrl("");
  };

  const handleGenerateCaptions = async () => {
    if (!videoUrl) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setCaptions(data.captions);
      } else {
        alert("Failed to generate captions");
      }
    } catch (error) {
      console.error("Caption generation error:", error);
      alert("Failed to generate captions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportVideo = async () => {
    if (!videoUrl || captions.length === 0) return;

    setIsRendering(true);

    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          captions,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRenderedVideoUrl(data.url);
        // Download the video by fetching and creating blob URL
        const response = await fetch(data.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "captioned-video.mp4";
        link.click();

        // Clean up blob URL
        URL.revokeObjectURL(blobUrl);
      } else {
        alert("Failed to render video");
      }
    } catch (error) {
      console.error("Render error:", error);
      alert("Failed to render video");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Video className="text-blue-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">
              Remotion Captioning Platform
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload your video, auto-generate captions with AI, and export with
            beautiful styles
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Upload Video
              </h2>
              {isUploading ? (
                <LoadingSpinner message="Uploading video..." />
              ) : (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={handleClearFile}
                />
              )}
            </div>

            {/* Generate Captions */}
            {videoUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Generate Captions
                </h2>
                {isGenerating ? (
                  <LoadingSpinner message="Generating captions with AI..." />
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleGenerateCaptions}
                      disabled={captions.length > 0}
                      className={`
                        w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                        font-medium transition-colors
                        ${
                          captions.length > 0
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }
                      `}
                    >
                      <Sparkles size={20} />
                      {captions.length > 0
                        ? "Captions Generated ✓"
                        : "Auto-generate Captions"}
                    </button>

                    {captions.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Generated {captions.length} caption
                          {captions.length !== 1 ? "s" : ""}
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {captions.slice(0, 3).map((caption) => (
                            <div
                              key={caption.id}
                              className="text-sm text-gray-600 bg-white p-2 rounded"
                            >
                              {caption.text}
                            </div>
                          ))}
                          {captions.length > 3 && (
                            <p className="text-sm text-gray-500 italic">
                              ...and {captions.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Caption Style Selection */}
            {captions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Choose Caption Style
                </h2>
                <CaptionStyleSelector
                  selectedStyle={selectedStyle}
                  onStyleChange={setSelectedStyle}
                />
              </div>
            )}

            {/* Export */}
            {captions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  4. Export Video
                </h2>
                {isRendering ? (
                  <LoadingSpinner message="Rendering video... This may take a few minutes." />
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleExportVideo}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download size={20} />
                      Export Captioned Video
                    </button>

                    {renderedVideoUrl && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium">
                          ✓ Video exported successfully!
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Your video has been downloaded automatically.
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 text-center">
                      Note: Rendering may take 2-5 minutes depending on video
                      length
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preview
              </h2>

              {!videoUrl ? (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <Video className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">
                    Upload a video to see the preview
                  </p>
                </div>
              ) : captions.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <Sparkles className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">
                    Generate captions to see them on your video
                  </p>
                </div>
              ) : (
                <VideoPreview
                  videoUrl={videoUrl}
                  captions={captions}
                  style={selectedStyle}
                />
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Hinglish Support
              </h3>
              <p className="text-sm text-blue-800">
                This platform fully supports mixed Hindi (Devanagari) and
                English text using Noto Sans fonts for perfect rendering.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with Next.js, Remotion, and OpenAI Whisper API</p>
        </div>
      </div>
    </div>
  );
}
