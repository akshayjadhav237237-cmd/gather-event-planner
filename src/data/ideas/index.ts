import type { IdeaBank } from '../../ai/ideaSeedTypes';
import type { EventType } from '../../types/event';
import { BIRTHDAY_BANK } from './birthdayIdeas';
import { COMMUNITY_BANK } from './communityIdeas';
import { WEDDING_BANK } from './weddingIdeas';

/** Curated birthday celebration idea bank. */
export { BIRTHDAY_BANK } from './birthdayIdeas';
/** Curated community celebration idea bank. */
export { COMMUNITY_BANK } from './communityIdeas';
/** Curated wedding celebration idea bank. */
export { WEDDING_BANK } from './weddingIdeas';

/** Retrieves the comprehensive idea bank corresponding to the given primary event type. */
export function getIdeaBank(eventType: EventType): IdeaBank {
  switch (eventType) {
    case 'wedding':
      return WEDDING_BANK;
    case 'birthday':
      return BIRTHDAY_BANK;
    case 'community':
      return COMMUNITY_BANK;
  }
}
