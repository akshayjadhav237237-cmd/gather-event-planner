import type { EventType } from '../../types/event';
import { BIRTHDAY_VENDOR_GUIDES } from './birthdayVendors';
import { COMMUNITY_VENDOR_GUIDES } from './communityVendors';
import { WEDDING_VENDOR_GUIDES, type VendorGuideTemplate } from './weddingVendors';

export { BIRTHDAY_VENDOR_GUIDES } from './birthdayVendors';
export { COMMUNITY_VENDOR_GUIDES } from './communityVendors';
export { WEDDING_VENDOR_GUIDES, type VendorGuideTemplate } from './weddingVendors';

const VENDOR_GUIDES_BY_TYPE: Record<EventType, readonly VendorGuideTemplate[]> = {
  wedding: WEDDING_VENDOR_GUIDES,
  birthday: BIRTHDAY_VENDOR_GUIDES,
  community: COMMUNITY_VENDOR_GUIDES,
};

/** Retrieves vendor guide templates for the specified event vertical. */
export function getVendorTemplates(eventType: EventType): readonly VendorGuideTemplate[] {
  return VENDOR_GUIDES_BY_TYPE[eventType] ?? [];
}
