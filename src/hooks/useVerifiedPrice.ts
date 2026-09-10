import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VerifiedPrice {
  available: boolean;
  priceId: string;
  amount: number | null;
  currency: string;
  billingType: "one_time" | "subscription";
  interval: "day" | "week" | "month" | "year" | null;
  productName: string | null;
  courseCount: number;
  isMembership: boolean;
}

/**
 * Asks the server what this price really costs, so the order summary shows the
 * exact amount that will be charged instead of a figure carried in the link.
 * When a product isn't set up for sale, `available` comes back false and the
 * pay button is switched off.
 */
export function useVerifiedPrice(priceId?: string | null) {
  return useQuery({
    queryKey: ["verified-price", priceId],
    enabled: Boolean(priceId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<VerifiedPrice> => {
      const { data, error } = await supabase.functions.invoke("payments-catalogue", {
        body: { priceId },
      });
      if (error || !data) {
        throw new Error(error?.message || "Could not check this price");
      }
      if (data.error) throw new Error(data.error);
      return data as VerifiedPrice;
    },
  });
}

export default useVerifiedPrice;
