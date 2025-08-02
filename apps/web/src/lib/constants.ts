import { authOptionsSchema } from '@workspace/db/helpers';
import { z } from 'zod';

export const LOCAL_STORAGE_SCHEMAS = {
  LAST_AUTH_METHOD: authOptionsSchema,
} as const;

export const ISSUE_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: 'bg-status-backlog' },
  { value: 'todo', label: 'Todo', color: 'bg-status-todo' },
  {
    value: 'in_progress',
    label: 'In Progress',
    color: 'bg-status-in-progress',
  },
  { value: 'in_review', label: 'In Review', color: 'bg-status-in-review' },
  { value: 'done', label: 'Done', color: 'bg-status-done' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-status-cancelled' },
  { value: 'duplicate', label: 'Duplicate', color: 'bg-status-duplicate' },
] as const;

export const ISSUE_PRIORITY_OPTIONS = [
  {
    value: 'no_priority',
    label: 'No priority',
    color: 'bg-muted-foreground/60',
  },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-600' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-400' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
] as const;

export type IssueStatus = (typeof ISSUE_STATUS_OPTIONS)[number]['value'];
export type IssuePriority = (typeof ISSUE_PRIORITY_OPTIONS)[number]['value'];

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_SCHEMAS;

export type LocalStorageValue<K extends LocalStorageKey> = z.infer<
  (typeof LOCAL_STORAGE_SCHEMAS)[K] & z.ZodTypeAny
>;
