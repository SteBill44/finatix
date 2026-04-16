import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FinatixLogo from "@/components/FinatixLogo";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const modeFromParams = (params: URLSearchParams): AuthMode => {
  const m = params.get("mode");
  if (m === "signup" || m === "reset" || m === "forgot") return m;
  return "login";
};

const HEADERS: Record<AuthMode, { title: string; subtitle: string }> = {
  login: { title: "Welcome Back", subtitle: "Sign in to access your courses and track progress" },
  signup: { title: "Create Account", subtitle: "Start your CIMA journey today" },
  forgot: { title: "Reset Password", subtitle: "Enter your email to receive a password reset link" },
  reset: { title: "Set New Password", subtitle: "Enter your new password below" },
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => modeFromParams(searchParams));

  useEffect(() => {
    setMode(modeFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => subscription.unsubscribe();
  }, []);

  const { title, subtitle } = HEADERS[mode];

  return (
    <Layout>
      <SEOHead
        title={mode === "signup" ? "Sign Up" : mode === "forgot" ? "Reset Password" : "Sign In"}
        description={
          mode === "signup"
            ? "Create your Finatix account and start your CIMA journey today."
            : "Sign in to access your CIMA courses and track your progress."
        }
        noIndex
      />
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 hex-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
              {(mode === "forgot" || mode === "reset") && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              )}

              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <FinatixLogo size="lg" showText={false} linkTo={null} animated={false} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>

              {mode === "forgot" && (
                <ForgotPasswordForm onBack={() => setMode("login")} />
              )}

              {mode === "reset" && (
                <ResetPasswordForm />
              )}

              {mode === "login" && (
                <LoginForm
                  onForgotPassword={() => setMode("forgot")}
                  onSignup={() => setMode("signup")}
                />
              )}

              {mode === "signup" && (
                <SignupForm
                  onLogin={() => setMode("login")}
                  initialReferralCode={searchParams.get("ref") || ""}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
