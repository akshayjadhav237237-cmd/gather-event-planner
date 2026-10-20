import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      children,
      type = 'button',
      className = '',
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-ink text-surface hover:bg-ink-soft active:bg-ink border border-transparent',
      secondary: 'bg-surface text-ink border border-line-control hover:bg-sunken active:bg-sunken',
      ghost: 'text-ink hover:bg-sunken active:bg-sunken border border-transparent',
    }[variant];

    const sizeStyles = {
      md: 'min-h-[44px] px-4 py-2 text-base gap-2',
      sm: 'min-h-[36px] px-3 py-1.5 text-sm gap-1.5',
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center font-medium rounded-control transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles} ${sizeStyles} ${className}`.trim()}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
