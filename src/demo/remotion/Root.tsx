// src/remotion/Root.tsx

import React from 'react';
import { Composition } from 'remotion';
import CaptionedVideo, { CaptionedVideoProps } from './compositions/CaptionedVideo';
import { REMOTION } from '@/lib/constants';

/**
 * Root component for Remotion - registers all compositions
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<CaptionedVideoProps>
        id={REMOTION.COMPOSITION_ID}
        component={CaptionedVideo}
        durationInFrames={REMOTION.DEFAULT_DURATION_IN_FRAMES}
        fps={REMOTION.DEFAULT_FPS}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: '',
          captions: [],
          style: 'bottom-centered',
        }}
        // Calculate duration based on video
        calculateMetadata={async ({ props }) => {
          // In production, this would calculate actual video duration
          // For now, we use a default
          const durationInFrames = REMOTION.DEFAULT_DURATION_IN_FRAMES;
          
          return {
            durationInFrames,
            fps: REMOTION.DEFAULT_FPS,
            width: 1920,
            height: 1080,
          };
        }}
      />
    </>
  );
};

export default RemotionRoot;