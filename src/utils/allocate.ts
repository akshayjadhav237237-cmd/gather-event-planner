/** Distributes an integer total across weights using the largest-remainder method. */
export function allocateByWeights(weights: readonly number[], total: number): number[] {
  const integerTotal = Math.round(total);
  if (integerTotal <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }

  const sanitized = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const totalWeight = sanitized.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) {
    return weights.map(() => 0);
  }

  const exact = sanitized.map((w) => (w * integerTotal) / totalWeight);
  const floored = exact.map((e) => Math.floor(e));
  const sumFloored = floored.reduce((sum, val) => sum + val, 0);
  const remainder = integerTotal - sumFloored;

  const fractions = exact.map((e, idx) => ({
    fraction: e - (floored[idx] ?? 0),
    idx,
  }));

  fractions.sort((a, b) => {
    const diff = b.fraction - a.fraction;
    if (Math.abs(diff) > 1e-9) {
      return diff;
    }
    return a.idx - b.idx;
  });

  const result = [...floored];
  for (let i = 0; i < remainder; i += 1) {
    const target = fractions[i];
    if (target !== undefined) {
      const current = result[target.idx];
      if (current !== undefined) {
        result[target.idx] = current + 1;
      }
    }
  }

  return result;
}
