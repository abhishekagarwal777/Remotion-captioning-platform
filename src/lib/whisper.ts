import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { Caption } from "./types";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateCaptions(
  audioBuffer: Buffer
): Promise<Caption[]> {
  try {
    const file = await toFile(audioBuffer, "audio.mp4", {
      type: "video/mp4",
    });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const captions: Caption[] = [];

    if (transcription.segments) {
      for (const segment of transcription.segments) {
        captions.push({
          id: uuidv4(),
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
        });
      }
    } else {
      captions.push({
        id: uuidv4(),
        start: 0,
        end: 5,
        text: transcription.text || "No captions generated",
      });
    }

    return captions;
  } catch (error) {
    console.error("Error generating captions:", error);
    throw new Error("Failed to generate captions");
  }
}
