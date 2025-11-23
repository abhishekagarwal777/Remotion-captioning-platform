import { Composition } from "remotion";
import { CaptionedVideo } from "./CaptionedVideo";

const CaptionedVideoLoose = CaptionedVideo as unknown as React.FC<
  Record<string, unknown>
>;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideoLoose}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoUrl: "",
          captions: [],
          style: "bottom-centered",
        }}
      />
    </>
  );
};
