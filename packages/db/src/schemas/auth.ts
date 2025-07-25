import {
  index,
  integer,
  pgTable,
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
    user_id: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    code: integer('code')
      .$defaultFn(() => parseInt(generateRandomCode(8))) // TODO: use 8 as a constant
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

export type EmailVerificationCode =
  typeof email_verification_codes.$inferSelect;
