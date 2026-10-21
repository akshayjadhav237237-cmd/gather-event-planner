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
  const hiddenClass = ['sr-only', className].filter(Boolean).join(' ');

  return (
    <Component className={hiddenClass} {...props}>
      {children}
    </Component>
  );
}
