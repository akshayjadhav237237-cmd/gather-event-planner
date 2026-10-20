import { describe, expect, it } from 'vitest';
import { allocateByWeights } from '../src/utils/allocate';

describe('allocateByWeights', () => {
  it('returns all zeros when total is zero or negative', () => {
    expect(allocateByWeights([10, 20, 30], 0)).toEqual([0, 0, 0]);
    expect(allocateByWeights([10, 20, 30], -50)).toEqual([0, 0, 0]);
  });

  it('returns empty array when weights are empty', () => {
    expect(allocateByWeights([], 100)).toEqual([]);
  });

  it('returns all zeros when sum of weights is zero or negative', () => {
    expect(allocateByWeights([0, 0, 0], 100)).toEqual([0, 0, 0]);
    expect(allocateByWeights([-5, -10], 100)).toEqual([0, 0]);
  });

  it('distributes exact integers when proportions divide evenly', () => {
    const weights = [50, 50];
    const result = allocateByWeights(weights, 100);
    expect(result).toEqual([50, 50]);
  });

  it('uses largest-remainder method when remainder exists', () => {
    // 100 distributed among [1, 1, 1]: each exact is 33.3333...
    // remainder = 1, tie breaks by lower index
    const result = allocateByWeights([1, 1, 1], 100);
    expect(result).toEqual([34, 33, 33]);
    expect(result.reduce((s, v) => s + v, 0)).toBe(100);
  });

  it('breaks ties deterministically in favor of lower index', () => {
    const weights = [1, 1, 1, 1];
    const result = allocateByWeights(weights, 2);
    // 0.5 each, 2 remainders -> index 0 and 1 get +1
    expect(result).toEqual([1, 1, 0, 0]);
    expect(result.reduce((s, v) => s + v, 0)).toBe(2);
  });

  it('allocates correctly when fractions differ', () => {
    // weights [1, 2], total 10:
    // exact: [3.333..., 6.666...]
    // floored: [3, 6], remainder: 1
    // fraction for index 1 is 0.666... > fraction for index 0 (0.333...)
    // so index 1 gets +1 -> [3, 7]
    const result = allocateByWeights([1, 2], 10);
    expect(result).toEqual([3, 7]);
    expect(result.reduce((s, v) => s + v, 0)).toBe(10);
  });

  it('handles negative or invalid weight entries by treating them as 0', () => {
    const weights = [50, -10, 50];
    const result = allocateByWeights(weights, 100);
    expect(result).toEqual([50, 0, 50]);
    expect(result.reduce((s, v) => s + v, 0)).toBe(100);
  });

  it('strictly satisfies invariant sum(result) === total across many inputs', () => {
    const testCases = [
      { weights: [20, 25, 10, 10, 7, 8, 3, 2, 8, 7], total: 100 },
      { weights: [20, 25, 10, 10, 7, 8, 3, 2, 8, 7], total: 1 },
      { weights: [20, 25, 10, 10, 7, 8, 3, 2, 8, 7], total: 999 },
      { weights: [20, 25, 10, 10, 7, 8, 3, 2, 8, 7], total: 100_000 },
      { weights: [33, 33, 34], total: 10 },
      { weights: [1], total: 42 },
      { weights: [7, 13, 29, 41, 53], total: 12345 },
      { weights: [100, 200, 300, 400], total: 7 },
      { weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], total: 55 },
      { weights: [10, 20, 30], total: 10_000_000 },
    ];

    for (const { weights, total } of testCases) {
      const result = allocateByWeights(weights, total);
      const sum = result.reduce((s, v) => s + v, 0);
      expect(sum).toBe(total);
      for (const val of result) {
        expect(Number.isInteger(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('handles stress distribution across 50 simulated combinations', () => {
    for (let count = 1; count <= 10; count += 1) {
      for (let mult = 1; mult <= 5; mult += 1) {
        const weights: number[] = [];
        for (let i = 0; i < count; i += 1) {
          weights.push((i + 1) * mult * 3);
        }
        const total = count * mult * 17 + 13;
        const result = allocateByWeights(weights, total);
        const sum = result.reduce((s, v) => s + v, 0);
        expect(sum).toBe(total);
        for (const item of result) {
          expect(Number.isInteger(item)).toBe(true);
          expect(item).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
