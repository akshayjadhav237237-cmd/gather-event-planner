import { z } from 'zod';
import {
  CONTEXT_FLAGS,
  CURRENCY_CODES,
  EVENT_SUBFORMATS,
  EVENT_TYPES,
  MAX_BUDGET,
  MAX_GUESTS,
  MAX_NOTES_LENGTH,
  MAX_PRIORITIES,
  MAX_TITLE_LENGTH,
  MIN_GUESTS,
  SEASONS,
  SUB_FORMATS,
  VENUE_SETTINGS,
} from '../config/constants';
import type {
  ActivityIdea,
  BespokeTask,
  CateringIdea,
  EventContext,
  PersonalizedIdeas,
  ThemeConcept,
  VendorQuote,
} from './event';

function isValidCalendarDate(dateStr: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

const EventTypeSchema = z.enum(EVENT_TYPES);
const SubFormatSchema = z.enum(SUB_FORMATS);
const CurrencyCodeSchema = z.enum(CURRENCY_CODES);
const VenueSettingSchema = z.enum(VENUE_SETTINGS);
const SeasonSchema = z.enum(SEASONS);
const ContextFlagSchema = z.enum(CONTEXT_FLAGS);

export const EventContextSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(MAX_TITLE_LENGTH),
    eventType: EventTypeSchema,
    subFormat: SubFormatSchema,
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must match YYYY-MM-DD'),
    currency: CurrencyCodeSchema,
    totalBudget: z.number().int().positive().max(MAX_BUDGET),
    guestCount: z.number().int().min(MIN_GUESTS).max(MAX_GUESTS),
    setting: VenueSettingSchema,
    season: SeasonSchema,
    priorities: z.array(z.string()).max(MAX_PRIORITIES),
    flags: z.array(ContextFlagSchema),
    userNotes: z.string().max(MAX_NOTES_LENGTH),
  })
  .superRefine((data, ctx) => {
    const allowed = EVENT_SUBFORMATS[data.eventType];
    if (!allowed || !allowed.includes(data.subFormat)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `subFormat "${data.subFormat}" is not valid for eventType "${data.eventType}"`,
        path: ['subFormat'],
      });
    }
    if (data.priorities.length > MAX_PRIORITIES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `priorities cannot exceed ${MAX_PRIORITIES} items`,
        path: ['priorities'],
      });
    }
    if (new Set(data.priorities).size !== data.priorities.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'priorities must contain unique items',
        path: ['priorities'],
      });
    }
    if (!isValidCalendarDate(data.eventDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `eventDate "${data.eventDate}" is not a valid calendar date`,
        path: ['eventDate'],
      });
    }
  });

export const VendorQuoteSchema = z
  .object({
    id: z.string().min(1),
    categoryId: z.string().min(1),
    vendorName: z.string().min(1).max(MAX_TITLE_LENGTH),
    baseQuote: z.number().min(0),
    serviceAndTaxPct: z.number().min(0).max(100),
    depositPaid: z.number().min(0),
    contractSigned: z.boolean(),
    insuranceVerified: z.boolean(),
    backupPlan: z.string().max(200),
  })
  .strict();

const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color format');

export const ThemeConceptSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(80),
    summary: z.string().min(1).max(300),
    whyItFits: z.string().min(1).max(300),
    colorPalette: z.tuple([HexColorSchema, HexColorSchema, HexColorSchema]),
  })
  .strict();

export const CateringIdeaSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(80),
    summary: z.string().min(1).max(300),
    whyItFits: z.string().min(1).max(300),
    allergySafetyNote: z.string().max(300),
    budgetSwapIdea: z.string().max(300),
  })
  .strict();

export const ActivityIdeaSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(80),
    summary: z.string().min(1).max(300),
    whyItFits: z.string().min(1).max(300),
    audienceFit: z.string().max(300),
    safetyNote: z.string().max(300),
  })
  .strict();

export const BespokeTaskSchema = z
  .object({
    title: z.string().min(1).max(80),
    phase: z.string().min(1).max(80),
    rationale: z.string().min(1).max(300),
  })
  .strict();

export const PersonalizedIdeasSchema = z
  .object({
    source: z.enum(['local', 'live']),
    themeConcepts: z.array(ThemeConceptSchema).length(3),
    cateringIdeas: z.array(CateringIdeaSchema).length(3),
    activityIdeas: z.array(ActivityIdeaSchema).length(3),
    bespokeTasks: z.array(BespokeTaskSchema).length(4),
    contradictionAdvisory: z.string().max(220).nullable(),
  })
  .strict();

export const IdeasSessionSchema = z
  .object({
    fingerprint: z.string().min(1),
    variant: z.number().int().nonnegative(),
  })
  .strict();

export function safeValidateIdeas(candidate: unknown): PersonalizedIdeas | null {
  const result = PersonalizedIdeasSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

export function safeValidateEventContext(candidate: unknown): EventContext | null {
  const result = EventContextSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

export function safeValidateVendorQuote(candidate: unknown): VendorQuote | null {
  const result = VendorQuoteSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

export function safeValidateIdeasSession(
  candidate: unknown
): { fingerprint: string; variant: number } | null {
  const result = IdeasSessionSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

export type InferredEventContext = z.infer<typeof EventContextSchema>;
export type InferredVendorQuote = z.infer<typeof VendorQuoteSchema>;
export type InferredThemeConcept = z.infer<typeof ThemeConceptSchema>;
export type InferredCateringIdea = z.infer<typeof CateringIdeaSchema>;
export type InferredActivityIdea = z.infer<typeof ActivityIdeaSchema>;
export type InferredBespokeTask = z.infer<typeof BespokeTaskSchema>;
export type InferredPersonalizedIdeas = z.infer<typeof PersonalizedIdeasSchema>;

// Static type assertions ensuring inferred types exactly match canonical interfaces
type ExactMatch<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type _Assert = ExactMatch<InferredEventContext, EventContext> &
  ExactMatch<InferredVendorQuote, VendorQuote> &
  ExactMatch<InferredThemeConcept, ThemeConcept> &
  ExactMatch<InferredCateringIdea, CateringIdea> &
  ExactMatch<InferredActivityIdea, ActivityIdea> &
  ExactMatch<InferredBespokeTask, BespokeTask> &
  ExactMatch<InferredPersonalizedIdeas, PersonalizedIdeas>;
const _assertType: true = true as _Assert;
void _assertType;
