/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from '../mcp/bundle.js';

import type { z as zodTypes } from 'zod';

/**
 * Preprocesses MCP tool arguments to convert string representations of numbers to actual numbers
 * before Zod validation. This handles cases where MCP clients send numbers as strings.
 *
 * @param args - The raw arguments object from MCP client
 * @param schema - The Zod schema to extract number field information from
 * @returns Preprocessed arguments with string numbers converted to actual numbers
 */
export function preprocessMcpArguments(args: Record<string, any>, schema: zodTypes.ZodSchema): Record<string, any> {
  if (!args || typeof args !== 'object')
    return args;


  // Clone the arguments to avoid mutating the original
  const processedArgs = { ...args };

  // Extract number fields from the schema
  const numberFields = extractNumberFields(schema);

  // Convert string representations of numbers to actual numbers
  for (const field of numberFields) {
    if (field in processedArgs && typeof processedArgs[field] === 'string') {
      const stringValue = processedArgs[field];
      const numericValue = parseFloat(stringValue);

      // Only convert if it's a valid number and the string represents a clean number
      if (!isNaN(numericValue) && isFinite(numericValue) && stringValue.trim() === numericValue.toString())
        processedArgs[field] = numericValue;

    }
  }

  return processedArgs;
}

/**
 * Extracts field names that are expected to be numbers from a Zod schema
 */
function extractNumberFields(schema: zodTypes.ZodSchema): string[] {
  const numberFields: string[] = [];

  try {
    // Handle different Zod schema types
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      for (const [key, fieldSchema] of Object.entries(shape)) {
        if (isNumberSchema(fieldSchema as zodTypes.ZodSchema))
          numberFields.push(key);

      }
    }
  } catch (error) {
    // If we can't extract the schema info, just return empty array
    // This is a fallback to avoid breaking existing functionality
  }

  return numberFields;
}

/**
 * Checks if a Zod schema represents a number type (including optional numbers)
 */
function isNumberSchema(schema: zodTypes.ZodSchema): boolean {
  try {
    // Handle ZodNumber directly
    if (schema instanceof z.ZodNumber)
      return true;


    // Handle ZodOptional containing ZodNumber
    if (schema instanceof z.ZodOptional)
      return isNumberSchema(schema._def.innerType);


    // Handle ZodDefault containing ZodNumber
    if (schema instanceof z.ZodDefault)
      return isNumberSchema(schema._def.innerType);


    // Handle ZodNullable containing ZodNumber
    if (schema instanceof z.ZodNullable)
      return isNumberSchema(schema._def.innerType);


    return false;
  } catch (error) {
    return false;
  }
}
