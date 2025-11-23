// src/remotion/styles/Karaoke.tsx

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption } from '@/types';

interface KaraokeProps {
  caption: Caption;
  currentTime: number;
}

/**
 * Karaoke-style caption with word-by-word highlighting
 */
const Karaoke: React.FC<KaraokeProps> = ({ caption, currentTime }) => {
  const frame = useCurrentFrame();

  // Split text into words
  const words = caption.text.split(/(\s+)/);
  const actualWords = caption.text.split(/\s+/);

  // Calculate timing for each word
  const captionDuration = caption.end - caption.start;
  const wordDuration = captionDuration / actualWords.length;
  const timeIntoCaption = currentTime - caption.start;
  const currentWordIndex = Math.floor(timeIntoCaption / wordDuration);

  // Fade in animation
  const opacity = interpolate(
    frame,
    [0, 10],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Scale animation
  const scale = interpolate(
    frame,
    [0, 10],
    [0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Render each word with appropriate styling
  let wordCounter = 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '90%',
          textAlign: 'center',
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1.5,
          fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
          opacity,
          transform: `scale(${scale})`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {words.map((word, index) => {
          // Skip whitespace
          if (word.trim() === '') {
            return null;
          }

          const isCurrentWord = wordCounter === currentWordIndex;
          const isPastWord = wordCounter < currentWordIndex;
          wordCounter++;

          // Calculate word scale for current word
          const wordScale = isCurrentWord
            ? interpolate(
                timeIntoCaption % wordDuration,
                [0, wordDuration * 0.2],
                [1, 1.15],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              )
            : 1;

          return (
            <span
              key={index}
              style={{
                color: isCurrentWord
                  ? '#FFD700' // Gold for current word
                  : isPastWord
                  ? '#FFFFFF' // White for past words
                  : '#999999', // Gray for upcoming words
                textShadow: isCurrentWord
                  ? '0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 8px rgba(0, 0, 0, 0.9)'
                  : '2px 2px 8px rgba(0, 0, 0, 0.9)',
                transform: `scale(${wordScale})`,
                transition: 'color 0.2s ease, transform 0.2s ease',
                display: 'inline-block',
                fontWeight: isCurrentWord ? 900 : 700,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default Karaoke;