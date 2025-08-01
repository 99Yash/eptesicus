import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
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
  todo_status: issue_statuses('todo_status')
    .$defaultFn(() => 'todo')
    .notNull(),
  todo_priority: issue_priorities('todo_priority')
    .$defaultFn(() => 'no_priority')
    .notNull(),
  ...lifecycle_dates,
});

export const issueInsertSchema = createInsertSchema(issues, {
  title: (schema) => schema.max(255),
});

export const issueUpdateSchema = createUpdateSchema(issues);

export type IssueInsertType = z.infer<typeof issueInsertSchema>;
export type IssueUpdateType = z.infer<typeof issueUpdateSchema>;

export const issue_relations = relations(issues, ({ one }) => ({
  organization: one(organizations, {
    fields: [issues.organization_id],
    references: [organizations.id],
  }),
}));
