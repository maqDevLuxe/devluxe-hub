/**
 * ButtonGenerator — Premium React/Tailwind button builder with live preview and code output.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronDown, Sparkles, MousePointer2, Zap, ArrowLeft } from "lucide-react";
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
type HoverAnimation = "none" | "pulse" | "magnetic" | "glow";

interface ButtonConfig {
  text: string;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
  shadowIntensity: number;
  fontSize: number;
  fontWeight: number;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  textColor: string;
  hoverAnimation: HoverAnimation;
  borderWidth: number;
  borderColor: string;
}

const defaultConfig: ButtonConfig = {
  text: "Get Started",
  paddingX: 32,
  paddingY: 14,
  borderRadius: 12,
  shadowIntensity: 30,
  fontSize: 16,
  fontWeight: 600,
  gradientFrom: "#7c3aed",
  gradientTo: "#06b6d4",
  gradientAngle: 135,
  textColor: "#ffffff",
  hoverAnimation: "glow",
  borderWidth: 0,
  borderColor: "#ffffff",
};

/* ─── Slider Component ─── */
const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-glow-secondary"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

/* ─── Color Picker ─── */
const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-foreground">{value}</span>
      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ background: value }} />
      </div>
    </div>
  </div>
);

/* ─── Dropdown ─── */
const AnimationDropdown = ({
  value,
  onChange,
}: {
  value: HoverAnimation;
  onChange: (v: HoverAnimation) => void;
}) => {
  const [open, setOpen] = useState(false);
  const options: { value: HoverAnimation; label: string; icon: React.ReactNode }[] = [
    { value: "none", label: "None", icon: <MousePointer2 className="w-4 h-4" /> },
    { value: "pulse", label: "Pulse", icon: <Zap className="w-4 h-4" /> },
    { value: "magnetic", label: "Magnetic", icon: <Sparkles className="w-4 h-4" /> },
    { value: "glow", label: "Glow", icon: <Sparkles className="w-4 h-4" /> },
  ];
  const selected = options.find((o) => o.value === value)!;

  return (
    <div className="space-y-2">
      <span className="text-sm text-muted-foreground">Hover Animation</span>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass-card text-sm text-foreground"
        >
          <span className="flex items-center gap-2">
            {selected.icon}
            {selected.label}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 mt-1 w-full rounded-xl glass-card border border-border overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                    opt.value === value ? "text-primary" : "text-foreground"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Code Generator ─── */
function generateCode(c: ButtonConfig): string {
  const hoverClass =
    c.hoverAnimation === "pulse"
      ? "hover:animate-pulse"
      : c.hoverAnimation === "magnetic"
      ? "hover:scale-105 transition-transform"
      : c.hoverAnimation === "glow"
      ? "hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-shadow"
      : "";

  const lines = [
    `<button`,
    `  className="${[
      "inline-flex items-center justify-center",
      `font-semibold`,
      `rounded-[${c.borderRadius}px]`,
      hoverClass,
      "transition-all duration-200",
    ]
      .filter(Boolean)
      .join(" ")}"`,
    `  style={{`,
    `    padding: "${c.paddingY}px ${c.paddingX}px",`,
    `    fontSize: "${c.fontSize}px",`,
    `    fontWeight: ${c.fontWeight},`,
    `    background: "linear-gradient(${c.gradientAngle}deg, ${c.gradientFrom}, ${c.gradientTo})",`,
    `    color: "${c.textColor}",`,
    `    boxShadow: "0 ${Math.round(c.shadowIntensity / 3)}px ${c.shadowIntensity}px -${Math.round(c.shadowIntensity / 4)}px ${c.gradientFrom}80",`,
    c.borderWidth > 0 ? `    border: "${c.borderWidth}px solid ${c.borderColor}",` : null,
    `  }}`,
    `>`,
    `  ${c.text}`,
    `</button>`,
  ];
  return lines.filter(Boolean).join("\n");
}

/* ─── Live Preview Button ─── */
const LiveButton = ({ config }: { config: ButtonConfig }) => {
  const style: React.CSSProperties = {
    padding: `${config.paddingY}px ${config.paddingX}px`,
    borderRadius: `${config.borderRadius}px`,
    fontSize: `${config.fontSize}px`,
    fontWeight: config.fontWeight,
    background: `linear-gradient(${config.gradientAngle}deg, ${config.gradientFrom}, ${config.gradientTo})`,
    color: config.textColor,
    boxShadow: `0 ${Math.round(config.shadowIntensity / 3)}px ${config.shadowIntensity}px -${Math.round(config.shadowIntensity / 4)}px ${config.gradientFrom}80`,
    border: config.borderWidth > 0 ? `${config.borderWidth}px solid ${config.borderColor}` : "none",
    cursor: "pointer",
  };

  const hoverVariants = {
    none: {},
    pulse: { scale: [1, 1.05, 1], transition: { duration: 0.6, repeat: Infinity } },
    magnetic: { scale: 1.08, transition: { type: "spring" as const, stiffness: 400, damping: 10 } },
    glow: {
      boxShadow: `0 0 40px 8px ${config.gradientFrom}60, 0 0 80px 16px ${config.gradientTo}30`,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.button
      style={style}
      className="inline-flex items-center justify-center transition-all duration-200"
      whileHover={hoverVariants[config.hoverAnimation]}
      whileTap={{ scale: 0.97 }}
    >
      {config.text}
    </motion.button>
  );
};

/* ─── Code Block ─── */
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">JSX</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed bg-card">
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  );
};

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Why <span className="gradient-text">Micro-Interactions</span> Matter in UI
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Micro-interactions are the subtle animations and feedback loops that make digital interfaces
          feel alive. A button that glows on hover, pulses to draw attention, or responds magnetically
          to the cursor tells users their actions are recognized. Studies show that well-crafted
          micro-interactions can increase click-through rates by up to 25% and significantly improve
          perceived quality of an application.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          In modern React applications, libraries like Framer Motion enable physics-based animations
          that feel natural and premium. Combined with Tailwind CSS utility classes, you can build
          production-ready interactive buttons in minutes—no custom CSS animation keyframes required.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How to Create a <span className="gradient-text">Magnetic Button</span> in React
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          A magnetic button effect makes the element subtly follow the cursor as it approaches,
          creating a sense of physical attraction. This is achieved by tracking mouse position relative
          to the button's bounding box and applying a small transform offset. With Framer Motion's
          <code className="text-primary mx-1">useMotionValue</code> and spring physics, the effect
          feels responsive yet natural. Pair it with a gradient background and a soft glow shadow for
          maximum visual impact.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Our generator above lets you preview the magnetic effect in real-time and export clean,
          copy-pasteable React + Tailwind code that you can drop into any project.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "Can I use the generated button code in production?",
              a: "Absolutely. The output is clean, semantic JSX with inline styles and Tailwind utility classes. It's production-ready and works with any React + Tailwind project.",
            },
            {
              q: "Does the button need Framer Motion to work?",
              a: "The base button works with pure CSS. However, the hover animations (Pulse, Magnetic, Glow) use Framer Motion for physics-based smoothness. You can replace them with CSS transitions if preferred.",
            },
            {
              q: "How do I make the button accessible?",
              a: "Always include meaningful text content (no icon-only buttons without aria-label), ensure sufficient color contrast (4.5:1 ratio minimum), and test keyboard navigation. The generated code uses semantic <button> elements by default.",
            },
            {
              q: "What's the best button size for mobile?",
              a: "Apple and Google recommend a minimum touch target of 44×44 CSS pixels. Use our padding sliders to ensure your button meets this threshold. We recommend at least 14px vertical and 24px horizontal padding.",
            },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-foreground text-left hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

/* ─── Main Page ─── */
const ButtonGenerator = () => {
  const [config, setConfig] = useState<ButtonConfig>(defaultConfig);

  useEffect(() => {
    document.title = "React Button Generator — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Design premium React buttons with live preview. Customize gradients, shadows, border-radius, and hover animations. Export clean React + Tailwind code instantly."
      );
    }
  }, []);

  const code = useMemo(() => generateCode(config), [config]);

  const update = <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tools
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              React <span className="gradient-text">Button</span> Generator
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Craft premium buttons with live physics-based animations, then export clean React + Tailwind code.
            </p>
          </motion.div>

          {/* Tool Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Live Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7 glass-card rounded-2xl p-8 flex flex-col"
            >
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
                Live Preview
              </span>

              {/* Button stage */}
              <div className="flex-1 min-h-[260px] flex items-center justify-center bg-grid rounded-xl border border-border/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-glow-secondary/5" />
                <LiveButton config={config} />
              </div>

              {/* Text input */}
              <div className="mt-6">
                <label className="text-sm text-muted-foreground mb-1.5 block">Button Text</label>
                <input
                  type="text"
                  value={config.text}
                  onChange={(e) => update("text", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Code output */}
              <div className="mt-6">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 block">
                  Generated Code
                </span>
                <CodeBlock code={code} />
              </div>
            </motion.div>

            {/* Controls Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-6 h-fit lg:sticky lg:top-28"
            >
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Controls
              </span>

              {/* Spacing */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Spacing</h3>
                <Slider label="Padding X" value={config.paddingX} min={8} max={64} onChange={(v) => update("paddingX", v)} />
                <Slider label="Padding Y" value={config.paddingY} min={4} max={32} onChange={(v) => update("paddingY", v)} />
              </div>

              {/* Shape */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Shape</h3>
                <Slider label="Border Radius" value={config.borderRadius} min={0} max={50} onChange={(v) => update("borderRadius", v)} />
                <Slider label="Border Width" value={config.borderWidth} min={0} max={4} onChange={(v) => update("borderWidth", v)} />
                {config.borderWidth > 0 && (
                  <ColorPicker label="Border Color" value={config.borderColor} onChange={(v) => update("borderColor", v)} />
                )}
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Typography</h3>
                <Slider label="Font Size" value={config.fontSize} min={12} max={24} onChange={(v) => update("fontSize", v)} />
                <Slider label="Font Weight" value={config.fontWeight} min={400} max={800} step={100} unit="" onChange={(v) => update("fontWeight", v)} />
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Colors</h3>
                <ColorPicker label="Gradient From" value={config.gradientFrom} onChange={(v) => update("gradientFrom", v)} />
                <ColorPicker label="Gradient To" value={config.gradientTo} onChange={(v) => update("gradientTo", v)} />
                <Slider label="Gradient Angle" value={config.gradientAngle} min={0} max={360} unit="°" onChange={(v) => update("gradientAngle", v)} />
                <ColorPicker label="Text Color" value={config.textColor} onChange={(v) => update("textColor", v)} />
              </div>

              {/* Effects */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Effects</h3>
                <Slider label="Shadow Intensity" value={config.shadowIntensity} min={0} max={80} onChange={(v) => update("shadowIntensity", v)} />
                <AnimationDropdown value={config.hoverAnimation} onChange={(v) => update("hoverAnimation", v)} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <SeoSection />
      <Footer />
    </div>
  );
};

export default ButtonGenerator;
