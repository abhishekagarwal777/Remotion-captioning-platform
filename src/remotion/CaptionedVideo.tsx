import { AbsoluteFill, OffthreadVideo } from "remotion";
import { Caption } from "./Caption";
import { Caption as CaptionType, CaptionStyle } from "@/lib/types";

interface CaptionedVideoProps {
  videoUrl: string;
  captions: CaptionType[];
  style: CaptionStyle;
}

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoUrl,
  captions,
  style,
}) => {
  
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <OffthreadVideo
          src={videoUrl}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>

      <AbsoluteFill>
        {captions.map((caption) => (
          <Caption key={caption.id} caption={caption} style={style} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
