import type { RunOfShowSlot } from '../types/event';
import { RULE_IDS } from './ruleIds';
import { minutesToTime, timeToMinutes } from './runOfShow';

export function injectContextualSlots(slots: RunOfShowSlot[], active: readonly string[]): void {
  if (
    active.includes(RULE_IDS.SURPRISE_PARTY) &&
    !slots.some((s) => /staging|hiding/i.test(s.activity))
  ) {
    const arr = slots.find((s) => /arrival|welcome/i.test(s.activity));
    const t = arr ? timeToMinutes(arr.startTime) : 1080;
    slots.push(
      {
        startTime: minutesToTime(t),
        durationMin: 30,
        activity: 'Secret guest arrival and coordination briefing',
        owner: 'Coordinator',
        bufferMin: 10,
      },
      {
        startTime: minutesToTime(t + 40),
        durationMin: 15,
        activity: 'Guest quiet hiding and staging in position',
        owner: 'Host',
        bufferMin: 5,
      },
      {
        startTime: minutesToTime(t + 60),
        durationMin: 15,
        activity: 'Guest of honor arrival and surprise reveal moment',
        owner: 'Host',
        bufferMin: 10,
      }
    );
  }

  if (
    active.includes(RULE_IDS.COMMUNITY_PUBLIC_EVENT) &&
    !slots.some((s) => /safety inspection/i.test(s.activity))
  ) {
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

  if (active.includes(RULE_IDS.OUTDOOR) && !slots.some((s) => /weather/i.test(s.activity))) {
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

  if (active.includes(RULE_IDS.ALLERGY_ALERT) && !slots.some((s) => /allergen/i.test(s.activity))) {
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

  if (active.includes(RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL)) {
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

  if (active.includes(RULE_IDS.OPEN_BAR) && !slots.some((s) => /last-call/i.test(s.activity))) {
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
}
