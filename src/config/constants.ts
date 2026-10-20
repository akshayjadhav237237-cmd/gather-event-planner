import type { CurrencyCode, EventType, SubFormat } from '../types/event';

// Threshold in available days below which a project timeline is treated as compressed.
export const COMPRESSED_THRESHOLD_DAYS = 21;

// Minimum contingency reserve fraction (5% of total budget).
export const CONTINGENCY_MIN = 0.05;

// Maximum contingency reserve fraction (15% of total budget).
export const CONTINGENCY_MAX = 0.15;

// Maximum number of prioritized budget categories permitted per event.
export const MAX_PRIORITIES = 3;

// Maximum allowed character length for freeform user notes.
export const MAX_NOTES_LENGTH = 300;

// Maximum allowed character length for event titles.
export const MAX_TITLE_LENGTH = 80;

// Lower bound for guest count validation.
export const MIN_GUESTS = 1;

// Upper bound for guest count validation.
export const MAX_GUESTS = 10000;

// Upper bound for total event budget in major currency units.
export const MAX_BUDGET = 10_000_000_000;

// Maximum waiting duration in milliseconds before timing out live AI inference.
export const AI_TIMEOUT_MS = 8000;

// Enforced cooldown period in milliseconds between consecutive AI requests.
export const AI_COOLDOWN_MS = 2000;

// Debounce delay in milliseconds before persisting application state to storage.
export const AUTOSAVE_DEBOUNCE_MS = 300;

// LocalStorage key namespace for persisting event planner application state.
export const STORAGE_KEY = 'event-planner:v1';

// SessionStorage key dedicated to storing user-provided Gemini API keys.
export const API_KEY_SESSION_KEY = 'event-planner:api-key';

// Mapping of primary event categories to their permitted sub-formats.
export const EVENT_SUBFORMATS: Record<EventType, readonly SubFormat[]> = {
  wedding: ['western', 'indian_multiday', 'interfaith', 'destination', 'micro_wedding'],
  birthday: ['kids_1_3', 'kids_4_12', 'teen', 'adult_milestone', 'surprise'],
  community: ['festival', 'fundraiser', 'neighborhood', 'school_cultural'],
};

// Formatting locales matched to supported currency codes for Intl display.
export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

// Gemini model configuration; edit the live model ID string exclusively here when upgrading.
export const LIVE_MODEL_CONFIG = {
  modelId: 'gemini-2.5-flash',
  endpointBase: 'https://generativelanguage.googleapis.com/v1beta',
} as const;

// All supported primary event types as a constant tuple.
export const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;

// All supported currency codes as a constant tuple.
export const CURRENCY_CODES = ['INR', 'USD', 'EUR', 'GBP'] as const;

// All supported venue setting types as a constant tuple.
export const VENUE_SETTINGS = ['indoor', 'outdoor', 'hybrid'] as const;

// All supported seasons as a constant tuple.
export const SEASONS = ['summer', 'monsoon', 'winter', 'mild'] as const;

// All supported subformats across all event types as a constant tuple.
export const SUB_FORMATS = [
  'western',
  'indian_multiday',
  'interfaith',
  'destination',
  'micro_wedding',
  'kids_1_3',
  'kids_4_12',
  'teen',
  'adult_milestone',
  'surprise',
  'festival',
  'fundraiser',
  'neighborhood',
  'school_cultural',
] as const;

// All supported contextual constraint flags as a constant tuple.
export const CONTEXT_FLAGS = [
  'multi_ceremony',
  'nut_allergy',
  'latex_allergy',
  'gluten_free',
  'vegan',
  'vegetarian',
  'jain',
  'halal',
  'wheelchair_access',
  'elderly_guests',
  'sensory_friendly',
  'sponsorship_needed',
  'amplified_music',
  'open_bar',
  'residential_venue',
] as const;
