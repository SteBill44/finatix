import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Award, TrendingUp, Globe, Briefcase, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import MagneticButton from "./MagneticButton";
import { SourceLink } from "@/components/credibility/SourceLink";
import { CIMA_CLAIMS, CIMA_RELATIONSHIP, type ClaimSource } from "@/lib/claims";

// Figures here are recorded with their sources in src/lib/claims.ts.
const cimaPerks = [
  {
    icon: Award,
    title: "Globally Recognised",
    description:
      "AICPA & CIMA report a combined 597,000 members, candidates and registrants across 188 countries and territories.",
    source: CIMA_CLAIMS.community.source,
  },
  {
    icon: TrendingUp,
    title: "Check the Earnings Data",
    description:
      "AICPA & CIMA publish salary data for CGMA designation holders and candidates, so you can look up current figures for your role and region.",
    source: CIMA_CLAIMS.salary.source,
  },
  {
    icon: Globe,
    title: "Exams Plus Experience",
    description:
      "The CGMA designation needs the exams and a minimum of three years' verified relevant practical experience.",
    source: CIMA_CLAIMS.practicalExperience.source,
  },
  {
    icon: Briefcase,
    title: "Strategic Business Skills",
    description:
      "CIMA's syllabus focuses on management accounting and business decision-making, not audit and practice work.",
  },
] satisfies Array<{
  icon: React.ElementType;
  title: string;
  description: string;
  source?: ClaimSource;
}>;

const signupPerks = [
  "Track progress across all CIMA levels",
  "AI-powered study assistant",
  "Competency radar & readiness score",
  "Spaced-repetition flashcards",
];

const CTA = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  // Logged-in state: keep centred layout
  if (user) {
    return (
      <section ref={sectionRef} className="py-12 lg:py-20 bg-background overflow-hidden">
        <motion.div style={{ scale: bgScale }} className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <SplitTextReveal
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-6"
            >
              Continue Your Learning Journey
            </SplitTextReveal>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-muted-foreground mb-10"
            >
              Pick up where you left off and keep making progress.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton strength={0.08}>
                <Link to="/dashboard">
                  <Button size="xl">Go to Dashboard</Button>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.08}>
                <Link to="/courses">
                  <Button size="xl" variant="outline">Browse Courses</Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>
      </section>
    );
  }

  // Logged-out state: two-column layout with dashboard screenshot
  return (
    <section ref={sectionRef} className="py-12 lg:py-24 bg-background overflow-hidden">
      <motion.div style={{ scale: bgScale }} className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">

          {/* Left - CTA copy */}
          <div className="mx-auto max-w-2xl text-center lg:col-span-2">
            <SplitTextReveal
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-5 leading-tight"
            >
              Create your account. Start for free.
            </SplitTextReveal>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-muted-foreground mb-8"
            >
              Everything you need to pass CIMA - in one place. No credit card required.
            </motion.p>

            {/* Perks list */}
            <motion.ul
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3 mb-10 inline-block text-left"
            >
              {signupPerks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {perk}
                </li>
              ))}
            </motion.ul>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton strength={0.08}>
                <Link to="/auth?mode=signup">
                  <Button size="xl">Create your free account</Button>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.08}>
                <Link to="/courses">
                  <Button size="xl" variant="outline">Explore Courses</Button>
                </Link>
              </MagneticButton>
            </motion.div>

            {/* CIMA Info Dropdown */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group"
              >
                <span>What is CIMA and why get qualified?</span>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 p-6 bg-muted/50 rounded-2xl border border-border text-left">
                      <p className="text-muted-foreground mb-6">
                        The{" "}
                        <strong className="text-foreground">
                          Chartered Institute of Management Accountants (CIMA)
                        </strong>{" "}
                        is the world's leading professional body for management accountants, helping
                        you become a strategic business leader.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {cimaPerks.map((perk, index) => (
                          <motion.div
                            key={perk.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <perk.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm">{perk.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{perk.description}</p>
                              {"source" in perk && perk.source && (
                                <SourceLink source={perk.source} className="mt-1" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
