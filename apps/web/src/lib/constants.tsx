import { authOptionsSchema } from '@workspace/db/helpers';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDot,
  Clock,
  Copy,
  Flag,
  Flame,
  Minus,
  XCircle,
} from 'lucide-react';
import { z } from 'zod';

export const LOCAL_STORAGE_SCHEMAS = {
  LAST_AUTH_METHOD: authOptionsSchema,
} as const;

export const SESSION_STORAGE_SCHEMAS = {
  SHOW_USERNAME_MODAL: z.boolean().default(false),
} as const;

export const ISSUE_STATUS_OPTIONS = [
  {
    value: 'backlog',
    label: 'Backlog',
    color: 'bg-status-backlog',
    icon: CircleDashed,
    textColor: 'text-status-backlog',
  },
  {
    value: 'todo',
    label: 'Todo',
    color: 'bg-status-todo',
    icon: Circle,
    textColor: 'text-status-todo',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    color: 'bg-status-in-progress',
    icon: Clock,
    textColor: 'text-status-in-progress',
  },
  {
    value: 'in_review',
    label: 'In Review',
    color: 'bg-status-in-review',
    icon: CircleDot,
    textColor: 'text-status-in-review',
  },
  {
    value: 'done',
    label: 'Done',
    color: 'bg-status-done',
    icon: CheckCircle2,
    textColor: 'text-status-done',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'bg-status-cancelled',
    icon: XCircle,
    textColor: 'text-status-cancelled',
  },
  {
    value: 'duplicate',
    label: 'Duplicate',
    color: 'bg-status-duplicate',
    icon: Copy,
    textColor: 'text-status-duplicate',
  },
] as const;

export const ISSUE_PRIORITY_OPTIONS = [
  {
    value: 'no_priority',
    label: 'No priority',
    color: 'bg-muted-foreground/60',
    icon: Flag,
    textColor: 'text-priority-none',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    color: 'bg-red-600',
    icon: Flame,
    textColor: 'text-priority-urgent',
  },
  {
    value: 'high',
    label: 'High',
    color: 'bg-orange-500',
    icon: ArrowUp,
    textColor: 'text-priority-high',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'bg-yellow-400',
    icon: Minus,
    textColor: 'text-priority-medium',
  },
  {
    value: 'low',
    label: 'Low',
    color: 'bg-green-500',
    icon: ArrowDown,
    textColor: 'text-priority-low',
  },
] as const;

export type IssueStatus = (typeof ISSUE_STATUS_OPTIONS)[number]['value'];
export type IssuePriority = (typeof ISSUE_PRIORITY_OPTIONS)[number]['value'];

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_SCHEMAS;

export type LocalStorageValue<K extends LocalStorageKey> = z.infer<
  (typeof LOCAL_STORAGE_SCHEMAS)[K] & z.ZodTypeAny
>;

export type SessionStorageKey = keyof typeof SESSION_STORAGE_SCHEMAS;

export type SessionStorageValue<K extends SessionStorageKey> = z.infer<
  (typeof SESSION_STORAGE_SCHEMAS)[K] & z.ZodTypeAny
>;

// -------------------- Helper Functions --------------------
export const getStatusOption = (status: IssueStatus) =>
  ISSUE_STATUS_OPTIONS.find((option) => option.value === status);

export const getPriorityOption = (priority: IssuePriority) =>
  ISSUE_PRIORITY_OPTIONS.find((option) => option.value === priority);

export const getStatusIcon = (status: IssueStatus) =>
  getStatusOption(status)?.icon || Circle;

export const getPriorityIcon = (priority: IssuePriority) =>
  getPriorityOption(priority)?.icon || Flag;

export const getStatusTextColor = (status: IssueStatus) =>
  getStatusOption(status)?.textColor || 'text-muted-foreground';

export const getPriorityTextColor = (priority: IssuePriority) =>
  getPriorityOption(priority)?.textColor || 'text-priority-none';
