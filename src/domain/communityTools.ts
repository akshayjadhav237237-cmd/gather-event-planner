// Planning heuristic: baseline ratio of attendees served per volunteer.
export const ATTENDEES_PER_VOLUNTEER = 25;

// Planning heuristic: minimum volunteer headcount baseline for community event logistics.
export const MIN_VOLUNTEERS = 4;

// Planning heuristic: standard volunteer shift duration in hours.
export const STANDARD_SHIFT_HOURS = 3;

// Planning heuristic: default community event operating duration in hours.
export const DEFAULT_EVENT_HOURS = 6;

export interface VolunteerEstimate {
  volunteersNeeded: number;
  shiftHours: number;
  rosterSize: number;
}

export interface EventFinanceInput {
  ticketPrice: number;
  expectedTickets: number;
  sponsorshipTotal: number;
  vendorFeeTotal: number;
  expenses: number;
}

export interface EventFinanceProjection {
  revenue: number;
  net: number;
  breakEvenTickets: number | null;
}

function sanitizeNonNegative(val: number): number {
  return Number.isFinite(val) ? Math.max(0, Math.round(val)) : 0;
}

/** Calculates estimated volunteer shift requirements and roster sizing based on attendee projections. */
export function estimateVolunteers(
  attendees: number,
  eventHours?: number
): { volunteersNeeded: number; shiftHours: number; rosterSize: number } {
  // Planning heuristic: volunteer requirements scale with attendee headcount subject to minimum floor.
  const safeAttendees = Number.isFinite(attendees) ? Math.max(0, attendees) : 0;
  const volunteersNeeded = Math.max(
    MIN_VOLUNTEERS,
    Math.ceil(safeAttendees / ATTENDEES_PER_VOLUNTEER)
  );

  const safeHours =
    eventHours !== undefined && Number.isFinite(eventHours)
      ? Math.max(1, eventHours)
      : DEFAULT_EVENT_HOURS;

  const rosterSize = Math.ceil((volunteersNeeded * safeHours) / STANDARD_SHIFT_HOURS);

  return {
    volunteersNeeded,
    shiftHours: STANDARD_SHIFT_HOURS,
    rosterSize,
  };
}

/** Projects overall community event financial balances, net surplus/deficit, and ticket break-even thresholds. */
export function projectEventFinance(input: {
  ticketPrice: number;
  expectedTickets: number;
  sponsorshipTotal: number;
  vendorFeeTotal: number;
  expenses: number;
}): { revenue: number; net: number; breakEvenTickets: number | null } {
  const safeTicketPrice = Number.isFinite(input.ticketPrice) ? Math.max(0, input.ticketPrice) : 0;
  const safeTickets = sanitizeNonNegative(input.expectedTickets);
  const safeSponsorship = sanitizeNonNegative(input.sponsorshipTotal);
  const safeVendorFees = sanitizeNonNegative(input.vendorFeeTotal);
  const safeExpenses = sanitizeNonNegative(input.expenses);

  const ticketRevenue = Math.round(safeTicketPrice * safeTickets);
  const fixedRevenue = safeSponsorship + safeVendorFees;
  const revenue = ticketRevenue + fixedRevenue;
  const net = revenue - safeExpenses;

  let breakEvenTickets: number | null = null;
  if (Number.isFinite(input.ticketPrice) && input.ticketPrice > 0) {
    const uncoveredExpenses = Math.max(0, safeExpenses - fixedRevenue);
    breakEvenTickets = Math.ceil(uncoveredExpenses / input.ticketPrice);
  }

  return {
    revenue,
    net,
    breakEvenTickets,
  };
}
