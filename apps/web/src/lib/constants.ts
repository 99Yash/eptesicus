import { authOptionsSchema } from '@workspace/db/helpers';
import { z } from 'zod';

export const LOCAL_STORAGE_SCHEMAS = {
  LAST_AUTH_METHOD: authOptionsSchema,
} as const;

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_SCHEMAS;

export type LocalStorageValue<K extends LocalStorageKey> = z.infer<
  (typeof LOCAL_STORAGE_SCHEMAS)[K]
>;
