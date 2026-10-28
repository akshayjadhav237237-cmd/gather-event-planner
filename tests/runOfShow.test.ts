import { describe, expect, it } from 'vitest';
import {
  BIRTHDAY_ADULT_TEEN_TEMPLATE,
  BIRTHDAY_KIDS_TEMPLATE,
  BIRTHDAY_SURPRISE_TEMPLATE,
  BIRTHDAY_YOUNG_KIDS_TEMPLATE,
  COMMUNITY_EVENT_DAY_TEMPLATE,
  INDIAN_MULTIDAY_WEDDING_TEMPLATE,
  RUN_OF_SHOW_ROLES,
  WEDDING_MAIN_DAY_TEMPLATE,
} from '../src/data/runOfShowTemplates';
import { RULE_IDS } from '../src/domain/ruleIds';
import { buildRunOfShow, minutesToTime, timeToMinutes } from '../src/domain/runOfShow';
import type { DecisionResult } from '../src/types/engine';
import type { EventContext, RunOfShowSlot } from '../src/types/event';

function createMockContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    id: 'evt-101',
    title: 'Celebration Test Event',
    eventType: 'wedding',
    subFormat: 'western',
    eventDate: '2026-12-15',
    currency: 'USD',
    totalBudget: 30000,
    guestCount: 120,
    setting: 'indoor',
    season: 'mild',
    priorities: [],
    flags: [],
    userNotes: '',
    ...overrides,
  };
}

function createDecision(activeRuleIds: string[] = []): DecisionResult {
  return { adaptations: [], activeRuleIds, contingencyDelta: 0 };
}

function verifyInvariants(slots: RunOfShowSlot[]): void {
  expect(slots.length).toBeGreaterThan(0);
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    expect(s.startTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect(s.durationMin).toBeGreaterThan(0);
    expect(s.bufferMin).toBeGreaterThanOrEqual(0);
    expect(s.activity.trim().length).toBeGreaterThan(0);
    expect(RUN_OF_SHOW_ROLES).toContain(s.owner);

    const start = timeToMinutes(s.startTime);
    const finish = start + s.durationMin + s.bufferMin;
    expect(finish).toBeLessThan(1440);

    const next = slots[i + 1];
    if (next) {
      const nextStart = timeToMinutes(next.startTime);
      expect(finish).toBeLessThanOrEqual(nextStart);
      expect(start).toBeLessThan(nextStart);
    }
  }
}

describe('Run of Show Engine', () => {
  it('converts time to minutes and back accurately', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('12:30')).toBe(750);
    expect(timeToMinutes('23:59')).toBe(1439);
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(750)).toBe('12:30');
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('preserves invariants across all static baseline templates', () => {
    const templates = [
      WEDDING_MAIN_DAY_TEMPLATE,
      INDIAN_MULTIDAY_WEDDING_TEMPLATE,
      BIRTHDAY_YOUNG_KIDS_TEMPLATE,
      BIRTHDAY_KIDS_TEMPLATE,
      BIRTHDAY_ADULT_TEEN_TEMPLATE,
      BIRTHDAY_SURPRISE_TEMPLATE,
      COMMUNITY_EVENT_DAY_TEMPLATE,
    ];
    templates.forEach((t) => verifyInvariants([...t]));
  });

  it('satisfies YOUNG_KIDS rule starting at 10:00 and finishing <= 120 min', () => {
    const ctx = createMockContext({ eventType: 'birthday', subFormat: 'kids_1_3' });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.YOUNG_KIDS]));
    verifyInvariants(plan);

    expect(plan[0]?.startTime).toBe('10:00');
    const last = plan[plan.length - 1];
    expect(last).toBeDefined();
    if (last) {
      const totalMin =
        timeToMinutes(last.startTime) + last.durationMin + last.bufferMin - timeToMinutes('10:00');
      expect(totalMin).toBeLessThanOrEqual(120);
    }
    expect(plan.some((s) => /snack|cake/i.test(s.activity))).toBe(true);
  });

  it('applies ACCESSIBILITY by increasing buffers and shifting start times without overlap', () => {
    const ctx = createMockContext({ eventType: 'wedding', subFormat: 'western' });
    const basePlan = buildRunOfShow(ctx, createDecision([]));
    const accessPlan = buildRunOfShow(ctx, createDecision([RULE_IDS.ACCESSIBILITY]));

    verifyInvariants(accessPlan);
    expect(accessPlan.length).toBe(basePlan.length);
    for (let i = 0; i < basePlan.length; i++) {
      const baseSlot = basePlan[i];
      const accSlot = accessPlan[i];
      if (baseSlot && accSlot) {
        expect(accSlot.bufferMin).toBe(baseSlot.bufferMin + 10);
      }
    }
  });

  it('inserts OUTDOOR weather review slot 2 hours before guest arrival', () => {
    const ctx = createMockContext({
      eventType: 'wedding',
      subFormat: 'western',
      setting: 'outdoor',
    });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.OUTDOOR]));

    verifyInvariants(plan);
    const weather = plan.find((s) => /weather/i.test(s.activity));
    expect(weather).toBeDefined();
    expect(['Coordinator', 'Safety Lead']).toContain(weather?.owner);

    const arrival = plan.find((s) => /arrival|welcome/i.test(s.activity) && s !== weather);
    expect(arrival).toBeDefined();
    if (arrival && weather) {
      expect(
        timeToMinutes(arrival.startTime) - timeToMinutes(weather.startTime)
      ).toBeGreaterThanOrEqual(120);
    }
  });

  it('includes SURPRISE_PARTY staging and reveal slots', () => {
    const ctx = createMockContext({ eventType: 'birthday', subFormat: 'surprise' });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.SURPRISE_PARTY]));

    verifyInvariants(plan);
    const staging = plan.find((s) => /staging|hiding/i.test(s.activity));
    const reveal = plan.find((s) => /reveal/i.test(s.activity));
    expect(staging).toBeDefined();
    expect(reveal).toBeDefined();
    expect(staging?.owner).toBe('Host');
    expect(reveal?.owner).toBe('Host');
  });

  it('inserts ALLERGY_ALERT briefing slot before meal service', () => {
    const ctx = createMockContext({ eventType: 'wedding', subFormat: 'western' });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.ALLERGY_ALERT]));

    verifyInvariants(plan);
    const briefing = plan.find((s) => /allergen briefing/i.test(s.activity));
    expect(briefing).toBeDefined();
    expect(['Caterer', 'Coordinator']).toContain(briefing?.owner);

    const meal = plan.find(
      (s) => /meal|dinner|lunch|cake|buffet/i.test(s.activity) && s !== briefing
    );
    expect(meal).toBeDefined();
    if (briefing && meal) {
      expect(timeToMinutes(briefing.startTime)).toBeLessThanOrEqual(timeToMinutes(meal.startTime));
    }
  });

  it('inserts AMPLIFIED_MUSIC_RESIDENTIAL wind-down and ends music by 21:55', () => {
    const ctx = createMockContext({ eventType: 'wedding', subFormat: 'western' });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL]));

    verifyInvariants(plan);
    const windDown = plan.find((s) => /amplified music wind-down/i.test(s.activity));
    expect(windDown?.startTime).toBe('21:30');

    for (const slot of plan) {
      if (/amplified/i.test(slot.activity)) {
        expect(timeToMinutes(slot.startTime) + slot.durationMin).toBeLessThanOrEqual(1315);
      }
    }
  });

  it('inserts OPEN_BAR last call slot 30 to 45 minutes before conclusion', () => {
    const ctx = createMockContext({ eventType: 'wedding', subFormat: 'western' });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.OPEN_BAR]));

    verifyInvariants(plan);
    const lastCall = plan.find((s) => /last-call/i.test(s.activity));
    expect(lastCall).toBeDefined();
    expect(['Caterer', 'Venue Manager']).toContain(lastCall?.owner);

    const last = plan[plan.length - 1];
    expect(last).toBeDefined();
    if (last && lastCall) {
      const conclusion = timeToMinutes(last.startTime) + last.durationMin;
      const diff = conclusion - timeToMinutes(lastCall.startTime);
      expect(diff).toBeGreaterThanOrEqual(30);
      expect(diff).toBeLessThanOrEqual(45);
    }
  });

  it('inserts COMMUNITY_PUBLIC_EVENT safety inspection before gates open', () => {
    const ctx = createMockContext({ eventType: 'community', subFormat: 'festival' });
    const plan = buildRunOfShow(ctx, createDecision([RULE_IDS.COMMUNITY_PUBLIC_EVENT]));

    verifyInvariants(plan);
    const safety = plan.find((s) => /safety inspection/i.test(s.activity));
    const gates = plan.find((s) => /gates open|attendee arrival/i.test(s.activity));
    expect(safety?.owner).toBe('Safety Lead');
    expect(gates).toBeDefined();
    if (safety && gates) {
      expect(timeToMinutes(safety.startTime)).toBeLessThan(timeToMinutes(gates.startTime));
    }
  });
});
