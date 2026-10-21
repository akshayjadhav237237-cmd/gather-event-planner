import { forwardRef, type TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', rows = 3, ...props }, ref) => {
    const textareaClass = [
      'w-full min-h-[44px] px-3 py-2 text-base text-ink bg-surface border border-line-control rounded-control placeholder:text-muted transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 aria-[invalid=true]:border-critical disabled:bg-sunken disabled:opacity-60 disabled:cursor-not-allowed',
      className,
    ].filter(Boolean).join(' ');

    return (
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClass}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
