/**
 * Checks if an object is empty or null.
 *
 * @param obj - The object to check.
 * @returns True if the object is empty or null, false otherwise.
 */
export function isObjectEmptyOrNull(obj: any): boolean {
  console.log(obj);
  if (obj === null || obj === undefined) {
    return true;
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
    } else {
      const cleanedObject: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = removeEmptyProperties(value);
        if (cleanedValue !== undefined) {
          cleanedObject[key] = cleanedValue;
        }
      }
      return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
    }
  }

  return obj;
}
