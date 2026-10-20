import { type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldAria {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
}

export interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: (aria: FormFieldAria) => ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  className = '',
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const isInvalid = error ? true : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': isInvalid,
      })}

      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-critical inline-flex items-center gap-1.5"
        >
          <AlertCircle size={18} strokeWidth={1.5} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
