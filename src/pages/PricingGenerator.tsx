/**
 * PricingGenerator — SaaS Luxury pricing table builder with live preview and code export.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Copy, Check, ArrowLeft, Plus, Trash2, Star, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Types ─── */
interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular: boolean;
  cta: string;
  features: PricingFeature[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultTiers: PricingTier[] = [
  {
    id: uid(),
    name: "Starter",
    monthlyPrice: 9,
    yearlyPrice: 90,
    description: "Perfect for individuals and small projects.",
    popular: false,
    cta: "Get Started",
    features: [
      { id: uid(), text: "5 projects", included: true },
      { id: uid(), text: "10 GB storage", included: true },
      { id: uid(), text: "Email support", included: true },
      { id: uid(), text: "API access", included: false },
    ],
  },
  {
    id: uid(),
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "For growing teams that need more power.",
    popular: true,
    cta: "Start Free Trial",
    features: [
      { id: uid(), text: "Unlimited projects", included: true },
      { id: uid(), text: "100 GB storage", included: true },
      { id: uid(), text: "Priority support", included: true },
      { id: uid(), text: "API access", included: true },
    ],
  },
  {
    id: uid(),
    name: "Enterprise",
    monthlyPrice: 79,
    yearlyPrice: 790,
    description: "Custom solutions for large organizations.",
    popular: false,
    cta: "Contact Sales",
    features: [
      { id: uid(), text: "Unlimited everything", included: true },
      { id: uid(), text: "1 TB storage", included: true },
      { id: uid(), text: "Dedicated support", included: true },
      { id: uid(), text: "Custom integrations", included: true },
    ],
  },
];

/* ─── Animated Number ─── */
const AnimatedPrice = ({ value }: { value: number }) => {
  const spring = useSpring(value, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setCurrent(v));
    return unsub;
  }, [display]);

  return <span>{current}</span>;
};

/* ─── Billing Toggle ─── */
const BillingToggle = ({
  isYearly,
  onChange,
}: {
  isYearly: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-center gap-4">
    <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
      Monthly
    </span>
    <button
      onClick={() => onChange(!isYearly)}
      className="relative w-14 h-7 rounded-full bg-secondary border border-border transition-colors"
      aria-label="Toggle billing period"
    >
      <motion.div
        className="absolute top-0.5 w-6 h-6 rounded-full bg-primary shadow-lg"
        animate={{ left: isYearly ? "calc(100% - 25px)" : "1px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
    <span className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
      Yearly
      <span className="ml-1.5 text-xs text-primary font-semibold">Save 20%</span>
    </span>
  </div>
);

/* ─── Live Preview Card ─── */
const PreviewCard = ({
  tier,
  isYearly,
}: {
  tier: PricingTier;
  isYearly: boolean;
}) => {
  const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-2xl p-6 sm:p-8 flex flex-col ${
        tier.popular
          ? "glass-card border-primary/30 ring-1 ring-primary/20"
          : "glass-card"
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-foreground mb-1">{tier.name}</h3>
      <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-display font-bold text-foreground">
          $<AnimatedPrice value={price} />
        </span>
        <span className="text-sm text-muted-foreground">
          /{isYearly ? "year" : "month"}
        </span>
      </div>

      <button
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all mb-6 ${
          tier.popular
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
        }`}
      >
        {tier.cta}
      </button>

      <ul className="space-y-3 flex-1">
        {tier.features.map((f) => (
          <li key={f.id} className="flex items-center gap-2.5 text-sm">
            <span className={f.included ? "text-primary" : "text-muted-foreground/40"}>
              {f.included ? "✓" : "×"}
            </span>
            <span className={f.included ? "text-foreground" : "text-muted-foreground line-through"}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

/* ─── Tier Editor ─── */
const TierEditor = ({
  tier,
  onUpdate,
  onRemove,
}: {
  tier: PricingTier;
  onUpdate: (t: PricingTier) => void;
  onRemove: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const update = <K extends keyof PricingTier>(key: K, val: PricingTier[K]) =>
    onUpdate({ ...tier, [key]: val });

  const updateFeature = (fid: string, patch: Partial<PricingFeature>) =>
    onUpdate({
      ...tier,
      features: tier.features.map((f) => (f.id === fid ? { ...f, ...patch } : f)),
    });

  const addFeature = () =>
    onUpdate({
      ...tier,
      features: [...tier.features, { id: uid(), text: "New feature", included: true }],
    });

  const removeFeature = (fid: string) =>
    onUpdate({ ...tier, features: tier.features.filter((f) => f.id !== fid) });

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground text-sm">{tier.name}</span>
          {tier.popular && (
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronIcon />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div className="grid grid-cols-2 gap-3">
                <SmallInput label="Tier Name" value={tier.name} onChange={(v) => update("name", v)} />
                <SmallInput label="CTA Text" value={tier.cta} onChange={(v) => update("cta", v)} />
              </div>
              <SmallInput label="Description" value={tier.description} onChange={(v) => update("description", v)} />
              <div className="grid grid-cols-2 gap-3">
                <SmallInput label="Monthly $" value={String(tier.monthlyPrice)} onChange={(v) => update("monthlyPrice", Number(v) || 0)} type="number" />
                <SmallInput label="Yearly $" value={String(tier.yearlyPrice)} onChange={(v) => update("yearlyPrice", Number(v) || 0)} type="number" />
              </div>

              {/* Popular toggle */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={tier.popular}
                  onChange={(e) => update("popular", e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">Mark as Popular</span>
              </label>

              {/* Features */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Features</span>
                {tier.features.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={f.included}
                      onChange={(e) => updateFeature(f.id, { included: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={f.text}
                      onChange={(e) => updateFeature(f.id, { text: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm rounded bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <button onClick={() => removeFeature(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={addFeature} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add feature
                </button>
              </div>

              <button onClick={onRemove} className="text-xs text-destructive hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Remove tier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SmallInput = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
    />
  </div>
);

/* ─── Code Generator ─── */
function generateHTML(tiers: PricingTier[], isYearly: boolean): string {
  const cards = tiers
    .map((t) => {
      const price = isYearly ? t.yearlyPrice : t.monthlyPrice;
      const period = isYearly ? "year" : "month";
      const features = t.features
        .map(
          (f) =>
            `      <li class="flex items-center gap-2 text-sm ${f.included ? "" : "line-through opacity-50"}">\n        <span>${f.included ? "✓" : "×"}</span> ${f.text}\n      </li>`
        )
        .join("\n");

      return `  <div class="relative rounded-2xl p-8 ${
        t.popular ? "border-2 border-indigo-500 bg-white/5" : "border border-gray-200 dark:border-gray-800"
      } backdrop-blur-xl">${
        t.popular ? `\n    <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-xs font-semibold">Most Popular</span>` : ""
      }
    <h3 class="text-xl font-bold mb-1">${t.name}</h3>
    <p class="text-sm text-gray-500 mb-6">${t.description}</p>
    <div class="flex items-baseline gap-1 mb-6">
      <span class="text-4xl font-bold">$${price}</span>
      <span class="text-sm text-gray-500">/${period}</span>
    </div>
    <button class="w-full py-3 rounded-xl text-sm font-semibold ${
      t.popular ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
    }">${t.cta}</button>
    <ul class="mt-6 space-y-3">
${features}
    </ul>
  </div>`;
    })
    .join("\n\n");

  return `<section class="py-20">\n  <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-${tiers.length} gap-6">\n${cards}\n  </div>\n</section>`;
}

/* ─── Code Block ─── */
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("HTML copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Tailwind HTML"}
      </button>
      <div className="rounded-xl overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">HTML</span>
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-card text-foreground max-h-64">
          {code}
        </pre>
      </div>
    </div>
  );
};

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          The Psychology of <span className="gradient-text">SaaS Pricing</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Pricing isn't just a number—it's a narrative. The most successful SaaS companies use anchoring
          (placing a high-price tier to make mid-tier feel affordable), decoy pricing (a deliberately
          unattractive option that nudges users toward the target tier), and charm pricing ($29 vs $30)
          to maximize conversions. Research from the Journal of Consumer Research shows that presenting
          three options increases the likelihood of choosing the middle one by 40%.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Your pricing page is often the highest-intent page on your site. Every element—typography,
          color contrast, feature comparison clarity, and CTA prominence—directly impacts revenue.
          The "Popular" badge leverages social proof, while annual billing toggles increase LTV by
          encouraging longer commitments with perceived savings.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How to Design a <span className="gradient-text">High-Converting</span> Pricing Table
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Start with three tiers—this follows the "rule of three" in consumer psychology. Clearly
          differentiate each tier with a short, benefit-driven description. Use visual hierarchy to
          draw attention to your recommended plan: a highlighted border, "Most Popular" badge, or
          elevated card. Make the CTA button for the featured plan more prominent with a filled
          background while keeping others outlined.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Feature lists should use checkmarks (✓) and crosses (×) for instant scannability. Place the
          most compelling features at the top. Include a monthly/yearly toggle to showcase annual
          savings—the discount percentage should be visible next to the toggle to incentivize longer
          commitments.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "How many pricing tiers should I have?",
              a: "Three is the sweet spot for most SaaS products. It leverages the psychological principle of the 'center stage effect'—users naturally gravitate toward the middle option. Four tiers can work for products with clearly distinct user segments (e.g., solo, team, business, enterprise).",
            },
            {
              q: "Should I show monthly or yearly pricing by default?",
              a: "Show monthly by default since it's the lower number and feels more accessible. The yearly toggle reveals a discount, creating a delightful 'savings moment.' Make sure the annual savings are clearly displayed (e.g., 'Save 20%').",
            },
            {
              q: "Is the generated code responsive?",
              a: "Yes. The output uses Tailwind's responsive grid classes (grid-cols-1 md:grid-cols-N) so cards stack vertically on mobile and display in a row on desktop.",
            },
            {
              q: "Can I customize the generated HTML further?",
              a: "Absolutely. The output is standard HTML with Tailwind utility classes—you can paste it directly into any Tailwind project and modify colors, spacing, fonts, and animations as needed.",
            },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-foreground text-left hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

/* ─── Main Page ─── */
const PricingGenerator = () => {
  const [tiers, setTiers] = useState<PricingTier[]>(defaultTiers);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    document.title = "Pricing Table Generator — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Build beautiful SaaS pricing tables with live preview. Add tiers, toggle billing, highlight plans, and export clean Tailwind HTML. Free and instant."
      );
    }
  }, []);

  const code = useMemo(() => generateHTML(tiers, isYearly), [tiers, isYearly]);

  const updateTier = (id: string, updated: PricingTier) =>
    setTiers((prev) => prev.map((t) => (t.id === id ? updated : t)));

  const removeTier = (id: string) => setTiers((prev) => prev.filter((t) => t.id !== id));

  const addTier = () =>
    setTiers((prev) => [
      ...prev,
      {
        id: uid(),
        name: "New Tier",
        monthlyPrice: 19,
        yearlyPrice: 190,
        description: "A new pricing tier.",
        popular: false,
        cta: "Get Started",
        features: [
          { id: uid(), text: "Feature one", included: true },
          { id: uid(), text: "Feature two", included: true },
        ],
      },
    ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tools
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              Pricing Table <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Build high-converting SaaS pricing tables with live preview and export clean Tailwind HTML.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-10">
            <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 block text-center">
              Live Preview
            </span>
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(tiers.length, 4)} gap-6 max-w-5xl mx-auto`}>
              <AnimatePresence mode="popLayout">
                {tiers.map((tier) => (
                  <PreviewCard key={tier.id} tier={tier} isYearly={isYearly} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Editor + Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Tier Editors */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Tiers ({tiers.length})
                </span>
                <button
                  onClick={addTier}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tier
                </button>
              </div>
              {tiers.map((tier) => (
                <TierEditor
                  key={tier.id}
                  tier={tier}
                  onUpdate={(t) => updateTier(tier.id, t)}
                  onRemove={() => removeTier(tier.id)}
                />
              ))}
            </motion.div>

            {/* Code Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:sticky lg:top-28 h-fit"
            >
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 block">
                Generated Code
              </span>
              <CodeBlock code={code} />
            </motion.div>
          </div>
        </div>
      </main>

      <SeoSection />
      <Footer />
    </div>
  );
};

export default PricingGenerator;
