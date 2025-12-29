import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Rocket, BookOpen, Award, Users, CheckCircle, Linkedin, Twitter, Instagram } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("interest_registrations")
      .insert({ 
        email: emailValidation.data, 
        full_name: fullName.trim() || null 
      });

    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already registered",
          description: "This email is already on our waiting list!",
        });
        setIsRegistered(true);
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsRegistered(true);
    toast({
      title: "You're on the list!",
      description: "We'll notify you when our courses go live.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CIMA Academy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Rocket className="w-4 h-4" />
                Launching Soon
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                MASTER <span className="text-primary">CIMA</span> WITH MODERN LEARNING
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                We're building a comprehensive, competency-based training platform to help you excel in management accounting. Register your interest to be the first to know when we launch.
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-10">
                {[
                  { icon: BookOpen, text: "Structured courses from Certificate to Strategic level" },
                  { icon: Award, text: "Practice quizzes with instant feedback" },
                  { icon: Users, text: "Join a community of aspiring accountants" },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                {isRegistered ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">You're on the list!</h3>
                    <p className="text-muted-foreground">
                      We'll send you an email as soon as our courses are ready.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Register Your Interest
                      </h2>
                      <p className="text-muted-foreground">
                        Be the first to access our courses when we launch.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Input
                          type="text"
                          placeholder="Your name (optional)"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-12"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12"
                          maxLength={255}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-12"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registering..." : "Notify Me"}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      We respect your privacy. No spam, ever.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CIMA Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
