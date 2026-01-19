import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Discount configuration - 10% per credit, max 50%
export const CREDITS_TO_DISCOUNT_RATE = 10; // 10% per credit
export const MAX_DISCOUNT_PERCENT = 50;

export function calculateDiscount(credits: number): number {
  return Math.min(credits * CREDITS_TO_DISCOUNT_RATE, MAX_DISCOUNT_PERCENT);
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalCredits: number;
  referralCode: string | null;
}

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useReferralCode() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['referral-code', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_or_create_referral_code', { p_user_id: user.id });
      
      if (error) throw error;
      return data as string;
    },
    enabled: !!user?.id,
  });
}

export function useReferralStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_referral_stats', { p_user_id: user.id });
      
      if (error) throw error;
      return data as unknown as ReferralStats;
    },
    enabled: !!user?.id,
  });
}

export function useMyReferrals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          status,
          created_at,
          completed_at
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profile info for each referred user
      const referralsWithProfiles = await Promise.all(
        (data || []).map(async (referral) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', referral.referred_id)
            .single();
          
          return {
            ...referral,
            profiles: profile || { full_name: null, avatar_url: null }
          };
        })
      );
      
      return referralsWithProfiles as Referral[];
    },
    enabled: !!user?.id,
  });
}

export function useApplyReferralCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .rpc('apply_referral_code', { 
          p_referred_id: user.id, 
          p_code: code.toUpperCase() 
        });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; referral_id?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to apply referral code');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
    },
  });
}

export function useCompleteReferral() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .rpc('complete_referral', { p_referred_id: user.id });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-referrals'] });
    },
  });
}

export function useReferralDiscount() {
  const { data: stats, isLoading } = useReferralStats();
  
  return {
    credits: stats?.totalCredits || 0,
    discountPercent: calculateDiscount(stats?.totalCredits || 0),
    maxDiscount: MAX_DISCOUNT_PERCENT,
    isLoading,
  };
}
