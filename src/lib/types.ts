export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
}

export type CaptionStyle = "bottom-centered" | "top-bar" | "karaoke";

export interface CaptionStyleConfig {
  name: string;
  value: CaptionStyle;
  description: string;
}

export interface RenderRequest {
  videoUrl: string;
  captions: Caption[];
  style: CaptionStyle;
}
