/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Format error message for display to users
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Hide technical error messages in production
    if (process.env.NODE_ENV === "production") {
      return "An unexpected error occurred. Please try again.";
    }
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Get user-friendly error message from API response
 */
export async function getErrorMessageFromResponse(
  response: Response
): Promise<string> {
  try {
    const data = await response.json();
    if (data.error) {
      return data.error;
    }
    if (data.message) {
      return data.message;
    }
  } catch {
    // If response is not JSON, continue with status-based message
  }

  // Fallback to status-based messages
  switch (response.status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "You are not authorized to perform this action.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This resource already exists.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "A server error occurred. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Handle API errors consistently
 */
export async function handleApiError(response: Response): Promise<never> {
  const errorMessage = await getErrorMessageFromResponse(response);
  throw new AppError(errorMessage, undefined, response.status);
}
