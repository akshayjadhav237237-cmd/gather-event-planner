import { type HTMLAttributes, type ReactNode } from 'react';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'span' | 'div';
  className?: string;
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
  className = '',
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component className={`sr-only ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
