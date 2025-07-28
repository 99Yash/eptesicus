import { AxiosError } from 'axios';
import z from 'zod';
import { LOCAL_STORAGE_KEYS } from './constants';

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
 * Stores a value in localStorage under the given key.
 * The value is automatically JSON.stringify-ed.
 *
 * @param key The key to store the value under.
 * @param value The value to store. Can be any JSON-serializable type.
 */
export function setLocalStorageItem<T>(
  key: (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS],
  value: T
): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting localStorage item for key "${key}":`, error);
  }
}

/**
 * Retrieves a value from localStorage under the given key, with runtime validation.
 * The value is automatically JSON.parse-d and then validated against the provided Zod schema.
 *
 * @param key The key to retrieve the value from.
 * @param schema A Zod schema to validate the retrieved data against.
 * @param defaultValue An optional default value to return if the key doesn't exist, parsing fails, or validation fails.
 * @returns The validated value, the default value, or undefined if not found/invalid and no default is provided.
 */
export function getLocalStorageItem<T>(
  key: (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS],
  schema: z.ZodType<T>, // Accept a Zod schema
  defaultValue?: T
): T | undefined {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue; // Key not found
    }

    const parsedValue: unknown = JSON.parse(serializedValue);

    // --- Core Protection: Zod Validation ---
    const validationResult = schema.safeParse(parsedValue);

    if (validationResult.success) {
      return validationResult.data; // Data is valid and typed as T
    } else {
      // Log the validation error for debugging
      console.warn(
        `Validation error for localStorage item "${key}":`,
        validationResult.error.errors
      );
      return defaultValue; // Return default if validation fails
    }
  } catch (error) {
    // This catch block handles JSON.parse errors or other unexpected issues
    console.error(
      `Error getting or parsing localStorage item for key "${key}":`,
      error
    );
    return defaultValue; // Return default on parsing or other errors
  }
}

/**
 * Removes an item from localStorage under the given key.
 *
 * @param key The key of the item to remove.
 */
export function removeLocalStorageItem(
  key: (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS]
): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item for key "${key}":`, error);
  }
}
