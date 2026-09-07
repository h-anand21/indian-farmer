import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Zod Validation Middleware Factory
 * Validates request body, query, or params against a Zod schema.
 *
 * Usage:
 *   router.post("/booking", validate(createBookingSchema), handler);
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      throw result.error; // Caught by errorHandler middleware
    }

    // Replace with parsed (coerced) data
    req[source] = result.data;
    next();
  };
}
