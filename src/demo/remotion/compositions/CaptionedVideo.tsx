// src/remotion/compositions/CaptionedVideo.tsx

import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption, CaptionStyle } from '@/types';
import BottomCentered from '../styles/BottomCentered';
import TopBar from '../styles/TopBar';
import Karaoke from '../styles/Karaoke';

export interface CaptionedVideoProps {
  videoSrc: string;
  captions: Caption[];
  style: CaptionStyle;
}

/**
 * Main Remotion composition for rendering video with captions
 */
const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoSrc,
  captions,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert frame to seconds
  const currentTime = frame / fps;

  // Find active caption at current time
  const activeCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  // Render caption based on selected style
  const renderCaption = () => {
    if (!activeCaption) return null;

    switch (style) {
      case 'bottom-centered':
        return <BottomCentered caption={activeCaption} />;
      case 'top-bar':
        return <TopBar caption={activeCaption} />;
      case 'karaoke':
        return (
          <Karaoke
            caption={activeCaption}
            currentTime={currentTime}
          />
        );
      default:
        return <BottomCentered caption={activeCaption} />;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Video layer */}
      <Video
        src={videoSrc}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Caption overlay */}
      {renderCaption()}
    </AbsoluteFill>
  );
};

export default CaptionedVideo;