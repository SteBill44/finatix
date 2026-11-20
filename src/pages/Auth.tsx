import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FinatixLogo from "@/components/FinatixLogo";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const PAGE_NAMES: Record<string, string> = {
  "/flashcards": "Flashcards",
  "/achievements": "Achievements",
  "/discussions": "Discussions",
  "/dashboard": "your Dashboard",
  
  "/ai-tutor": "the AI Tutor",
  "/certificates": "your Certificates",
  "/referrals": "Referrals",
  "/account": "your Account",
};

type AuthMode = "login" | "signup" | "forgot" | "reset";

const modeFromParams = (params: URLSearchParams): AuthMode => {
  const m = params.get("mode");
  if (m === "signup" || m === "reset" || m === "forgot") return m;
  return "login";
};

const HEADERS: Record<AuthMode, { title: string; subtitle: string }> = {
  login: { title: "Sign in to Finatix", subtitle: "" },
  signup: { title: "Create Account", subtitle: "Start your CIMA journey today" },
  forgot: { title: "Reset Password", subtitle: "Enter your email to receive a password reset link" },
  reset: { title: "Set New Password", subtitle: "Enter your new password below" },
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectedFrom = (location.state as { from?: string } | null)?.from;
  const redirectedFromName = redirectedFrom ? PAGE_NAMES[redirectedFrom] ?? null : null;
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
      <section className="bg-background">
        <div className="container auth-shell px-5 md:px-8">
          <div className="hidden lg:block"><p className="eyebrow">Finatix / Your study workspace</p><h2 className="section-title max-w-md">Make progress.<br /><span className="text-primary">Keep it yours.</span></h2><p className="mt-6 max-w-sm text-lg text-muted-foreground">All sixteen CIMA exams. Your notes, revision and course progress, together in one account.</p><Link to="/courses" className="mt-8 inline-block border-b border-primary pb-1 text-sm font-semibold">Explore the exam catalogue</Link></div>
          <div className="auth-form">
            <div>
              {(mode === "forgot" || mode === "reset") && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              )}

              {redirectedFromName && mode === "login" && (
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 mb-3">
                  <LogIn className="w-4 h-4 flex-shrink-0" />
                  <span>Sign in to access {redirectedFromName}</span>
                </div>
              )}

              <div className="mb-8">
                <div className="flex mb-5">
                  <FinatixLogo size="md" showText={false} linkTo={null} animated={false} />
                </div>
                <h1 className="auth-title text-2xl md:text-3xl font-medium text-foreground mb-1">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
