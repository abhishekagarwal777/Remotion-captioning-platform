// src/remotion/styles/TopBar.tsx

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption } from '@/types';

interface TopBarProps {
  caption: Caption;
}

/**
 * Top bar caption style (news/broadcast style)
 */
const TopBar: React.FC<TopBarProps> = ({ caption }) => {
  const frame = useCurrentFrame();

  // Slide down animation
  const translateY = interpolate(
    frame,
    [0, 15],
    [-100, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Fade in animation
  const opacity = interpolate(
    frame,
    [0, 15],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          padding: '24px 48px',
          width: '100%',
          textAlign: 'left',
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.3,
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8)',
          transform: `translateY(${translateY}px)`,
          opacity,
          borderBottom: '4px solid #FFD700',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};

export default TopBar;