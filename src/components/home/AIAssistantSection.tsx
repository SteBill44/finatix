import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";

const capabilities = [
  "Explain a difficult concept in plain English",
  "Explain why an answer you gave was wrong",
  "Help you revise a topic before an exam",
  "Point you at the areas you keep getting wrong",
  "Suggest what to study next and for how long",
];

const AIAssistantSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-4">
            Your personal AI study assistant
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Built into your course, so you can ask a question the moment you get stuck instead of
            waiting for a tutor to reply.
          </p>
          <ul className="space-y-3 mb-8">
            {capabilities.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-charcoal dark:text-white">{c}</span>
              </li>
            ))}
          </ul>
          <Link to="/auth?mode=signup">
            <Button size="lg">Start Free</Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border bg-background p-5 md:p-6 shadow-lg"
        >
          <p className="text-xs text-muted-foreground mb-4">Example conversation</p>
          <div className="space-y-4">
            <div className="flex gap-3 justify-end">
              <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 max-w-[85%] text-sm">
                Why did I get that transfer pricing question wrong?
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3 max-w-[85%] text-sm text-charcoal dark:text-white">
                You used the market price, but the selling division had spare capacity. With spare
                capacity the minimum acceptable price is the marginal cost. Want three more
                questions on this to check it has stuck?
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIAssistantSection;
