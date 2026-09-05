import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { toast } from "sonner";

export interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

export const useSubscription = () => {
  const { user } = useAuth();
  const environment = isPaymentsConfigured() ? getStripeEnvironment() : null;

  const query = useQuery({
    queryKey: ["subscription", user?.id, environment],
    queryFn: async () => {
      if (!user || !environment) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, status, price_id, current_period_end, cancel_at_period_end")
        .eq("user_id", user.id)
        .eq("environment", environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SubscriptionRow) ?? null;
    },
    enabled: !!user && !!environment,
  });

  const sub = query.data ?? null;
  const periodInFuture = !sub?.current_period_end ||
    new Date(sub.current_period_end).getTime() > Date.now();

  // Cancelled members keep access until the end of the period they paid for
  const isActive = Boolean(
    sub &&
      ((ACTIVE_STATUSES.includes(sub.status) && periodInFuture) ||
        (sub.status === "canceled" && sub.current_period_end &&
          new Date(sub.current_period_end).getTime() > Date.now())),
  );

  const portal = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: window.location.href,
        },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || data?.error || "Could not open billing settings");
      }
      return data.url as string;
    },
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    subscription: sub,
    isActive,
    isPastDue: sub?.status === "past_due",
    isLoading: query.isLoading,
    openBillingPortal: portal.mutate,
    isOpeningPortal: portal.isPending,
  };
};

export default useSubscription;
