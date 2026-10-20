import type { TaskTemplate } from '../../types/engine';
import { BIRTHDAY_TASKS } from './birthdayTasks';
import { COMMUNITY_TASKS } from './communityTasks';
import { CONDITIONAL_TASKS } from './conditionalTasks';
import { WEDDING_TASKS } from './weddingTasks';

const ALL_TASK_TEMPLATES: readonly TaskTemplate[] = [
  ...WEDDING_TASKS,
  ...BIRTHDAY_TASKS,
  ...COMMUNITY_TASKS,
  ...CONDITIONAL_TASKS,
];

/** Retrieves the combined catalog of task templates across all event types. */
export function getTaskTemplates(): readonly TaskTemplate[] {
  return ALL_TASK_TEMPLATES;
}
