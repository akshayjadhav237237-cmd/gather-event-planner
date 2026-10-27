import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { hasApiKey } from '../../ai/apiKeyStorage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface HeaderProps {
  isWorkspace?: boolean;
  onOpenApiKey?: () => void;
  onOpenReset?: () => void;
  onOpenExport?: () => void;
  apiKeyVersion?: number;
}

export function Header({
  isWorkspace = false,
  onOpenApiKey,
  onOpenReset,
  onOpenExport,
  apiKeyVersion = 0,
}: HeaderProps) {
  const [hasKey, setHasKey] = useState(() => hasApiKey());

  useEffect(() => {
    setHasKey(hasApiKey());
  }, [apiKeyVersion]);

  return (
    <header className="border-b border-line bg-surface print:hidden">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div className="flex flex-col shrink-0">
          <span className="hidden sm:inline text-xs uppercase tracking-widest text-muted font-semibold leading-tight">
            Celebration & Event Planner
          </span>
          <span className="font-serif text-2xl tracking-tight text-ink leading-none">
            Gather
          </span>
        </div>

        {isWorkspace && (
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Badge
              tone={hasKey ? 'accent' : 'neutral'}
              aria-label={hasKey ? 'Live ideas ready' : 'Offline ideas'}
              className="px-2 sm:px-2.5"
            >
              <span
                className={`w-2 h-2 rounded-full ${hasKey ? 'bg-accent' : 'bg-muted'}`}
                aria-hidden="true"
              />
              <span className="inline md:hidden text-[11px] font-medium">
                {hasKey ? 'Live' : 'Offline'}
              </span>
              <span className="hidden md:inline">
                {hasKey ? 'Live ideas ready' : 'Offline ideas'}
              </span>
            </Badge>

            {onOpenExport && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Download className="w-4 h-4" aria-hidden="true" />}
                onClick={onOpenExport}
                aria-label="Export"
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                Export
              </Button>
            )}

            {onOpenApiKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenApiKey}
                aria-label="AI settings"
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                AI settings
              </Button>
            )}

            {onOpenReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenReset}
                aria-label="Start over"
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                Start over
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
