import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "INVALID_STATE"
  | "BUSINESS_RULE_VIOLATION"
  | "SERVER_ERROR";

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    {
      error: {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

export const ErrorCodes = {
  VALIDATION_ERROR: (message: string, details?: Record<string, unknown>) =>
    new ApiError("VALIDATION_ERROR", 400, message, details),
  UNAUTHORIZED: (message = "Unauthorized") =>
    new ApiError("UNAUTHORIZED", 401, message),
  FORBIDDEN: (message = "Forbidden") =>
    new ApiError("FORBIDDEN", 403, message),
  NOT_FOUND: (message = "Not found") =>
    new ApiError("NOT_FOUND", 404, message),
  CONFLICT: (message: string) =>
    new ApiError("CONFLICT", 409, message),
  RATE_LIMITED: (message = "Rate limit exceeded") =>
    new ApiError("RATE_LIMITED", 429, message),
  DATABASE_ERROR: (message = "Database error") =>
    new ApiError("DATABASE_ERROR", 500, message),
  EXTERNAL_SERVICE_ERROR: (message = "External service error") =>
    new ApiError("EXTERNAL_SERVICE_ERROR", 502, message),
  INVALID_STATE: (message: string) =>
    new ApiError("INVALID_STATE", 400, message),
  BUSINESS_RULE_VIOLATION: (message: string) =>
    new ApiError("BUSINESS_RULE_VIOLATION", 422, message),
};

