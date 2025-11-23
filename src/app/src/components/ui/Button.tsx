// src/components/ui/Button.tsx

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

// Button sizes
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Button props interface
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Reusable Button component with multiple variants and sizes
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 shadow-sm hover:shadow-md',
      secondary:
        'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800 shadow-sm hover:shadow-md',
      outline:
        'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-sm hover:shadow-md',
      success:
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800 shadow-sm hover:shadow-md',
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
      xl: 'px-8 py-4 text-xl gap-3',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;