import { getRunOfShowTemplate } from '../data/runOfShowTemplates';
import type { DecisionResult } from '../types/engine';
import type { EventContext, RunOfShowSlot } from '../types/event';
import { RULE_IDS } from './ruleIds';
import { injectContextualSlots } from './runOfShowRules';

export { injectContextualSlots } from './runOfShowRules';

export const DAY_END_MINUTES = 1439;
export const MINUTES_PER_DAY = 1440;
export const DAY_MAX_START_MINUTES = 1435;

/** Converts a 24-hour HH:MM time string to integer minutes from midnight. */
export function timeToMinutes(time: string): number {
  const [hStr = '0', mStr = '0'] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return Math.max(0, Math.min(DAY_END_MINUTES, h * 60 + m));
}

/** Converts integer minutes from midnight to a 24-hour HH:MM string. */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(DAY_END_MINUTES, Math.floor(minutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

/** Recalculates slot start times sequentially to ensure non-overlapping execution within the day. */
export function recalculateSchedule(slots: RunOfShowSlot[]): RunOfShowSlot[] {
  const sorted = [...slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (!cur) continue;
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev) {
        const prevEnd = timeToMinutes(prev.startTime) + prev.durationMin + prev.bufferMin;
        if (timeToMinutes(cur.startTime) < prevEnd) {
          cur.startTime = minutesToTime(prevEnd);
        }
      }
    }
    const end = timeToMinutes(cur.startTime) + cur.durationMin + cur.bufferMin;
    if (end >= MINUTES_PER_DAY) {
      const available = DAY_MAX_START_MINUTES - timeToMinutes(cur.startTime);
      if (available >= 5) {
        cur.bufferMin = 0;
        cur.durationMin = available;
      }
    }
  }
  return sorted;
}

function buildYoungKidsSchedule(hasAccessibility: boolean): RunOfShowSlot[] {
  const b = hasAccessibility ? 10 : 0;
  return recalculateSchedule([
    {
      startTime: '10:00',
      durationMin: hasAccessibility ? 20 : 30,
      activity: 'Toddler arrival and sensory play stations',
      owner: 'Host',
      bufferMin: b,
    },
    {
      startTime: '10:30',
      durationMin: hasAccessibility ? 25 : 45,
      activity: 'Interactive circle time and gentle games',
      owner: 'Entertainer',
      bufferMin: b,
    },
    {
      startTime: '11:15',
      durationMin: hasAccessibility ? 20 : 30,
      activity: 'Toddler snack and mini cake celebration',
      owner: 'Caterer',
      bufferMin: b,
    },
    {
      startTime: '11:45',
      durationMin: 15,
      activity: 'Goodie bags and calm departure',
      owner: 'Host',
      bufferMin: b,
    },
  ]);
}

/** Generates a minute-by-minute day-of run-of-show schedule tailored by active contextual decision rules. */
export function buildRunOfShow(ctx: EventContext, decision: DecisionResult): RunOfShowSlot[] {
  const active = decision.activeRuleIds;
  const hasAccess = active.includes(RULE_IDS.ACCESSIBILITY);

  if (active.includes(RULE_IDS.YOUNG_KIDS) || ctx.subFormat === 'kids_1_3') {
    return buildYoungKidsSchedule(hasAccess);
  }

  let slots = getRunOfShowTemplate(ctx.eventType, ctx.subFormat);
  injectContextualSlots(slots, active);

  if (hasAccess) {
    for (const s of slots) {
      s.bufferMin += 10;
    }
  }

  slots = recalculateSchedule(slots);

  if (active.includes(RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL)) {
    for (const s of slots) {
      const start = timeToMinutes(s.startTime);
      if (start >= 1315 && /music|dance|dj|band/i.test(s.activity)) {
        s.activity = 'Acoustic background music and guest farewells';
      }
    }
  }

  return slots;
}
