import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Eye, EyeOff, Mail, Lock, User, CreditCard, Check, X, ArrowLeft, Gift, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import CIMAProfileModal from "@/components/CIMAProfileModal";
import FinatixLogo from "@/components/FinatixLogo";

// Password validation helper
const passwordRequirements = [
  { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
  { label: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd: string) => /[0-9]/.test(pwd) },
  { label: "One special character (!@#$%^&*)", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

const validatePassword = (password: string) => {
  return passwordRequirements.every((req) => req.test(password));
};

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const signupSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }).max(100),
  lastName: z.string().trim().min(1, { message: "Last name is required" }).max(100),
  cimaId: z.string().trim().max(20).optional(),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .refine((pwd) => /[A-Z]/.test(pwd), { message: "Password must contain an uppercase letter" })
    .refine((pwd) => /[a-z]/.test(pwd), { message: "Password must contain a lowercase letter" })
    .refine((pwd) => /[0-9]/.test(pwd), { message: "Password must contain a number" })
    .refine((pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), { message: "Password must contain a special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .refine((pwd) => /[A-Z]/.test(pwd), { message: "Password must contain an uppercase letter" })
    .refine((pwd) => /[a-z]/.test(pwd), { message: "Password must contain a lowercase letter" })
    .refine((pwd) => /[0-9]/.test(pwd), { message: "Password must contain a number" })
    .refine((pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), { message: "Password must contain a special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup") return "signup";
    if (urlMode === "reset") return "reset";
    if (urlMode === "forgot") return "forgot";
    return "login";
  });

  // Sync mode with URL changes
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup") setMode("signup");
    else if (urlMode === "reset") setMode("reset");
    else if (urlMode === "forgot") setMode("forgot");
    else setMode("login");
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCIMAModal, setShowCIMAModal] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cimaId, setCimaId] = useState("");
  const [referralCode, setReferralCode] = useState(() => searchParams.get("ref") || "");
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for password recovery event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!email.trim()) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated!",
          description: "Your password has been successfully reset.",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setEmailExistsError(false);
    setLoading(true);

    try {
      if (mode === "login") {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const result = signupSchema.safeParse({ firstName, lastName, cimaId, email, password, confirmPassword });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const { error } = await signUp(email, password, fullName, { 
          first_name: firstName.trim(), 
          last_name: lastName.trim(), 
          cima_id: cimaId.trim()
        });
        if (error) {
          if (error.message.includes("User already registered") || error.message.includes("already exists")) {
            setEmailExistsError(true);
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          // Apply referral code if provided
          if (referralCode.trim()) {
            try {
              const { data: { user: newUser } } = await supabase.auth.getUser();
              if (newUser) {
                await supabase.rpc('apply_referral_code', {
                  p_referred_id: newUser.id,
                  p_code: referralCode.trim().toUpperCase()
                });
              }
            } catch (refErr) {
              // Silently fail - user account is created, referral is optional
              console.error('Failed to apply referral code:', refErr);
            }
          }
          
          toast({
            title: "Account created!",
            description: "Welcome to Finatix. You can now access your dashboard.",
          });
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetEmailSent(false);
    setEmailExistsError(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          title: "Google Sign-In failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong with Google Sign-In. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const getHeaderContent = () => {
    switch (mode) {
      case "forgot":
        return {
          title: "Reset Password",
          subtitle: "Enter your email to receive a password reset link"
        };
      case "reset":
        return {
          title: "Set New Password",
          subtitle: "Enter your new password below"
        };
      case "signup":
        return {
          title: "Create Account",
          subtitle: "Start your CIMA journey today"
        };
      default:
        return {
          title: "Welcome Back",
          subtitle: "Sign in to access your courses and track progress"
        };
    }
  };

  const header = getHeaderContent();

  return (
    <Layout>
      <SEOHead 
        title={mode === "signup" ? "Sign Up" : mode === "forgot" ? "Reset Password" : "Sign In"}
        description={mode === "signup" ? "Create your Finatix account and start your CIMA journey today." : "Sign in to access your CIMA courses and track your progress."}
        noIndex
      />
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 hex-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
              {/* Back button for forgot/reset modes */}
              {(mode === "forgot" || mode === "reset") && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <FinatixLogo size="lg" showText={false} linkTo={null} animated={loading} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {header.title}
                </h1>
                <p className="text-muted-foreground">
                  {header.subtitle}
                </p>
              </div>

              {/* Forgot Password Form */}
              {mode === "forgot" && (
                <>
                  {resetEmailSent ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Check your inbox</h3>
                        <p className="text-sm text-muted-foreground">
                          We've sent a password reset link to <strong>{email}</strong>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setResetEmailSent(false);
                          setEmail("");
                        }}
                      >
                        Try a different email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  )}
                </>
              )}

              {/* Reset Password Form */}
              {mode === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                    
                    {/* Password requirements indicator */}
                    {password.length > 0 && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                        <div className="space-y-1">
                          {passwordRequirements.map((req, index) => {
                            const passed = req.test(password);
                            return (
                              <div key={index} className="flex items-center gap-2">
                                {passed ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                                <span className={`text-xs ${passed ? 'text-green-500' : 'text-muted-foreground'}`}>
                                  {req.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}

              {/* Login/Signup Forms */}
              {(mode === "login" || mode === "signup") && (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email already exists alert */}
                    {mode === "signup" && emailExistsError && (
                      <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="ml-2">
                          An account with this email already exists.{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className="font-semibold underline underline-offset-2 hover:text-destructive-foreground"
                          >
                            Sign in instead
                          </button>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {mode === "signup" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="cimaId">CIMA ID</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="cimaId"
                              type="text"
                              placeholder="e.g., 1-482715"
                              value={cimaId}
                              onChange={(e) => setCimaId(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {errors.cimaId && (
                            <p className="text-sm text-destructive">{errors.cimaId}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="firstName"
                                type="text"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            {errors.firstName && (
                              <p className="text-sm text-destructive">{errors.firstName}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="Smith"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                            />
                            {errors.lastName && (
                              <p className="text-sm text-destructive">{errors.lastName}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => switchMode("forgot")}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                      
                      {/* Password requirements indicator - only show on signup */}
                      {mode === "signup" && password.length > 0 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                          <div className="space-y-1">
                            {passwordRequirements.map((req, index) => {
                              const passed = req.test(password);
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  {passed ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                                  )}
                                  <span className={`text-xs ${passed ? 'text-green-500' : 'text-muted-foreground'}`}>
                                    {req.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {mode === "signup" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="referralCode" className="flex items-center gap-1">
                            <Gift className="w-4 h-4 text-primary" />
                            Referral Code <span className="text-xs text-muted-foreground">(optional)</span>
                          </Label>
                          <Input
                            id="referralCode"
                            type="text"
                            placeholder="e.g., ABC12345"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            className="font-mono tracking-wider uppercase"
                            maxLength={12}
                          />
                          <p className="text-xs text-muted-foreground">
                            Have a friend's referral code? Enter it to earn bonus credits!
                          </p>
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                      {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign-In Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      "Connecting..."
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  {/* Toggle */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                        className="text-primary font-medium hover:underline"
                      >
                        {mode === "login" ? "Sign up" : "Sign in"}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
