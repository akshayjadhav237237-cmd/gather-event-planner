import { describe, expect, it } from 'vitest';
import { estimateVolunteers, projectEventFinance } from '../src/domain/communityTools';

describe('estimateVolunteers', () => {
  it('returns baseline minimum 4 volunteers for zero attendees', () => {
    const result = estimateVolunteers(0);
    expect(result.volunteersNeeded).toBe(4);
    expect(result.shiftHours).toBe(3);
    expect(result.rosterSize).toBe(8);
  });

  it('enforces minimum 4 volunteers for low attendee counts', () => {
    const res1 = estimateVolunteers(1);
    expect(res1.volunteersNeeded).toBe(4);

    const res50 = estimateVolunteers(50);
    expect(res50.volunteersNeeded).toBe(4);
    expect(res50.rosterSize).toBe(8);

    const res100 = estimateVolunteers(100);
    expect(res100.volunteersNeeded).toBe(4);
    expect(res100.rosterSize).toBe(8);
  });

  it('scales volunteers proportionally for large crowds', () => {
    const res2500 = estimateVolunteers(2500);
    expect(res2500.volunteersNeeded).toBe(100);
    expect(res2500.shiftHours).toBe(3);
    // (100 volunteers * 6 hours default) / 3 shift hours = 200
    expect(res2500.rosterSize).toBe(200);
  });

  it('adjusts roster size with custom event hours', () => {
    const res3h = estimateVolunteers(100, 3);
    expect(res3h.volunteersNeeded).toBe(4);
    expect(res3h.rosterSize).toBe(4);

    const res9h = estimateVolunteers(100, 9);
    expect(res9h.volunteersNeeded).toBe(4);
    expect(res9h.rosterSize).toBe(12);

    const res1h = estimateVolunteers(100, 1);
    expect(res1h.volunteersNeeded).toBe(4);
    expect(res1h.rosterSize).toBe(2);
  });

  it('robustly handles negative, zero, and NaN inputs', () => {
    const resNeg = estimateVolunteers(-50);
    expect(resNeg.volunteersNeeded).toBe(4);
    expect(resNeg.rosterSize).toBe(8);

    const resNan = estimateVolunteers(Number.NaN);
    expect(resNan.volunteersNeeded).toBe(4);
    expect(resNan.rosterSize).toBe(8);

    const resNegHours = estimateVolunteers(100, -2);
    expect(resNegHours.rosterSize).toBe(2);

    const resNanHours = estimateVolunteers(100, Number.NaN);
    expect(resNanHours.rosterSize).toBe(8);
  });
});

describe('projectEventFinance', () => {
  it('calculates financial surplus and break-even ticket count', () => {
    const result = projectEventFinance({
      ticketPrice: 20,
      expectedTickets: 100,
      sponsorshipTotal: 1000,
      vendorFeeTotal: 500,
      expenses: 3000,
    });

    expect(result.revenue).toBe(3500);
    expect(result.net).toBe(500);
    // uncovered expenses = 3000 - 1500 = 1500; 1500 / 20 = 75
    expect(result.breakEvenTickets).toBe(75);
  });

  it('calculates financial deficit and higher break-even ticket requirement', () => {
    const result = projectEventFinance({
      ticketPrice: 15,
      expectedTickets: 100,
      sponsorshipTotal: 500,
      vendorFeeTotal: 200,
      expenses: 3000,
    });

    expect(result.revenue).toBe(2200);
    expect(result.net).toBe(-800);
    // uncovered expenses = 3000 - 700 = 2300; ceil(2300 / 15) = 154
    expect(result.breakEvenTickets).toBe(154);
  });

  it('sets breakEvenTickets to 0 when fixed revenues cover all expenses', () => {
    const result = projectEventFinance({
      ticketPrice: 25,
      expectedTickets: 50,
      sponsorshipTotal: 4000,
      vendorFeeTotal: 1000,
      expenses: 3500,
    });

    expect(result.net).toBe(2750);
    expect(result.breakEvenTickets).toBe(0);
  });

  it('returns null breakEvenTickets when ticket price is zero or free', () => {
    const result = projectEventFinance({
      ticketPrice: 0,
      expectedTickets: 200,
      sponsorshipTotal: 3000,
      vendorFeeTotal: 500,
      expenses: 2500,
    });

    expect(result.revenue).toBe(3500);
    expect(result.net).toBe(1000);
    expect(result.breakEvenTickets).toBeNull();
  });

  it('returns null breakEvenTickets for negative ticket prices', () => {
    const result = projectEventFinance({
      ticketPrice: -10,
      expectedTickets: 50,
      sponsorshipTotal: 500,
      vendorFeeTotal: 0,
      expenses: 1000,
    });

    expect(result.breakEvenTickets).toBeNull();
  });

  it('robustly sanitizes negative and NaN financial inputs', () => {
    const result = projectEventFinance({
      ticketPrice: Number.NaN,
      expectedTickets: -50,
      sponsorshipTotal: Number.NaN,
      vendorFeeTotal: -100,
      expenses: Number.NaN,
    });

    expect(result.revenue).toBe(0);
    expect(result.net).toBe(0);
    expect(result.breakEvenTickets).toBeNull();
  });
});
