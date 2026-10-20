import { useState } from 'react';
import { estimateVolunteers } from '../../domain/communityTools';
import { parseWholeNumber } from '../../ui/formModel';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Stat } from '../ui/Stat';

export interface VolunteerPlannerProps {
  guestCount: number;
}

export function VolunteerPlanner({ guestCount }: VolunteerPlannerProps) {
  const [hoursStr, setHoursStr] = useState<string>('6');

  const parsed = parseWholeNumber(hoursStr);
  const isValid = Number.isFinite(parsed) && parsed >= 1 && parsed <= 24;
  const eventHours = isValid ? parsed : 6;
  const estimate = estimateVolunteers(guestCount, eventHours);

  const error =
    hoursStr.trim() !== '' && !isValid
      ? 'Enter a duration between 1 and 24 hours.'
      : undefined;

  return (
    <Card as="section" padding="md" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">Volunteer estimate</h3>
        <p className="text-sm text-muted">
          Planning heuristic: Estimates reflect 1 volunteer per 25 attendees (minimum 4) with 3-hour shifts.
        </p>
      </div>

      <div className="max-w-xs">
        <FormField
          id="volunteer-hours"
          label="Event length in hours"
          hint="Operating duration from 1 to 24 hours"
          error={error}
        >
          {(aria) => (
            <Input
              {...aria}
              inputMode="numeric"
              value={hoursStr}
              onChange={(e) => setHoursStr(e.target.value)}
            />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-control bg-sunken">
        <Stat
          label="Volunteers at one time"
          value={estimate.volunteersNeeded}
          sub="Minimum 4 on duty"
        />
        <Stat
          label="Shift length"
          value={`${estimate.shiftHours} hrs`}
          sub="Standard shift duration"
        />
        <Stat
          label="Total roster size"
          value={estimate.rosterSize}
          sub="Recommended headcount"
        />
      </div>

      <div aria-live="polite" className="sr-only">
        {`Volunteer estimate for ${guestCount} attendees over ${eventHours} hours: ${estimate.volunteersNeeded} volunteers on duty, ${estimate.shiftHours} hour shifts, total roster size of ${estimate.rosterSize}.`}
      </div>
    </Card>
  );
}
