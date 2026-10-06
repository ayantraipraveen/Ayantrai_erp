import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Validates request body, query, and params against a Zod schema
 */
export const validate = (schema: AnyZodObject) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Assign sanitized / coerced fields back to request
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  });

export default validate;
