import type { EventType, RunOfShowSlot, SubFormat } from '../types/event';
import { BIRTHDAY_ADULT_TEEN_TEMPLATE, BIRTHDAY_SURPRISE_TEMPLATE } from './runOfShowBirthdayAdult';
import { BIRTHDAY_KIDS_TEMPLATE, BIRTHDAY_YOUNG_KIDS_TEMPLATE } from './runOfShowBirthdayKids';
import { COMMUNITY_EVENT_DAY_TEMPLATE } from './runOfShowCommunity';
import { INDIAN_MULTIDAY_WEDDING_TEMPLATE, WEDDING_MAIN_DAY_TEMPLATE } from './runOfShowWedding';

export {
  RUN_OF_SHOW_ROLES,
  type RunOfShowRole,
  isRunOfShowRole,
} from './runOfShowRoles';
export {
  WEDDING_MAIN_DAY_TEMPLATE,
  INDIAN_MULTIDAY_WEDDING_TEMPLATE,
} from './runOfShowWedding';
export {
  BIRTHDAY_YOUNG_KIDS_TEMPLATE,
  BIRTHDAY_KIDS_TEMPLATE,
} from './runOfShowBirthdayKids';
export {
  BIRTHDAY_ADULT_TEEN_TEMPLATE,
  BIRTHDAY_SURPRISE_TEMPLATE,
} from './runOfShowBirthdayAdult';
export { COMMUNITY_EVENT_DAY_TEMPLATE } from './runOfShowCommunity';

/** Retrieves the baseline run-of-show schedule template for an event type and subformat. */
export function getRunOfShowTemplate(
  eventType: EventType,
  subFormat: SubFormat
): RunOfShowSlot[] {
  let source: readonly RunOfShowSlot[];

  if (eventType === 'wedding') {
    source = subFormat === 'indian_multiday'
      ? INDIAN_MULTIDAY_WEDDING_TEMPLATE
      : WEDDING_MAIN_DAY_TEMPLATE;
  } else if (eventType === 'birthday') {
    if (subFormat === 'kids_1_3') {
      source = BIRTHDAY_YOUNG_KIDS_TEMPLATE;
    } else if (subFormat === 'kids_4_12') {
      source = BIRTHDAY_KIDS_TEMPLATE;
    } else if (subFormat === 'surprise') {
      source = BIRTHDAY_SURPRISE_TEMPLATE;
    } else {
      source = BIRTHDAY_ADULT_TEEN_TEMPLATE;
    }
  } else {
    source = COMMUNITY_EVENT_DAY_TEMPLATE;
  }

  return source.map((slot) => ({ ...slot }));
}
