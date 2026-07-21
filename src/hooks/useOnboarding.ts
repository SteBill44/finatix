import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { from } from "@/lib/api/client";

const storageKey = (userId: string) => `finatix-onboarding-completed:${userId}`;

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setShowOnboarding(false);
        setIsLoading(false);
        return;
      }

      // Local flag is authoritative to guarantee the tour only shows once per user.
      if (localStorage.getItem(storageKey(user.id)) === "true") {
        setShowOnboarding(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.onboarding_completed === true) {
          localStorage.setItem(storageKey(user.id), "true");
          setShowOnboarding(false);
        } else {
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

    // Persist locally first so the tour never re-appears, even if the DB write fails.
    localStorage.setItem(storageKey(user.id), "true");
    setShowOnboarding(false);

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
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return { showOnboarding, isLoading, completeOnboarding };
}
