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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        const parsed = parseError(error);
        // Only show error if it's not a refresh token issue (common on page load)
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

      // If signup successful and we have CIMA data, update the profile
      if (data.user && cimaData) {
        // Use setTimeout to defer the Supabase call and avoid deadlock
        setTimeout(async () => {
          await supabase.from("profiles").upsert({
            user_id: data.user!.id,
            full_name: fullName,
            first_name: cimaData.first_name,
            last_name: cimaData.last_name,
            cima_id: cimaData.cima_id,
            cima_start_date: new Date().toISOString().split("T")[0],
          }, { onConflict: 'user_id' });
        }, 0);
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

  const signIn = async (email: string, password: string) => {
    clearAuthError();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const parsed = parseError(error);
        setAuthError({
          message: parsed.message,
          type: parsed.type === "network" ? "network" : "auth",
        });
        return { error: error as Error };
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

  const signOut = async () => {
    // Clear local state first to ensure UI updates immediately
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