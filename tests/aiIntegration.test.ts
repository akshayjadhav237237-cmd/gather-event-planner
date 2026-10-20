import { describe, expect, it } from 'vitest';
import { generateIdeas } from '../src/ai';
import type { LlmClient } from '../src/ai/aiTypes';
import { createResponseCache } from '../src/ai/responseCache';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { buildPlan } from '../src/domain/buildPlan';
import { PersonalizedIdeasSchema } from '../src/types/schemas';

const VALID_LIVE_JSON = JSON.stringify({
  themeConcepts: [
    {
      id: 'live-theme-1',
      title: 'Starlight Gala',
      summary: 'An elegant evening celebration with ambient lighting.',
      whyItFits: 'Matches evening setting and guest count.',
      colorPalette: ['#1A2B3C', '#D4AF37', '#FFFFFF'],
    },
    {
      id: 'live-theme-2',
      title: 'Garden Bloom',
      summary: 'Lush botanical elements and floral arrangements.',
      whyItFits: 'Complements the outdoor venue.',
      colorPalette: ['#2D5A27', '#E8F5E9', '#F8BBD0'],
    },
    {
      id: 'live-theme-3',
      title: 'Modern Minimalist',
      summary: 'Clean lines with contemporary monochrome styling.',
      whyItFits: 'Keeps overhead low while maintaining sophistication.',
      colorPalette: ['#000000', '#757575', '#EEEEEE'],
    },
  ],
  cateringIdeas: [
    {
      id: 'live-cat-1',
      title: 'Artisan Grazing Table',
      summary: 'Curated selection of local cheeses and produce.',
      whyItFits: 'Encourages guest mingling during reception.',
      allergySafetyNote: 'All gluten items isolated on dedicated board.',
      budgetSwapIdea: 'Substitute imported cheese with local selections.',
    },
    {
      id: 'live-cat-2',
      title: 'Interactive Live Stations',
      summary: 'Chef-manned stations for freshly plated appetizers.',
      whyItFits: 'Adds dynamic entertainment value to meal service.',
      allergySafetyNote: 'Dedicated vegetarian skillet maintained at all times.',
      budgetSwapIdea: 'Limit live stations to cocktail hour only.',
    },
    {
      id: 'live-cat-3',
      title: 'Family-Style Platters',
      summary: 'Generous shared plates served directly to tables.',
      whyItFits: 'Warm communal atmosphere for celebration.',
      allergySafetyNote: 'Individual pre-plated servings for dietary requests.',
      budgetSwapIdea: 'Choose seasonal vegetables and grain sides.',
    },
  ],
  activityIdeas: [
    {
      id: 'live-act-1',
      title: 'Acoustic Welcome Duo',
      summary: 'Live background acoustic guitar and vocals.',
      whyItFits: 'Creates inviting entrance atmosphere.',
      audienceFit: 'Appeals to all age groups.',
      safetyNote: 'Cables taped down and sound levels monitored.',
    },
    {
      id: 'live-act-2',
      title: 'Commemorative Photo Moment',
      summary: 'Stylized backdrop with instant photo prints.',
      whyItFits: 'Provides lasting guest keepsake.',
      audienceFit: 'Popular across all demographics.',
      safetyNote: 'Maintain clear walkway around photo area.',
    },
    {
      id: 'live-act-3',
      title: 'Evening Lantern Moment',
      summary: 'Battery-operated LED lantern pathway illumination.',
      whyItFits: 'Magical visual transition to evening program.',
      audienceFit: 'Engages all generations safely.',
      safetyNote: 'Flame-free LED units only for safety.',
    },
  ],
  bespokeTasks: [
    {
      title: 'Confirm sound ordinance compliance',
      phase: 'Booking',
      rationale: 'Ensures compliance with local noise limits.',
    },
    {
      title: 'Review allergen matrix with culinary team',
      phase: 'Details',
      rationale: 'Protects guests with declared dietary requirements.',
    },
    {
      title: 'Conduct walk-through of arrival staging area',
      phase: 'Final Week',
      rationale: 'Ensures smooth guest flow and wheelchair accessibility.',
    },
    {
      title: 'Final check of backup power and weather cover',
      phase: 'Event Day',
      rationale: 'Mitigates disruption from adverse weather or power issues.',
    },
  ],
  contradictionAdvisory: null,
});

describe('AI Layer Integration with buildPlan across all Demo Scenarios', () => {
  const referenceDate = '2026-06-01';
  const scenarios = getDemoScenarios(referenceDate);

  it('runs local offline generation when no API key is provided', async () => {
    let mockClock = 100_000;
    for (const sc of scenarios) {
      const plan = buildPlan(sc.context, referenceDate);
      const result = await generateIdeas(plan, {
        apiKey: null,
        notes: sc.context.userNotes,
        now: () => (mockClock += 5000),
        cache: createResponseCache(5),
      });

      expect(result.mode).toBe('local');
      expect(result.reason).toBeNull();
      expect(result.ideas.source).toBe('local');

      const parsed = PersonalizedIdeasSchema.safeParse(result.ideas);
      expect(parsed.success).toBe(true);
      expect(result.ideas.themeConcepts).toHaveLength(3);
      expect(result.ideas.cateringIdeas).toHaveLength(3);
      expect(result.ideas.activityIdeas).toHaveLength(3);
      expect(result.ideas.bespokeTasks).toHaveLength(4);
    }
  });

  it('returns live results when a key and functional client are supplied', async () => {
    const fakeClient: LlmClient = {
      generate: async () => VALID_LIVE_JSON,
    };

    let mockClock = 200_000;
    for (const sc of scenarios) {
      const plan = buildPlan(sc.context, referenceDate);
      const result = await generateIdeas(plan, {
        apiKey: 'mock-valid-api-key-test-value-12345',
        client: fakeClient,
        notes: sc.context.userNotes,
        now: () => (mockClock += 5000),
        cache: createResponseCache(5),
      });

      expect(result.mode).toBe('live');
      expect(result.reason).toBeNull();
      expect(result.ideas.source).toBe('live');

      const parsed = PersonalizedIdeasSchema.safeParse(result.ideas);
      expect(parsed.success).toBe(true);
      expect(result.ideas.themeConcepts[0]?.title).toBe('Starlight Gala');
    }
  });

  it('gracefully degrades to fallback when client returns invalid JSON', async () => {
    const garbageClient: LlmClient = {
      generate: async () => 'Sorry, I am an AI and cannot complete this: {not-json}',
    };

    let mockClock = 300_000;
    for (const sc of scenarios) {
      const plan = buildPlan(sc.context, referenceDate);
      const result = await generateIdeas(plan, {
        apiKey: 'mock-valid-api-key-test-value-12345',
        client: garbageClient,
        notes: sc.context.userNotes,
        now: () => (mockClock += 5000),
        cache: createResponseCache(5),
      });

      expect(result.mode).toBe('fallback');
      expect(result.reason).toBe('invalid_response');
      expect(result.ideas.source).toBe('local');

      const parsed = PersonalizedIdeasSchema.safeParse(result.ideas);
      expect(parsed.success).toBe(true);
      expect(result.ideas.themeConcepts).toHaveLength(3);
    }
  });
});
