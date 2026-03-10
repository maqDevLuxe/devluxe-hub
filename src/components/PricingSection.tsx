/**
 * PricingSection — Decoy pricing strategy with three tiers.
 * Ultimate is highlighted as "Best Value" with a glow effect.
 */
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Basic access to get started",
    icon: Zap,
    features: [
      "5 Free Components",
      "3 Daily SaaS Tool Uses",
      "Community Support",
      "Light & Dark Mode",
    ],
    cta: "Get Started Free",
    highlighted: false,
    tier: "free" as const,
  },
  {
    name: "Professional",
    price: "$19",
    period: "/month",
    description: "All Pro components + unlimited tools",
    icon: Sparkles,
    features: [
      "All Pro Components",
      "Unlimited SaaS Tools",
      "Priority Support",
      "LTR/RTL Support",
      "Source Code Access",
      "Monthly Updates",
    ],
    cta: "Go Professional",
    highlighted: false,
    tier: "professional" as const,
  },
  {
    name: "Ultimate All-Access",
    price: "$149",
    period: "lifetime",
    description: "Everything. Forever. No limits.",
    icon: Crown,
    badge: "Best Value",
    features: [
      "100+ Website Templates",
      "Full UI Library Access",
      "Lifetime SaaS Tools",
      "All Future Updates",
      "Premium Support (24h)",
      "LTR/RTL + i18n Ready",
      "Commercial License",
      "Figma Source Files",
    ],
    cta: "Get Lifetime Access",
    highlighted: true,
    tier: "ultimate" as const,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 relative" id="pricing">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="text-center mb-16 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm uppercase tracking-[0.2em] text-primary mb-3 font-medium"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          Invest in{" "}
          <span className="gradient-text">Premium Quality</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-lg mx-auto"
        >
          Choose the plan that fits your ambition. Upgrade anytime.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col",
                plan.highlighted
                  ? "border-primary/50 bg-card shadow-[0_0_80px_-20px_hsl(var(--glow)/0.3)] scale-[1.02]"
                  : "border-border bg-card/50 glass-card"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    plan.highlighted ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <Icon className={cn("w-5 h-5", plan.highlighted ? "text-primary" : "text-muted-foreground")} />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>

              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1 text-sm">
                  {plan.period}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={cn("w-4 h-4 mt-0.5 shrink-0", plan.highlighted ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all",
                  plan.highlighted
                    ? "btn-pro"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
