import { useState } from 'react';
import { Calendar, Sparkles, Users, Wallet } from 'lucide-react';
import { useFocusOnMount } from '../../hooks/useFocusOnMount';
import { usePlan } from '../../hooks/usePlan';
import { usePlanStore } from '../../store/planStore';
import type { PlanBundle } from '../../types/engine';
import { draftFromContext } from '../../ui/formModel';
import { EVENT_TYPE_LABELS, SUBFORMAT_LABELS } from '../../ui/labels';
import { AdaptationBanner } from '../adaptations/AdaptationBanner';
import { ContextForm } from '../context/ContextForm';
import { BudgetPanel } from '../panels/BudgetPanel';
import { IdeasPanel } from '../panels/IdeasPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { VendorsPanel } from '../panels/VendorsPanel';
import { PrintBrief } from '../print';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tabs, type TabItem } from '../ui/Tabs';
import { VitalsStrip } from './VitalsStrip';

export interface WorkspaceProps {
  bundle?: PlanBundle | null;
  hasLiveKey?: boolean;
  onOpenAiSettings?: () => void;
}

export function Workspace({
  bundle: propBundle,
  hasLiveKey = false,
  onOpenAiSettings = () => {},
}: WorkspaceProps = {}) {
  const { bundle: hookBundle, today } = usePlan();
  const bundle = propBundle !== undefined ? propBundle : hookBundle;

  const taskCompletion = usePlanStore((s) => s.taskCompletion);
  const actualSpend = usePlanStore((s) => s.actualSpend);
  const vendorQuotes = usePlanStore((s) => s.vendorQuotes);
  const ideas = usePlanStore((s) => s.ideas);
  const setContext = usePlanStore((s) => s.setContext);
  const clearAll = usePlanStore((s) => s.clearAll);

  const [activeTab, setActiveTab] = useState('budget');
  const h1Ref = useFocusOnMount<HTMLHeadingElement>(bundle?.context.id);

  if (!bundle) {
    return (
      <Card padding="lg" className="text-center space-y-4">
        <h1 className="font-serif text-3xl text-ink font-normal">
          Unable to load event plan
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          The saved event data appears to be incomplete or could not be processed.
          You can clear the saved data and start again.
        </p>
        <div>
          <Button variant="primary" onClick={clearAll}>
            Clear saved data and start again
          </Button>
        </div>
      </Card>
    );
  }

  const tabs: ReadonlyArray<TabItem> = [
    {
      id: 'budget',
      label: 'Budget',
      icon: <Wallet className="w-4 h-4" aria-hidden="true" />,
      panel: <BudgetPanel bundle={bundle} today={today} />,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
      panel: <TimelinePanel bundle={bundle} today={today} />,
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: <Users className="w-4 h-4" aria-hidden="true" />,
      panel: <VendorsPanel bundle={bundle} today={today} />,
    },
    {
      id: 'ideas',
      label: 'Ideas',
      icon: <Sparkles className="w-4 h-4" aria-hidden="true" />,
      panel: (
        <IdeasPanel
          bundle={bundle}
          today={today}
          hasLiveKey={hasLiveKey}
          onOpenAiSettings={onOpenAiSettings}
        />
      ),
    },
  ];

  const typeLabel = EVENT_TYPE_LABELS[bundle.context.eventType] ?? bundle.context.eventType;
  const formatLabel = SUBFORMAT_LABELS[bundle.context.subFormat] ?? bundle.context.subFormat;

  return (
    <div className="space-y-8 animate-rise">
      <header className="space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{typeLabel}</Badge>
          <Badge tone="neutral">{formatLabel}</Badge>
        </div>
        <h1
          ref={h1Ref}
          tabIndex={-1}
          className="font-serif text-3xl sm:text-4xl text-ink font-normal focus-visible:outline-none"
        >
          {bundle.context.title}
        </h1>
      </header>

      <div className="print:hidden">
        <ContextForm
          key={bundle.context.id}
          mode="edit"
          initialDraft={draftFromContext(bundle.context)}
          existingId={bundle.context.id}
          onSubmit={setContext}
        />
      </div>

      <div className="print:hidden">
        <VitalsStrip bundle={bundle} taskCompletion={taskCompletion} />
      </div>

      <div className="print:hidden">
        <AdaptationBanner adaptations={bundle.decision.adaptations} />
      </div>

      <div className="print:hidden">
        <Tabs
          label="Event plan views"
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <PrintBrief
        bundle={bundle}
        taskCompletion={taskCompletion}
        actualSpend={actualSpend}
        vendorQuotes={vendorQuotes}
        ideas={ideas}
        today={today}
      />
    </div>
  );
}
