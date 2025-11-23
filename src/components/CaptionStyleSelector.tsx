"use client";

import { CaptionStyle, CaptionStyleConfig } from "@/lib/types";
import { AlignCenter, AlignJustify, Music } from "lucide-react";

interface CaptionStyleSelectorProps {
  selectedStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

const captionStyles: CaptionStyleConfig[] = [
  {
    name: "Bottom Centered",
    value: "bottom-centered",
    description: "Standard subtitles at the bottom",
  },
  {
    name: "Top Bar",
    value: "top-bar",
    description: "News-style banner at the top",
  },
  {
    name: "Karaoke",
    value: "karaoke",
    description: "Word-by-word highlighting",
  },
];

const getIcon = (style: CaptionStyle) => {
  switch (style) {
    case "bottom-centered":
      return <AlignCenter size={20} />;
    case "top-bar":
      return <AlignJustify size={20} />;
    case "karaoke":
      return <Music size={20} />;
  }
};

export default function CaptionStyleSelector({
  selectedStyle,
  onStyleChange,
}: CaptionStyleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Caption Style
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {captionStyles.map((style) => (
          <button
            key={style.value}
            onClick={() => onStyleChange(style.value)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${
                selectedStyle === style.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={
                  selectedStyle === style.value
                    ? "text-blue-600"
                    : "text-gray-400"
                }
              >
                {getIcon(style.value)}
              </div>
              <span className="font-medium text-gray-900">{style.name}</span>
            </div>
            <p className="text-sm text-gray-500">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
