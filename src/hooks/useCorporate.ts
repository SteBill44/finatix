import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CorporateAccount {
  id: string;
  company_name: string;
  contact_email: string;
  contact_name: string | null;
  phone: string | null;
  employee_count: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Get all corporate accounts (admin only)
export const useCorporateAccounts = () => {
  return useQuery({
    queryKey: ["corporate-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CorporateAccount[];
    },
  });
};

// Submit a corporate inquiry (public)
export const useSubmitCorporateInquiry = () => {
  return useMutation({
    mutationFn: async (data: {
      company_name: string;
      contact_email: string;
      contact_name?: string;
      phone?: string;
      employee_count?: number;
      notes?: string;
    }) => {
      const { data: account, error } = await supabase
        .from("corporate_accounts")
        .insert({
          ...data,
          status: "inquiry",
        })
        .select()
        .single();
      
      if (error) throw error;
      return account;
    },
  });
};

// Update corporate account (admin only)
export const useUpdateCorporateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      status?: string;
      notes?: string;
      contact_name?: string;
      phone?: string;
      employee_count?: number;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from("corporate_accounts")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-accounts"] });
    },
  });
};

// Delete corporate account (admin only)
export const useDeleteCorporateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("corporate_accounts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-accounts"] });
    },
  });
};
