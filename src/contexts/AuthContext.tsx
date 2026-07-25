import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { parseError } from "@/lib/errorHandling";

interface CIMAData {
  first_name?: string;
  last_name?: string;
  cima_id?: string;
}

interface AuthError {
  message: string;
  type: "auth" | "network" | "unknown";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: AuthError | null;
  signUp: (email: string, password: string, fullName: string, cimaData?: CIMAData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null; isFirstSignIn?: boolean }>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Clear any previous auth errors on successful auth state change
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setAuthError(null);
        }
        
        // Handle token refresh failures
        if (event === "TOKEN_REFRESHED" && !session) {
          setAuthError({
            message: "Your session has expired. Please sign in again.",
            type: "auth",
          });
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session.
    // If the user didn't choose "stay logged in", their session is only valid
    // for the current browser tab - sign them out when the tab/browser closes.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      const sessionOnlyMarker = sessionStorage.getItem("finatix_session_only");
      const hasStoredSession = !!session;

      if (hasStoredSession && !sessionOnlyMarker) {
        // Check if this session was created without rememberMe - the marker
        // should be in sessionStorage if the browser is still open.
        // If it's absent (browser was closed and reopened) AND the session
        // was stored without rememberMe, sign out.
        const noRemember = localStorage.getItem("finatix_no_remember");
        if (noRemember) {
          supabase.auth.signOut().then(() => {
            localStorage.removeItem("finatix_no_remember");
            setSession(null);
            setUser(null);
            setLoading(false);
          });
          return;
        }
      }

      if (error) {
        const parsed = parseError(error);
        if (!parsed.message.includes("refresh_token_not_found")) {
          setAuthError({
            message: parsed.message,
            type: parsed.type === "network" ? "network" : "auth",
          });
        }
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, cimaData?: CIMAData) => {
    const redirectUrl = `${window.location.origin}/`;
    clearAuthError();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            first_name: cimaData?.first_name,
            last_name: cimaData?.last_name,
            cima_id: cimaData?.cima_id,
          },
        },
      });

      if (error) {
        const parsed = parseError(error);
        setAuthError({
          message: parsed.message,
          type: parsed.type === "network" ? "network" : "auth",
        });
        return { error: error as Error };
      }

      // Persist CIMA profile data if provided at signup
      if (data.user && cimaData) {
        await supabase.from("profiles").upsert({
          user_id: data.user.id,
          full_name: fullName,
          first_name: cimaData.first_name,
          last_name: cimaData.last_name,
          cima_id: cimaData.cima_id,
          cima_start_date: new Date().toISOString().split("T")[0],
        }, { onConflict: "user_id" });
      }
      
      return { error: null };
    } catch (err) {
      const parsed = parseError(err);
      setAuthError({
        message: parsed.message,
        type: "unknown",
      });
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe = true) => {
    clearAuthError();

    // Simple client-side brute-force throttle: 5 failures → 15-minute lockout
    const LOCKOUT_KEY = "finatix_login_lockout";
    const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
    const MAX_ATTEMPTS = 5;

    const stored = localStorage.getItem(LOCKOUT_KEY);
    const lockout = stored ? (JSON.parse(stored) as { count: number; since: number }) : null;
    const now = Date.now();

    if (lockout && now - lockout.since < LOCKOUT_WINDOW_MS && lockout.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_WINDOW_MS - (now - lockout.since)) / 60000);
      setAuthError({
        message: `Too many failed attempts. Please try again in ${remaining} minute${remaining === 1 ? "" : "s"}.`,
        type: "auth",
      });
      return { error: new Error("Locked out") };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Increment failure counter
        const prev = lockout && now - lockout.since < LOCKOUT_WINDOW_MS ? lockout : { count: 0, since: now };
        localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ count: prev.count + 1, since: prev.since }));

        const parsed = parseError(error);
        setAuthError({
          message: parsed.message,
          type: parsed.type === "network" ? "network" : "auth",
        });
        return { error: error as Error };
      }

      // Clear failure counter on success
      localStorage.removeItem(LOCKOUT_KEY);

      // Track session persistence preference
      if (rememberMe) {
        localStorage.removeItem("finatix_no_remember");
        sessionStorage.removeItem("finatix_session_only");
      } else {
        localStorage.setItem("finatix_no_remember", "1");
        sessionStorage.setItem("finatix_session_only", "1");
      }

      return { error: null };
    } catch (err) {
      const parsed = parseError(err);
      setAuthError({ message: parsed.message, type: "unknown" });
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("finatix_no_remember");
    sessionStorage.removeItem("finatix_session_only");
    setUser(null);
    setSession(null);
    clearAuthError();
    
    // Then attempt to sign out from Supabase (ignore errors if session already invalid)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Session may already be invalid, which is fine
      console.log("Sign out completed");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      authError, 
      signUp, 
      signIn, 
      signOut,
      clearAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};