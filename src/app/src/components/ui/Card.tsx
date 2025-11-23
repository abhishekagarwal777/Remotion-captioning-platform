// src/components/ui/Card.tsx

import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

// Card variants
type CardVariant = 'default' | 'bordered' | 'elevated' | 'outlined';

// Card props interface
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  children: React.ReactNode;
}

/**
 * Card component for containing content
 */
const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  children,
  className,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white rounded-xl transition-all duration-200';

  // Variant styles
  const variantStyles: Record<CardVariant, string> = {
    default: 'shadow-md',
    bordered: 'border-2 border-gray-200',
    elevated: 'shadow-lg',
    outlined: 'border border-gray-300',
  };

  // Padding styles
  const paddingStyles: Record<typeof padding, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // Hoverable styles
  const hoverStyles = hoverable
    ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
    : '';

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header subcomponent
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('border-b border-gray-200 pb-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title subcomponent
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={clsx('text-2xl font-bold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

// Card Description subcomponent
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={clsx('text-sm text-gray-600 mt-2', className)}
      {...props}
    >
      {children}
    </p>
  );
};

// Card Content subcomponent
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer subcomponent
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('border-t border-gray-200 pt-4 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;