import { UserPayload } from '../types';

/**
 * Checks if an object is empty or null.
 *
 * @param obj - The object to check.
 * @returns True if the object is empty or null, false otherwise.
 */
export function isObjectEmptyOrNull(obj: any): boolean {
  if (obj === null || obj === undefined) {
    return true;
  }

  if (obj instanceof RegExp) {
    return false;
  }

  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.every(isObjectEmptyOrNull);
    }

    return Object.keys(obj).length === 0 || Object.values(obj).every(isObjectEmptyOrNull);
  }

  return false;
}

/**
 * Removes empty properties from an object.
 *
 * @param obj - The object to clean.
 * @returns The cleaned object or undefined if it is empty.
 */
export function removeEmptyProperties(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (obj instanceof RegExp) {
    return obj;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      const cleanedArray = obj.map(removeEmptyProperties).filter((item) => item !== undefined);
      return cleanedArray.length > 0 ? cleanedArray : undefined;
    }
    const cleanedObject: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeEmptyProperties(value);
      if (cleanedValue !== undefined) {
        cleanedObject[key] = cleanedValue;
      }
    }
    return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
  }

  return obj;
}

/**
 * Check if the payload is void
 *
 * @param content - The payload to check
 * @param modelName - The name of the model
 * @param action - The action to check
 */
export function checkVoidPayload(content: any, modelName: string, action: string): void {
  if (!content || Object.keys(content).length === 0) {
    throw new Error(`No information provided to ${action} ${modelName}`);
  }
}

/**
 * Check if the instance is void
 *
 * @param instance - The instance to check
 * @param modelName - The name of the model
 */
export function checkVoidInstance(instance: any, modelName: string, id: string): void {
  if (!instance) {
    throw new Error(`${modelName} not found with id ${id}`);
  }
}

/**
 * Check if the user is void
 *
 * @param user - The user to check
 * @param modelName - The name of the model
 * @param action - The action to check
 */
export function checkVoidUser(
  user: UserPayload | undefined,
  modelName: string,
  action: string,
): void {
  if (!user || Object.keys(user).length === 0) {
    throw new Error(`User not authenticated to ${action} ${modelName}`);
  }
}

/**
 * Calculate the last month
 *
 * @param year - The year
 * @param month - The month
 * @returns The last month
 */
export function calculateLastMonth(year: number, month: number): { year: number, month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }

  return { year, month: month - 1 };
}

/**
   * Parses a date to a Date object.
   *
   * @remarks
   * This is necessary because the date can be passed as a string in the request body.
   *
   * @param date - The date to parse.
   * @returns The parsed date.
   */
export function parseDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}
