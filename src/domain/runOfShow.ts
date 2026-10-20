import { RULE_IDS } from './ruleIds';
import { getRunOfShowTemplate } from '../data/runOfShowTemplates';
import type { DecisionResult } from '../types/engine';
import type { EventContext, RunOfShowSlot } from '../types/event';

/** Converts a 24-hour HH:MM time string to integer minutes from midnight. */
export function timeToMinutes(time: string): number {
  const [hStr = '0', mStr = '0'] = time.split(':');
  return Number(hStr) * 60 + Number(mStr);
}

/** Converts integer minutes from midnight to a 24-hour HH:MM string. */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

/** Recalculates slot start times sequentially to ensure non-overlapping execution within the day. */
export function recalculateSchedule(slots: RunOfShowSlot[]): RunOfShowSlot[] {
  const sorted = [...slots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
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
    if (end >= 1440) {
      const available = 1435 - timeToMinutes(cur.startTime);
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
    { startTime: '10:00', durationMin: hasAccessibility ? 20 : 30, activity: 'Toddler arrival and sensory play stations', owner: 'Host', bufferMin: b },
    { startTime: '10:30', durationMin: hasAccessibility ? 25 : 45, activity: 'Interactive circle time and gentle games', owner: 'Entertainer', bufferMin: b },
    { startTime: '11:15', durationMin: hasAccessibility ? 20 : 30, activity: 'Toddler snack and mini cake celebration', owner: 'Caterer', bufferMin: b },
    { startTime: '11:45', durationMin: 15, activity: 'Goodie bags and calm departure', owner: 'Host', bufferMin: b },
  ]);
}

function injectSurprisePartySlots(slots: RunOfShowSlot[]): void {
  const hasStaging = slots.some((s) => /staging|hiding/i.test(s.activity));
  const hasReveal = slots.some((s) => /reveal/i.test(s.activity));
  if (hasStaging && hasReveal) return;
  const arr = slots.find((s) => /arrival|welcome/i.test(s.activity));
  const t = arr ? timeToMinutes(arr.startTime) : 1080;
  slots.push(
    { startTime: minutesToTime(t), durationMin: 30, activity: 'Secret guest arrival and coordination briefing', owner: 'Coordinator', bufferMin: 10 },
    { startTime: minutesToTime(t + 40), durationMin: 15, activity: 'Guest quiet hiding and staging in position', owner: 'Host', bufferMin: 5 },
    { startTime: minutesToTime(t + 60), durationMin: 15, activity: 'Guest of honor arrival and surprise reveal moment', owner: 'Host', bufferMin: 10 },
  );
}

function injectOutdoorReviewSlot(slots: RunOfShowSlot[]): void {
  if (slots.some((s) => /weather/i.test(s.activity))) return;
  const arr = slots.find((s) => /arrival|gates open|doors open|baraat/i.test(s.activity));
  const t = arr ? timeToMinutes(arr.startTime) : 720;
  slots.push({
    startTime: minutesToTime(Math.max(0, t - 120)),
    durationMin: 20,
    activity: 'Weather and ground conditions review',
    owner: 'Safety Lead',
    bufferMin: 10,
  });
}

function injectAllergenBriefingSlot(slots: RunOfShowSlot[]): void {
  if (slots.some((s) => /allergen/i.test(s.activity))) return;
  const meal = slots.find((s) => /meal|dinner|lunch|cake|buffet|snack|food/i.test(s.activity));
  const t = meal ? timeToMinutes(meal.startTime) : 720;
  slots.push({
    startTime: minutesToTime(Math.max(0, t - 20)),
    durationMin: 15,
    activity: 'Allergen briefing with catering team and food stations',
    owner: 'Caterer',
    bufferMin: 5,
  });
}

function injectCommunityPublicSlot(slots: RunOfShowSlot[]): void {
  if (slots.some((s) => /safety inspection/i.test(s.activity))) return;
  const gates = slots.find((s) => /gates open|attendee arrival|doors open/i.test(s.activity));
  const t = gates ? timeToMinutes(gates.startTime) : 600;
  slots.push({
    startTime: minutesToTime(Math.max(0, t - 45)),
    durationMin: 30,
    activity: 'Site safety inspection and volunteer briefing',
    owner: 'Safety Lead',
    bufferMin: 15,
  });
}

function injectOpenBarLastCall(slots: RunOfShowSlot[]): void {
  if (slots.some((s) => /last-call/i.test(s.activity))) return;
  const last = slots[slots.length - 1];
  const t = last ? timeToMinutes(last.startTime) + last.durationMin : 1380;
  slots.push({
    startTime: minutesToTime(Math.max(0, t - 40)),
    durationMin: 15,
    activity: 'Bar last-call and service closure',
    owner: 'Caterer',
    bufferMin: 5,
  });
}

function enforceAmplifiedMusicLimit(slots: RunOfShowSlot[]): void {
  for (let i = slots.length - 1; i >= 0; i--) {
    const s = slots[i];
    if (!s) continue;
    const start = timeToMinutes(s.startTime);
    if (start < 1290 && start + s.durationMin > 1290) {
      s.durationMin = Math.max(5, 1290 - start);
      s.bufferMin = 0;
    } else if (start >= 1290 && start < 1315) {
      slots.splice(i, 1);
    }
  }
  slots.push({
    startTime: '21:30',
    durationMin: 25,
    activity: 'Amplified music wind-down and acoustic transition',
    owner: 'Entertainer',
    bufferMin: 0,
  });
}

/** Generates a minute-by-minute day-of run-of-show schedule tailored by active contextual decision rules. */
export function buildRunOfShow(
  ctx: EventContext,
  decision: DecisionResult,
): RunOfShowSlot[] {
  const active = decision.activeRuleIds;
  const hasAccess = active.includes(RULE_IDS.ACCESSIBILITY);

  if (active.includes(RULE_IDS.YOUNG_KIDS) || ctx.subFormat === 'kids_1_3') {
    return buildYoungKidsSchedule(hasAccess);
  }

  let slots = getRunOfShowTemplate(ctx.eventType, ctx.subFormat);

  if (active.includes(RULE_IDS.SURPRISE_PARTY)) injectSurprisePartySlots(slots);
  if (active.includes(RULE_IDS.COMMUNITY_PUBLIC_EVENT)) injectCommunityPublicSlot(slots);
  if (active.includes(RULE_IDS.OUTDOOR)) injectOutdoorReviewSlot(slots);
  if (active.includes(RULE_IDS.ALLERGY_ALERT)) injectAllergenBriefingSlot(slots);
  if (active.includes(RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL)) enforceAmplifiedMusicLimit(slots);
  if (active.includes(RULE_IDS.OPEN_BAR)) injectOpenBarLastCall(slots);

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
