import type { ContextFlag, Season, SubFormat, VenueSetting } from '../types/event';
import type { BudgetTier } from '../types/engine';

export interface SeedTags {
  subFormats?: SubFormat[];
  settings?: VenueSetting[];
  seasons?: Season[];
  requiresFlags?: ContextFlag[];
  excludesFlags?: ContextFlag[];
  budgetTiers?: BudgetTier[];
}

export interface ThemeSeed {
  id: string;
  title: string;
  summary: string;
  why: string;
  colorPalette: [string, string, string];
  keywords?: string[];
  tags?: SeedTags;
}

export interface CateringSeed {
  id: string;
  title: string;
  summary: string;
  why: string;
  allergySafetyNote: string;
  budgetSwapIdea: string;
  keywords?: string[];
  tags?: SeedTags;
}

export interface ActivitySeed {
  id: string;
  title: string;
  summary: string;
  why: string;
  audienceFit: string;
  safetyNote: string;
  keywords?: string[];
  tags?: SeedTags;
}

export interface BespokeSeed {
  id: string;
  title: string;
  phase: string;
  rationale: string;
  keywords?: string[];
  tags?: SeedTags;
}

export interface IdeaBank {
  themes: ThemeSeed[];
  catering: CateringSeed[];
  activities: ActivitySeed[];
  bespoke: BespokeSeed[];
}
