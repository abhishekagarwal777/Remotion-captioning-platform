import { isHinglish } from "../../utils/helpers";
import { AbsoluteFill } from "remotion";

interface StyleProps {
  text: string;
  opacity: number;
}

export const BottomCenteredStyle: React.FC<StyleProps> = ({
  text,
  opacity,
}) => {
  const hasDevanagari = isHinglish(text);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          padding: "12px 24px",
          borderRadius: 8,
          maxWidth: "80%",
          opacity,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 36,
            fontWeight: "bold",
            textAlign: "center",
            margin: 0,
            fontFamily: hasDevanagari
              ? "var(--font-noto-devanagari), system-ui, sans-serif"
              : "var(--font-noto-sans), system-ui, sans-serif",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            lineHeight: 1.4,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};
