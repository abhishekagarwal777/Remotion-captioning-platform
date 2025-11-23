import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { getGridFSBucket } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Readable } from "stream";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let propsPath: string | null = null;
  let tempVideoPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const { videoUrl, captions, style } = await request.json();

    if (!videoUrl || !captions || !Array.isArray(captions)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid captions format" },
        { status: 400 }
      );
    }

    console.log("Received render request:", {
      videoUrl,
      captionsCount: captions.length,
      style,
      platform: process.env.VERCEL ? "Vercel" : "Local",
    });

    // IMPORTANT: Use /tmp on Vercel (only writable directory)
    const tempDir = join("/tmp", "remotion-temp", uuidv4());
    await mkdir(tempDir, { recursive: true });

    console.log("Created temp directory:", tempDir);

    // Download video from MongoDB
    const fileIdMatch = videoUrl.match(/\/api\/video\/([a-f0-9]+)/);

    if (!fileIdMatch) {
      return NextResponse.json(
        { error: "Invalid video URL format" },
        { status: 400 }
      );
    }

    const fileId = fileIdMatch[1];

    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    console.log("Fetching video from MongoDB...");

    const bucket = await getGridFSBucket();
    const objectId = new ObjectId(fileId);

    // Download video to temp
    tempVideoPath = join(tempDir, "input.mp4");
    const downloadStream = bucket.openDownloadStream(objectId);
    const chunks: Buffer[] = [];

    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }

    const videoBuffer = Buffer.concat(chunks);
    await writeFile(tempVideoPath, videoBuffer);

    console.log("Video saved to temp:", {
      path: tempVideoPath,
      sizeKB: Math.round(videoBuffer.length / 1024),
    });

    // Create output path
    outputPath = join(tempDir, "output.mp4");

    // Create props file - use the API URL directly (not file path)
    propsPath = join(tempDir, "props.json");

    const renderProps = {
      videoUrl: videoUrl, // Keep using API endpoint
      captions,
      style: style || "bottom-centered",
    };

    await writeFile(propsPath, JSON.stringify(renderProps, null, 2));

    console.log("Props created, starting Remotion render...");

    // Check for FFmpeg (will help debug Vercel issues)
    try {
      const { stdout: ffmpegVersion } = await execAsync("ffmpeg -version");
      console.log("FFmpeg available:", ffmpegVersion.split("\n")[0]);
    } catch (e) {
      console.warn("FFmpeg check failed:", e);
    }

    // Remotion render command
    const command = `npx remotion render src/remotion/Root.tsx CaptionedVideo "${outputPath}" --props="${propsPath}" --log=verbose`;

    console.log("Executing:", command);

    const startTime = Date.now();
    const timeoutMs = process.env.VERCEL ? 9000 : 300000; // 9s on Vercel (leave 1s buffer), 5min local

    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 50, // 50MB
      timeout: timeoutMs,
    });

    const renderDuration = Date.now() - startTime;
    console.log(`Render completed in ${renderDuration}ms`);
    console.log("Remotion output:", stdout);

    if (stderr) {
      console.log("Remotion stderr:", stderr);
    }

    // Verify output
    if (!existsSync(outputPath)) {
      throw new Error("Output video was not created by Remotion");
    }

    const outputStats = await readFile(outputPath);
    console.log("Output video created:", {
      path: outputPath,
      sizeKB: Math.round(outputStats.length / 1024),
    });

    // Upload rendered video to MongoDB
    console.log("Uploading rendered video to MongoDB...");

    const outputBuffer = await readFile(outputPath);

    const readableStream = new Readable();
    readableStream.push(outputBuffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(`rendered-${uuidv4()}.mp4`, {
      metadata: {
        contentType: "video/mp4",
        type: "rendered",
        originalFileId: fileId,
        createdAt: new Date(),
        size: outputBuffer.length,
      },
    });

    await new Promise((resolve, reject) => {
      readableStream
        .pipe(uploadStream)
        .on("finish", resolve)
        .on("error", reject);
    });

    const renderedFileId = uploadStream.id.toString();

    console.log("Upload complete, cleaning up...");

    // Cleanup temp directory
    try {
      if (propsPath && existsSync(propsPath)) await unlink(propsPath);
      if (tempVideoPath && existsSync(tempVideoPath)) await unlink(tempVideoPath);
      if (outputPath && existsSync(outputPath)) await unlink(outputPath);
      // Remove the temp directory itself
      await execAsync(`rm -rf "${tempDir}"`);
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    return NextResponse.json({
      success: true,
      url: `/api/video/${renderedFileId}`,
      fileId: renderedFileId,
      message: "Video rendered successfully",
      renderTime: `${renderDuration}ms`,
    });
  } catch (e) {
    const error = e as Error & {
      stdout?: string;
      stderr?: string;
      code?: string;
      killed?: boolean;
    };

    console.error("Render error:", {
      message: error.message,
      code: error.code,
      killed: error.killed,
    });

    // Cleanup on error
    try {
      if (propsPath && existsSync(propsPath)) await unlink(propsPath);
      if (tempVideoPath && existsSync(tempVideoPath))
        await unlink(tempVideoPath);
      if (outputPath && existsSync(outputPath)) await unlink(outputPath);
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    // Better error messages
    if (error.killed || error.code === "ETIMEDOUT") {
      return NextResponse.json(
        {
          error: "Render timeout",
          details:
            "Video rendering exceeded Vercel's 10-second free tier limit. Please upgrade to Vercel Pro (300s limit) or use Railway.app for free unlimited rendering time.",
        },
        { status: 408 }
      );
    }

    if (error.message.includes("ENOENT") && error.message.includes("ffmpeg")) {
      return NextResponse.json(
        {
          error: "FFmpeg not found",
          details:
            "FFmpeg is required for video rendering but is not available on Vercel free tier. Please deploy to Railway.app or upgrade to Vercel Pro with custom configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to render video",
        details: error.message,
        code: error.code,
        stdout: error.stdout?.substring(0, 1000), // Limit log size
        stderr: error.stderr?.substring(0, 1000),
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 300; // Requires Vercel Pro