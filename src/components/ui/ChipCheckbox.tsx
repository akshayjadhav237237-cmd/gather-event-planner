import { Check } from 'lucide-react';

export interface ChipCheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function ChipCheckbox({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
  className = '',
}: ChipCheckboxProps) {
  return (
    <div className={`inline-flex ${className}`.trim()}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <label
        htmlFor={id}
        className={`min-h-[44px] inline-flex items-center gap-2.5 px-3.5 py-2 rounded-control border text-sm select-none transition-colors duration-150 ease-out peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2 ${
          checked
            ? 'bg-accent-soft border-accent text-ink font-medium'
            : 'bg-surface border-line-control text-ink hover:bg-sunken'
        } ${
          disabled
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : 'cursor-pointer'
        }`}
      >
        <span
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
            checked
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-line-control bg-surface'
          }`}
        >
          {checked && (
            <Check
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="text-accent-ink"
            />
          )}
        </span>
        <span className="flex flex-col">
          <span>{label}</span>
          {description && (
            <span className="text-xs text-muted font-normal">
              {description}
            </span>
          )}
        </span>
      </label>
    </div>
  );
}
