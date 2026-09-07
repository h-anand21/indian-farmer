import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 * Handles Zod validation errors with field-level detail.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("❌ Error:", err);

  // Zod validation errors → 400 with field details
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation Error",
      details: err.issues.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma known request errors
  if (err.name === "PrismaClientKnownRequestError") {
    res.status(409).json({
      success: false,
      error: "Database Conflict",
      message: "A database constraint was violated. The record may already exist.",
    });
    return;
  }

  // Generic server error
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
