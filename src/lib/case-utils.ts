/**
 * Convert snake_case keys to camelCase
 */
export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

/**
 * Convert camelCase keys to snake_case
 */
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = obj[key]; // Don't recurse into values
  }
  return result;
}
