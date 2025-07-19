// @see https://github.com/unkeyed/unkey/blob/main/internal/db/src/schema/util/lifecycle_dates.ts

import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';
import { customAlphabet } from 'nanoid';

export const lifecycle_dates = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
};

export function createId(
  prefix?: string,
  { length = 12, separator = '_' } = {}
) {
  const id = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length)();
  return prefix ? `${prefix}${separator}${id}` : id;
}
