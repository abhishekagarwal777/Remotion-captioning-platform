"use client";

import React, { useRef, useState } from "react";
import { Upload, Video, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export default function FileUpload({
  onFileSelect,
  selectedFile,
  onClear,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "video/mp4") {
      onFileSelect(file);
    } else {
      alert("Please upload an MP4 video file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "video/mp4") {
      onFileSelect(file);
    } else {
      alert("Please upload an MP4 video file");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Video className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <X className="text-gray-500" size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div
          className={`p-4 rounded-full ${
            isDragging ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          <Upload
            className={isDragging ? "text-blue-600" : "text-gray-400"}
            size={32}
          />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900">
            Drop your video here or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-1">
            MP4 format only, max 100MB
          </p>
        </div>
      </div>
    </div>
  );
}
