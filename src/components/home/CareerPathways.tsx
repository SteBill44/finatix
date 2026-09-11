import { motion } from "framer-motion";
import { TrendingUp, Briefcase, BarChart3, Building2 } from "lucide-react";
import SectionHeading from "./SectionHeading";

const roles = [
  {
    icon: BarChart3,
    title: "Management Accountant",
    description:
      "Translate financial data into operational decisions. Build budgets, forecast performance, and partner with department heads to drive efficiency.",
    bullets: [
      "Produce monthly management accounts",
      "Lead budgeting and forecasting cycles",
      "Advise operational teams on cost control",
    ],
  },
  {
    icon: TrendingUp,
    title: "Finance Business Partner",
    description:
      "Sit alongside the business, not behind it. Bring financial insight to commercial decisions, evaluate investments, and challenge assumptions.",
    bullets: [
      "Partner with commercial leadership",
      "Evaluate investment and pricing decisions",
      "Translate strategy into financial plans",
    ],
  },
  {
    icon: Briefcase,
    title: "Financial Controller",
    description:
      "Own the numbers. Lead the finance function, ensure reporting integrity, and turn close-cycle data into board-ready insight.",
    bullets: [
      "Manage month-end and year-end close",
      "Lead finance teams and workflows",
      "Own statutory reporting and controls",
    ],
  },
  {
    icon: Building2,
    title: "CFO / Finance Director",
    description:
      "Set the financial strategy. Define capital allocation, lead investor relations, and steer the organisation through growth, change and risk.",
    bullets: [
      "Define long-term financial strategy",
      "Lead capital allocation and M&A",
      "Brief boards and investors",
    ],
  },
];

const CareerPathways = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Career pathways"
          title="What CIMA professionals actually do"
          description="CIMA-qualified accountants lead across every level of an organisation - from frontline analysis to the boardroom."
        />

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <role.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-charcoal pt-1.5">{role.title}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {role.description}
              </p>

              <ul className="space-y-2 border-t border-border/50 pt-4">
                {role.bullets.map((b) => (
                  <li
                    key={b}
                    className="text-sm text-foreground/80 flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-primary before:flex-shrink-0"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerPathways;
