import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const tile = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const Sparkline = ({ color = "hsl(var(--primary))" }: { color?: string }) => (
  <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
    <defs>
      <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.35" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 30 L15 26 L30 28 L45 20 L60 22 L75 14 L90 16 L105 8 L120 6 L120 40 L0 40 Z"
      fill="url(#sparkFill)"
    />
    <path
      d="M0 30 L15 26 L30 28 L45 20 L60 22 L75 14 L90 16 L105 8 L120 6"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Ring = ({ value, label }: { value: number; label: string }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div>
        <div className="text-2xl font-extrabold leading-none">{value}%</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
};

const LevelTile = ({
  code,
  name,
  desc,
  progress,
  to,
}: {
  code: string;
  name: string;
  desc: string;
  progress: number;
  to: string;
}) => (
  <Link
    to={to}
    className="group rounded-3xl bg-card border border-border p-6 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col"
  >
    <div className="flex items-center justify-between mb-5">
      <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center font-extrabold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {code}
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <h3 className="text-lg font-bold mb-1">{name}</h3>
    <p className="text-sm text-muted-foreground leading-snug flex-1">{desc}</p>
    <div className="mt-5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        <span>Mastery track</span>
        <span className="font-semibold text-foreground">{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </Link>
);

const Hero = () => {
  return (
    <section className="relative w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">
          {/* HERO MODULE */}
          <motion.div
            {...tile}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-8 md:row-span-2 bg-foreground text-background rounded-[2rem] p-8 md:p-12 flex flex-col justify-between overflow-hidden relative min-h-[440px]"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-md px-3 py-1 rounded-full text-primary text-[11px] font-bold uppercase tracking-widest mb-6 border border-background/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Built for the 2025 CIMA syllabus
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-2xl !text-background">
                Mastering CIMA, <br />
                <span className="text-primary">simplified.</span>
              </h1>
              <p className="text-background/60 mt-6 text-base md:text-lg max-w-md leading-relaxed">
                Structured lessons, adaptive practice, mock exams, and progress
                insights — the definitive management accounting prep platform.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 relative z-10">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="rounded-xl px-7 h-12 font-bold shadow-lg shadow-primary/20 group">
                  Start learning free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-xl px-7 h-12 font-bold bg-background/5 border border-background/10 text-background hover:bg-background/10 hover:text-background"
                >
                  View courses
                </Button>
              </Link>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary opacity-20 blur-[120px] pointer-events-none"
            />
          </motion.div>

          {/* PASS RATE MODULE */}
          <motion.div
            {...tile}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="md:col-span-4 bg-primary text-primary-foreground rounded-[2rem] p-8 flex flex-col justify-between min-h-[210px] relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-80">
              <TrendingUp className="w-3.5 h-3.5" /> Pass rate
            </div>
            <div>
              <div className="text-6xl font-black leading-none">94%</div>
              <div className="text-sm font-medium mt-2 opacity-90">
                First-time pass rate across CIMA levels
              </div>
            </div>
            <div className="opacity-90">
              <Sparkline color="hsl(0 0% 100%)" />
            </div>
          </motion.div>

          {/* READINESS RINGS MODULE */}
          <motion.div
            {...tile}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-4 bg-card border border-border rounded-[2rem] p-8 flex flex-col justify-between min-h-[210px]"
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Adaptive readiness
              </div>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Ring value={82} label="Financial Reporting" />
              <Ring value={64} label="Management Acc." />
            </div>
          </motion.div>

          {/* LEVEL TILES */}
          <motion.div {...tile} transition={{ duration: 0.5, delay: 0.15 }} className="md:col-span-4">
            <LevelTile
              code="C"
              name="Certificate"
              desc="Grounding in business, finance and IT fundamentals."
              progress={22}
              to="/courses"
            />
          </motion.div>
          <motion.div {...tile} transition={{ duration: 0.5, delay: 0.2 }} className="md:col-span-4">
            <LevelTile
              code="O"
              name="Operational"
              desc="Short-term decisions, costing and performance."
              progress={48}
              to="/courses"
            />
          </motion.div>
          <motion.div {...tile} transition={{ duration: 0.5, delay: 0.25 }} className="md:col-span-4">
            <LevelTile
              code="M"
              name="Management"
              desc="Translate strategy into action across the business."
              progress={12}
              to="/courses"
            />
          </motion.div>

          {/* TESTIMONIAL */}
          <motion.div
            {...tile}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-7 bg-card border border-border rounded-[2rem] p-8 md:p-10 flex flex-col justify-between min-h-[220px]"
          >
            <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
              <span className="text-primary text-3xl leading-none align-top mr-1">“</span>
              Finatix turned my exam anxiety into confidence. The progress
              tracking kept me focused on the topics that mattered most — I
              passed Strategic on my first attempt.
            </p>
            <div className="flex items-center mt-6">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                SJ
              </div>
              <div>
                <p className="font-bold text-sm">Sarah Jenkins</p>
                <p className="text-muted-foreground text-xs">Strategic Level, passed 2025</p>
              </div>
            </div>
          </motion.div>

          {/* CTA / QUICK LINKS */}
          <motion.div
            {...tile}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="md:col-span-5 bg-foreground text-background rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-1">Ready to qualify?</h3>
              <p className="text-background/60 text-sm">
                Join thousands of candidates using Finatix to accelerate their careers.
              </p>
            </div>
            <div className="space-y-2 relative z-10">
              <Link
                to="/why-cima"
                className="flex items-center justify-between p-3.5 bg-background/5 rounded-xl border border-background/10 hover:bg-background/10 transition-colors group"
              >
                <span className="font-medium text-sm">Which level should I start with?</span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="flex items-center justify-between p-3.5 bg-background/5 rounded-xl border border-background/10 hover:bg-background/10 transition-colors group"
              >
                <span className="font-medium text-sm">See pricing & plans</span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div
              aria-hidden
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary opacity-15 blur-[100px] pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
