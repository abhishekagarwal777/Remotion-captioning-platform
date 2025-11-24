import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGridFSBucket } from "@/lib/mongodb";

export async function GET(
  req: Request,
  context: { params: { fileId: string } }
) {
  try {
    const { fileId } = context.params;
    const objectId = new ObjectId(fileId);

    const bucket = await getGridFSBucket(); // NOW bucket is not void

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();

    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const downloadStream = bucket.openDownloadStream(objectId);

    return new Response(downloadStream as any, {
      headers: {
        "Content-Type": files[0].metadata?.contentType ?? "video/mp4",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}



// import { NextRequest, NextResponse } from "next/server";
// import { getGridFSBucket } from "@/lib/mongodb";
// import { ObjectId } from "mongodb";

// interface RouteParams {
//   params: Promise<{
//     fileId: string;
//   }>;
// }

// export async function GET(request: NextRequest, context: RouteParams) {
//   try {
//     // Await params first!
//     const { fileId } = await context.params;

//     console.log("Fetching video with fileId:", fileId);

//     if (!fileId) {
//       return NextResponse.json(
//         { error: "No file ID provided" },
//         { status: 400 }
//       );
//     }

//     if (!ObjectId.isValid(fileId)) {
//       return NextResponse.json(
//         { error: "Invalid file ID format" },
//         { status: 400 }
//       );
//     }

//     const bucket = await getGridFSBucket();
//     const objectId = new ObjectId(fileId);

//     // Check if file exists
//     const files = await bucket.find({ _id: objectId }).toArray();

//     if (files.length === 0) {
//       return NextResponse.json({ error: "File not found" }, { status: 404 });
//     }

//     const file = files[0];
//     console.log("Found file:", file.filename);

//     // Create download stream
//     const downloadStream = bucket.openDownloadStream(objectId);

//     // Convert stream to buffer
//     const chunks: Buffer[] = [];
//     for await (const chunk of downloadStream) {
//       chunks.push(chunk);
//     }
//     const buffer = Buffer.concat(chunks);

//     // Get content type from metadata
//     const contentType = (file.metadata?.contentType as string) || "video/mp4";

//     console.log("Sending video, size:", buffer.length, "bytes");

//     // Return video with proper headers
//     return new NextResponse(buffer, {
//       headers: {
//         "Content-Type": contentType,
//         "Content-Length": buffer.length.toString(),
//         "Cache-Control": "public, max-age=31536000, immutable",
//         "Accept-Ranges": "bytes",
//       },
//     });
//   } catch (error) {
//     console.error("Video retrieval error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to retrieve video",
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
