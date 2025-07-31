import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createId, lifecycle_dates } from '../helpers/utils';
import { organizations, users } from './users';

export const issue_statuses = pgEnum('issue_statuses', [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
  'duplicate',
]);

export const issue_priorities = pgEnum('issue_priorities', [
  'no_priority',
  'urgent',
  'high',
  'medium',
  'low',
]);

export const issues = pgTable('issues', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  user_id: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  organization_id: varchar('organization_id')
    .references(() => organizations.id)
    .notNull(),
  assignee_id: varchar('assignee_id').references(() => users.id), // TODO: has to be in the same organization
  todo_status: issue_statuses('todo_status'),
  todo_priority: issue_priorities('todo_priority'),
  ...lifecycle_dates,
});
