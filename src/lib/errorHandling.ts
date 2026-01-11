// Centralized error handling utilities

export type ErrorType = 
  | "network"
  | "auth"
  | "validation"
  | "not_found"
  | "permission"
  | "rate_limit"
  | "server"
  | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  retryable: boolean;
}

// Parse Supabase/API errors into user-friendly messages
export function parseError(error: unknown): AppError {
  if (!error) {
    return {
      type: "unknown",
      message: "An unknown error occurred",
      retryable: true,
    };
  }

  // Handle Supabase/Postgres errors
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    const message = (err.message as string) || "";
    const code = (err.code as string) || "";
    const status = (err.status as number) || 0;

    // Network errors
    if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("net::")) {
      return {
        type: "network",
        message: "Unable to connect. Please check your internet connection and try again.",
        originalError: error,
        retryable: true,
      };
    }

    // Auth errors
    if (code === "invalid_credentials" || message.includes("Invalid login credentials")) {
      return {
        type: "auth",
        message: "Invalid email or password. Please check your credentials.",
        originalError: error,
        retryable: false,
      };
    }

    if (message.includes("User already registered") || code === "user_already_exists") {
      return {
        type: "auth",
        message: "An account with this email already exists. Please sign in instead.",
        originalError: error,
        retryable: false,
      };
    }

    if (message.includes("Email not confirmed")) {
      return {
        type: "auth",
        message: "Please confirm your email address before signing in.",
        originalError: error,
        retryable: false,
      };
    }

    if (message.includes("refresh_token_not_found") || message.includes("Invalid Refresh Token")) {
      return {
        type: "auth",
        message: "Your session has expired. Please sign in again.",
        originalError: error,
        retryable: false,
      };
    }

    if (message.includes("JWT expired") || message.includes("token is expired")) {
      return {
        type: "auth",
        message: "Your session has expired. Please sign in again.",
        originalError: error,
        retryable: false,
      };
    }

    // Permission errors
    if (code === "42501" || message.includes("row-level security") || status === 403) {
      return {
        type: "permission",
        message: "You don't have permission to perform this action.",
        originalError: error,
        retryable: false,
      };
    }

    // Not found
    if (status === 404 || code === "PGRST116") {
      return {
        type: "not_found",
        message: "The requested resource was not found.",
        originalError: error,
        retryable: false,
      };
    }

    // Rate limiting
    if (status === 429 || message.includes("rate limit")) {
      return {
        type: "rate_limit",
        message: "Too many requests. Please wait a moment and try again.",
        originalError: error,
        retryable: true,
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        type: "server",
        message: "Our servers are experiencing issues. Please try again later.",
        originalError: error,
        retryable: true,
      };
    }

    // Validation errors
    if (code === "23505" || message.includes("duplicate key")) {
      return {
        type: "validation",
        message: "This record already exists.",
        originalError: error,
        retryable: false,
      };
    }

    if (code === "23503" || message.includes("violates foreign key")) {
      return {
        type: "validation",
        message: "Invalid reference to related data.",
        originalError: error,
        retryable: false,
      };
    }

    // Generic error with message
    if (message) {
      return {
        type: "unknown",
        message: message.length > 150 ? `${message.substring(0, 150)}...` : message,
        originalError: error,
        retryable: true,
      };
    }
  }

  // String errors
  if (typeof error === "string") {
    return {
      type: "unknown",
      message: error,
      originalError: error,
      retryable: true,
    };
  }

  return {
    type: "unknown",
    message: "Something went wrong. Please try again.",
    originalError: error,
    retryable: true,
  };
}

// Get toast variant based on error type
export function getErrorVariant(type: ErrorType): "default" | "destructive" {
  switch (type) {
    case "network":
    case "server":
    case "rate_limit":
      return "destructive";
    default:
      return "destructive";
  }
}

// Get appropriate error title
export function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case "network":
      return "Connection Error";
    case "auth":
      return "Authentication Error";
    case "validation":
      return "Validation Error";
    case "not_found":
      return "Not Found";
    case "permission":
      return "Access Denied";
    case "rate_limit":
      return "Too Many Requests";
    case "server":
      return "Server Error";
    default:
      return "Error";
  }
}
