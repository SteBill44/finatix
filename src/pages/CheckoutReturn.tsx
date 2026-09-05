import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, HelpCircle } from "lucide-react";

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const courseSlug = searchParams.get("course");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh enrolments so the new course appears straight away
    queryClient.invalidateQueries({ queryKey: ["enrollments"] });
  }, [queryClient]);

  return (
    <Layout>
      <SEOHead
        title="Order confirmed | Finatix"
        description="Your Finatix course purchase is confirmed."
        noIndex
      />
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <Card className="p-8 text-center">
            {sessionId ? (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Payment received</h1>
                <p className="text-muted-foreground mb-6">
                  Thanks for your order. Your course is being unlocked now - it can take a few
                  seconds to appear on your dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link to={courseSlug ? `/courses/${courseSlug}` : "/dashboard"}>
                      Start learning
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/dashboard">Go to dashboard</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Nothing to show here</h1>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any order details. If you've just paid, check your dashboard or
                  get in touch and we'll sort it out.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link to="/dashboard">Go to dashboard</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/contact">Contact us</Link>
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutReturn;
