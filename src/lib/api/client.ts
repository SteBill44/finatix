/**
 * Centralized API Client
 * Provides a unified interface for all Supabase operations with:
 * - Automatic performance tracking
 * - Error handling and normalization
 * - Type-safe query builders
 * - Optimistic update helpers
 */

import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Re-export supabase for direct access when needed
export { supabase };

// Global API logger (set by PerformanceProvider)
type LogApiCall = (endpoint: string, durationMs: number, success: boolean) => void;
let globalLogApiCall: LogApiCall | null = null;

export function setApiLogger(logger: LogApiCall) {
  globalLogApiCall = logger;
}

// Error types for consistent error handling
export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(message: string, code: string = "UNKNOWN", status: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromPostgrestError(error: PostgrestError): ApiError {
    return new ApiError(
      error.message,
      error.code,
      parseInt(error.code) || 500,
      error.details
    );
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof Error) {
      return new ApiError(error.message, "UNKNOWN", 500);
    }
    return new ApiError(String(error), "UNKNOWN", 500);
  }
}

// Result type for consistent return values
export type ApiResult<T> = 
  | { data: T; error: null }
  | { data: null; error: ApiError };

/**
 * Execute a tracked database operation
 */
export async function tracked<T>(
  operationName: string,
  operation: () => PromiseLike<{ data: T | null; error: PostgrestError | null }>
): Promise<ApiResult<T>> {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    if (result.error) {
      globalLogApiCall?.(operationName, duration, false);
      return { data: null, error: ApiError.fromPostgrestError(result.error) };
    }
    
    globalLogApiCall?.(operationName, duration, true);
    return { data: result.data as T, error: null };
  } catch (error) {
    const duration = performance.now() - start;
    globalLogApiCall?.(operationName, duration, false);
    return { data: null, error: ApiError.fromUnknown(error) };
  }
}

/**
 * Execute a tracked async operation (non-Supabase)
 */
export async function trackedAsync<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    globalLogApiCall?.(operationName, duration, true);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    globalLogApiCall?.(operationName, duration, false);
    throw error;
  }
}

// Table type helpers
type Tables = Database["public"]["Tables"];
type TableName = keyof Tables;

/**
 * Type-safe table accessor
 */
export function from<T extends TableName>(table: T) {
  return supabase.from(table);
}

/**
 * RPC call with tracking
 */
export async function rpc<T = unknown>(
  fnName: string,
  params?: Record<string, unknown>
): Promise<ApiResult<T>> {
  return tracked(`rpc:${fnName}`, () => 
    supabase.rpc(fnName as any, params as any)
  );
}

/**
 * Auth helpers
 */
export const auth = {
  getUser: () => supabase.auth.getUser(),
  getSession: () => supabase.auth.getSession(),
  signIn: (email: string, password: string) => 
    trackedAsync("auth:signIn", () => 
      supabase.auth.signInWithPassword({ email, password })
    ),
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) =>
    trackedAsync("auth:signUp", () =>
      supabase.auth.signUp({ email, password, options: { data: metadata } })
    ),
  signOut: () => trackedAsync("auth:signOut", () => supabase.auth.signOut()),
  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
};

/**
 * Storage helpers
 */
export const storage = {
  from: (bucket: string) => supabase.storage.from(bucket),
  upload: async (bucket: string, path: string, file: File) =>
    trackedAsync(`storage:upload:${bucket}`, () =>
      supabase.storage.from(bucket).upload(path, file)
    ),
  download: async (bucket: string, path: string) =>
    trackedAsync(`storage:download:${bucket}`, () =>
      supabase.storage.from(bucket).download(path)
    ),
  getPublicUrl: (bucket: string, path: string) =>
    supabase.storage.from(bucket).getPublicUrl(path),
};

/**
 * Realtime subscription helper
 */
export function subscribe(
  channelName: string,
  table: string,
  callback: (payload: unknown) => void,
  filter?: string
) {
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
