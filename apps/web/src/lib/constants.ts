import { authOptionsSchema } from '@workspace/db/helpers';
import { z } from 'zod';

export const LOCAL_STORAGE_SCHEMAS = {
  LAST_AUTH_METHOD: authOptionsSchema,
} as const;

export const ISSUE_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: 'bg-muted-foreground/60' },
  { value: 'todo', label: 'Todo', color: 'bg-primary' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'in_review', label: 'In Review', color: 'bg-purple-500' },
  { value: 'done', label: 'Done', color: 'bg-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive' },
  { value: 'duplicate', label: 'Duplicate', color: 'bg-yellow-500' },
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
