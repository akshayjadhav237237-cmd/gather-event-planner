import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { hasApiKey } from '../../ai';
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-muted font-semibold leading-tight">
            Celebration & Event Planner
          </span>
          <span className="font-serif text-2xl tracking-tight text-ink leading-none">
            Gather
          </span>
        </div>

        {isWorkspace && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge tone={hasKey ? 'accent' : 'neutral'}>
              {hasKey ? 'Live ideas ready' : 'Offline ideas'}
            </Badge>

            {onOpenExport && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Download className="w-4 h-4" aria-hidden="true" />}
                onClick={onOpenExport}
                aria-label="Export"
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
