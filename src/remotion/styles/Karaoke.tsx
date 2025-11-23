import { isHinglish } from "../../utils/helpers";
import { AbsoluteFill, interpolate } from "remotion";

interface StyleProps {
  text: string;
  opacity: number;
  currentTime: number;
  captionStart: number;
  captionEnd: number;
}

export const KaraokeStyle: React.FC<StyleProps> = ({
  text,
  opacity,
  currentTime,
  captionStart,
  captionEnd,
}) => {
  const hasDevanagari = isHinglish(text);
  const words = text.split(" ");
  const captionDuration = captionEnd - captionStart;
  const timePerWord = captionDuration / words.length;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "20px 40px",
          borderRadius: 12,
          maxWidth: "90%",
          opacity,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 42,
            fontWeight: "bold",
            textAlign: "center",
            margin: 0,
            fontFamily: hasDevanagari
              ? "var(--font-noto-devanagari), system-ui, sans-serif"
              : "var(--font-noto-sans), system-ui, sans-serif",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            lineHeight: 1.5,
          }}
        >
          {words.map((word, index) => {
            const wordStart = captionStart + index * timePerWord;
            const wordEnd = wordStart + timePerWord;
            const isActive = currentTime >= wordStart && currentTime <= wordEnd;

            const scale = isActive
              ? interpolate(
                  currentTime,
                  [wordStart, wordStart + 0.1],
                  [1, 1.15],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                )
              : 1;

            return (
              <span
                key={index}
                style={{
                  color: isActive ? "#fbbf24" : "white",
                  transform: `scale(${scale})`,
                  transition: "all 0.1s ease",
                  textShadow: isActive
                    ? "0 0 20px rgba(251, 191, 36, 0.8)"
                    : "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
