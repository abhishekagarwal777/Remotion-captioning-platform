// src/remotion/styles/BottomCentered.tsx

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption } from '@/types';

interface BottomCenteredProps {
  caption: Caption;
}

/**
 * Bottom-centered caption style (classic subtitles)
 */
const BottomCentered: React.FC<BottomCenteredProps> = ({ caption }) => {
  const frame = useCurrentFrame();

  // Fade in/out animation
  const opacity = interpolate(
    frame,
    [0, 10, 10, 20],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: 8,
          maxWidth: '85%',
          textAlign: 'center',
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.4,
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9)',
          opacity,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};

export default BottomCentered;