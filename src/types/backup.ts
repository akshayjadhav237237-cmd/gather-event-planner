import type { EventContext, PersonalizedIdeas, VendorQuote } from './event';

export interface BackupPayload {
  context: EventContext;
  taskCompletion: Record<string, boolean>;
  actualSpend: Record<string, number>;
  vendorQuotes: VendorQuote[];
  ideas: PersonalizedIdeas | null;
}
