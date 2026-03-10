/**
 * FaviconGenerator — Drag-and-drop image → multi-size favicon generator.
 * Pure frontend: Canvas API + FileReader + JSZip. No backend required.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  Image as ImageIcon,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Favicon sizes to generate ─── */
const SIZES = [
  { width: 16, height: 16, label: "16×16", filename: "favicon-16x16.png", description: "Browser tab" },
  { width: 32, height: 32, label: "32×32", filename: "favicon-32x32.png", description: "Taskbar shortcut" },
  { width: 180, height: 180, label: "180×180", filename: "apple-touch-icon.png", description: "Apple Touch Icon" },
  { width: 192, height: 192, label: "192×192", filename: "android-chrome-192x192.png", description: "Android Chrome" },
] as const;

/* ─── Resize helper using Canvas API ─── */
const resizeImage = (
  img: HTMLImageElement,
  width: number,
  height: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    /* High-quality downscaling */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    /* Centre-crop to square */
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, width, height);

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Blob creation failed"))),
      "image/png"
    );
  });
};

/* ─── FAQ data ─── */
const FAQ_ITEMS = [
  {
    q: "What image formats can I upload?",
    a: "You can upload any common raster image format — PNG, JPG, JPEG, WEBP, GIF, BMP, and SVG. For best results, use a square PNG with a transparent background.",
  },
  {
    q: "Will my image be uploaded to a server?",
    a: "No. Everything runs 100% in your browser using the HTML5 Canvas API. Your files never leave your device.",
  },
  {
    q: "What sizes are included in the ZIP?",
    a: "The ZIP contains favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180×180), and android-chrome-192x192.png — covering all major platforms.",
  },
  {
    q: "How do I add the favicon to my website?",
    a: 'Place the files in your site\'s root directory and add <link> tags in your HTML <head>. For example: <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
  },
  {
    q: "Can I generate an .ico file?",
    a: "The current version generates PNG favicons in all standard sizes. Modern browsers support PNG favicons natively, making .ico largely unnecessary.",
  },
];

/* ─── Generated icon preview card ─── */
const PreviewCard = ({
  label,
  description,
  dataUrl,
  size,
  index,
}: {
  label: string;
  description: string;
  dataUrl: string;
  size: number;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
    className="glass-card rounded-2xl p-6 flex flex-col items-center text-center"
  >
    <div className="w-24 h-24 rounded-xl bg-secondary/30 flex items-center justify-center mb-4 border border-border/30">
      <img
        src={dataUrl}
        alt={`Favicon ${label}`}
        width={Math.min(size, 64)}
        height={Math.min(size, 64)}
        className="object-contain"
        style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
      />
    </div>
    <span className="font-display font-semibold text-foreground text-sm">{label}</span>
    <span className="text-xs text-muted-foreground mt-1">{description}</span>
  </motion.div>
);

/* ─── FAQ Accordion Item ─── */
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
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
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════ */
const FaviconGenerator = () => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [generatedIcons, setGeneratedIcons] = useState<
    { label: string; description: string; size: number; dataUrl: string; blob: Blob }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Dynamic meta for SEO */
  useEffect(() => {
    document.title = "Favicon Generator — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Generate favicons in all sizes (16×16, 32×32, 180×180, 192×192) from any image. Free, private, runs in your browser."
      );
    }
  }, []);

  /* ─── Process uploaded image ─── */
  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setIsProcessing(true);
    setGeneratedIcons([]);

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setSourcePreview(dataUrl);

      /* Load into an Image element */
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });
      setSourceImage(img);

      /* Generate all sizes in parallel */
      const results = await Promise.all(
        SIZES.map(async (s) => {
          const blob = await resizeImage(img, s.width, s.height);
          const url = URL.createObjectURL(blob);
          return {
            label: s.label,
            description: s.description,
            size: s.width,
            dataUrl: url,
            blob,
          };
        })
      );

      setGeneratedIcons(results);
      toast.success(`Generated ${results.length} favicon sizes!`);
    } catch {
      toast.error("Failed to process image. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /* ─── Drag & drop handlers ─── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  /* ─── Download all as ZIP ─── */
  const handleDownloadZip = useCallback(async () => {
    if (generatedIcons.length === 0) return;
    const zip = new JSZip();
    SIZES.forEach((s, i) => {
      zip.file(s.filename, generatedIcons[i].blob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "favicons.zip");
    toast.success("ZIP downloaded!");
  }, [generatedIcons]);

  /* ─── Reset ─── */
  const handleReset = useCallback(() => {
    generatedIcons.forEach((icon) => URL.revokeObjectURL(icon.dataUrl));
    setSourceImage(null);
    setSourcePreview(null);
    setGeneratedIcons([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [generatedIcons]);

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
              <ImageIcon className="w-3 h-3" />
              Free Tool — No Sign-Up Required
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Favicon <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Drop any image and instantly generate favicons in every size your site needs. Download as a ZIP — all in your browser.
            </p>
          </motion.div>

          {/* ─── Drop Zone ─── */}
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
                className={`relative glass-card rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] ${
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
                    or click to browse — PNG, JPG, SVG, WEBP
                  </p>
                </motion.div>
              </div>
            ) : (
              /* ─── Source preview + reset ─── */
              <div className="glass-card rounded-3xl p-4 glow-effect">
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
                <div className="w-full flex items-center justify-center rounded-2xl bg-secondary/20 p-6 min-h-[200px]">
                  <img
                    src={sourcePreview}
                    alt="Uploaded source"
                    className="max-h-48 max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* ─── Processing indicator ─── */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
              >
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Generating favicons…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Generated Previews ─── */}
          <AnimatePresence>
            {generatedIcons.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-10"
              >
                <div className="flex items-center justify-between mb-6 px-1">
                  <h2 className="font-display font-semibold text-foreground text-lg">
                    Generated Icons
                  </h2>
                  <button
                    onClick={handleDownloadZip}
                    className="btn-pro px-5 py-2.5 rounded-xl font-display text-sm font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download ZIP
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedIcons.map((icon, i) => (
                    <PreviewCard
                      key={icon.label}
                      label={icon.label}
                      description={icon.description}
                      dataUrl={icon.dataUrl}
                      size={icon.size}
                      index={i}
                    />
                  ))}
                </div>

                {/* HTML snippet */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="mt-6"
                >
                  <HtmlSnippet />
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
              What is a Favicon?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A favicon (short for "favourite icon") is the small graphic displayed in browser tabs,
              bookmarks, history lists, and search-engine results. Despite its tiny size, a favicon
              is a crucial branding touchpoint — it helps users identify your site at a glance among
              dozens of open tabs and reinforces brand recognition across every interaction.
            </p>

            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              How to Create a Favicon for SEO
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google displays favicons in mobile search results, making them a subtle but impactful
              SEO signal. Follow these best practices:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-8">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Use a square image</strong> — at least 192×192
                  pixels for maximum clarity on high-DPI screens.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Keep it simple</strong> — favicons are rendered
                  as small as 16×16 pixels. Logos with fine detail get lost; bold, iconic shapes work
                  best.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Provide multiple sizes</strong> — include 16×16
                  and 32×32 for browsers, 180×180 for Apple devices, and 192×192 for Android.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong className="text-foreground">Use PNG format</strong> — all modern browsers
                  support PNG favicons natively, ensuring crisp rendering with transparency.
                </span>
              </li>
            </ul>

            {/* FAQ Accordion */}
            <h2 className="text-3xl font-display font-bold mb-6 text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="glass-card rounded-2xl px-6">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </motion.article>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ─── HTML Snippet Output ─── */
const HtmlSnippet = () => {
  const [copied, setCopied] = useState(false);
  const snippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("HTML copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">
          HTML &lt;head&gt; Snippet
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
        >
          {copied ? <Check className="w-3 h-3" /> : null}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded-xl bg-card border border-border/50 p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre select-all leading-relaxed">
        {snippet}
      </div>
    </div>
  );
};

export default FaviconGenerator;
