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
              The Chartered Institute of Management Accountants (CIMA) is the world's
              leading professional body for management accountants. As both a qualification
              and a designation, it certifies expertise in financial management, strategic
              decision-making, and business performance. Skills that drive organisations
              forward, not just balance the books.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              CIMA-qualified professionals translate financial data into business strategy.
              They forecast performance, evaluate investments, optimise costs, and partner
              with leadership to make the calls that shape the future of an organisation,
              from FTSE 100 boards to high-growth startups.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              The qualification spans four progressive levels: Certificate in Business
              Accounting establishes the fundamentals; Operational develops short-term
              decision-making; Management focuses on medium-term performance; and Strategic
              equips you for senior leadership and long-term strategy.
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
