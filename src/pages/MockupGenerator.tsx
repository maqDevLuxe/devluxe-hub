/**
 * MockupGenerator — Dribbble-ready screenshot mockup builder with Canvas rendering.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Download, Monitor, Smartphone, Tablet, Image as ImageIcon } from "lucide-react";
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

/* ─── Device Frames ─── */
type DeviceType = "macbook" | "iphone" | "ipad" | "browser" | "none";

interface DeviceConfig {
  id: DeviceType;
  label: string;
  icon: React.ElementType;
  canvasW: number;
  canvasH: number;
  // Inset where screenshot goes (relative to canvas)
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  cornerRadius: number;
  drawFrame: (ctx: CanvasRenderingContext2D, w: number, h: number, isDark: boolean) => void;
}

const devices: DeviceConfig[] = [
  {
    id: "macbook",
    label: "Laptop",
    icon: Monitor,
    canvasW: 1400,
    canvasH: 900,
    screenX: 140,
    screenY: 60,
    screenW: 1120,
    screenH: 700,
    cornerRadius: 8,
    drawFrame: (ctx, w, h, isDark) => {
      const frameColor = isDark ? "#1a1a2e" : "#e8e8ed";
      const bezelColor = isDark ? "#0d0d1a" : "#d1d1d6";
      // Screen bezel
      ctx.fillStyle = frameColor;
      roundRect(ctx, 120, 40, 1160, 740, 16);
      ctx.fill();
      // Inner screen border
      ctx.fillStyle = isDark ? "#000" : "#111";
      roundRect(ctx, 136, 56, 1128, 708, 6);
      ctx.fill();
      // Bottom bar (chassis)
      ctx.fillStyle = bezelColor;
      roundRect(ctx, 60, 780, 1280, 30, 4);
      ctx.fill();
      // Hinge notch
      ctx.fillStyle = frameColor;
      roundRect(ctx, 560, 778, 280, 8, 4);
      ctx.fill();
      // Bottom base
      ctx.fillStyle = isDark ? "#111122" : "#d8d8dd";
      ctx.beginPath();
      ctx.moveTo(40, 810);
      ctx.lineTo(1360, 810);
      ctx.lineTo(1340, 830);
      ctx.lineTo(60, 830);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    id: "iphone",
    label: "Phone",
    icon: Smartphone,
    canvasW: 500,
    canvasH: 960,
    screenX: 42,
    screenY: 42,
    screenW: 416,
    screenH: 876,
    cornerRadius: 24,
    drawFrame: (ctx, w, h, isDark) => {
      const frameColor = isDark ? "#1a1a2e" : "#e0e0e5";
      ctx.fillStyle = frameColor;
      roundRect(ctx, 20, 20, 460, 920, 52);
      ctx.fill();
      ctx.fillStyle = isDark ? "#000" : "#111";
      roundRect(ctx, 38, 38, 424, 884, 36);
      ctx.fill();
      // Dynamic island
      ctx.fillStyle = isDark ? "#0a0a15" : "#000";
      roundRect(ctx, 170, 52, 160, 28, 14);
      ctx.fill();
      // Side button
      ctx.fillStyle = frameColor;
      ctx.fillRect(478, 200, 6, 80);
      // Volume buttons
      ctx.fillRect(16, 180, 6, 50);
      ctx.fillRect(16, 250, 6, 50);
    },
  },
  {
    id: "ipad",
    label: "Tablet",
    icon: Tablet,
    canvasW: 1100,
    canvasH: 820,
    screenX: 50,
    screenY: 50,
    screenW: 1000,
    screenH: 720,
    cornerRadius: 16,
    drawFrame: (ctx, w, h, isDark) => {
      const frameColor = isDark ? "#1a1a2e" : "#e0e0e5";
      ctx.fillStyle = frameColor;
      roundRect(ctx, 20, 20, 1060, 780, 32);
      ctx.fill();
      ctx.fillStyle = isDark ? "#000" : "#111";
      roundRect(ctx, 46, 46, 1008, 728, 12);
      ctx.fill();
      // Camera dot
      ctx.fillStyle = isDark ? "#222240" : "#c0c0c5";
      ctx.beginPath();
      ctx.arc(550, 34, 5, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: "browser",
    label: "Browser",
    icon: Monitor,
    canvasW: 1200,
    canvasH: 820,
    screenX: 20,
    screenY: 72,
    screenW: 1160,
    screenH: 728,
    cornerRadius: 0,
    drawFrame: (ctx, w, h, isDark) => {
      const barColor = isDark ? "#1e1e30" : "#f0f0f4";
      const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
      // Window chrome
      ctx.fillStyle = barColor;
      roundRect(ctx, 16, 16, 1168, 788, 12);
      ctx.fill();
      // Title bar
      ctx.fillStyle = isDark ? "#161625" : "#e4e4e8";
      roundRect(ctx, 16, 16, 1168, 52, 12);
      ctx.fill();
      // Bottom corners of title bar (square)
      ctx.fillRect(16, 48, 1168, 20);
      // Traffic light dots
      dotColors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(44 + i * 22, 42, 7, 0, Math.PI * 2);
        ctx.fill();
      });
      // Address bar
      ctx.fillStyle = isDark ? "#0d0d1a" : "#fff";
      roundRect(ctx, 120, 28, 960, 28, 8);
      ctx.fill();
      // URL text placeholder
      ctx.fillStyle = isDark ? "#444466" : "#aaa";
      ctx.font = "12px monospace";
      ctx.fillText("https://yourapp.com", 134, 47);
    },
  },
  {
    id: "none",
    label: "No Frame",
    icon: ImageIcon,
    canvasW: 1200,
    canvasH: 800,
    screenX: 40,
    screenY: 40,
    screenW: 1120,
    screenH: 720,
    cornerRadius: 16,
    drawFrame: () => {},
  },
];

/* ─── Gradient Backgrounds ─── */
interface GradientBg {
  id: string;
  label: string;
  css: string;
  stops: { offset: number; color: string }[];
  angle: number;
}

const gradients: GradientBg[] = [
  { id: "sunset", label: "Sunset", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", stops: [{ offset: 0, color: "#667eea" }, { offset: 1, color: "#764ba2" }], angle: 135 },
  { id: "ocean", label: "Ocean", css: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", stops: [{ offset: 0, color: "#0ea5e9" }, { offset: 1, color: "#6366f1" }], angle: 135 },
  { id: "mint", label: "Mint", css: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", stops: [{ offset: 0, color: "#10b981" }, { offset: 1, color: "#06b6d4" }], angle: 135 },
  { id: "fire", label: "Fire", css: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)", stops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "#ef4444" }], angle: 135 },
  { id: "rose", label: "Rose", css: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", stops: [{ offset: 0, color: "#ec4899" }, { offset: 1, color: "#8b5cf6" }], angle: 135 },
  { id: "midnight", label: "Midnight", css: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)", stops: [{ offset: 0, color: "#1e1b4b" }, { offset: 0.5, color: "#312e81" }, { offset: 1, color: "#1e1b4b" }], angle: 135 },
  { id: "peach", label: "Peach", css: "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)", stops: [{ offset: 0, color: "#fbbf24" }, { offset: 1, color: "#f472b6" }], angle: 135 },
  { id: "slate", label: "Slate", css: "linear-gradient(135deg, #334155 0%, #1e293b 100%)", stops: [{ offset: 0, color: "#334155" }, { offset: 1, color: "#1e293b" }], angle: 135 },
];

/* ─── Helpers ─── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ─── Canvas Renderer ─── */
function renderMockup(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  device: DeviceConfig,
  gradient: GradientBg,
  isDark: boolean,
  shadow: number,
  padding: number,
) {
  const totalW = device.canvasW + padding * 2;
  const totalH = device.canvasH + padding * 2;
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const rad = (gradient.angle * Math.PI) / 180;
  const gx1 = totalW / 2 - Math.cos(rad) * totalW;
  const gy1 = totalH / 2 - Math.sin(rad) * totalH;
  const gx2 = totalW / 2 + Math.cos(rad) * totalW;
  const gy2 = totalH / 2 + Math.sin(rad) * totalH;
  const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
  gradient.stops.forEach((s) => grad.addColorStop(s.offset, s.color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, totalW, totalH);

  ctx.save();
  ctx.translate(padding, padding);

  // Shadow
  if (shadow > 0 && device.id !== "none") {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = shadow * 0.3;
    ctx.fillStyle = "rgba(0,0,0,0)";
    roundRect(ctx, device.screenX - 4, device.screenY - 4, device.screenW + 8, device.screenH + 8, device.cornerRadius);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  // Device frame
  device.drawFrame(ctx, device.canvasW, device.canvasH, isDark);

  // Screenshot image clipped to screen area
  ctx.save();
  roundRect(ctx, device.screenX, device.screenY, device.screenW, device.screenH, device.cornerRadius);
  ctx.clip();

  // Cover fill
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const screenAspect = device.screenW / device.screenH;
  let drawW: number, drawH: number, drawX: number, drawY: number;
  if (imgAspect > screenAspect) {
    drawH = device.screenH;
    drawW = drawH * imgAspect;
    drawX = device.screenX - (drawW - device.screenW) / 2;
    drawY = device.screenY;
  } else {
    drawW = device.screenW;
    drawH = drawW / imgAspect;
    drawX = device.screenX;
    drawY = device.screenY - (drawH - device.screenH) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  ctx.restore();
}

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How to Present <span className="gradient-text">Portfolio Screenshots</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Raw screenshots feel unfinished. Placing them inside device frames with gradient backgrounds
          instantly communicates professionalism and context. Dribbble, Behance, and Product Hunt
          submissions with polished mockups receive significantly more engagement than flat screenshots.
          The device frame tells viewers "this is a real product" while the gradient adds visual polish
          that makes your work stand out in crowded feeds.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Choose the device frame that matches your product's primary use case—laptop for web apps,
          phone for mobile apps. Use contrasting gradient backgrounds that complement your app's color
          scheme without competing for attention.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Best Tools for Creating <span className="gradient-text">App Mockups</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Professional designers use tools like Figma, Sketch, and Adobe XD for pixel-perfect mockups.
          However, for quick social media and portfolio presentations, browser-based generators like this
          one are faster and more accessible. Our tool renders directly on HTML5 Canvas—no server uploads,
          no subscriptions, no watermarks. The output is a high-resolution PNG ready for any platform.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For animated mockups and video presentations, After Effects and Motion provide the gold standard.
          But for the 90% of cases where you need a static, beautiful mockup in under 30 seconds, a
          client-side generator is the optimal workflow.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "What image formats can I upload?", a: "PNG, JPEG, and WebP are supported. For best results, use a high-resolution PNG screenshot (at least 1920×1080 for laptop frames, 1170×2532 for phone frames)." },
            { q: "Is my screenshot uploaded to a server?", a: "No. Everything is processed locally using HTML5 Canvas. Your images never leave your browser." },
            { q: "What resolution is the output?", a: "The output matches the canvas size of the selected device frame (e.g., 1400×900 for laptop). This is high enough for social media, portfolio sites, and presentations." },
            { q: "Can I use the mockups commercially?", a: "Yes. The device frames are generic geometric shapes, not trademarked designs. The output is yours to use however you like." },
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
const MockupGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState<HTMLImageElement | null>(null);
  const [deviceId, setDeviceId] = useState<DeviceType>("macbook");
  const [gradientId, setGradientId] = useState("sunset");
  const [shadow, setShadow] = useState(40);
  const [padding, setPadding] = useState(80);
  const [dragOver, setDragOver] = useState(false);

  const device = devices.find((d) => d.id === deviceId)!;
  const gradient = gradients.find((g) => g.id === gradientId)!;

  // Detect dark mode
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => {
    document.title = "Screenshot Mockup Generator — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Create Dribbble-ready mockups instantly. Upload a screenshot, pick a device frame and gradient, then download a polished PNG. Free and private.");
    }
  }, []);

  // Render canvas whenever config changes
  useEffect(() => {
    if (!imgSrc || !canvasRef.current) return;
    renderMockup(canvasRef.current, imgSrc, device, gradient, isDark, shadow, padding);
  }, [imgSrc, device, gradient, isDark, shadow, padding]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImgSrc(img);
        toast.success("Screenshot loaded!");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "mockup.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("Mockup downloaded!");
  };

  const pct = ((shadow - 0) / 80) * 100;
  const padPct = ((padding - 20) / 160) * 100;

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
              Screenshot <span className="gradient-text">Mockup</span> Generator
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Turn screenshots into portfolio-ready mockups with device frames and gradient backgrounds.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {!imgSrc ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (ev) => {
                    const f = (ev.target as HTMLInputElement).files?.[0];
                    if (f) handleFile(f);
                  };
                  input.click();
                }}
                className={`glass-card rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all ${
                  dragOver ? "border-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)]" : "border-border"
                }`}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-foreground font-medium mb-1">Drop your screenshot here or click to browse</p>
                <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP — high resolution recommended</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Controls */}
                <div className="glass-card rounded-2xl p-6 space-y-5">
                  {/* Device Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Device Frame</span>
                    <div className="flex flex-wrap gap-2">
                      {devices.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setDeviceId(d.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            d.id === deviceId
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                          }`}
                        >
                          <d.icon className="w-4 h-4" />
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Background</span>
                    <div className="flex flex-wrap gap-2">
                      {gradients.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setGradientId(g.id)}
                          className={`w-10 h-10 rounded-xl transition-all ${
                            g.id === gradientId ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                          }`}
                          style={{ background: g.css }}
                          title={g.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Shadow</span>
                        <span className="font-mono text-primary">{shadow}px</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--glow-secondary)))" }} />
                        <input type="range" min={0} max={80} value={shadow} onChange={(e) => setShadow(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Padding</span>
                        <span className="font-mono text-primary">{padding}px</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${padPct}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--glow-secondary)))" }} />
                        <input type="range" min={20} max={180} value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                      <Download className="w-4 h-4" /> Download PNG
                    </button>
                    <button
                      onClick={() => {
                        setImgSrc(null);
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm hover:bg-secondary/80 transition-colors"
                    >
                      New Screenshot
                    </button>
                  </div>
                </div>

                {/* Canvas Preview */}
                <div className="glass-card rounded-2xl p-6 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto rounded-xl"
                    style={{ maxHeight: "600px" }}
                  />
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

export default MockupGenerator;
