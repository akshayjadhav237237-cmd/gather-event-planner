import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DisclosureProps {
  id: string;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export function Disclosure({
  id,
  title,
  summary,
  defaultOpen = false,
  className = '',
  children,
}: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const triggerId = `${id}-trigger`;
  const containerClass = ['border border-line rounded-card bg-surface', className]
    .filter(Boolean)
    .join(' ');
  const chevronClass = [
    'shrink-0 text-muted transition-transform duration-150 ease-out',
    isOpen ? 'rotate-180 text-ink' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <button
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between text-left text-ink rounded-card transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 cursor-pointer"
      >
        <span className="flex flex-col pr-4">
          <span className="font-medium text-base">{title}</span>
          {summary && <span className="text-sm text-muted mt-0.5">{summary}</span>}
        </span>
        <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" className={chevronClass} />
      </button>

      {isOpen && (
        <div
          id={id}
          role="region"
          aria-labelledby={triggerId}
          className="px-4 pb-4 pt-1 border-t border-line"
        >
          {children}
        </div>
      )}
    </div>
  );
}
