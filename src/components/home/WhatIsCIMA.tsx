import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SplitTextReveal from "./SplitTextReveal";

const WhatIsCIMA = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="block text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4"
          >
            Understanding CIMA
          </motion.span>

          <SplitTextReveal
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-8 leading-[1.15]"
          >
            What is the CIMA qualification?
          </SplitTextReveal>

          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              CIMA is a practical route into management accounting. It helps you build
              the finance, business, and decision-making skills needed to support real
              organisations — not just pass exams.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              As you move through the qualification, you learn how to turn numbers into
              useful advice: spotting trends, weighing up options, understanding costs,
              and helping teams make better calls.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              The qualification is split into four stages, from the Certificate level
              through to Strategic. Each stage builds on the last, so you can grow your
              confidence step by step.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10"
          >
            <Link
              to="/why-cima"
              className="inline-flex items-center gap-2 text-primary font-semibold text-base group hover:gap-3 transition-all"
            >
              Read the complete guide to CIMA
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsCIMA;
