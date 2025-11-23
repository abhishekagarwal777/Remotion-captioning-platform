import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getGridFSBucket } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

interface VerboseTranscription {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: TranscriptionSegment[];
}

export async function POST(req: Request) {
  try {
    console.log("inside try");

    const body = await req.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "No video URL provided" },
        { status: 400 }
      );
    }

    let videoFile: File;

    // Extract fileId from URL (format: /api/video/[fileId])
    const fileIdMatch = videoUrl.match(/\/api\/video\/([a-f0-9]+)/);

    if (fileIdMatch) {
      const fileId = fileIdMatch[1];

      if (!ObjectId.isValid(fileId)) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
      }

      const bucket = await getGridFSBucket();
      const objectId = new ObjectId(fileId);

      // Download from GridFS
      const downloadStream = bucket.openDownloadStream(objectId);

      const chunks: Buffer[] = [];
      for await (const chunk of downloadStream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const videoBlob = new Blob([buffer], { type: "video/mp4" });
      videoFile = new File([videoBlob], "video.mp4", {
        type: "video/mp4",
      });
    } else {
      // Fallback: Fetch from external URL
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        return NextResponse.json(
          { error: "Failed to fetch video" },
          { status: 500 }
        );
      }
      const videoBlob = await videoResponse.blob();
      videoFile = new File([videoBlob], "video.mp4", {
        type: videoBlob.type,
      });
    }

    // Transcribe with Groq Whisper
    const result = (await client.audio.transcriptions.create({
      file: videoFile,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    })) as unknown as VerboseTranscription;

    // Format captions with timing information from segments
    const captions = result.segments.map((segment, index) => ({
      id: `caption-${index}`,
      text: segment.text.trim(),
      start: segment.start,
      end: segment.end,
    }));

    // If segments aren't available, create a single caption
    if (captions.length === 0 && result.text) {
      captions.push({
        id: "caption-0",
        text: result.text,
        start: 0,
        end: 5,
      });
    }

    return NextResponse.json({
      success: true,
      captions,
      text: result.text,
    });
  } catch (e) {
    console.error("Transcription error:", e);
    return NextResponse.json(
      { error: "Error transcribing audio", details: String(e) },
      { status: 500 }
    );
  }
}
