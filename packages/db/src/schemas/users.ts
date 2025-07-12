import { boolean, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { lifecycleDates } from './utils';

export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    imageUrl: text('image_url'),
    bio: text('bio'),
    isVerified: boolean('is_verified').default(false).notNull(),
    ...lifecycleDates,
  },
  (user) => [
    index('email_idx').on(user.email),
    index('username_idx').on(user.username),
    index('name_idx').on(user.name),
  ]
);
