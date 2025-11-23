import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Caption as CaptionType, CaptionStyle } from "@/lib/types";
import { BottomCenteredStyle } from "./styles/BottomCentered";
import { TopBarStyle } from "./styles/TopBar";
import { KaraokeStyle } from "./styles/Karaoke";

interface CaptionProps {
  caption: CaptionType;
  style: CaptionStyle;
}

export const Caption: React.FC<CaptionProps> = ({ caption, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const isActive = currentTime >= caption.start && currentTime <= caption.end;

  if (!isActive) {
    return null;
  }

  const startFrame = caption.start * fps;
  const endFrame = caption.end * fps;
  const fadeInDuration = 5;
  const fadeOutDuration = 5;

  const opacity = interpolate(
    frame,
    [
      startFrame,
      startFrame + fadeInDuration,
      endFrame - fadeOutDuration,
      endFrame,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const props = {
    text: caption.text,
    opacity,
    currentTime,
    captionStart: caption.start,
    captionEnd: caption.end,
  };

  switch (style) {
    case "top-bar":
      return <TopBarStyle {...props} />;
    case "karaoke":
      return <KaraokeStyle {...props} />;
    case "bottom-centered":
    default:
      return <BottomCenteredStyle {...props} />;
  }
};
