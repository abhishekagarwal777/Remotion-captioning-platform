// // src/components/ExportSection.tsx

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
// import Button from './ui/Button';
// import Progress from './ui/Progress';
// import { useToast } from './ui/Toast';
// import { Caption, CaptionStyle } from '@/types';

// interface ExportSectionProps {
//   videoFile: File | null;
//   captions: Caption[];
//   style: CaptionStyle;
//   isRendering: boolean;
//   onRender: (value: boolean) => void;
// }

// interface RenderStatus {
//   status: 'idle' | 'uploading' | 'rendering' | 'completed' | 'error';
//   progress: number;
//   message: string;
//   outputUrl?: string;
//   fileName?: string;
//   fileSize?: number;
// }

// const ExportSection: React.FC<ExportSectionProps> = ({
//   videoFile,
//   captions,
//   style,
//   isRendering,
//   onRender,
// }) => {
//   const { success, error: showError, info } = useToast();
//   const [renderStatus, setRenderStatus] = useState<RenderStatus>({
//     status: 'idle',
//     progress: 0,
//     message: 'Ready to render',
//   });
//   const [uploadedVideoPath, setUploadedVideoPath] = useState<string>('');

//   // Reset status when video or captions change
//   useEffect(() => {
//     if (renderStatus.status === 'completed') {
//       setRenderStatus({
//         status: 'idle',
//         progress: 0,
//         message: 'Ready to render',
//       });
//     }
//   }, [videoFile, captions, style]);

//   // Handle video rendering
//   const handleRender = async () => {
//     if (!videoFile) {
//       showError('Please upload a video first');
//       return;
//     }

//     if (captions.length === 0) {
//       showError('Please add captions before rendering');
//       return;
//     }

//     onRender(true);
//     setRenderStatus({
//       status: 'uploading',
//       progress: 10,
//       message: 'Uploading video...',
//     });

//     try {
//       // Step 1: Upload video if not already uploaded
//       let videoPath = uploadedVideoPath;
      
//       if (!videoPath) {
//         const formData = new FormData();
//         formData.append('video', videoFile);

//         const uploadResponse = await fetch('/api/upload', {
//           method: 'POST',
//           body: formData,
//         });

//         if (!uploadResponse.ok) {
//           throw new Error('Failed to upload video');
//         }

//         const uploadData = await uploadResponse.json();
//         videoPath = uploadData.file.fileName;
//         setUploadedVideoPath(videoPath);

//         info('Video uploaded successfully');
//       }

//       setRenderStatus({
//         status: 'rendering',
//         progress: 30,
//         message: 'Rendering video with captions...',
//       });

//       // Step 2: Render video with captions
//       const renderResponse = await fetch('/api/render', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           videoPath,
//           captions,
//           style,
//           outputFileName: `captioned_${Date.now()}.mp4`,
//         }),
//       });

//       if (!renderResponse.ok) {
//         const errorData = await renderResponse.json();
//         throw new Error(errorData.message || 'Rendering failed');
//       }

//       const renderData = await renderResponse.json();

//       // Simulate progress updates
//       setRenderStatus({
//         status: 'rendering',
//         progress: 90,
//         message: 'Finalizing video...',
//       });

//       // Complete
//       setRenderStatus({
//         status: 'completed',
//         progress: 100,
//         message: 'Video rendered successfully!',
//         outputUrl: renderData.downloadUrl,
//         fileName: renderData.outputFileName,
//         fileSize: renderData.fileSize,
//       });

//       success('Video rendered successfully! Ready to download.');

//     } catch (err: any) {
//       console.error('Render error:', err);
      
//       setRenderStatus({
//         status: 'error',
//         progress: 0,
//         message: err.message || 'Failed to render video',
//       });

//       showError(err.message || 'Failed to render video');
//     } finally {
//       onRender(false);
//     }
//   };

//   // Handle download
//   const handleDownload = () => {
//     if (renderStatus.outputUrl) {
//       window.open(renderStatus.outputUrl, '_blank');
//       success('Download started');
//     }
//   };

//   // Format file size
//   const formatFileSize = (bytes: number): string => {
//     if (bytes < 1024) return bytes + ' B';
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
//     return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
//   };

//   // Get status icon
//   const getStatusIcon = () => {
//     switch (renderStatus.status) {
//       case 'idle':
//         return (
//           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
//           </svg>
//         );
//       case 'uploading':
//       case 'rendering':
//         return (
//           <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//           </svg>
//         );
//       case 'completed':
//         return (
//           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//           </svg>
//         );
//       case 'error':
//         return (
//           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//           </svg>
//         );
//     }
//   };

//   // Get status color
//   const getStatusColor = () => {
//     switch (renderStatus.status) {
//       case 'idle':
//         return 'text-gray-600';
//       case 'uploading':
//       case 'rendering':
//         return 'text-blue-600';
//       case 'completed':
//         return 'text-green-600';
//       case 'error':
//         return 'text-red-600';
//     }
//   };

//   // Can render?
//   const canRender = videoFile && captions.length > 0 && !isRendering;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Export Video</CardTitle>
//         <CardDescription>
//           Render your video with captions and download it
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         {/* Render status */}
//         <div className="mb-6">
//           <div className="flex items-center gap-3 mb-3">
//             <div className={getStatusColor()}>
//               {getStatusIcon()}
//             </div>
//             <div className="flex-1">
//               <h4 className="text-sm font-semibold text-gray-900">
//                 {renderStatus.message}
//               </h4>
//               {(renderStatus.status === 'uploading' || renderStatus.status === 'rendering') && (
//                 <p className="text-xs text-gray-600 mt-0.5">
//                   This may take a few minutes depending on video length...
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Progress bar */}
//           {(renderStatus.status === 'uploading' || renderStatus.status === 'rendering') && (
//             <Progress
//               value={renderStatus.progress}
//               showLabel
//               variant="primary"
//               animated
//             />
//           )}

//           {renderStatus.status === 'completed' && (
//             <Progress
//               value={100}
//               showLabel
//               variant="success"
//             />
//           )}

//           {renderStatus.status === 'error' && (
//             <Progress
//               value={0}
//               showLabel
//               variant="danger"
//             />
//           )}
//         </div>

//         {/* Video info */}
//         {videoFile && (
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <h4 className="text-sm font-semibold text-gray-900 mb-2">Video Information</h4>
//             <div className="space-y-1 text-sm text-gray-600">
//               <p>
//                 <span className="font-medium">File:</span> {videoFile.name}
//               </p>
//               <p>
//                 <span className="font-medium">Size:</span> {formatFileSize(videoFile.size)}
//               </p>
//               <p>
//                 <span className="font-medium">Captions:</span> {captions.length}
//               </p>
//               <p>
//                 <span className="font-medium">Style:</span>{' '}
//                 <span className="capitalize">{style.replace('-', ' ')}</span>
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Action buttons */}
//         <div className="space-y-3">
//           {/* Render button */}
//           <Button
//             onClick={handleRender}
//             disabled={!canRender}
//             loading={isRendering}
//             fullWidth
//             size="lg"
//             leftIcon={
//               !isRendering && (
//                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               )
//             }
//           >
//             {isRendering ? 'Rendering Video...' : 'Render Video with Captions'}
//           </Button>

//           {/* Download button */}
//           {renderStatus.status === 'completed' && renderStatus.outputUrl && (
//             <Button
//               onClick={handleDownload}
//               variant="success"
//               fullWidth
//               size="lg"
//               leftIcon={
//                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                 </svg>
//               }
//             >
//               Download Rendered Video
//             </Button>
//           )}

//           {/* Render again button */}
//           {renderStatus.status === 'completed' && (
//             <Button
//               onClick={handleRender}
//               variant="outline"
//               fullWidth
//               size="md"
//               leftIcon={
//                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//               }
//             >
//               Render Again
//             </Button>
//           )}
//         </div>

//         {/* Output file info */}
//         {renderStatus.status === 'completed' && renderStatus.fileName && (
//           <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//             <div className="flex items-start gap-3">
//               <div className="flex-shrink-0 text-green-600">
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h4 className="text-sm font-semibold text-green-900 mb-1">
//                   Video Ready!
//                 </h4>
//                 <p className="text-sm text-green-700 break-all">
//                   <span className="font-medium">File:</span> {renderStatus.fileName}
//                 </p>
//                 {renderStatus.fileSize && (
//                   <p className="text-sm text-green-700">
//                     <span className="font-medium">Size:</span> {formatFileSize(renderStatus.fileSize)}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Requirements notice */}
//         {(!videoFile || captions.length === 0) && (
//           <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <div className="flex items-start gap-3">
//               <div className="flex-shrink-0 text-yellow-600">
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div>
//                 <h4 className="text-sm font-semibold text-yellow-900 mb-1">
//                   Requirements
//                 </h4>
//                 <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
//                   {!videoFile && <li>Upload a video file</li>}
//                   {captions.length === 0 && <li>Add or generate captions</li>}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default ExportSection;