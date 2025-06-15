import { z } from 'zod';
import { Result, success, failure } from '../../types/result.js';

/**
 * Validates data using a Zod schema and returns a Result
 * Follows the principle: "Validate all external data at boundaries"
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Result<T, z.ZodError> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return success(result.data);
  } else {
    return failure(result.error);
  }
}

/**
 * Validates JSON string and parses it with a schema
 */
export function validateJsonWithSchema<T>(
  schema: z.ZodSchema<T>,
  jsonString: string
): Result<T, Error> {
  try {
    const parsed = JSON.parse(jsonString);
    const validation = validateWithSchema(schema, parsed);
    
    if (validation.success) {
      return success(validation.data);
    } else {
      return failure(new Error(`Validation failed: ${validation.error.message}`));
    }
  } catch (error) {
    return failure(new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`));
  }
}

/**
 * Creates a validation middleware for request bodies
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): Result<T, Error> => {
    const validation = validateWithSchema(schema, data);
    
    if (validation.success) {
      return success(validation.data);
    } else {
      const errorMessage = validation.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      return failure(new Error(`Validation failed: ${errorMessage}`));
    }
  };
} 