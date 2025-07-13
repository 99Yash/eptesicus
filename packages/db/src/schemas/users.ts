import { relations } from 'drizzle-orm';
import { index, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { lifecycleDates } from './utils';

export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    image_url: text('image_url'),
    bio: text('bio'),
    ...lifecycleDates,
  },
  (user) => [
    index('email_idx').on(user.email),
    index('username_idx').on(user.username),
    index('name_idx').on(user.name),
  ]
);

export const organizations = pgTable('organizations', {
  id: varchar('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logo_url: text('logo_url'),
  bio: text('bio'),
  ...lifecycleDates,
});

export const users_to_organizations = pgTable('users_to_organizations', {
  user_id: varchar('user_id').references(() => users.id),
  organization_id: varchar('organization_id').references(
    () => organizations.id
  ),
  ...lifecycleDates,
});

export const user_organization_relations = relations(users, ({ many }) => ({
  organizations: many(organizations),
}));

export const organization_user_relations = relations(
  organizations,
  ({ many }) => ({
    users: many(users),
  })
);

export const users_to_organizations_relations = relations(
  users_to_organizations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [users_to_organizations.organization_id],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [users_to_organizations.user_id],
      references: [users.id],
    }),
  })
);
