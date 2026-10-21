import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className = '',
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleClick = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInside =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInside) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  const dialogClass = [
    'backdrop:bg-ink/40 bg-surface text-ink rounded-card p-6 max-w-lg w-full border border-line shadow-[0_24px_64px_-24px_rgba(28,25,23,0.25)] animate-rise m-auto focus-visible:outline-none',
    className,
  ].filter(Boolean).join(' ');

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-desc' : undefined}
      className={dialogClass}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <h2
            id="dialog-title"
            className="font-serif text-2xl text-ink font-normal"
          >
            {title}
          </h2>
          {description && (
            <p id="dialog-desc" className="text-sm text-muted mt-1">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center rounded-control text-muted hover:text-ink hover:bg-sunken transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 cursor-pointer"
        >
          <X size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="text-base text-ink">{children}</div>

      {footer && (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </dialog>
  );
}
