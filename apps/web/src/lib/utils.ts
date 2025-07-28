import { AxiosError } from 'axios';
import z from 'zod';
import {
  LOCAL_STORAGE_SCHEMAS,
  LocalStorageKey,
  LocalStorageValue,
} from './constants';

export const unknownError = 'Something went wrong. Please try again.';
export function getErrorMessage(err: unknown) {
  if (typeof err === 'string') {
    return err;
  } else if (err instanceof z.ZodError) {
    return err.errors.map((e) => e.message).join(', ') ?? unknownError;
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
        validationResult.error.errors
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
  try {
    const serializedValue = localStorage.getItem(key);
    const schema = LOCAL_STORAGE_SCHEMAS[key]; // Retrieve schema based on the key

    if (serializedValue === null) {
      // If the item doesn't exist, try to get a default from the schema itself,
      // then fallback to the provided `defaultValue`.
      // This allows Zod's .default() to provide a fallback even if localStorage is empty.
      const defaultSchemaValue = schema.safeParse(undefined).success
        ? schema.parse(undefined) // This will trigger Zod's default if present
        : undefined;
      return defaultValue ?? defaultSchemaValue;
    }

    const parsedValue: unknown = JSON.parse(serializedValue);

    // --- Core Protection: Zod Validation ---
    const validationResult = schema.safeParse(parsedValue);

    if (validationResult.success) {
      return validationResult.data as LocalStorageValue<K>; // Data is valid and precisely typed
    } else {
      // Log the validation error for debugging purposes
      console.warn(
        `[LocalStorageValidation] Stored data for key "${key}" is invalid. ` +
          `Returning default value (if provided) or schema default.`,
        `Stored value:`,
        parsedValue,
        `Errors:`,
        validationResult.error.errors
      );
      // If validation fails, attempt to get schema default, then provided default
      const defaultSchemaValue = schema.safeParse(undefined).success
        ? schema.parse(undefined)
        : undefined;
      return defaultValue ?? defaultSchemaValue;
    }
  } catch (error) {
    // This catch block handles JSON.parse errors or other unexpected issues
    console.error(
      `[LocalStorageError] Failed to get or parse item for key "${key}":`,
      error
    );
    return defaultValue; // Return default on parsing or other errors
  }
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
