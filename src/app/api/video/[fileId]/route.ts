import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGridFSBucket } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await context.params; // 👈 IMPORTANT

    const objectId = new ObjectId(fileId);
    const bucket = await getGridFSBucket();

    // Check GridFS for file
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
