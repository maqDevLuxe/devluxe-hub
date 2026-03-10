/**
 * ColorExtractor — Upload an image, extract top 5 dominant colors via Canvas pixel analysis.
 * Pure frontend: Canvas API + k-means-inspired quantisation. No backend.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Copy, Check, Pipette, X } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Colour extraction via quantised pixel sampling ─── */
const extractColors = (img: HTMLImageElement, count = 5): string[] => {
  const canvas = document.createElement("canvas");
  const size = 150; // downsample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  /* Bucket pixels into a map keyed by quantised RGB */
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  const q = 24; // quantisation step

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent
    const r = Math.round(data[i] / q) * q;
    const g = Math.round(data[i + 1] / q) * q;
    const b = Math.round(data[i + 2] / q) * q;
    const key = `${r},${g},${b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.r += data[i];
      existing.g += data[i + 1];
      existing.b += data[i + 2];
      existing.count += 1;
    } else {
      buckets.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
    }
  }

  /* Sort by frequency, take top N, compute average hex */
  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);

  /* Filter out near-duplicates */
  const results: string[] = [];
  for (const bucket of sorted) {
    if (results.length >= count) break;
    const avgR = Math.round(bucket.r / bucket.count);
    const avgG = Math.round(bucket.g / bucket.count);
    const avgB = Math.round(bucket.b / bucket.count);
    const hex = `#${[avgR, avgG, avgB].map((c) => c.toString(16).padStart(2, "0")).join("")}`;

    /* Skip if too close to an existing result */
    const tooClose = results.some((existing) => {
      const er = parseInt(existing.slice(1, 3), 16);
      const eg = parseInt(existing.slice(3, 5), 16);
      const eb = parseInt(existing.slice(5, 7), 16);
      return Math.abs(avgR - er) + Math.abs(avgG - eg) + Math.abs(avgB - eb) < 60;
    });
    if (!tooClose) results.push(hex);
  }

  return results;
};

/* ─── Determine if a colour is light or dark for text contrast ─── */
const isLight = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150;
};

/* ─── Hex to HSL string ─── */
const hexToHsl = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

/* ─── Hex to RGB string ─── */
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

/* ─── Color Block Card ─── */
const ColorCard = ({ hex, index }: { hex: string; index: number }) => {
  const [copied, setCopied] = useState(false);
  const light = isLight(hex);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`Copied ${value}`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" }}
      animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleCopy(hex)}
      className="cursor-pointer group relative rounded-2xl overflow-hidden"
      style={{ background: hex }}
    >
      <div className="aspect-[3/4] sm:aspect-square flex flex-col items-center justify-end p-5 relative">
        {/* Subtle gradient overlay for text readability */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: light
              ? "linear-gradient(to top, rgba(0,0,0,0.12), transparent)"
              : "linear-gradient(to top, rgba(255,255,255,0.08), transparent)",
          }}
        />

        <div className="relative z-10 text-center space-y-1 w-full">
          {/* Hex */}
          <div className="flex items-center justify-center gap-1.5">
            {copied ? (
              <Check className="w-3.5 h-3.5" style={{ color: light ? "#1a1a1a" : "#ffffff" }} />
            ) : (
              <Copy
                className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity"
                style={{ color: light ? "#1a1a1a" : "#ffffff" }}
              />
            )}
            <span
              className="font-mono text-sm font-semibold tracking-wide uppercase"
              style={{ color: light ? "#1a1a1a" : "#ffffff" }}
            >
              {hex}
            </span>
          </div>
          {/* Secondary values */}
          <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-60 transition-opacity text-[10px] font-mono"
            style={{ color: light ? "#1a1a1a" : "#ffffff" }}
          >
            <button onClick={(e) => { e.stopPropagation(); handleCopy(hexToRgb(hex)); }} className="hover:underline">
              {hexToRgb(hex)}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleCopy(hexToHsl(hex)); }} className="hover:underline">
              {hexToHsl(hex)}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */
const ColorExtractor = () => {
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Dynamic SEO meta */
  useEffect(() => {
    document.title = "Color Palette Extractor — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Extract the dominant color palette from any image. Get hex, RGB, and HSL values instantly. Free, private, runs in your browser."
      );
    }
  }, []);

  /* ─── Process image ─── */
  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    setIsProcessing(true);
    setColors([]);

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setSourcePreview(dataUrl);

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const extracted = extractColors(img, 5);
      setColors(extracted);
      toast.success(`Extracted ${extracted.length} dominant colors!`);
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /* Drag handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImage(file);
  }, [processImage]);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleReset = useCallback(() => {
    setSourcePreview(null);
    setColors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── Tool Section ─── */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-muted-foreground mb-6">
              <Pipette className="w-3 h-3" />
              Free Tool — No Sign-Up Required
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Color Palette <span className="gradient-text">Extractor</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload any image and instantly discover its dominant color palette. Copy hex, RGB, or HSL with a single click.
            </p>
          </motion.div>

          {/* ─── Upload / Preview ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {!sourcePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative glass-card rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] ${
                  isDragging
                    ? "border-primary bg-primary/5 shadow-[0_0_40px_-8px_hsl(var(--glow)/0.3)]"
                    : "border-border/50 hover:border-primary/40 hover:bg-secondary/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload image"
                />
                <motion.div
                  animate={isDragging ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-foreground mb-2">
                    {isDragging ? "Drop it here" : "Drop your image here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse — PNG, JPG, WEBP, SVG
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">
                    Source Image
                  </span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-secondary/20 p-6 min-h-[180px]">
                  <img
                    src={sourcePreview}
                    alt="Uploaded source"
                    className="max-h-56 max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Processing */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Extracting palette…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Color Blocks ─── */}
          <AnimatePresence>
            {colors.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-10"
              >
                <h2 className="font-display font-semibold text-foreground text-lg mb-6 px-1">
                  Dominant Colors
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {colors.map((hex, i) => (
                    <ColorCard key={hex + i} hex={hex} index={i} />
                  ))}
                </div>

                {/* Full palette bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 h-16 rounded-2xl overflow-hidden flex"
                >
                  {colors.map((hex, i) => (
                    <div key={i} className="flex-1" style={{ background: hex }} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── SEO Content ─── */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              Color Theory in Web Design
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Color is the single most influential element of visual design. It communicates mood,
              establishes hierarchy, and guides user attention — all within milliseconds of page
              load. A well-chosen palette creates emotional resonance: blues convey trust, warm
              tones evoke energy, and neutrals lend sophistication. Understanding the color wheel,
              complementary pairs, and analogous harmonies empowers designers to make intentional
              choices rather than relying on instinct alone.
            </p>

            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              How to Extract Colors from Images
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Extracting a palette from an existing image is a powerful shortcut to cohesive design.
              The process works by sampling every pixel, quantising similar colours into buckets,
              and ranking those buckets by frequency. This tool performs that analysis entirely in
              your browser using the HTML5 Canvas API:
            </p>
            <ol className="space-y-3 text-muted-foreground mb-8 list-decimal list-inside">
              <li>
                <strong className="text-foreground">Downsample</strong> — the image is drawn onto a
                small canvas to reduce computation.
              </li>
              <li>
                <strong className="text-foreground">Quantise</strong> — each pixel's RGB values are
                rounded to reduce the colour space.
              </li>
              <li>
                <strong className="text-foreground">Rank</strong> — buckets are sorted by pixel
                count; near-duplicates are merged.
              </li>
              <li>
                <strong className="text-foreground">Output</strong> — the top colours are converted
                to hex, RGB, and HSL for immediate use.
              </li>
            </ol>

            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              Best Color Combinations for UI
            </h2>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">60-30-10 Rule</strong> — allocate 60% to a
                  dominant neutral, 30% to a secondary colour, and 10% to a vibrant accent.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Monochromatic palettes</strong> — use
                  different lightness values of a single hue for a refined, editorial feel.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Complementary accents</strong> — pair colours
                  opposite on the wheel (e.g., blue + orange) for maximum contrast on CTAs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Accessibility first</strong> — always verify a
                  minimum 4.5:1 contrast ratio between text and background (WCAG AA).
                </span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Use this extractor to pull palettes from photographs, artwork, or competitor UIs —
              then fine-tune the values for your own brand identity, entirely in the browser.
            </p>
          </motion.article>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ColorExtractor;
