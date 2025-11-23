// src/remotion/types.ts

import { Caption } from '@/types';

/**
 * Type definitions for Remotion compositions
 */

export type CaptionStyle = 'bottom-centered' | 'top-bar' | 'karaoke';

export interface VideoCompositionProps {
  videoSrc: string;
  captions: Caption[];
  style: CaptionStyle;
}

export interface CaptionStyleProps {
  caption: Caption;
  currentTime?: number;
}

export interface VideoMetadata {
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export interface RenderOptions {
  composition: string;
  inputProps: VideoCompositionProps;
  codec: 'h264' | 'h265' | 'vp8' | 'vp9';
  outputLocation: string;
  concurrency?: number;
  timeoutInMilliseconds?: number;
  videoBitrate?: string;
  audioBitrate?: string;
}

export default {
  CaptionStyle,
  VideoCompositionProps,
  CaptionStyleProps,
  VideoMetadata,
  RenderOptions,
};