export const RUN_OF_SHOW_ROLES = [
  'Host',
  'Coordinator',
  'Family Lead',
  'Venue Manager',
  'Caterer',
  'Photographer',
  'Entertainer',
  'Volunteer Lead',
  'Safety Lead',
] as const;

export type RunOfShowRole = (typeof RUN_OF_SHOW_ROLES)[number];

/** Validates whether a given string is a sanctioned run-of-show role. */
export function isRunOfShowRole(role: string): role is RunOfShowRole {
  return (RUN_OF_SHOW_ROLES as readonly string[]).includes(role);
}
