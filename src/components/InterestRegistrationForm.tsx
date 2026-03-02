import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, User, CheckCircle, Loader2 } from "lucide-react";

interface InterestRegistrationFormProps {
  courseId: string;
  courseName: string;
}

const InterestRegistrationForm = ({ courseId, courseName }: InterestRegistrationFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const registerInterest = async (email: string, fullName?: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("interest_registrations")
        .insert({
          course_id: courseId,
          email,
          full_name: fullName || null,
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("You've already registered interest for this course!");
          setIsRegistered(true);
        } else {
          throw error;
        }
      } else {
        toast.success("Thanks! We'll notify you when this course launches.");
        setIsRegistered(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to register interest");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }
    await registerInterest(formData.email, formData.fullName);
  };

  const handleQuickRegister = async () => {
    if (!user?.email) return;
    await registerInterest(user.email, user.user_metadata?.full_name);
  };

  if (isRegistered) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">You're on the list!</h3>
        <p className="text-sm text-muted-foreground">
          We'll email you when <strong>{courseName}</strong> is available.
        </p>
      </div>
    );
  }

  // Logged-in users get a simple one-click button
  if (user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          We'll notify <strong className="text-foreground">{user.email}</strong> when this course launches.
        </p>
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={handleQuickRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Register Interest
            </>
          )}
        </Button>
      </div>
    );
  }

  // Guest users fill in the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name (optional)
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            placeholder="Your name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Register Interest
          </>
        )}
      </Button>
    </form>
  );
};

export default InterestRegistrationForm;
