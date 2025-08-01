import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { createId, lifecycle_dates } from '../helpers/utils';

export const auth_providers = pgEnum('auth_providers', [
  'EMAIL',
  'GOOGLE',
  'GITHUB',
]);

export const users = pgTable(
  'users',
  {
    id: varchar('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    image_url: text('image_url'),
    bio: text('bio'),
    auth_provider: auth_providers('auth_provider').notNull(),
    ...lifecycle_dates,
  },
  (user) => [
    index('email_idx').on(user.email),
    index('username_idx').on(user.username),
    index('name_idx').on(user.name),
  ]
);

export const organizations = pgTable('organizations', {
  id: varchar('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logo_url: text('logo_url'),
  bio: text('bio'),
  ...lifecycle_dates,
});

export const users_to_organizations = pgTable('users_to_organizations', {
  user_id: varchar('user_id').references(() => users.id),
  organization_id: varchar('organization_id').references(
    () => organizations.id
  ),
  ...lifecycle_dates,
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

export const organizationInsertSchema = createInsertSchema(organizations, {
  name: (schema) => schema.max(255),
});

export type OrganizationInsertType = z.infer<typeof organizationInsertSchema>;
