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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("interest_registrations")
        .insert({
          course_id: courseId,
          email: formData.email,
          full_name: formData.fullName || null,
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
            defaultValue={user?.email || ""}
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
