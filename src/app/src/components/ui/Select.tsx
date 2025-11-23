// src/components/ui/Select.tsx

import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

// Select option interface
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Select props interface
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

/**
 * Select component for dropdown selections
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'block px-4 py-2.5 pr-10 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white';

    // State styles
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400';

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : 'w-auto';

    // Icon wrapper styles
    const iconWrapperStyles = leftIcon ? 'pl-10' : '';

    return (
      <div className={clsx('relative', fullWidth ? 'w-full' : 'inline-block')}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select wrapper with icon */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Select element */}
          <select
            ref={ref}
            disabled={disabled}
            required={required}
            className={clsx(
              baseStyles,
              stateStyles,
              widthStyles,
              iconWrapperStyles,
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;