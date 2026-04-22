import { motion } from "framer-motion";

const logos = [
  "CIMA",
  "AICPA",
  "Deloitte",
  "PwC",
  "EY",
  "KPMG",
  "BDO",
  "Grant Thornton",
  "Mazars",
  "RSM",
];

const TrustedBy = () => {
  return (
    <section className="py-10 lg:py-14 bg-card border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-8">
          Trusted by professionals at leading organisations
        </p>

        <div className="relative overflow-hidden">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-12 md:gap-16 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...logos, ...logos].map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="text-xl md:text-2xl font-bold tracking-tight text-muted-foreground/60 hover:text-foreground transition-colors flex-shrink-0"
              >
                {logo}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
