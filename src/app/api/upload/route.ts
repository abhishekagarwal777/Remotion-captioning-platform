import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const tempDir = join("/tmp", "uploads");
    await mkdir(tempDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = join(tempDir, `${uuidv4()}.mp4`);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      tempPath: filePath,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from "next/server";
// import { getGridFSBucket } from "@/lib/mongodb";
// import { Readable } from "stream";

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }

//     // Validate file type
//     if (!file.type.includes("video/mp4")) {
//       return NextResponse.json(
//         { error: "Only MP4 files are allowed" },
//         { status: 400 }
//       );
//     }

//     // Validate file size (100MB max)
//     const maxSize = 100 * 1024 * 1024; // 100MB in bytes
//     if (file.size > maxSize) {
//       return NextResponse.json(
//         { error: "File size exceeds 100MB limit" },
//         { status: 400 }
//       );
//     }

//     // Get GridFS bucket
//     const bucket = await getGridFSBucket();

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Create a readable stream from buffer
//     const readableStream = new Readable();
//     readableStream.push(buffer);
//     readableStream.push(null);

//     // Upload to GridFS with metadata (contentType goes in metadata)
//     const uploadStream = bucket.openUploadStream(file.name, {
//       metadata: {
//         contentType: file.type,
//         originalName: file.name,
//         uploadedAt: new Date(),
//         size: buffer.length,
//       },
//     });

//     // Pipe the file to GridFS
//     await new Promise((resolve, reject) => {
//       readableStream
//         .pipe(uploadStream)
//         .on("finish", resolve)
//         .on("error", reject);
//     });

//     const fileId = uploadStream.id.toString();

//     // Return MongoDB file ID
//     return NextResponse.json({
//       success: true,
//       url: `/api/video/${fileId}`,
//       fileId,
//       filename: file.name,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { error: "Failed to upload file" },
//       { status: 500 }
//     );
//   }
// }
