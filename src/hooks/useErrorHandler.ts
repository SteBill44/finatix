import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { parseError, getErrorTitle, getErrorVariant, AppError } from "@/lib/errorHandling";
import { useAuth } from "@/contexts/AuthContext";

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  onError?: (error: AppError) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { showToast = true, redirectOnAuth = true, onError } = options;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleError = useCallback(
    async (error: unknown): Promise<AppError> => {
      const parsedError = parseError(error);

      // Handle auth errors with redirect
      if (parsedError.type === "auth" && redirectOnAuth) {
        if (
          parsedError.message.includes("session has expired") ||
          parsedError.message.includes("sign in again")
        ) {
          await signOut();
          navigate("/auth");
        }
      }

      // Show toast notification
      if (showToast) {
        toast({
          title: getErrorTitle(parsedError.type),
          description: parsedError.message,
          variant: getErrorVariant(parsedError.type),
        });
      }

      // Call custom error handler
      if (onError) {
        onError(parsedError);
      }

      return parsedError;
    },
    [toast, navigate, signOut, showToast, redirectOnAuth, onError]
  );

  return { handleError, parseError };
}

// Wrapper for async operations with automatic error handling
export function useAsyncHandler() {
  const { handleError } = useErrorHandler();

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void;
        onError?: (error: AppError) => void;
        showSuccessToast?: boolean;
        successMessage?: string;
      }
    ): Promise<T | null> => {
      try {
        const result = await asyncFn();
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (error) {
        const parsedError = await handleError(error);
        if (options?.onError) {
          options.onError(parsedError);
        }
        return null;
      }
    },
    [handleError]
  );

  return { execute };
}
