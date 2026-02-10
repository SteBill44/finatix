import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { from, rpc } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

export const CREDITS_TO_DISCOUNT_RATE = 10;
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
      const result = await rpc('get_or_create_referral_code', { p_user_id: user.id });
      if (result.error) throw result.error;
      return result.data as string;
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
      const result = await rpc('get_referral_stats', { p_user_id: user.id });
      if (result.error) throw result.error;
      return result.data as unknown as ReferralStats;
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
      const { data, error } = await from('referrals')
        .select(`id, referred_id, status, created_at, completed_at`)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const referralsWithProfiles = await Promise.all(
        (data || []).map(async (referral) => {
          const { data: profile } = await from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', referral.referred_id)
            .single();
          return { ...referral, profiles: profile || { full_name: null, avatar_url: null } };
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
      const result = await rpc('apply_referral_code', { p_referred_id: user.id, p_code: code.toUpperCase() });
      if (result.error) throw result.error;
      const data = result.data as { success: boolean; error?: string; referral_id?: string };
      if (!data.success) throw new Error(data.error || 'Failed to apply referral code');
      return data;
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
      const result = await rpc('complete_referral', { p_referred_id: user.id });
      if (result.error) throw result.error;
      return result.data;
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
