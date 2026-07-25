import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import FinatixLogo from "@/components/FinatixLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, CreditCard, Loader2, Mail } from "lucide-react";

const CompleteProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cimaId, setCimaId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, cima_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.first_name && profile?.last_name && profile?.cima_id) {
        navigate("/dashboard", { replace: true });
        return;
      }

      // Pre-fill from any existing profile / OAuth metadata
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      const fullName = meta.full_name || meta.name || "";
      const [metaFirst, ...metaRest] = fullName.split(" ");
      setFirstName(profile?.first_name || meta.first_name || metaFirst || "");
      setLastName(profile?.last_name || meta.last_name || metaRest.join(" ") || "");
      setCimaId(profile?.cima_id || "");
      setChecking(false);
    })();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!cimaId.trim()) nextErrors.cimaId = "CIMA ID is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          cima_id: cimaId.trim(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        toast({ title: "Could not save", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Welcome to Finatix!", description: "Your profile is all set." });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checking) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Complete Your Profile" description="Finish setting up your Finatix account." noIndex />
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <FinatixLogo size="lg" showText={false} linkTo={null} animated={false} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h1>
                <p className="text-muted-foreground">
                  We need a few more details before you can get started.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cimaId">CIMA ID *</Label>
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
                  {errors.cimaId && <p className="text-sm text-destructive">{errors.cimaId}</p>}
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
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
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
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Continue to Dashboard"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CompleteProfile;
