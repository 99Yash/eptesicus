import { AxiosError } from 'axios';
import z from 'zod/v4';
import {
  LOCAL_STORAGE_SCHEMAS,
  LocalStorageKey,
  LocalStorageValue,
  SESSION_STORAGE_SCHEMAS,
  SessionStorageKey,
  SessionStorageValue,
} from './constants';

export const unknownError = 'Something went wrong. Please try again.';
export function getErrorMessage(err: unknown) {
  if (typeof err === 'string') {
    return err;
  } else if (err instanceof z.ZodError) {
    return err.issues.map((e) => e.message).join(', ') ?? unknownError;
  } else if (err instanceof AxiosError) {
    return err.response?.data.message ?? unknownError;
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

/**
 * Sets an item in localStorage, automatically serializing the value.
 * The value's type is strictly enforced by the schema associated with the key,
 * which is inferred directly from the `key` parameter.
 *
 * @param key The key under which to store the value. Must be one of `LOCAL_STORAGE_KEYS`.
 * @param value The value to store. Its type is inferred from the schema defined for the key.
 */
export function setLocalStorageItem<K extends LocalStorageKey>(
  key: K,
  value: LocalStorageValue<K>
): void {
  try {
    const schema = LOCAL_STORAGE_SCHEMAS[key];

    // Optional but recommended: Validate the value against its schema before storing.
    // This catches potential type mismatches or invalid data that might slip through
    // if `value` was casted or incorrectly typed higher up the call stack.
    const validationResult = schema.safeParse(value);

    if (!validationResult.success) {
      console.error(
        `[LocalStorageError] Type mismatch or invalid value for key "${key}". ` +
          `Provided value does not conform to its schema.`,
        `Schema:`,
        schema.toString(), // Zod schema string representation
        `Value:`,
        value,
        `Errors:`,
        validationResult.error.issues
      );
      // Depending on strictness, you might throw an error here, or just log and return.
      // For localStorage, it's often better to prevent storing bad data.
      return;
    }

    // Store the validated data to ensure defaults are applied if schema has them
    // and to strip extra properties if the schema is strict.
    const serializedValue = JSON.stringify(validationResult.data);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(
      `[LocalStorageError] Failed to set item for key "${key}":`,
      error
    );
  }
}

/**
 * Retrieves a value from localStorage under the given key, with runtime validation
 * against the pre-defined Zod schema for that key. The schema is inferred
 * directly from the `key` parameter.
 *
 * @param key The key to retrieve the value from. Must be one of `LOCAL_STORAGE_KEYS`.
 * @param defaultValue An optional default value to return if the key doesn't exist,
 *                     parsing fails, or validation fails. Its type is also strictly
 *                     enforced to match the inferred type for the key.
 * @returns The validated value, the provided default value, or `undefined` if
 *          not found/invalid and no default is provided.
 */
export function getLocalStorageItem<K extends LocalStorageKey>(
  key: K,
  defaultValue?: LocalStorageValue<K>
): LocalStorageValue<K> | undefined {
  const schema = LOCAL_STORAGE_SCHEMAS[key];

  // Try to get the stored value
  const serializedValue = localStorage.getItem(key);

  // If no stored value, try to use default or schema default
  if (serializedValue === null) {
    // Validate provided default against schema
    if (defaultValue !== undefined) {
      const defaultResult = schema.safeParse(defaultValue);
      if (defaultResult.success) {
        return defaultResult.data;
      }
      console.error(
        `[LocalStorageError] Default value for key "${key}" does not conform to schema:`,
        defaultResult.error.issues
      );
    }

    // Try schema default as fallback
    const schemaDefaultResult = schema.safeParse(undefined);
    return schemaDefaultResult.success ? schemaDefaultResult.data : undefined;
  }

  // Parse the stored value
  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(serializedValue);
  } catch (error) {
    console.error(
      `[LocalStorageError] Failed to parse stored value for key "${key}":`,
      error
    );
    return getLocalStorageItem(key, defaultValue); // Recursively try with default
  }

  // Validate the parsed value against schema
  const validationResult = schema.safeParse(parsedValue);

  if (validationResult.success) {
    return validationResult.data;
  }

  // Validation failed, log warning and try fallbacks
  console.warn(
    `[LocalStorageValidation] Stored data for key "${key}" is invalid:`,
    validationResult.error.issues
  );

  // Try provided default
  if (defaultValue !== undefined) {
    const defaultResult = schema.safeParse(defaultValue);
    if (defaultResult.success) {
      return defaultResult.data;
    }
    console.error(
      `[LocalStorageError] Default value for key "${key}" does not conform to schema:`,
      defaultResult.error.issues
    );
  }

  // Try schema default as last resort
  const schemaDefaultResult = schema.safeParse(undefined);
  return schemaDefaultResult.success ? schemaDefaultResult.data : undefined;
}

/**
 * Removes an item from localStorage under the given key.
 *
 * @param key The key of the item to remove. Must be one of `LOCAL_STORAGE_KEYS`.
 */
export function removeLocalStorageItem(key: LocalStorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `[LocalStorageError] Failed to remove item for key "${key}":`,
      error
    );
  }
}

/**
 * Sets an item in sessionStorage with schema validation, mirroring localStorage helpers.
 */
export function setSessionStorageItem<K extends SessionStorageKey>(
  key: K,
  value: SessionStorageValue<K>
): void {
  try {
    // SSR/edge-safe guard
    if (typeof window === 'undefined' || !('sessionStorage' in window)) {
      return;
    }

    const schema = SESSION_STORAGE_SCHEMAS[key];
    const validationResult = schema.safeParse(value);
    if (!validationResult.success) {
      console.error(
        `[SessionStorageError] Type mismatch or invalid value for key "${key}":`,
        validationResult.error.issues
      );
      return;
    }
    const serializedValue = JSON.stringify(validationResult.data);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.debug(
      `[SessionStorageError] Failed to set item for key "${key}":`,
      error
    );
  }
}

/**
 * Retrieves a sessionStorage value with runtime validation, mirroring localStorage helpers.
 */
export function getSessionStorageItem<K extends SessionStorageKey>(
  key: K,
  defaultValue?: SessionStorageValue<K>
): SessionStorageValue<K> | undefined {
  // SSR/edge-safe guard
  if (typeof window === 'undefined' || !('sessionStorage' in window)) {
    const schema = SESSION_STORAGE_SCHEMAS[key];
    const schemaDefaultResult = schema.safeParse(
      defaultValue === undefined ? undefined : defaultValue
    );
    return schemaDefaultResult.success ? schemaDefaultResult.data : undefined;
  }

  const schema = SESSION_STORAGE_SCHEMAS[key];
  let serializedValue: string | null = null;
  try {
    serializedValue = sessionStorage.getItem(key);
  } catch (error) {
    console.debug(
      `[SessionStorageError] Failed to read item for key "${key}":`,
      error
    );
  }

  if (serializedValue === null) {
    if (defaultValue !== undefined) {
      const defaultResult = schema.safeParse(defaultValue);
      if (defaultResult.success) return defaultResult.data;
      console.error(
        `[SessionStorageError] Default value for key "${key}" does not conform to schema:`,
        defaultResult.error.issues
      );
    }
    const schemaDefaultResult = schema.safeParse(undefined);
    return schemaDefaultResult.success ? schemaDefaultResult.data : undefined;
  }

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(serializedValue);
  } catch (error) {
    console.debug(
      `[SessionStorageError] Failed to parse stored value for key "${key}":`,
      error
    );
    return getSessionStorageItem(key, defaultValue);
  }

  const validationResult = schema.safeParse(parsedValue);
  if (validationResult.success) return validationResult.data;

  console.warn(
    `[SessionStorageValidation] Stored data for key "${key}" is invalid:`,
    validationResult.error.issues
  );

  if (defaultValue !== undefined) {
    const defaultResult = schema.safeParse(defaultValue);
    if (defaultResult.success) return defaultResult.data;
    console.error(
      `[SessionStorageError] Default value for key "${key}" does not conform to schema:`,
      defaultResult.error.issues
    );
  }

  const schemaDefaultResult = schema.safeParse(undefined);
  return schemaDefaultResult.success ? schemaDefaultResult.data : undefined;
}

/**
 * Removes an item from sessionStorage under the given key.
 */
export function removeSessionStorageItem(key: SessionStorageKey): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.debug(
      `[SessionStorageError] Failed to remove item for key "${key}":`,
      error
    );
  }
}
