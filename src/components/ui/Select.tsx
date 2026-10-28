import { forwardRef, type SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    const selectClass = [
      'w-full min-h-[44px] px-3 py-2 text-base text-ink bg-surface border border-line-control rounded-control transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 aria-[invalid=true]:border-critical disabled:bg-sunken disabled:opacity-60 disabled:cursor-not-allowed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <select ref={ref} className={selectClass} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
