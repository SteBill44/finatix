import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { from, tracked } from "@/lib/api/client";
import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_values: Json | null;
  new_values: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface CreateAuditLogParams {
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  old_values?: Json;
  new_values?: Json;
}

export function useAuditLogs(options?: { limit?: number; entityType?: string }) {
  const limit = options?.limit ?? 50;
  const entityType = options?.entityType;

  return useQuery<AuditLogEntry[]>({
    queryKey: ["admin-audit-logs", limit, entityType],
    queryFn: async () => {
      let query = from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (entityType) query = query.eq("entity_type", entityType);

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    staleTime: 1000 * 30,
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateAuditLogParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const result = await tracked("audit:create", () =>
        from("admin_audit_logs").insert([{
          admin_user_id: user.id,
          action: params.action,
          entity_type: params.entity_type,
          entity_id: params.entity_id || null,
          entity_name: params.entity_name || null,
          old_values: params.old_values || null,
          new_values: params.new_values || null,
          user_agent: navigator.userAgent,
        }])
      );
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });
}

export function useLoggedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  auditOptions: {
    action: "create" | "update" | "delete";
    entity_type: string;
    getEntityName?: (variables: TVariables) => string;
    getEntityId?: (variables: TVariables, data: TData) => string;
    getOldValues?: (variables: TVariables) => Json;
    getNewValues?: (variables: TVariables) => Json;
  }
) {
  const queryClient = useQueryClient();
  const createAuditLog = useCreateAuditLog();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const result = await mutationFn(variables);
      await createAuditLog.mutateAsync({
        action: auditOptions.action,
        entity_type: auditOptions.entity_type,
        entity_id: auditOptions.getEntityId?.(variables, result),
        entity_name: auditOptions.getEntityName?.(variables),
        old_values: auditOptions.getOldValues?.(variables),
        new_values: auditOptions.getNewValues?.(variables),
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
  });
}
