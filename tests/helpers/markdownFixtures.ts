import type { PersonalizedIdeas } from '../../src/types/event';

export function createMockIdeas(): PersonalizedIdeas {
  return {
    source: 'local',
    themeConcepts: [
      {
        id: 't1',
        title: 'Golden Sunset',
        summary: 'Warm amber tones.',
        whyItFits: 'Fits evening.',
        colorPalette: ['#f59e0b', '#d97706', '#b45309'],
      },
      {
        id: 't2',
        title: 'Rustic Garden',
        summary: 'Earthy greens.',
        whyItFits: 'Fits outdoor.',
        colorPalette: ['#10b981', '#059669', '#047857'],
      },
      {
        id: 't3',
        title: 'Monochrome Chic',
        summary: 'Crisp black & white.',
        whyItFits: 'Formal gathering.',
        colorPalette: ['#111827', '#6b7280', '#f3f4f6'],
      },
    ],
    cateringIdeas: [
      {
        id: 'c1',
        title: 'Grazing Table',
        summary: 'Artisanal breads.',
        whyItFits: 'Mingling.',
        allergySafetyNote: 'Gluten label.',
        budgetSwapIdea: 'Local cheese.',
      },
      {
        id: 'c2',
        title: 'Street Food',
        summary: 'Custom bowls.',
        whyItFits: 'High energy.',
        allergySafetyNote: 'Nut free.',
        budgetSwapIdea: 'Fewer proteins.',
      },
      {
        id: 'c3',
        title: 'Family Feast',
        summary: 'Shared platters.',
        whyItFits: 'Conversation.',
        allergySafetyNote: 'Dietary checks.',
        budgetSwapIdea: 'Seasonal sides.',
      },
    ],
    activityIdeas: [
      {
        id: 'a1',
        title: 'Memory Wall',
        summary: 'Instant photos.',
        whyItFits: 'Low-cost keepsake.',
        audienceFit: 'All ages.',
        safetyNote: 'Tuck cords.',
      },
      {
        id: 'a2',
        title: 'Trivia Quiz',
        summary: 'Tailored questions.',
        whyItFits: 'Engages groups.',
        audienceFit: 'Teens & adults.',
        safetyNote: 'Audio clear.',
      },
      {
        id: 'a3',
        title: 'Acoustic Set',
        summary: 'Acoustic guitar.',
        whyItFits: 'Cocktail hour.',
        audienceFit: 'All guests.',
        safetyNote: 'Volume check.',
      },
    ],
    bespokeTasks: [
      { title: 'Confirm acoustic gear', phase: 'Details', rationale: 'Verify power access.' },
      {
        title: 'Print allergy labels',
        phase: 'Final Week',
        rationale: 'Protect sensitive guests.',
      },
      { title: 'Purchase instant film', phase: 'Details', rationale: 'Stock for memory wall.' },
      { title: 'Finalize trivia script', phase: 'Final Week', rationale: 'Confirm pacing.' },
    ],
    contradictionAdvisory: null,
  };
}
