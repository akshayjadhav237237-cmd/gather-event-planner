export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface SegmentedControlProps<T extends string> {
  name: string;
  legend: string;
  hideLegend?: boolean;
  value: T;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  name,
  legend,
  hideLegend = false,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <fieldset
      disabled={disabled}
      className={`border-0 p-0 m-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`.trim()}
    >
      <legend
        className={
          hideLegend ? 'sr-only' : 'text-sm font-medium text-ink mb-2'
        }
      >
        {legend}
      </legend>

      <div className="inline-flex flex-wrap p-1 gap-1 bg-sunken rounded-control border border-line">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const inputId = `${name}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={`relative cursor-pointer select-none ${
                disabled ? 'cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only peer"
              />
              <span className="min-h-[44px] px-3.5 py-2 inline-flex flex-col items-center justify-center text-sm rounded-control transition-colors duration-150 ease-out border border-transparent text-muted hover:text-ink peer-checked:bg-surface peer-checked:text-ink peer-checked:border-line-control peer-checked:font-medium peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2">
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="text-xs text-muted mt-0.5">
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
