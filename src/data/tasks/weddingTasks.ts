import type { TaskTemplate } from '../../types/engine';
import { WEDDING_FOUNDATION_TASKS } from './weddingFoundationTasks';
import { WEDDING_DETAIL_TASKS } from './weddingDetailTasks';
import { WEDDING_MULTIDAY_TASKS } from './weddingMultidayTasks';

/** Comprehensive catalog of task templates for wedding celebrations. */
export const WEDDING_TASKS: readonly TaskTemplate[] = [
  ...WEDDING_FOUNDATION_TASKS,
  ...WEDDING_DETAIL_TASKS,
  ...WEDDING_MULTIDAY_TASKS,
];
