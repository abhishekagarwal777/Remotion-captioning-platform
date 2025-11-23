// src/components/CaptionStyleSelector.tsx

'use client';

import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { CaptionStyle } from '@/types';
import { clsx } from 'clsx';

interface CaptionStyleSelectorProps {
  selectedStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

// Style configuration with metadata
interface StyleConfig {
  id: CaptionStyle;
  name: string;
  description: string;
  preview: string;
  icon: React.ReactNode;
  features: string[];
}

const CaptionStyleSelector: React.FC<CaptionStyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
}) => {
  // Style configurations
  const styles: StyleConfig[] = [
    {
      id: 'bottom-centered',
      name: 'Bottom Centered',
      description: 'Classic subtitle style at the bottom of the video',
      preview: 'Standard subtitles positioned at the bottom center with semi-transparent background',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v4h16v-4M4 8h16M4 8V4h16v4"
          />
        </svg>
      ),
      features: ['Centered alignment', 'Semi-transparent background', 'Easy to read', 'Standard format'],
    },
    {
      id: 'top-bar',
      name: 'Top Bar',
      description: 'News-style caption bar at the top of the video',
      preview: 'Professional news-style caption bar with solid background at the top',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
      features: ['Top positioning', 'Full-width bar', 'News/broadcast style', 'Bold text'],
    },
    {
      id: 'karaoke',
      name: 'Karaoke Style',
      description: 'Word-by-word highlighting as they are spoken',
      preview: 'Dynamic word highlighting with smooth transitions and animations',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
      features: ['Word-by-word highlighting', 'Smooth animations', 'Engaging style', 'Modern look'],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caption Style</CardTitle>
        <CardDescription>
          Choose how your captions will appear in the video
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {styles.map((style) => (
            <StyleOption
              key={style.id}
              style={style}
              isSelected={selectedStyle === style.id}
              onSelect={() => onStyleChange(style.id)}
            />
          ))}
        </div>

        {/* Selected style info */}
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <h4 className="text-sm font-semibold text-primary-900 mb-2">
            Selected: {styles.find((s) => s.id === selectedStyle)?.name}
          </h4>
          <p className="text-sm text-primary-700">
            {styles.find((s) => s.id === selectedStyle)?.preview}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Individual style option component
interface StyleOptionProps {
  style: StyleConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const StyleOption: React.FC<StyleOptionProps> = ({ style, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'relative w-full p-5 text-left border-2 rounded-xl transition-all duration-200',
        'hover:border-primary-400 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="bg-primary-600 text-white rounded-full p-1">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={clsx(
            'flex-shrink-0 p-3 rounded-lg',
            isSelected ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
          )}
        >
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 pr-8">
          <h3
            className={clsx(
              'text-lg font-semibold mb-1',
              isSelected ? 'text-primary-900' : 'text-gray-900'
            )}
          >
            {style.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{style.description}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {style.features.map((feature, index) => (
              <span
                key={index}
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  isSelected
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="relative h-32 bg-gray-900 rounded-lg overflow-hidden">
          {/* Preview based on style */}
          {style.id === 'bottom-centered' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5">
              <div className="bg-black/70 text-white px-4 py-2 rounded text-center">
                <p className="text-sm font-medium">Sample caption text • नमूना टेक्स्ट</p>
              </div>
            </div>
          )}

          {style.id === 'top-bar' && (
            <div className="absolute top-0 left-0 right-0 bg-black/90 text-white px-6 py-3">
              <p className="text-sm font-bold">Sample caption text • नमूना टेक्स्ट</p>
            </div>
          )}

          {style.id === 'karaoke' && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-4/5">
              <div className="text-center">
                <p className="text-base font-bold">
                  <span className="text-yellow-400">Sample</span>
                  <span className="text-white"> caption text • </span>
                  <span className="text-gray-400">नमूना टेक्स्ट</span>
                </p>
              </div>
            </div>
          )}

          {/* Preview label */}
          <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
            Preview
          </div>
        </div>
      </div>
    </button>
  );
};

export default CaptionStyleSelector;