// // src/app/api/download/[filename]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import path from 'path';
// import fs from 'fs/promises';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { filename: string } }
// ) {
//   try {
//     const filename = params.filename;

//     // Security: Prevent directory traversal
//     if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
//       return NextResponse.json(
//         { error: 'Invalid filename' },
//         { status: 400 }
//       );
//     }

//     const outputDir = path.join(process.cwd(), 'output');
//     const filePath = path.join(outputDir, filename);

//     // Check if file exists
//     try {
//       await fs.access(filePath);
//     } catch {
//       return NextResponse.json(
//         { error: 'File not found' },
//         { status: 404 }
//       );
//     }

//     // Read file
//     const fileBuffer = await fs.readFile(filePath);

//     // Return file
//     return new NextResponse(fileBuffer, {
//       headers: {
//         'Content-Type': 'video/mp4',
//         'Content-Disposition': `attachment; filename="${filename}"`,
//         'Content-Length': fileBuffer.length.toString(),
//       },
//     });
//   } catch (error: any) {
//     console.error('Download error:', error);
//     return NextResponse.json(
//       { error: 'Failed to download file', message: error.message },
//       { status: 500 }
//     );
//   }
// }