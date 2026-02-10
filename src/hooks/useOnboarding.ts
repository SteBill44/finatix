import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { from } from "@/lib/api/client";

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!profile || profile.onboarding_completed !== true) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { data: existingProfile } = await from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        await from("profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", user.id);
      } else {
        await from("profiles").insert({
          user_id: user.id,
          onboarding_completed: true,
        });
      }

      setShowOnboarding(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return { showOnboarding, isLoading, completeOnboarding };
}
