import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import { useIdeas } from '../../hooks/useIdeas';
import { ActivitySection, BespokeSection, CateringSection, ThemeSection } from '../ideas';
import { AlertCard } from '../shared/AlertCard';
import { SectionHeader } from '../shared/SectionHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { IdeasPanelProps } from './types';

export const IdeasPanel: FC<IdeasPanelProps> = ({ bundle, hasLiveKey, onOpenAiSettings }) => {
  const { ideas, status, info, notesDropped, isStale, refreshAll, regenerate } = useIdeas(
    bundle,
    hasLiveKey
  );

  const isLoading = status === 'loading';

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ideas"
        title="Ideas shaped around your event"
        description="Creative themes, catering concepts, activities, and bespoke checklist items personalized to your context."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-line rounded-card">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={info.tone}>{info.label}</Badge>
          <span className="text-xs sm:text-sm text-ink-soft">{info.detail}</span>
        </div>
        {!hasLiveKey ? (
          <Button variant="ghost" size="sm" onClick={onOpenAiSettings}>
            Add a key for live ideas
          </Button>
        ) : null}
      </div>

      {isStale ? (
        <AlertCard
          tone="info"
          title="Your details have changed since these ideas were made"
          actions={
            <Button variant="secondary" size="sm" onClick={refreshAll} disabled={isLoading}>
              Refresh ideas
            </Button>
          }
        >
          Your event details were updated. You can refresh ideas now to incorporate the latest
          changes.
        </AlertCard>
      ) : null}

      {notesDropped ? (
        <AlertCard
          tone="info"
          title="Part of your notes looked like instructions to an AI, so it was not used."
        />
      ) : null}

      {ideas?.contradictionAdvisory ? (
        <AlertCard tone="warning" title="A note about your request">
          {ideas.contradictionAdvisory}
        </AlertCard>
      ) : null}

      {isLoading && !ideas ? (
        <div role="status" className="space-y-4">
          <div className="text-sm font-medium text-ink-soft">Preparing your ideas</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 rounded-card bg-sunken animate-pulse border border-line" />
            <div className="h-48 rounded-card bg-sunken animate-pulse border border-line" />
            <div className="h-48 rounded-card bg-sunken animate-pulse border border-line" />
          </div>
        </div>
      ) : null}

      {ideas ? (
        <>
          <ThemeSection
            themes={ideas.themeConcepts}
            onRegenerate={() => void regenerate('themeConcepts')}
            isLoading={isLoading}
          />
          <CateringSection
            catering={ideas.cateringIdeas}
            onRegenerate={() => void regenerate('cateringIdeas')}
            isLoading={isLoading}
          />
          <ActivitySection
            activities={ideas.activityIdeas}
            onRegenerate={() => void regenerate('activityIdeas')}
            isLoading={isLoading}
          />
          <BespokeSection
            tasks={ideas.bespokeTasks}
            onRegenerate={() => void regenerate('bespokeTasks')}
            isLoading={isLoading}
          />
          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              onClick={refreshAll}
              disabled={isLoading}
              icon={
                <RefreshCw
                  size={16}
                  className={isLoading ? 'animate-spin' : ''}
                  aria-hidden="true"
                />
              }
            >
              Refresh all ideas
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};
