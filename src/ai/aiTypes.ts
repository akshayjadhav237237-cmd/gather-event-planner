import type { EventContext, PersonalizedIdeas } from '../types/event';
import type { ContextSignals, DecisionResult } from '../types/engine';

export type IdeaSection = 'themeConcepts' | 'cateringIdeas' | 'activityIdeas' | 'bespokeTasks';

export interface AiPlanInput {
  context: EventContext;
  signals: ContextSignals;
  decision: DecisionResult;
}

export type AiMode = 'local' | 'live' | 'fallback';

export type AiFallbackReason =
  | 'no_key'
  | 'timeout'
  | 'network'
  | 'http_error'
  | 'rate_limited'
  | 'invalid_response'
  | 'crypto_unavailable';

export interface AiResult {
  ideas: PersonalizedIdeas;
  mode: AiMode;
  reason: AiFallbackReason | null;
  notesDropped: boolean;
  fromCache: boolean;
}

export interface LlmRequestOptions {
  apiKey: string;
  signal: AbortSignal;
  fetchImpl: typeof fetch;
}

export interface LlmClient {
  generate(system: string, user: string, opts: LlmRequestOptions): Promise<string>;
}
