import { useEffect, useState } from 'react';
import { simulateGuestChange } from '../../domain/whatIf';
import { usePlanStore } from '../../store/planStore';
import type { ContextSignals } from '../../types/engine';
import type { BudgetBreakdown, EventContext } from '../../types/event';
import {
  ADD_ON_OPTIONS,
  describeFoodChange,
  describeTier,
  guestSliderBounds,
} from '../../ui/calculatorsView';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';

export interface WhatIfSimulatorProps {
  context: EventContext;
  signals?: ContextSignals;
  breakdown?: BudgetBreakdown;
}

export function WhatIfSimulator({ context }: WhatIfSimulatorProps) {
  const setContext = usePlanStore((s) => s.setContext);
  const [simulatedGuests, setSimulatedGuests] = useState<number>(context.guestCount);
  const [addOnPct, setAddOnPct] = useState<number>(0);

  useEffect(() => {
    setSimulatedGuests(context.guestCount);
  }, [context.guestCount]);

  const bounds = guestSliderBounds(context.guestCount);
  const deltaGuests = simulatedGuests - context.guestCount;
  const sim = simulateGuestChange(context, deltaGuests, addOnPct);
  const tier = describeTier(sim.newTier);
  const foodChangeText = describeFoodChange(sim.estimatedFoodCostChange, context.currency);
  const hasChanges = simulatedGuests !== context.guestCount;

  return (
    <Card as="section" padding="md" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">What if the guest list changes?</h3>
        <p className="text-sm text-muted">
          Explore how guest count adjustments shift your per-guest economics and food budget.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="guest-slider" className="text-sm font-medium text-ink">
              Guest count: <span className="tabular-nums font-semibold">{simulatedGuests}</span>
            </label>
            <span className="text-xs text-muted tabular-nums">
              Allowed: {bounds.min} – {bounds.max}
            </span>
          </div>
          <input
            id="guest-slider"
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            value={simulatedGuests}
            onChange={(e) => setSimulatedGuests(Number(e.target.value))}
            aria-valuemin={bounds.min}
            aria-valuemax={bounds.max}
            aria-valuenow={simulatedGuests}
            aria-valuetext={`${simulatedGuests} guests`}
            className="w-full h-2 bg-sunken rounded-control accent-ink cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="addon-select" className="text-sm font-medium text-ink">
            Service charge and tax on food and drink (illustrative)
          </label>
          <Select
            id="addon-select"
            value={addOnPct}
            onChange={(e) => setAddOnPct(Number(e.target.value))}
          >
            {ADD_ON_OPTIONS.map((pct) => (
              <option key={pct} value={pct}>
                {pct === 0 ? '0% (Standard base food allocation)' : `+${pct}% service charge & tax buffer`}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-control bg-sunken">
        <div className="space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold block">
            Adjusted guest count
          </span>
          <span className="font-serif text-2xl tabular-nums text-ink block">
            {sim.newGuestCount}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold block">
            New per-guest budget
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-2xl tabular-nums text-ink">
              {formatCurrency(sim.newPerGuestBudget, context.currency)}
            </span>
            <Badge tone={tier.tone}>{tier.label}</Badge>
          </div>
        </div>

        <div className="sm:col-span-2 pt-3 border-t border-line space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold block">
            Food & drink change
          </span>
          <p className="text-sm text-ink">{foodChangeText}</p>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {`${simulatedGuests} guests. New per-guest budget is ${formatCurrency(
          sim.newPerGuestBudget,
          context.currency
        )}, ${tier.label}. ${foodChangeText}`}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          variant="secondary"
          disabled={!hasChanges}
          onClick={() => setContext({ ...context, guestCount: simulatedGuests })}
        >
          Apply this guest count
        </Button>
      </div>
    </Card>
  );
}
