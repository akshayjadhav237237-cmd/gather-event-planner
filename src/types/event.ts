export type EventType = 'wedding' | 'birthday' | 'community';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';
export type VenueSetting = 'indoor' | 'outdoor' | 'hybrid';
export type Season = 'summer' | 'monsoon' | 'winter' | 'mild';
export type SubFormat =
  | 'western'
  | 'indian_multiday'
  | 'interfaith'
  | 'destination'
  | 'micro_wedding'
  | 'kids_1_3'
  | 'kids_4_12'
  | 'teen'
  | 'adult_milestone'
  | 'surprise'
  | 'festival'
  | 'fundraiser'
  | 'neighborhood'
  | 'school_cultural';
export type ContextFlag =
  | 'multi_ceremony'
  | 'nut_allergy'
  | 'latex_allergy'
  | 'gluten_free'
  | 'vegan'
  | 'vegetarian'
  | 'jain'
  | 'halal'
  | 'wheelchair_access'
  | 'elderly_guests'
  | 'sensory_friendly'
  | 'sponsorship_needed'
  | 'amplified_music'
  | 'open_bar'
  | 'residential_venue';
export type Severity = 'info' | 'warning' | 'critical';
export type TargetModule = 'budget' | 'timeline' | 'vendor' | 'safety' | 'ideas';

export interface EventContext {
  id: string;
  title: string; // 1..80 chars
  eventType: EventType;
  subFormat: SubFormat; // must be valid for eventType (see EVENT_SUBFORMATS)
  eventDate: string; // ISO 'YYYY-MM-DD'
  currency: CurrencyCode;
  totalBudget: number; // whole major currency units, > 0
  guestCount: number; // integer 1..10000
  setting: VenueSetting;
  season: Season;
  priorities: string[]; // BudgetCategory ids, max 3
  flags: ContextFlag[];
  userNotes: string; // max 300 chars, plain text
}

export interface FeasibilityAlert {
  code:
    | 'UNREALISTIC_PER_HEAD'
    | 'OVER_CAP'
    | 'MICRO_EVENT_FIXED_COSTS'
    | 'HIDDEN_COST_EXPOSURE'
    | 'DATE_IN_PAST';
  severity: Severity;
  message: string;
  remedies: string[];
}

export interface BudgetCategoryRow {
  id: string;
  name: string;
  baselinePct: number; // before priority rebalancing
  allocatedPct: number;
  allocatedAmount: number; // integer, major units
  isPriority: boolean;
  isFixedCost: boolean;
  costSavingSwap: string | null;
}

export interface BudgetBreakdown {
  currency: CurrencyCode;
  totalBudget: number;
  contingencyPct: number; // 0.05..0.15 as a fraction
  contingencyAmount: number; // integer
  allocatableBudget: number; // totalBudget - contingencyAmount
  perGuestAllocatable: number;
  allInExposureNote: string; // text about service charge/tax buffer; no fake precision
  categories: BudgetCategoryRow[];
  alerts: FeasibilityAlert[];
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TimelineTask {
  id: string;
  title: string;
  phase: string; // e.g. 'Foundations', 'Booking', 'Details', 'Final Week', 'Event Day'
  dueDate: string; // ISO
  priority: TaskPriority;
  dependsOn: string[]; // task ids
  optional: boolean;
  skippedInCompression: boolean;
  rationale: string; // one line: why this task exists / why this date
}

export interface RunOfShowSlot {
  startTime: string; // 'HH:MM' 24h
  durationMin: number;
  activity: string;
  owner: string; // a ROLE, never a person's name
  bufferMin: number;
}

export interface TimelinePlan {
  daysAvailable: number;
  isCompressed: boolean;
  tasks: TimelineTask[];
  runOfShow: RunOfShowSlot[];
}

export interface VendorCategoryGuide {
  id: string;
  name: string;
  scope: string;
  questions: string[];
  requiredChecks: string[];
  contractWatchouts: string[];
}

export interface VendorQuote {
  // USER-ENTERED ONLY. The app never invents vendors.
  id: string;
  categoryId: string;
  vendorName: string; // user text, max 80
  baseQuote: number;
  serviceAndTaxPct: number; // 0..100
  depositPaid: number;
  contractSigned: boolean;
  insuranceVerified: boolean;
  backupPlan: string; // max 200
}

export interface ContextAdaptation {
  id: string;
  ruleId: string;
  triggerSignal: string;
  severity: Severity;
  explanation: string;
  targetModule: TargetModule;
}

export interface IdeaCard {
  id: string;
  title: string;
  summary: string;
  whyItFits: string;
}

export interface ThemeConcept extends IdeaCard {
  colorPalette: [string, string, string];
}

export interface CateringIdea extends IdeaCard {
  allergySafetyNote: string;
  budgetSwapIdea: string;
}

export interface ActivityIdea extends IdeaCard {
  audienceFit: string;
  safetyNote: string;
}

export interface BespokeTask {
  title: string;
  phase: string;
  rationale: string;
}

export interface PersonalizedIdeas {
  source: 'local' | 'live';
  themeConcepts: ThemeConcept[]; // exactly 3
  cateringIdeas: CateringIdea[]; // exactly 3
  activityIdeas: ActivityIdea[]; // exactly 3
  bespokeTasks: BespokeTask[]; // exactly 4
  contradictionAdvisory: string | null; // max 220 chars
}
