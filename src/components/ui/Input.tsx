import { forwardRef, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full min-h-[44px] px-3 py-2 text-base text-ink bg-surface border border-line-control rounded-control placeholder:text-muted transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 aria-[invalid=true]:border-critical disabled:bg-sunken disabled:opacity-60 disabled:cursor-not-allowed ${className}`.trim()}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
