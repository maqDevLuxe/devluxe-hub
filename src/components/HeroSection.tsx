/**
 * HeroSection — Dynamic glowing gradient heading with stagger-fade-up reveal.
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid + glow orb */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 container mx-auto px-6 text-center max-w-4xl"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-glow-secondary animate-pulse" />
          100% Browser-Based — No Server Required
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tight mb-6"
        >
          Premium Developer Tools.{" "}
          <span className="gradient-text">Zero Server Required.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A curated suite of beautifully crafted, lightning-fast developer utilities —
          all running securely in your browser.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
          <button className="btn-pro px-8 py-3 rounded-xl font-display font-semibold text-base flex items-center gap-2">
            Explore Tools <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 rounded-xl font-display font-semibold text-base border border-border text-foreground hover:bg-secondary/50 transition-colors">
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
