/**
 * CssAnimator — CSS Keyframe Generator with live preview, bezier editor, and code export.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ArrowLeft, Play, RotateCcw } from "lucide-react";
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
interface AnimConfig {
  name: string;
  duration: number;
  delay: number;
  iterationCount: string;
  direction: string;
  fillMode: string;
  translateX: number;
  translateY: number;
  scaleFrom: number;
  scaleTo: number;
  rotateFrom: number;
  rotateTo: number;
  opacityFrom: number;
  opacityTo: number;
  bezier: [number, number, number, number];
}

const defaultConfig: AnimConfig = {
  name: "custom-animation",
  duration: 1,
  delay: 0,
  iterationCount: "infinite",
  direction: "alternate",
  fillMode: "both",
  translateX: 0,
  translateY: -20,
  scaleFrom: 1,
  scaleTo: 1.1,
  rotateFrom: 0,
  rotateTo: 0,
  opacityFrom: 1,
  opacityTo: 1,
  bezier: [0.42, 0, 0.58, 1],
};

/* ─── Neon Slider ─── */
const NeonSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
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
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-primary">{value}{unit}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden group">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--glow-secondary)))`,
            boxShadow: `0 0 8px hsl(var(--primary) / 0.5)`,
          }}
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

/* ─── Bezier Curve Editor ─── */
const BezierEditor = ({
  value,
  onChange,
}: {
  value: [number, number, number, number];
  onChange: (v: [number, number, number, number]) => void;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<1 | 2 | null>(null);
  const size = 160;
  const pad = 16;
  const inner = size - pad * 2;

  const toSvg = (x: number, y: number) => ({
    cx: pad + x * inner,
    cy: pad + (1 - y) * inner,
  });

  const fromSvg = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left - pad) / inner));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top - pad) / inner));
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100] as [number, number];
  };

  const p1 = toSvg(value[0], value[1]);
  const p2 = toSvg(value[2], value[3]);
  const start = toSvg(0, 0);
  const end = toSvg(1, 1);

  const handleMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!dragging) return;
      const [x, y] = fromSvg(e.clientX, e.clientY);
      if (dragging === 1) onChange([x, y, value[2], value[3]]);
      else onChange([value[0], value[1], x, y]);
    },
    [dragging, value, onChange]
  );

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(null);
    const move = (e: MouseEvent) => handleMove(e);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, handleMove]);

  const presets: { label: string; val: [number, number, number, number] }[] = [
    { label: "ease", val: [0.25, 0.1, 0.25, 1] },
    { label: "ease-in-out", val: [0.42, 0, 0.58, 1] },
    { label: "ease-out", val: [0, 0, 0.58, 1] },
    { label: "bounce", val: [0.34, 1.56, 0.64, 1] },
  ];

  return (
    <div className="space-y-3">
      <span className="text-xs text-muted-foreground">Easing Curve</span>
      <div className="glass-card rounded-xl p-3 flex flex-col items-center">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="cursor-crosshair"
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75].map((t) => (
            <g key={t} opacity={0.15}>
              <line x1={pad + t * inner} y1={pad} x2={pad + t * inner} y2={pad + inner} stroke="currentColor" className="text-muted-foreground" />
              <line x1={pad} y1={pad + t * inner} x2={pad + inner} y2={pad + t * inner} stroke="currentColor" className="text-muted-foreground" />
            </g>
          ))}
          {/* Linear reference */}
          <line x1={start.cx} y1={start.cy} x2={end.cx} y2={end.cy} stroke="currentColor" className="text-border" strokeDasharray="4 4" />
          {/* Control lines */}
          <line x1={start.cx} y1={start.cy} x2={p1.cx} y2={p1.cy} stroke="hsl(var(--primary))" strokeWidth={1} opacity={0.5} />
          <line x1={end.cx} y1={end.cy} x2={p2.cx} y2={p2.cy} stroke="hsl(var(--glow-secondary))" strokeWidth={1} opacity={0.5} />
          {/* Curve */}
          <path
            d={`M ${start.cx} ${start.cy} C ${p1.cx} ${p1.cy}, ${p2.cx} ${p2.cy}, ${end.cx} ${end.cy}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }}
          />
          {/* Control points */}
          <circle
            cx={p1.cx}
            cy={p1.cy}
            r={6}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
            className="cursor-grab"
            onMouseDown={() => setDragging(1)}
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" }}
          />
          <circle
            cx={p2.cx}
            cy={p2.cy}
            r={6}
            fill="hsl(var(--glow-secondary))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
            className="cursor-grab"
            onMouseDown={() => setDragging(2)}
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--glow-secondary) / 0.6))" }}
          />
        </svg>
        <span className="text-xs font-mono text-primary mt-1">
          cubic-bezier({value.join(", ")})
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.val)}
            className="px-2.5 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Code Generator ─── */
function generateCSS(c: AnimConfig): string {
  const easing = `cubic-bezier(${c.bezier.join(", ")})`;
  const fromTransform = `translate(${c.translateX === 0 ? "0" : c.translateX + "px"}, ${c.translateY === 0 ? "0" : c.translateY + "px"}) scale(${c.scaleFrom}) rotate(${c.rotateFrom}deg)`;
  const toTransform = `translate(0, 0) scale(${c.scaleTo}) rotate(${c.rotateTo}deg)`;

  return `@keyframes ${c.name} {
  from {
    transform: ${fromTransform};
    opacity: ${c.opacityFrom};
  }
  to {
    transform: ${toTransform};
    opacity: ${c.opacityTo};
  }
}

.animated-element {
  animation: ${c.name} ${c.duration}s ${easing} ${c.delay}s ${c.iterationCount} ${c.direction} ${c.fillMode};
}`;
}

/* ─── Code Block ─── */
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("CSS copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">CSS</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-card text-foreground">
        {code}
      </pre>
    </div>
  );
};

/* ─── Select ─── */
const SmallSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs text-muted-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

/* ─── Live Preview ─── */
const LivePreview = ({ config, animKey }: { config: AnimConfig; animKey: number }) => {
  const easing = `cubic-bezier(${config.bezier.join(", ")})`;
  const fromTransform = `translate(${config.translateX}px, ${config.translateY}px) scale(${config.scaleFrom}) rotate(${config.rotateFrom}deg)`;
  const toTransform = `translate(0, 0) scale(${config.scaleTo}) rotate(${config.rotateTo}deg)`;
  const animName = `live-anim-${animKey}`;

  const keyframesCSS = `
    @keyframes ${animName} {
      from { transform: ${fromTransform}; opacity: ${config.opacityFrom}; }
      to { transform: ${toTransform}; opacity: ${config.opacityTo}; }
    }
  `;

  return (
    <div className="relative flex items-center justify-center min-h-[280px] bg-grid rounded-xl border border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-glow-secondary/5" />
      <style>{keyframesCSS}</style>
      <div
        key={animKey}
        className="w-20 h-20 rounded-2xl relative"
        style={{
          background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--glow-secondary)))`,
          boxShadow: `0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--glow-secondary) / 0.15)`,
          animation: `${animName} ${config.duration}s ${easing} ${config.delay}s ${config.iterationCount} ${config.direction} ${config.fillMode}`,
        }}
      />
    </div>
  );
};

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          What Is a <span className="gradient-text">CSS Keyframe</span> Animation?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          CSS <code className="text-primary mx-1">@keyframes</code> define intermediate steps in an animation sequence,
          giving you fine-grained control over an element's style at specific points during the animation cycle.
          Unlike transitions (which animate between two states), keyframe animations can define multiple
          waypoints with different properties at each stage—enabling complex, multi-step motion design entirely in CSS.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Modern browsers hardware-accelerate <code className="text-primary mx-1">transform</code> and
          <code className="text-primary mx-1">opacity</code> properties, making keyframe animations with these
          properties incredibly performant—often running on the GPU compositor thread without triggering layout recalculations.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How to Optimize CSS Animations for <span className="gradient-text">60fps</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The golden rule: only animate <code className="text-primary mx-1">transform</code> and
          <code className="text-primary mx-1">opacity</code>. These two properties can be composited on the GPU
          without triggering layout or paint. Animating properties like <code className="text-primary mx-1">width</code>,
          <code className="text-primary mx-1">height</code>, <code className="text-primary mx-1">top</code>, or
          <code className="text-primary mx-1">margin</code> forces the browser to recalculate layout every frame—a major jank source.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Use <code className="text-primary mx-1">will-change: transform</code> sparingly to hint the browser about
          upcoming animations. Avoid animating more than 2-3 elements simultaneously on mobile. Our generator above
          only uses transform and opacity to ensure silky 60fps output by default.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Transition vs <span className="gradient-text">Animation</span>: What's the Difference?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "CSS Transition", points: ["Triggered by state change (hover, class)", "Only from → to (two states)", "Simpler syntax", "Best for interactive feedback"] },
            { title: "CSS Animation", points: ["Runs automatically or on trigger", "Multiple keyframes (0%–100%)", "Loop, direction, delay control", "Best for decorative motion"] },
          ].map((col) => (
            <div key={col.title} className="glass-card rounded-xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-foreground">{col.title}</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {col.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "Can I use multiple keyframes (not just from/to)?", a: "Our generator outputs from/to for clean, optimized animations. You can manually add percentage steps (25%, 50%, 75%) to the generated code for multi-step sequences." },
            { q: "Will this animation work in all browsers?", a: "CSS @keyframes are supported in all modern browsers (Chrome, Firefox, Safari, Edge). No vendor prefixes are needed for current browser versions." },
            { q: "How do I trigger the animation on scroll?", a: "Pair the generated CSS class with Intersection Observer in JavaScript, or use CSS scroll-driven animations (supported in Chrome 115+) for a pure CSS approach." },
            { q: "What is a cubic-bezier curve?", a: "It defines the speed curve of an animation using four control points (x1, y1, x2, y2). The curve maps time (x-axis) to animation progress (y-axis). Values outside 0-1 on the y-axis create overshoot/bounce effects." },
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
const CssAnimator = () => {
  const [config, setConfig] = useState<AnimConfig>(defaultConfig);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    document.title = "CSS Keyframe Generator — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Build CSS @keyframes animations visually with a bezier curve editor, live preview, and instant code export. Optimized for 60fps.");
    }
  }, []);

  const code = useMemo(() => generateCSS(config), [config]);

  const update = <K extends keyof AnimConfig>(key: K, value: AnimConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setAnimKey((k) => k + 1);
  };

  const replay = () => setAnimKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to tools
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              CSS Keyframe <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Visually craft CSS animations with a bezier curve editor, live preview, and instant code export.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Preview + Code */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7 space-y-6">
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Live Preview</span>
                  <button onClick={replay} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <RotateCcw className="w-3.5 h-3.5" /> Replay
                  </button>
                </div>
                <LivePreview config={config} animKey={animKey} />
              </div>

              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 block">Generated Code</span>
                <CodeBlock code={code} />
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-5 h-fit lg:sticky lg:top-28"
            >
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Controls</span>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Animation Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value.replace(/[^a-zA-Z0-9-_]/g, "") }))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Timing */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Timing</h3>
                <NeonSlider label="Duration" value={config.duration} min={0.1} max={5} step={0.1} unit="s" onChange={(v) => update("duration", v)} />
                <NeonSlider label="Delay" value={config.delay} min={0} max={3} step={0.1} unit="s" onChange={(v) => update("delay", v)} />
                <div className="grid grid-cols-2 gap-3">
                  <SmallSelect label="Iterations" value={config.iterationCount} options={["1", "2", "3", "infinite"]} onChange={(v) => update("iterationCount", v)} />
                  <SmallSelect label="Direction" value={config.direction} options={["normal", "reverse", "alternate", "alternate-reverse"]} onChange={(v) => update("direction", v)} />
                </div>
                <SmallSelect label="Fill Mode" value={config.fillMode} options={["none", "forwards", "backwards", "both"]} onChange={(v) => update("fillMode", v)} />
              </div>

              {/* Transform */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Transform (From)</h3>
                <NeonSlider label="Translate X" value={config.translateX} min={-100} max={100} unit="px" onChange={(v) => update("translateX", v)} />
                <NeonSlider label="Translate Y" value={config.translateY} min={-100} max={100} unit="px" onChange={(v) => update("translateY", v)} />
                <NeonSlider label="Scale From" value={config.scaleFrom} min={0} max={2} step={0.05} onChange={(v) => update("scaleFrom", v)} />
                <NeonSlider label="Scale To" value={config.scaleTo} min={0} max={2} step={0.05} onChange={(v) => update("scaleTo", v)} />
                <NeonSlider label="Rotate From" value={config.rotateFrom} min={-360} max={360} unit="°" onChange={(v) => update("rotateFrom", v)} />
                <NeonSlider label="Rotate To" value={config.rotateTo} min={-360} max={360} unit="°" onChange={(v) => update("rotateTo", v)} />
              </div>

              {/* Opacity */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Opacity</h3>
                <NeonSlider label="From" value={config.opacityFrom} min={0} max={1} step={0.05} onChange={(v) => update("opacityFrom", v)} />
                <NeonSlider label="To" value={config.opacityTo} min={0} max={1} step={0.05} onChange={(v) => update("opacityTo", v)} />
              </div>

              {/* Bezier */}
              <BezierEditor value={config.bezier} onChange={(v) => update("bezier", v)} />
            </motion.div>
          </div>
        </div>
      </main>

      <SeoSection />
      <Footer />
    </div>
  );
};

export default CssAnimator;
