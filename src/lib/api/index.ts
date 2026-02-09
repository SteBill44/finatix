/**
 * API Module - Central export point
 * Import everything from here for clean imports:
 * 
 * import { api, queries, queryKeys } from "@/lib/api";
 */

export * from "./client";
export * as queries from "./queries";
export { queryKeys } from "./queries";

// Convenience re-export
import { tracked, trackedAsync, from, rpc, auth, storage, subscribe, setApiLogger } from "./client";

export const api = {
  tracked,
  trackedAsync,
  from,
  rpc,
  auth,
  storage,
  subscribe,
  setApiLogger,
};
