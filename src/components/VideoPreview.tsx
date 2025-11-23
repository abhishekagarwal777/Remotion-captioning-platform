"use client";

import { useEffect, useRef, useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { CaptionedVideo } from "@/remotion/CaptionedVideo";
import { Caption, CaptionStyle } from "@/lib/types";
import { Play, Pause } from "lucide-react";

interface VideoPreviewProps {
  videoUrl: string;
  captions: Caption[];
  style: CaptionStyle;
}

export default function VideoPreview({
  videoUrl,
  captions,
  style,
}: VideoPreviewProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Get video duration
    const video = document.createElement("video");
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      setDuration(Math.floor(video.duration));
    };
  }, [videoUrl]);

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!duration) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center">
        <p className="text-gray-500">Loading video...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg overflow-hidden">
        <Player
          ref={playerRef}
          component={CaptionedVideo}
          inputProps={{
            videoUrl,
            captions,
            style,
          }}
          durationInFrames={duration * 30}
          fps={30}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{
            width: "100%",
          }}
          controls
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={togglePlayPause}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
