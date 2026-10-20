import { useState } from 'react';
import { todayIso } from '../utils/dateMath';

/** Returns today's ISO date string (YYYY-MM-DD), computed once per component mount. */
export function useToday(): string {
  const [today] = useState(() => todayIso());
  return today;
}
