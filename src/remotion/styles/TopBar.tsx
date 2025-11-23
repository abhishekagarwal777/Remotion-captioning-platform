import { isHinglish } from "../../utils/helpers";
import { AbsoluteFill } from "remotion";

interface StyleProps {
  text: string;
  opacity: number;
}

export const TopBarStyle: React.FC<StyleProps> = ({ text, opacity }) => {
  const hasDevanagari = isHinglish(text);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(220, 38, 38, 0.95)",
          width: "100%",
          padding: "20px 40px",
          opacity,
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
            margin: 0,
            fontFamily: hasDevanagari
              ? "var(--font-noto-devanagari), system-ui, sans-serif"
              : "var(--font-noto-sans), system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 1,
            lineHeight: 1.4,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};
