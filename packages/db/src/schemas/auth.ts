import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  createId,
  generateRandomCode,
  lifecycle_dates,
} from '../helpers/utils';
import { users } from './users';

export const email_verification_codes = pgTable(
  'email_verification_codes',
  {
    id: varchar('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    email: varchar('email', { length: 255 })
      .references(() => users.email)
      .unique()
      .notNull(),
    user_id: varchar('user_id').references(() => users.id),
    code: integer('code')
      .$defaultFn(() => parseInt(generateRandomCode(8)))
      .notNull(),
    expires_at: timestamp('expires_at')
      .$defaultFn(() => {
        return new Date(Date.now() + 60 * 60 * 1000);
      })
      .notNull(),
    ...lifecycle_dates,
  },
  (table) => [
    index('email_verification_codes_email_idx').on(table.email),
    index('email_verification_codes_user_id_idx').on(table.user_id),
  ]
);

// OAuth federated credentials table
export const federated_credentials = pgTable(
  'federated_credentials',
  {
    id: varchar('id')
      .$defaultFn(() => createId())
      .primaryKey(),
    user_id: varchar('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    provider: varchar('provider', { length: 50 }).notNull(), // 'google', 'github', etc.
    subject: text('subject').notNull(), // OAuth provider's user ID
    access_token: text('access_token'),
    refresh_token: text('refresh_token'),
    expires_at: timestamp('expires_at'),
    ...lifecycle_dates,
  },
  (table) => [
    index('federated_credentials_user_id_idx').on(table.user_id),
    index('federated_credentials_provider_subject_idx').on(
      table.provider,
      table.subject
    ),
  ]
);
