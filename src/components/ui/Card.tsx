import { type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

export function Card({
  as: Component = 'div',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  return (
    <Component
      className={`bg-surface border border-line rounded-card ${paddingStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
