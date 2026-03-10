/**
 * FeaturesSection — Explains why DevLuxe tools are fast, secure, and browser-based.
 */
import { motion } from "framer-motion";
import { Zap, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "Every tool runs entirely in your browser — no round-trips to a server. Instant results, even offline.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data never leaves your machine. No uploads, no tracking, no analytics on your content.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Fully responsive and cross-browser. Use on desktop, tablet, or mobile with zero installation.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-32 relative">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-glow-secondary/5 blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Why <span className="gradient-text">DevLuxe</span>?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Built for developers who value speed, security, and elegance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <feat.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                {feat.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
