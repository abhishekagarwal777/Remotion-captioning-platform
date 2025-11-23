import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let propsPath = null;
  let outputPath = null;

  try {
    const { tempPath, captions, style } = await request.json();

    if (!tempPath) {
      return NextResponse.json(
        { error: "Missing video path" },
        { status: 400 }
      );
    }

    const tempDir = join("/tmp", "remotion-temp", uuidv4());
    await mkdir(tempDir, { recursive: true });

    const videoPath = join(tempDir, "input.mp4");
    const videoBuffer = await readFile(tempPath);
    await writeFile(videoPath, videoBuffer);

    // Prepare props
    outputPath = join(tempDir, "output.mp4");
    propsPath = join(tempDir, "props.json");

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

    // Run Remotion render
    const command = `npx remotion render src/remotion/Root.tsx CaptionedVideo "${outputPath}" --props="${propsPath}"`;
    await execAsync(command, { timeout: 9000 }); // 9s limit on Vercel

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

export const maxDuration = 10;




// import { NextRequest, NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import { writeFile, unlink, mkdir, readFile } from "fs/promises";
// import { join } from "path";
// import { exec } from "child_process";
// import { promisify } from "util";
// import { existsSync } from "fs";

// const execAsync = promisify(exec);

// export async function POST(request: NextRequest) {
//   let propsPath: string | null = null;
//   let tempVideoPath: string | null = null;
//   let outputPath: string | null = null;

//   try {
//     const { videoUrl, captions, style } = await request.json();

//     if (!videoUrl || !captions || !Array.isArray(captions)) {
//       return NextResponse.json(
//         { error: "Missing required fields or invalid captions format" },
//         { status: 400 }
//       );
//     }

//     console.log("Received render request:", {
//       videoUrl,
//       captionsCount: captions.length,
//       style,
//       platform: process.env.VERCEL ? "Vercel" : "Local",
//     });

//     // Use /tmp on Vercel
//     const tempDir = join("/tmp", "remotion-temp", uuidv4());
//     await mkdir(tempDir, { recursive: true });

//     console.log("Created temp directory:", tempDir);

//     // -------------------------------
//     // ✅ Download video directly from URL
//     // -------------------------------
//     tempVideoPath = join(tempDir, "input.mp4");

//     console.log("Downloading input video:", videoUrl);

//     const response = await fetch(videoUrl);
//     if (!response.ok) {
//       return NextResponse.json(
//         { error: "Failed to download video" },
//         { status: 500 }
//       );
//     }

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     await writeFile(tempVideoPath, buffer);

//     console.log("Video saved to temp:", {
//       path: tempVideoPath,
//       sizeKB: Math.round(buffer.length / 1024),
//     });

//     // --------------------------------
//     // Render
//     // --------------------------------
//     outputPath = join(tempDir, "output.mp4");
//     propsPath = join(tempDir, "props.json");

//     const renderProps = {
//       videoUrl,
//       captions,
//       style: style || "bottom-centered",
//     };

//     await writeFile(propsPath, JSON.stringify(renderProps, null, 2));

//     console.log("Props created, starting Remotion render...");

//     try {
//       const { stdout: ffmpegVersion } = await execAsync("ffmpeg -version");
//       console.log("FFmpeg available:", ffmpegVersion.split("\n")[0]);
//     } catch (e) {
//       console.warn("FFmpeg check failed:", e);
//     }

//     const command = `npx remotion render src/remotion/Root.tsx CaptionedVideo "${outputPath}" --props="${propsPath}" --log=verbose`;

//     console.log("Executing:", command);

//     const startTime = Date.now();
//     const timeoutMs = process.env.VERCEL ? 9000 : 300000;

//     const { stdout, stderr } = await execAsync(command, {
//       cwd: process.cwd(),
//       maxBuffer: 1024 * 1024 * 50,
//       timeout: timeoutMs,
//     });

//     const renderDuration = Date.now() - startTime;
//     console.log(`Render completed in ${renderDuration}ms`);
//     console.log("Remotion output:", stdout);
//     if (stderr) console.log("Remotion stderr:", stderr);

//     if (!existsSync(outputPath)) {
//       throw new Error("Output video was not created by Remotion");
//     }

//     const outputBuffer = await readFile(outputPath);

//     console.log("Render finished. Size:", {
//       sizeKB: Math.round(outputBuffer.length / 1024),
//     });

//     // -------------------------------
//     // ✅ Return video directly (no MongoDB)
//     // -------------------------------

//     return new NextResponse(outputBuffer, {
//       status: 200,
//       headers: {
//         "Content-Type": "video/mp4",
//         "Content-Disposition": `attachment; filename=rendered-${uuidv4()}.mp4`,
//       },
//     });
//   } catch (e) {
//     const error = e as any;
//     console.error("Render error:", {
//       message: error.message,
//       code: error.code,
//       killed: error.killed,
//     });

//     try {
//       if (propsPath && existsSync(propsPath)) await unlink(propsPath);
//       if (tempVideoPath && existsSync(tempVideoPath)) await unlink(tempVideoPath);
//       if (outputPath && existsSync(outputPath)) await unlink(outputPath);
//     } catch (cleanupError) {
//       console.error("Cleanup error:", cleanupError);
//     }

//     if (error.killed || error.code === "ETIMEDOUT") {
//       return NextResponse.json(
//         {
//           error: "Render timeout",
//           details:
//             "Video rendering exceeded Vercel's 10-second limit. Use Railway.app or Vercel Pro.",
//         },
//         { status: 408 }
//       );
//     }

//     if (error.message.includes("ffmpeg")) {
//       return NextResponse.json(
//         {
//           error: "FFmpeg not found",
//           details:
//             "FFmpeg is required. Vercel Free Tier does not support it. Use Railway.app.",
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(
//       {
//         error: "Failed to render video",
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// export const maxDuration = 300; // Vercel Pro only
