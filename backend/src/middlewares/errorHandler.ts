import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod validation errors with clear 400 status
  if (err instanceof ZodError || err.name === "ZodError") {
    const firstIssue = err.issues?.[0] || err.errors?.[0];
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: firstIssue?.message || "Validation failed",
      errors: err.issues || err.errors
    });
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === "P2002") {
    return res.status(StatusCodes.CONFLICT).json({
      message: "A record with this information already exists",
      target: err.meta?.target
    });
  }

  console.error("Error:", err.message);
  if (process.env.NODE_ENV !== "test") {
    console.error("Stack:", err.stack);
  }

  const statusCode =
    res.statusCode >= StatusCodes.BAD_REQUEST
      ? res.statusCode
      : StatusCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? "" : err.stack
  });
};
