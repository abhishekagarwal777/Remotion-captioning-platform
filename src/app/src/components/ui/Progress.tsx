// src/components/ui/Progress.tsx

import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

// Progress variants
type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

// Progress sizes
type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';

// Progress props interface
export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

/**
 * Progress bar component
 */
const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
  ...props
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Base container styles
  const containerStyles = 'w-full bg-gray-200 rounded-full overflow-hidden';

  // Size styles
  const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    xl: 'h-6',
  };

  // Variant styles
  const variantStyles: Record<ProgressVariant, string> = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  };

  // Bar base styles
  const barBaseStyles = 'h-full transition-all duration-300 ease-in-out';

  // Animated styles
  const animatedStyles = animated
    ? 'animate-pulse'
    : '';

  // Striped styles
  const stripedStyles = striped
    ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:30px_100%] animate-[shimmer_2s_infinite]'
    : '';

  return (
    <div className={clsx('w-full', className)} {...props}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || `Progress`}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress bar container */}
      <div className={clsx(containerStyles, sizeStyles[size])}>
        {/* Progress bar fill */}
        <div
          className={clsx(
            barBaseStyles,
            variantStyles[variant],
            animatedStyles,
            stripedStyles
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

// Circular Progress component
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  size?: number; // in pixels
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Variant colors
  const variantColors: Record<ProgressVariant, string> = {
    primary: 'stroke-primary-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-600',
    info: 'stroke-blue-600',
  };

  return (
    <div
      className={clsx('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={clsx('transition-all duration-300', variantColors[variant])}
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Indeterminate progress (loading spinner)
export interface IndeterminateProgressProps extends HTMLAttributes<HTMLDivElement> {
  size?: ProgressSize;
  variant?: ProgressVariant;
}

export const IndeterminateProgress: React.FC<IndeterminateProgressProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  ...props
}) => {
  // Size styles
  const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    xl: 'h-6',
  };

  // Variant styles
  const variantStyles: Record<ProgressVariant, string> = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div
      className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizeStyles[size], className)}
      {...props}
    >
      <div
        className={clsx(
          'h-full w-1/3 rounded-full animate-[progress_1.5s_ease-in-out_infinite]',
          variantStyles[variant]
        )}
      />
    </div>
  );
};

export default Progress;