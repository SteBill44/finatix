import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { from } from "@/lib/api/client";

export function useFirstSignIn() {
  const { user } = useAuth();
  const [isFirstSignIn, setIsFirstSignIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsFirstSignIn(false);
      return;
    }

    let cancelled = false;

    const checkProfile = async () => {
      try {
        const { data: profile } = await from("profiles")
          .select("first_sign_in_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (!profile?.first_sign_in_at) {
          setIsFirstSignIn(true);
          await from("profiles").upsert(
            {
              user_id: user.id,
              first_sign_in_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } else {
          setIsFirstSignIn(false);
        }
      } catch (error) {
        console.error("Error checking first sign-in status:", error);
        if (!cancelled) setIsFirstSignIn(false);
      }
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    isFirstSignIn: isFirstSignIn ?? false,
    isLoading: isFirstSignIn === null,
  };
}
