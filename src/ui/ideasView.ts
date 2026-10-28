import type { AiFallbackReason, AiMode, IdeaSection } from '../ai/aiTypes';
import type { ContextSignals } from '../types/engine';
import type { EventContext } from '../types/event';

export const SECTION_LABELS: Record<IdeaSection, string> = {
  themeConcepts: 'Themes',
  cateringIdeas: 'Food & Drink',
  activityIdeas: 'Activities',
  bespokeTasks: 'Bespoke Checklist',
};

export function ideasFingerprint(context: EventContext, signals: ContextSignals): string {
  return [
    context.eventType,
    context.subFormat,
    context.setting,
    context.season,
    [...context.flags].sort().join(','),
    signals.budgetTier,
    signals.isShortNotice,
    context.userNotes.trim(),
  ].join('::');
}

export type IdeasActionDecision =
  'generate' | 'regenerate_local' | 'mark_stale' | 'record_baseline' | 'none';

export interface DecideIdeasActionInput {
  hasIdeas: boolean;
  knownFingerprint: string | null;
  currentFingerprint: string;
  hasLiveKey: boolean;
}

export function decideIdeasAction(input: DecideIdeasActionInput): IdeasActionDecision {
  if (!input.hasIdeas) return 'generate';
  if (input.knownFingerprint === null) return 'record_baseline';
  if (input.knownFingerprint === input.currentFingerprint) return 'none';
  if (!input.hasLiveKey) return 'regenerate_local';
  return 'mark_stale';
}

export interface IdeasResultDescription {
  label: string;
  tone: 'neutral' | 'accent' | 'warning';
  detail: string;
}

export function describeResult(
  source: 'local' | 'live',
  mode: AiMode | null,
  reason: AiFallbackReason | null
): IdeasResultDescription {
  if (mode === 'live' || (source === 'live' && mode !== 'fallback')) {
    return {
      label: 'Live ideas',
      tone: 'accent',
      detail: 'Personalized concepts generated live via Gemini model.',
    };
  }

  if (mode === 'fallback') {
    let detail = 'Operating on offline ideas as fallback.';
    if (reason === 'rate_limited') {
      detail = 'Operating on offline ideas due to temporary request cooldown.';
    } else if (reason === 'timeout') {
      detail = 'Operating on offline ideas due to connection timeout.';
    } else if (reason === 'invalid_response') {
      detail = 'Operating on offline ideas after validating format bounds.';
    }

    return {
      label: 'Offline fallback',
      tone: 'warning',
      detail,
    };
  }

  return {
    label: 'Offline ideas',
    tone: 'neutral',
    detail: 'Curated creative concepts tailored by deterministic heuristic banks.',
  };
}
