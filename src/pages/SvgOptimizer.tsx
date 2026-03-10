/**
 * SvgOptimizer — Client-side SVG optimizer with before/after comparison.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Copy, Check, ArrowLeft, Upload, Download, Trash2, GripVertical } from "lucide-react";
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

/* ─── SVG Optimization Engine (Pure JS/Regex) ─── */
function optimizeSvg(raw: string): string {
  let s = raw;
  // Remove XML declaration
  s = s.replace(/<\?xml[^?]*\?>\s*/gi, "");
  // Remove DOCTYPE
  s = s.replace(/<!DOCTYPE[^>]*>\s*/gi, "");
  // Remove XML comments
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // Remove editor metadata (Inkscape, Illustrator, Sketch)
  s = s.replace(/<(metadata|sodipodi:[^>]*|inkscape:[^>]*)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  // Remove empty <defs></defs>
  s = s.replace(/<defs\s*>\s*<\/defs>/gi, "");
  // Remove empty <g></g>
  s = s.replace(/<g\s*>\s*<\/g>/gi, "");
  // Remove xmlns:xlink if no xlink usage remains
  if (!s.includes("xlink:")) {
    s = s.replace(/\s*xmlns:xlink="[^"]*"/g, "");
  }
  // Remove Inkscape/Sodipodi/Illustrator namespaces & attributes
  s = s.replace(/\s*xmlns:(inkscape|sodipodi|dc|cc|rdf|sketch|ai)="[^"]*"/gi, "");
  s = s.replace(/\s*(inkscape|sodipodi|sketch|ai):[a-z-]+="[^"]*"/gi, "");
  // Remove data- attributes from editors
  s = s.replace(/\s*data-name="[^"]*"/g, "");
  // Remove id attributes that look auto-generated (optional, conservative)
  // s = s.replace(/\s*id="(Layer_|SVGID_|_)[^"]*"/g, "");
  // Remove empty style attributes
  s = s.replace(/\s*style="\s*"/g, "");
  // Remove empty class attributes
  s = s.replace(/\s*class="\s*"/g, "");
  // Collapse whitespace between tags
  s = s.replace(/>\s+</g, "><");
  // Collapse multiple spaces in attributes
  s = s.replace(/ {2,}/g, " ");
  // Trim leading/trailing whitespace per line then collapse
  s = s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  // Remove empty lines
  s = s.replace(/\n{2,}/g, "\n");
  return s.trim();
}

/* ─── Animated Counter ─── */
const AnimatedPercent = ({ value }: { value: number }) => {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setCurrent(v));
    return unsub;
  }, [display]);

  return <span>{current}</span>;
};

/* ─── Before/After Slider ─── */
const BeforeAfterSlider = ({
  beforeSvg,
  afterSvg,
}: {
  beforeSvg: string;
  afterSvg: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      setSplit(pct);
    },
    []
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, handleMove]);

  const beforeUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(beforeSvg)}`;
  const afterUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(afterSvg)}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-h-[360px] rounded-xl overflow-hidden border border-border bg-grid cursor-col-resize select-none"
      onMouseDown={() => setDragging(true)}
      onTouchStart={() => setDragging(true)}
    >
      {/* After (full) */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <img src={afterUrl} alt="Optimized SVG" className="max-w-full max-h-full object-contain" />
      </div>
      {/* Before (clipped) */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      >
        <img src={beforeUrl} alt="Original SVG" className="max-w-full max-h-full object-contain" />
      </div>
      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
        style={{ left: `${split}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
          style={{ boxShadow: `0 0 16px hsl(var(--primary) / 0.4)` }}
        >
          <GripVertical className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      {/* Labels */}
      <span className="absolute top-3 left-3 text-xs font-mono px-2 py-0.5 rounded bg-secondary/80 text-foreground z-20">Before</span>
      <span className="absolute top-3 right-3 text-xs font-mono px-2 py-0.5 rounded bg-primary/80 text-primary-foreground z-20">After</span>
    </div>
  );
};

/* ─── Drop Zone ─── */
const DropZone = ({
  onFile,
}: {
  onFile: (content: string, name: string) => void;
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".svg")) {
      toast.error("Please upload an SVG file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFile(text, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      animate={{
        borderColor: dragOver ? "hsl(var(--primary))" : "hsl(var(--border))",
        boxShadow: dragOver ? "0 0 30px hsl(var(--primary) / 0.15)" : "none",
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      className="glass-card rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all"
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".svg";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
      <p className="text-foreground font-medium mb-1">
        Drop your SVG here or click to browse
      </p>
      <p className="text-xs text-muted-foreground">.svg files only</p>
    </motion.div>
  );
};

/* ─── Code Block ─── */
const CodeBlock = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{label}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-card text-foreground max-h-48">
        {code}
      </pre>
    </div>
  );
};

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Why Optimize <span className="gradient-text">SVG Files</span>?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          SVG files exported from design tools like Figma, Illustrator, and Inkscape contain significant
          bloat: XML declarations, editor metadata, empty groups, redundant namespaces, and verbose
          formatting. This metadata serves no visual purpose but increases file size—sometimes by
          40-60%. Optimized SVGs load faster, render quicker, and consume less bandwidth, directly
          improving your Core Web Vitals scores (especially LCP and CLS).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Since SVGs are text-based, they compress well with gzip/brotli. But starting with a smaller
          source file means even better compression ratios. Every kilobyte matters for above-the-fold
          icons, logos, and illustrations that block rendering.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How Does SVG <span className="gradient-text">Minification</span> Work?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          SVG minification removes unnecessary data without changing the visual output. This includes
          stripping XML comments, editor-specific metadata (Inkscape's <code className="text-primary mx-1">sodipodi</code>
          namespace, Illustrator's <code className="text-primary mx-1">data-name</code> attributes),
          empty elements (<code className="text-primary mx-1">&lt;defs&gt;&lt;/defs&gt;</code>,
          <code className="text-primary mx-1">&lt;g&gt;&lt;/g&gt;</code>), and collapsing whitespace.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Advanced optimizers also merge paths, simplify transforms, convert shapes to shorter path
          notation, and reduce decimal precision. Our tool focuses on safe, lossless optimizations that
          guarantee visual fidelity while achieving meaningful size reductions.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Impact of SVGs on <span className="gradient-text">Page Load Speed</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Inline SVGs are parsed as part of the DOM—bloated SVGs mean more DOM nodes, longer parse times,
          and increased memory usage. A page with 20 unoptimized SVG icons could have thousands of
          unnecessary DOM nodes. External SVGs loaded via <code className="text-primary mx-1">&lt;img&gt;</code>
          tags add HTTP requests. In both cases, smaller files mean faster rendering.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For critical above-the-fold SVGs (logos, hero illustrations), inline optimized SVGs eliminate
          the network request entirely. For decorative SVGs, lazy loading with <code className="text-primary mx-1">loading="lazy"</code>
          prevents them from blocking the initial paint.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "Will optimization change how my SVG looks?", a: "No. Our optimizer only removes non-visual data (comments, metadata, empty elements). The visual output is identical to the original." },
            { q: "Is my SVG uploaded to a server?", a: "No. All processing happens entirely in your browser using JavaScript. Your files never leave your device." },
            { q: "Can I optimize animated SVGs?", a: "Yes, but with caution. The optimizer preserves animation elements (<animate>, <animateTransform>) but may remove some editor-specific attributes. Always test the output." },
            { q: "What's a good target file size for SVG icons?", a: "Most UI icons should be under 1KB optimized. Illustrations typically range from 2-15KB. If your SVG exceeds 50KB, consider simplifying paths in your design tool." },
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
const SvgOptimizer = () => {
  const [fileName, setFileName] = useState("");
  const [original, setOriginal] = useState("");
  const [optimized, setOptimized] = useState("");

  useEffect(() => {
    document.title = "SVG Optimizer — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Optimize SVG files instantly in your browser. Strip metadata, remove empty tags, and reduce file size. Free, private, no upload required.");
    }
  }, []);

  const originalSize = new Blob([original]).size;
  const optimizedSize = new Blob([optimized]).size;
  const saved = originalSize > 0 ? Math.round(((originalSize - optimizedSize) / originalSize) * 100) : 0;

  const handleFile = (content: string, name: string) => {
    setFileName(name);
    setOriginal(content);
    setOptimized(optimizeSvg(content));
    toast.success("SVG optimized!");
  };

  const handleDownload = () => {
    const blob = new Blob([optimized], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(".svg", ".min.svg");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setFileName("");
    setOriginal("");
    setOptimized("");
  };

  const formatSize = (bytes: number) =>
    bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to tools
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              SVG <span className="gradient-text">Optimizer</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Strip metadata, remove bloat, and reduce SVG file size—entirely in your browser.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {!original ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DropZone onFile={handleFile} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs text-muted-foreground block">Original</span>
                      <span className="text-lg font-mono font-bold text-foreground">{formatSize(originalSize)}</span>
                    </div>
                    <div className="text-2xl text-muted-foreground/30">→</div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Optimized</span>
                      <span className="text-lg font-mono font-bold text-primary">{formatSize(optimizedSize)}</span>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Saved</span>
                      <span className="text-lg font-mono font-bold text-primary">
                        <AnimatedPercent value={saved} />%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> New File
                    </button>
                  </div>
                </div>

                {/* Visual Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 block">
                      Visual Comparison
                    </span>
                    <BeforeAfterSlider beforeSvg={original} afterSvg={optimized} />
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest block">
                      File: {fileName}
                    </span>
                    <CodeBlock code={optimized} label="Optimized SVG" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <SeoSection />
      <Footer />
    </div>
  );
};

export default SvgOptimizer;
