// // src/app/api/render/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { bundle } from '@remotion/bundler';
// import { renderMedia, selectComposition } from '@remotion/renderer';
// import path from 'path';
// import fs from 'fs/promises';
// import { z } from 'zod';

// // Validation schema
// const RenderRequestSchema = z.object({
//   videoPath: z.string(),
//   captions: z.array(
//     z.object({
//       id: z.string(),
//       start: z.number(),
//       end: z.number(),
//       text: z.string(),
//     })
//   ),
//   style: z.enum(['bottom-centered', 'top-bar', 'karaoke']),
//   outputFileName: z.string().optional(),
// });

// export async function POST(request: NextRequest) {
//   try {
//     // Parse request body
//     const body = await request.json();
    
//     // Validate request
//     const validationResult = RenderRequestSchema.safeParse(body);
//     if (!validationResult.success) {
//       return NextResponse.json(
//         { 
//           error: 'Invalid request data', 
//           details: validationResult.error.issues 
//         },
//         { status: 400 }
//       );
//     }

//     const { videoPath, captions, style, outputFileName } = validationResult.data;

//     // Verify video file exists
//     const uploadDir = path.join(process.cwd(), 'uploads');
//     const fullVideoPath = path.join(uploadDir, videoPath);
    
//     try {
//       await fs.access(fullVideoPath);
//     } catch {
//       return NextResponse.json(
//         { error: 'Video file not found' },
//         { status: 404 }
//       );
//     }

//     // Generate output file name
//     const timestamp = Date.now();
//     const finalOutputFileName = outputFileName || `captioned_video_${timestamp}.mp4`;
//     const outputDir = path.join(process.cwd(), 'output');
    
//     // Ensure output directory exists
//     await fs.mkdir(outputDir, { recursive: true });
    
//     const outputPath = path.join(outputDir, finalOutputFileName);

//     console.log('Starting video render...');
//     console.log('Video path:', fullVideoPath);
//     console.log('Output path:', outputPath);
//     console.log('Captions count:', captions.length);
//     console.log('Style:', style);

//     // Bundle the Remotion project
//     const bundleLocation = await bundle({
//       entryPoint: path.join(process.cwd(), 'src', 'remotion', 'Root.tsx'),
//       webpackOverride: (config) => config,
//     });

//     console.log('Bundle created at:', bundleLocation);

//     // Get composition
//     const composition = await selectComposition({
//       serveUrl: bundleLocation,
//       id: 'CaptionedVideo',
//       inputProps: {
//         videoSrc: fullVideoPath,
//         captions,
//         style,
//       },
//     });

//     console.log('Composition selected:', composition.id);

//     // Render the video
//     await renderMedia({
//       composition,
//       serveUrl: bundleLocation,
//       codec: 'h264',
//       outputLocation: outputPath,
//       inputProps: {
//         videoSrc: fullVideoPath,
//         captions,
//         style,
//       },
//       // Performance settings
//       concurrency: parseInt(process.env.REMOTION_CONCURRENCY || '2'),
//       timeoutInMilliseconds: parseInt(process.env.REMOTION_TIMEOUT || '120000'),
//       // Quality settings
//       videoBitrate: '5M',
//       audioBitrate: '192k',
//       // Callback for progress
//       onProgress: ({ progress }) => {
//         console.log(`Rendering progress: ${Math.round(progress * 100)}%`);
//       },
//     });

//     console.log('Video rendered successfully!');

//     // Verify output file exists
//     try {
//       const stats = await fs.stat(outputPath);
//       console.log('Output file size:', stats.size, 'bytes');
//     } catch (error) {
//       console.error('Output file verification failed:', error);
//       return NextResponse.json(
//         { error: 'Render completed but output file not found' },
//         { status: 500 }
//       );
//     }

//     // Return success response with download information
//     return NextResponse.json(
//       {
//         success: true,
//         message: 'Video rendered successfully',
//         outputFileName: finalOutputFileName,
//         downloadUrl: `/api/download/${finalOutputFileName}`,
//         fileSize: (await fs.stat(outputPath)).size,
//       },
//       { status: 200 }
//     );

//   } catch (error: any) {
//     console.error('Error rendering video:', error);
    
//     // Handle specific error types
//     if (error.message?.includes('ENOSPC')) {
//       return NextResponse.json(
//         { 
//           error: 'Insufficient disk space',
//           message: 'Server does not have enough disk space to render the video'
//         },
//         { status: 507 }
//       );
//     }

//     if (error.message?.includes('timeout')) {
//       return NextResponse.json(
//         { 
//           error: 'Render timeout',
//           message: 'Video rendering took too long and was terminated'
//         },
//         { status: 504 }
//       );
//     }

//     // Generic error response
//     return NextResponse.json(
//       {
//         error: 'Failed to render video',
//         message: error.message || 'An unexpected error occurred',
//         details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET endpoint to check render status or list rendered videos
// export async function GET(request: NextRequest) {
//   try {
//     const outputDir = path.join(process.cwd(), 'output');
    
//     // Ensure output directory exists
//     await fs.mkdir(outputDir, { recursive: true });
    
//     // List all rendered videos
//     const files = await fs.readdir(outputDir);
//     const videoFiles = files.filter(file => 
//       file.endsWith('.mp4') || file.endsWith('.mov')
//     );

//     // Get file stats for each video
//     const videos = await Promise.all(
//       videoFiles.map(async (file) => {
//         const filePath = path.join(outputDir, file);
//         const stats = await fs.stat(filePath);
        
//         return {
//           fileName: file,
//           size: stats.size,
//           created: stats.birthtime,
//           modified: stats.mtime,
//           downloadUrl: `/api/download/${file}`,
//         };
//       })
//     );

//     // Sort by creation date (newest first)
//     videos.sort((a, b) => b.created.getTime() - a.created.getTime());

//     return NextResponse.json(
//       {
//         success: true,
//         count: videos.length,
//         videos,
//       },
//       { status: 200 }
//     );

//   } catch (error: any) {
//     console.error('Error listing rendered videos:', error);
    
//     return NextResponse.json(
//       {
//         error: 'Failed to list rendered videos',
//         message: error.message || 'An unexpected error occurred',
//       },
//       { status: 500 }
//     );
//   }
// }

// // DELETE endpoint to remove a rendered video
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const fileName = searchParams.get('fileName');

//     if (!fileName) {
//       return NextResponse.json(
//         { error: 'fileName parameter is required' },
//         { status: 400 }
//       );
//     }

//     // Security: Prevent directory traversal
//     if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
//       return NextResponse.json(
//         { error: 'Invalid file name' },
//         { status: 400 }
//       );
//     }

//     const outputDir = path.join(process.cwd(), 'output');
//     const filePath = path.join(outputDir, fileName);

//     // Check if file exists
//     try {
//       await fs.access(filePath);
//     } catch {
//       return NextResponse.json(
//         { error: 'File not found' },
//         { status: 404 }
//       );
//     }

//     // Delete the file
//     await fs.unlink(filePath);

//     console.log('Deleted file:', fileName);

//     return NextResponse.json(
//       {
//         success: true,
//         message: 'File deleted successfully',
//         fileName,
//       },
//       { status: 200 }
//     );

//   } catch (error: any) {
//     console.error('Error deleting video:', error);
    
//     return NextResponse.json(
//       {
//         error: 'Failed to delete video',
//         message: error.message || 'An unexpected error occurred',
//       },
//       { status: 500 }
//     );
//   }
// }

// // Configure API route
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '50mb',
//     },
//     responseLimit: false,
//   },
//   maxDuration: 300, // 5 minutes for Vercel Pro
// };