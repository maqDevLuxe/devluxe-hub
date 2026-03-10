/**
 * GradientGenerator — Fully functional Tailwind CSS gradient builder.
 * Pure frontend tool using React state. Glassmorphism premium aesthetic.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Tailwind color palette ─── */
const COLORS = [
  { name: "slate-300", hex: "#cbd5e1" }, { name: "slate-500", hex: "#64748b" }, { name: "slate-700", hex: "#334155" },
  { name: "red-400", hex: "#f87171" }, { name: "red-500", hex: "#ef4444" }, { name: "red-700", hex: "#b91c1c" },
  { name: "orange-400", hex: "#fb923c" }, { name: "orange-500", hex: "#f97316" }, { name: "orange-700", hex: "#c2410c" },
  { name: "amber-400", hex: "#fbbf24" }, { name: "amber-500", hex: "#f59e0b" },
  { name: "yellow-300", hex: "#fde047" }, { name: "yellow-500", hex: "#eab308" },
  { name: "lime-400", hex: "#a3e635" }, { name: "lime-500", hex: "#84cc16" },
  { name: "green-400", hex: "#4ade80" }, { name: "green-500", hex: "#22c55e" }, { name: "green-700", hex: "#15803d" },
  { name: "emerald-400", hex: "#34d399" }, { name: "emerald-500", hex: "#10b981" },
  { name: "teal-400", hex: "#2dd4bf" }, { name: "teal-500", hex: "#14b8a6" },
  { name: "cyan-400", hex: "#22d3ee" }, { name: "cyan-500", hex: "#06b6d4" },
  { name: "sky-400", hex: "#38bdf8" }, { name: "sky-500", hex: "#0ea5e9" },
  { name: "blue-400", hex: "#60a5fa" }, { name: "blue-500", hex: "#3b82f6" }, { name: "blue-700", hex: "#1d4ed8" },
  { name: "indigo-400", hex: "#818cf8" }, { name: "indigo-500", hex: "#6366f1" }, { name: "indigo-700", hex: "#4338ca" },
  { name: "violet-400", hex: "#a78bfa" }, { name: "violet-500", hex: "#8b5cf6" }, { name: "violet-700", hex: "#6d28d9" },
  { name: "purple-400", hex: "#c084fc" }, { name: "purple-500", hex: "#a855f7" },
  { name: "fuchsia-400", hex: "#e879f9" }, { name: "fuchsia-500", hex: "#d946ef" },
  { name: "pink-400", hex: "#f472b6" }, { name: "pink-500", hex: "#ec4899" }, { name: "pink-700", hex: "#be185d" },
  { name: "rose-400", hex: "#fb7185" }, { name: "rose-500", hex: "#f43f5e" },
  { name: "white", hex: "#ffffff" }, { name: "black", hex: "#000000" },
  { name: "transparent", hex: "transparent" },
];

/* ─── Gradient directions ─── */
const DIRECTIONS = [
  { label: "→", value: "to-r", css: "to right" },
  { label: "←", value: "to-l", css: "to left" },
  { label: "↓", value: "to-b", css: "to bottom" },
  { label: "↑", value: "to-t", css: "to top" },
  { label: "↘", value: "to-br", css: "to bottom right" },
  { label: "↗", value: "to-tr", css: "to top right" },
  { label: "↙", value: "to-bl", css: "to bottom left" },
  { label: "↖", value: "to-tl", css: "to top left" },
] as const;

/* ─── Color Picker Panel ─── */
const ColorPicker = ({
  label,
  selected,
  onSelect,
  enabled,
  onToggle,
  optional = false,
}: {
  label: string;
  selected: string;
  onSelect: (name: string) => void;
  enabled: boolean;
  onToggle?: () => void;
  optional?: boolean;
}) => {
  const selectedColor = COLORS.find((c) => c.name === selected);
  return (
    <motion.div
      layout
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Active color swatch */}
          <div
            className="w-8 h-8 rounded-lg border border-border/50 shrink-0"
            style={{
              background: selectedColor?.hex === "transparent"
                ? "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%) 50% / 12px 12px"
                : selectedColor?.hex,
            }}
          />
          <span className="font-display font-semibold text-sm text-foreground">{label}</span>
          {selected !== "none" && (
            <span className="text-xs text-muted-foreground font-mono">{selected}</span>
          )}
        </div>
        {optional && onToggle && (
          <button
            onClick={onToggle}
            className="text-xs px-3 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {enabled ? "Disable" : "Enable"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onSelect(color.name)}
                  title={color.name}
                  className={`w-7 h-7 rounded-md border-2 transition-all duration-150 hover:scale-110 ${
                    selected === color.name
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-transparent"
                  }`}
                  style={{
                    background: color.hex === "transparent"
                      ? "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                      : color.hex,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Main Page ─── */
const GradientGenerator = () => {
  const [fromColor, setFromColor] = useState("blue-500");
  const [viaColor, setViaColor] = useState("purple-500");
  const [toColor, setToColor] = useState("pink-500");
  const [viaEnabled, setViaEnabled] = useState(true);
  const [direction, setDirection] = useState("to-r");
  

  /* Build Tailwind class string */
  const tailwindClass = useMemo(() => {
    const parts = [`bg-gradient-${direction}`, `from-${fromColor}`];
    if (viaEnabled) parts.push(`via-${viaColor}`);
    parts.push(`to-${toColor}`);
    return parts.join(" ");
  }, [direction, fromColor, viaColor, toColor, viaEnabled]);

  /* Build inline CSS gradient for live preview */
  const previewGradient = useMemo(() => {
    const dir = DIRECTIONS.find((d) => d.value === direction)?.css || "to right";
    const from = COLORS.find((c) => c.name === fromColor)?.hex || "#3b82f6";
    const via = COLORS.find((c) => c.name === viaColor)?.hex || "#8b5cf6";
    const to = COLORS.find((c) => c.name === toColor)?.hex || "#ec4899";
    if (viaEnabled) {
      return `linear-gradient(${dir}, ${from}, ${via}, ${to})`;
    }
    return `linear-gradient(${dir}, ${from}, ${to})`;
  }, [direction, fromColor, viaColor, toColor, viaEnabled]);

  /* CSS output string */
  const cssOutput = useMemo(() => {
    const dir = DIRECTIONS.find((d) => d.value === direction)?.css || "to right";
    const from = COLORS.find((c) => c.name === fromColor)?.hex || "#3b82f6";
    const via = COLORS.find((c) => c.name === viaColor)?.hex || "#8b5cf6";
    const to = COLORS.find((c) => c.name === toColor)?.hex || "#ec4899";
    const stops = viaEnabled ? `${from}, ${via}, ${to}` : `${from}, ${to}`;
    return `background: linear-gradient(${dir}, ${stops});`;
  }, [direction, fromColor, viaColor, toColor, viaEnabled]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleReset = () => {
    setFromColor("blue-500");
    setViaColor("purple-500");
    setToColor("pink-500");
    setViaEnabled(true);
    setDirection("to-r");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── Tool Section ─── */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="w-3 h-3" />
              Free Tool — No Sign-Up Required
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Tailwind <span className="gradient-text">Gradient Generator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Visually craft beautiful Tailwind CSS gradients and copy the classes instantly.
            </p>
          </motion.div>

          {/* ─── Live Preview ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card rounded-3xl p-3 mb-8 glow-effect"
          >
            <div
              className="w-full h-64 sm:h-80 rounded-2xl transition-all duration-500"
              style={{ background: previewGradient }}
            />
          </motion.div>

          {/* ─── Controls Grid ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8"
          >
            {/* Direction selector */}
            <div className="lg:col-span-3 glass-card rounded-2xl p-5">
              <span className="font-display font-semibold text-sm text-foreground block mb-4">Direction</span>
              <div className="grid grid-cols-4 gap-2">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDirection(d.value)}
                    className={`h-10 rounded-lg font-mono text-sm transition-all duration-150 ${
                      direction === d.value
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleReset}
                className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 rounded-lg bg-secondary/30 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Color pickers */}
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorPicker label="From" selected={fromColor} onSelect={setFromColor} enabled={true} />
              <ColorPicker
                label="Via"
                selected={viaColor}
                onSelect={setViaColor}
                enabled={viaEnabled}
                onToggle={() => setViaEnabled((p) => !p)}
                optional
              />
              <ColorPicker label="To" selected={toColor} onSelect={setToColor} enabled={true} />
            </div>
          </motion.div>

          {/* ─── Output Panel ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="space-y-4"
          >
            {/* Tailwind output */}
            <OutputBox label="Tailwind Classes" code={tailwindClass} onCopy={handleCopy} />
            <OutputBox label="CSS" code={cssOutput} onCopy={handleCopy} />
          </motion.div>
        </div>
      </section>

      {/* ─── SEO Content Section ─── */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="prose-custom"
          >
            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              What is a CSS Gradient?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A CSS gradient is a smooth transition between two or more colours, rendered natively by
              the browser without requiring image files. Gradients are defined using functions like{" "}
              <code className="px-1.5 py-0.5 rounded bg-secondary/60 text-accent-foreground text-sm font-mono">linear-gradient()</code>,{" "}
              <code className="px-1.5 py-0.5 rounded bg-secondary/60 text-accent-foreground text-sm font-mono">radial-gradient()</code>, and{" "}
              <code className="px-1.5 py-0.5 rounded bg-secondary/60 text-accent-foreground text-sm font-mono">conic-gradient()</code>.
              They are resolution-independent, infinitely scalable, and dramatically lighter than
              bitmap alternatives — making them ideal for performance-focused modern web design.
            </p>

            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              Why Use Tailwind CSS Gradients?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tailwind CSS turns complex gradient syntax into intuitive utility classes. Instead of
              writing verbose CSS, you compose gradients directly in your markup:
            </p>
            <div className="rounded-xl bg-card border border-border/50 p-4 mb-6 font-mono text-sm text-foreground overflow-x-auto">
              &lt;div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"&gt;…&lt;/div&gt;
            </div>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Rapid prototyping</strong> — change colours and directions in seconds without leaving your HTML.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Design consistency</strong> — Tailwind's curated palette ensures harmonious colour combinations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Zero runtime cost</strong> — gradients compile to static CSS with no JavaScript overhead.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Responsive & stateful</strong> — combine with breakpoints and dark-mode variants effortlessly.</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              This generator lets you visually explore every combination, preview the result in
              real-time, and copy production-ready code with a single click — all without leaving
              your browser.
            </p>
          </motion.article>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ─── Reusable Output Box with self-contained copied state ─── */
const OutputBox = ({
  label,
  code,
  onCopy,
}: {
  label: string;
  code: string;
  onCopy: (text: string) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded-xl bg-card border border-border/50 p-4 font-mono text-sm text-foreground overflow-x-auto select-all">
        {code}
      </div>
    </div>
  );
};

export default GradientGenerator;
