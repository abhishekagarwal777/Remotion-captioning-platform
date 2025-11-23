// src/demo/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Just return file metadata (frontend will send it to /transcribe)
    return NextResponse.json(
      {
        success: true,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}








// // src/demo/app/api/transcribe/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { OpenAI } from "openai";

// export const runtime = "edge";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const form = await req.formData();
//     const file = form.get("file") as File | null;

//     if (!file) {
//       return NextResponse.json(
//         { error: "No video file uploaded" },
//         { status: 400 }
//       );
//     }

//     // Whisper automatically extracts audio from MP4, MOV, etc.
//     const transcription = await openai.audio.transcriptions.create({
//       model: "whisper-1",
//       file, // ← fixed
//       response_format: "verbose_json",
//       timestamp_granularities: ["segment"],
//     });

//     const captions =
//       transcription.segments?.map((seg: any, index: number) => ({
//         id: `caption_${index + 1}`,
//         start: seg.start,
//         end: seg.end,
//         text: seg.text.trim(),
//       })) || [];

//     return NextResponse.json(
//       {
//         success: true,
//         provider: "openai",
//         captionsCount: captions.length,
//         captions,
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("Transcription error:", error);
//     return NextResponse.json(
//       {
//         error: "Transcription failed",
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
