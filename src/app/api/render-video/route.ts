import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { tempPath, captions, style } = await request.json();

    if (!tempPath) {
      return NextResponse.json(
        { error: "Missing video path" },
        { status: 400 }
      );
    }

    // Create temp directory in Vercel's writable path
    const tempDir = join("/tmp", "remotion-temp", uuidv4());
    await mkdir(tempDir, { recursive: true });

    // Save input video inside /tmp
    const videoPath = join(tempDir, "input.mp4");
    const videoBuffer = await readFile(tempPath);
    await writeFile(videoPath, videoBuffer);

    // Prepare Remotion prop files
    const outputPath = join(tempDir, "output.mp4");
    const propsPath = join(tempDir, "props.json");

    await writeFile(
      propsPath,
      JSON.stringify(
        {
          videoUrl: videoPath,
          captions,
          style: style ?? "bottom-centered",
        },
        null,
        2
      )
    );

    // Run Remotion
    const command = `npx remotion render src/remotion/Root.tsx CaptionedVideo "${outputPath}" --props="${propsPath}"`;

    await execAsync(command, { timeout: 9000 }); // 9s limit (Vercel Free)

    if (!existsSync(outputPath)) {
      throw new Error("Remotion did not produce output");
    }

    const outputBuffer = await readFile(outputPath);
    const base64 = outputBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      videoBase64: base64,
    });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: "Render failed", details: String(error) },
      { status: 500 }
    );
  }
}

export const maxDuration = 10; // Required for Vercel Serverless
