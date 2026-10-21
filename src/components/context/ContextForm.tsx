import { type FormEvent } from 'react';
import { useContextDraft } from '../../hooks/useContextDraft';
import type { EventContext } from '../../types/event';
import type { FormDraft } from '../../ui/formModel';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Disclosure } from '../ui/Disclosure';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { DetailsFields } from './DetailsFields';
import { EssentialsFields } from './EssentialsFields';
import { FlagGroups } from './FlagGroups';
import { PriorityPicker } from './PriorityPicker';

export interface ContextFormProps {
  initialDraft: FormDraft;
  mode: 'create' | 'edit';
  existingId?: string;
  onSubmit?: (ctx: EventContext) => void;
  onBack?: () => void;
  className?: string;
}

export function ContextForm({
  initialDraft,
  mode,
  existingId,
  onSubmit,
  onBack,
  className = '',
}: ContextFormProps) {
  const {
    draft,
    errors,
    updateField,
    togglePriority,
    toggleFlag,
    submit,
  } = useContextDraft({
    initialDraft,
    mode,
    existingId,
    onApply: onSubmit,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const errorCount = Object.keys(errors).length;
  const errorSummary =
    errorCount > 0
      ? `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please correct them.`
      : '';

  const formClass = ['flex flex-col gap-6', className].filter(Boolean).join(' ');

  if (mode === 'edit') {
    return (
      <form onSubmit={handleSubmit} className={formClass} noValidate>
        <VisuallyHidden role="status" aria-live="polite">
          {errorSummary}
        </VisuallyHidden>

        <EssentialsFields
          draft={draft}
          errors={errors}
          onChange={updateField}
          idPrefix="edit-context"
        />

        <Disclosure id="context-more-details" title="More details & options">
          <div className="flex flex-col gap-6 pt-4">
            <PriorityPicker
              eventType={draft.eventType}
              priorities={draft.priorities}
              onToggle={togglePriority}
              idPrefix="edit-priority"
            />

            <FlagGroups
              eventType={draft.eventType}
              flags={draft.flags}
              onToggle={toggleFlag}
              idPrefix="edit-flag"
            />

            <DetailsFields
              draft={draft}
              errors={errors}
              onChange={updateField}
              idPrefix="edit-details"
            />
          </div>
        </Disclosure>

        <p role="status" className="text-xs text-muted">
          All changes are saved on this device.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={formClass} noValidate>
      <VisuallyHidden role="status" aria-live="polite">
        {errorSummary}
      </VisuallyHidden>

      <Card as="section">
        <h2 className="text-xl font-medium text-ink mb-1">
          The basics
        </h2>
        <p className="text-xs text-muted mb-5">
          Core parameters that drive realistic vendor pricing and timeline horizons.
        </p>
        <EssentialsFields
          draft={draft}
          errors={errors}
          onChange={updateField}
          idPrefix="create-context"
        />
      </Card>

      <Card as="section">
        <h2 className="text-xl font-medium text-ink mb-1">
          Make it yours, optional
        </h2>
        <p className="text-xs text-muted mb-5">
          Tune your focus areas, dietary requirements, and logistical adaptations.
        </p>
        <div className="flex flex-col gap-6">
          <PriorityPicker
            eventType={draft.eventType}
            priorities={draft.priorities}
            onToggle={togglePriority}
            idPrefix="create-priority"
          />

          <FlagGroups
            eventType={draft.eventType}
            flags={draft.flags}
            onToggle={toggleFlag}
            idPrefix="create-flag"
          />

          <DetailsFields
            draft={draft}
            errors={errors}
            onChange={updateField}
            idPrefix="create-details"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4 pt-2">
        {onBack ? (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}

        <Button type="submit" variant="primary">
          Create my plan
        </Button>
      </div>
    </form>
  );
}
