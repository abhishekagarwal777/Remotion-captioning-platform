// // src/components/VideoUploader.tsx

// 'use client';

// import React, { useRef, useState, useCallback } from 'react';
// import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
// import Button from './ui/Button';
// import Progress from './ui/Progress';
// import { useToast } from './ui/Toast';
// import { clsx } from 'clsx';

// interface VideoUploaderProps {
//   onVideoSelect: (file: File, url: string) => void;
// }

// interface UploadStatus {
//   isUploading: boolean;
//   progress: number;
//   error: string | null;
// }

// interface VideoMetadata {
//   duration: number;
//   width: number;
//   height: number;
//   size: string;
// }

// const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { success, error: showError, info } = useToast();
  
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
//   const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
//     isUploading: false,
//     progress: 0,
//     error: null,
//   });
//   const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
//   const [isDragging, setIsDragging] = useState(false);

//   // File size limits
//   const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
//   const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

//   // Validate file
//   const validateFile = (file: File): boolean => {
//     // Check file type
//     if (!ALLOWED_TYPES.includes(file.type)) {
//       showError('Invalid file type. Please upload MP4, MOV, AVI, or WebM videos.');
//       return false;
//     }

//     // Check file size
//     if (file.size > MAX_FILE_SIZE) {
//       showError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
//       return false;
//     }

//     return true;
//   };

//   // Extract video metadata
//   const extractMetadata = (file: File): Promise<VideoMetadata> => {
//     return new Promise((resolve, reject) => {
//       const video = document.createElement('video');
//       video.preload = 'metadata';

//       video.onloadedmetadata = () => {
//         window.URL.revokeObjectURL(video.src);
//         resolve({
//           duration: video.duration,
//           width: video.videoWidth,
//           height: video.videoHeight,
//           size: formatFileSize(file.size),
//         });
//       };

//       video.onerror = () => {
//         reject(new Error('Failed to load video metadata'));
//       };

//       video.src = URL.createObjectURL(file);
//     });
//   };

//   // Format file size
//   const formatFileSize = (bytes: number): string => {
//     if (bytes < 1024) return bytes + ' B';
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
//     return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
//   };

//   // Format duration
//   const formatDuration = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Handle file selection
//   const handleFileSelect = async (file: File) => {
//     if (!validateFile(file)) {
//       return;
//     }

//     setSelectedFile(file);
//     setUploadStatus({ isUploading: false, progress: 0, error: null });

//     // Create preview URL
//     const url = URL.createObjectURL(file);
//     setVideoPreviewUrl(url);

//     // Extract metadata
//     try {
//       const metadata = await extractMetadata(file);
//       setVideoMetadata(metadata);
//       info('Video loaded successfully');
//     } catch (error) {
//       console.error('Failed to extract metadata:', error);
//       setVideoMetadata(null);
//     }

//     // Notify parent component
//     onVideoSelect(file, url);
//   };

//   // Handle file input change
//   const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       handleFileSelect(file);
//     }
//   };

//   // Handle drag and drop
//   const handleDragEnter = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   }, []);

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);

//     const file = e.dataTransfer.files?.[0];
//     if (file) {
//       handleFileSelect(file);
//     }
//   }, []);

//   // Handle browse click
//   const handleBrowseClick = () => {
//     fileInputRef.current?.click();
//   };

//   // Handle remove video
//   const handleRemoveVideo = () => {
//     setSelectedFile(null);
//     setVideoPreviewUrl('');
//     setVideoMetadata(null);
//     setUploadStatus({ isUploading: false, progress: 0, error: null });
    
//     // Revoke object URL
//     if (videoPreviewUrl) {
//       URL.revokeObjectURL(videoPreviewUrl);
//     }

//     // Reset file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }

//     success('Video removed');
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Upload Video</CardTitle>
//         <CardDescription>
//           Upload your video file (MP4, MOV, AVI, WebM) - Max 500MB
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         {!selectedFile ? (
//           // Upload area
//           <div
//             className={clsx(
//               'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer',
//               isDragging
//                 ? 'border-primary-500 bg-primary-50'
//                 : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
//             )}
//             onDragEnter={handleDragEnter}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             onClick={handleBrowseClick}
//           >
//             {/* Hidden file input */}
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
//               onChange={handleFileInputChange}
//               className="hidden"
//             />

//             {/* Upload icon and text */}
//             <div className="text-center">
//               <div className="mx-auto w-16 h-16 mb-4 text-gray-400">
//                 {isDragging ? (
//                   <svg
//                     className="w-full h-full text-primary-600"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="w-full h-full"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
//                     />
//                   </svg>
//                 )}
//               </div>

//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 {isDragging ? 'Drop video here' : 'Upload Video File'}
//               </h3>

//               <p className="text-sm text-gray-600 mb-4">
//                 Drag and drop your video file here, or click to browse
//               </p>

//               <Button variant="primary" size="md" onClick={handleBrowseClick}>
//                 Browse Files
//               </Button>

//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                     MP4, MOV, AVI, WebM
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                     Max 500MB
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           // Selected video preview
//           <div className="space-y-4">
//             {/* Video thumbnail */}
//             <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
//               <video
//                 src={videoPreviewUrl}
//                 className="w-full h-full object-contain"
//                 controls={false}
//               />
              
//               {/* Overlay */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
//                 <div className="p-4 w-full">
//                   <h4 className="text-white font-semibold text-lg truncate">
//                     {selectedFile.name}
//                   </h4>
//                 </div>
//               </div>
//             </div>

//             {/* Video metadata */}
//             {videoMetadata && (
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <p className="text-xs text-gray-600 mb-1">Duration</p>
//                   <p className="text-lg font-semibold text-gray-900">
//                     {formatDuration(videoMetadata.duration)}
//                   </p>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <p className="text-xs text-gray-600 mb-1">Resolution</p>
//                   <p className="text-lg font-semibold text-gray-900">
//                     {videoMetadata.width} × {videoMetadata.height}
//                   </p>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <p className="text-xs text-gray-600 mb-1">File Size</p>
//                   <p className="text-lg font-semibold text-gray-900">
//                     {videoMetadata.size}
//                   </p>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <p className="text-xs text-gray-600 mb-1">Format</p>
//                   <p className="text-lg font-semibold text-gray-900 uppercase">
//                     {selectedFile.name.split('.').pop()}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Action buttons */}
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 fullWidth
//                 onClick={handleBrowseClick}
//                 leftIcon={
//                   <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                 }
//               >
//                 Replace Video
//               </Button>
//               <Button
//                 variant="danger"
//                 fullWidth
//                 onClick={handleRemoveVideo}
//                 leftIcon={
//                   <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                   </svg>
//                 }
//               >
//                 Remove Video
//               </Button>
//             </div>

//             {/* Upload progress (if uploading) */}
//             {uploadStatus.isUploading && (
//               <div className="mt-4">
//                 <Progress
//                   value={uploadStatus.progress}
//                   showLabel
//                   label="Uploading video..."
//                   variant="primary"
//                   animated
//                 />
//               </div>
//             )}

//             {/* Success message */}
//             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0 text-green-600">
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-semibold text-green-900 mb-1">
//                     Video Ready!
//                   </h4>
//                   <p className="text-sm text-green-700">
//                     Your video is loaded and ready. You can now generate captions or add them manually.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default VideoUploader;