import type { RunOfShowSlot } from '../types/event';

export function formatSlotRange(startTime: string, durationMin: number): string {
  const parts = startTime.split(':');
  const startH = parts[0] ? Number(parts[0]) : 0;
  const startM = parts[1] ? Number(parts[1]) : 0;
  const safeStartH = Number.isNaN(startH) ? 0 : Math.max(0, startH);
  const safeStartM = Number.isNaN(startM) ? 0 : Math.max(0, Math.min(59, startM));
  const startMin = safeStartH * 60 + safeStartM;
  const safeDuration = Number.isFinite(durationMin) && durationMin > 0 ? durationMin : 0;

  const endMin = Math.min(1440, startMin + safeDuration);
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;
  const endHStr = String(endH).padStart(2, '0');
  const endMStr = String(endM).padStart(2, '0');
  const endTime = `${endHStr}:${endMStr}`;

  return `${startTime} \u2013 ${endTime}`;
}

export function totalMinutes(slots: readonly RunOfShowSlot[]): number {
  return slots.reduce((acc, slot) => acc + slot.durationMin + slot.bufferMin, 0);
}
