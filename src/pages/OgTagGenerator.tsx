/**
 * OgTagGenerator — Corporate-trust OG tag builder with live social card previews.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowLeft, Globe, Image as ImageIcon, Type, FileText, ExternalLink } from "lucide-react";
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
interface OgConfig {
  title: string;
  description: string;
  imageUrl: string;
  siteUrl: string;
  siteName: string;
  type: string;
  twitterHandle: string;
}

const defaultConfig: OgConfig = {
  title: "DevLuxe — Premium Developer Tools",
  description: "A curated suite of beautifully crafted, client-side developer utilities. Fast, private, and free.",
  imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop",
  siteUrl: "https://devluxe.app",
  siteName: "DevLuxe",
  type: "website",
  twitterHandle: "@devluxe",
};

type PreviewTab = "facebook" | "twitter" | "linkedin";

/* ─── Input Field ─── */
const Field = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  textarea = false,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  textarea?: boolean;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
      />
    )}
  </div>
);

/* ─── Social Card Previews ─── */
const FacebookPreview = ({ config }: { config: OgConfig }) => {
  const domain = (() => {
    try { return new URL(config.siteUrl).hostname; } catch { return "example.com"; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg overflow-hidden border border-border bg-card shadow-sm max-w-[524px] mx-auto"
    >
      <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
        {config.imageUrl ? (
          <img src={config.imageUrl} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1 border-t border-border">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{domain}</p>
        <h3 className="text-base font-semibold text-foreground leading-tight line-clamp-2">
          {config.title || "Page Title"}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {config.description || "Page description will appear here."}
        </p>
      </div>
    </motion.div>
  );
};

const TwitterPreview = ({ config }: { config: OgConfig }) => {
  const domain = (() => {
    try { return new URL(config.siteUrl).hostname; } catch { return "example.com"; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm max-w-[524px] mx-auto"
    >
      <div className="aspect-[2/1] bg-muted relative overflow-hidden">
        {config.imageUrl ? (
          <img src={config.imageUrl} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
          {config.title || "Page Title"}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {config.description || "Page description will appear here."}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
          <ExternalLink className="w-3 h-3" />
          {domain}
        </p>
      </div>
    </motion.div>
  );
};

const LinkedInPreview = ({ config }: { config: OgConfig }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="rounded-lg overflow-hidden border border-border bg-card shadow-sm max-w-[524px] mx-auto"
  >
    <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
      {config.imageUrl ? (
        <img src={config.imageUrl} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        </div>
      )}
    </div>
    <div className="p-3.5 space-y-1 bg-secondary/30">
      <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
        {config.title || "Page Title"}
      </h3>
      <p className="text-xs text-muted-foreground">
        {config.siteName || "Site Name"}
      </p>
    </div>
  </motion.div>
);

/* ─── Code Output ─── */
function generateMetaTags(c: OgConfig): string {
  return [
    `<!-- Open Graph -->`,
    `<meta property="og:type" content="${c.type}" />`,
    `<meta property="og:title" content="${c.title}" />`,
    `<meta property="og:description" content="${c.description}" />`,
    `<meta property="og:image" content="${c.imageUrl}" />`,
    `<meta property="og:url" content="${c.siteUrl}" />`,
    `<meta property="og:site_name" content="${c.siteName}" />`,
    ``,
    `<!-- Twitter Card -->`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${c.title}" />`,
    `<meta name="twitter:description" content="${c.description}" />`,
    `<meta name="twitter:image" content="${c.imageUrl}" />`,
    c.twitterHandle ? `<meta name="twitter:site" content="${c.twitterHandle}" />` : null,
  ].filter(Boolean).join("\n");
}

const MetaCodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Meta tags copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Meta Tags"}
      </button>
      <div className="rounded-lg overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">HTML</span>
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-card text-foreground">
          {code}
        </pre>
      </div>
    </div>
  );
};

/* ─── Tab Button ─── */
const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative px-5 py-2.5 text-sm font-medium transition-colors rounded-lg ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-secondary rounded-lg border border-border"
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    )}
    <span className="relative z-10">{label}</span>
  </button>
);

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          What Are <span className="gradient-text">Open Graph</span> Tags?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Open Graph (OG) tags are HTML meta elements that control how your content appears when shared
          on social media platforms like Facebook, Twitter (X), LinkedIn, and messaging apps. Introduced
          by Facebook in 2010, the Open Graph protocol transforms ordinary links into rich, visual
          preview cards with images, titles, and descriptions—dramatically increasing click-through rates.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Without proper OG tags, platforms will attempt to guess your page's content, often resulting
          in missing images, truncated titles, or incorrect descriptions. Setting them explicitly gives
          you full control over your brand's first impression across the social web.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How to Optimize <span className="gradient-text">Social Preview Cards</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The key to high-performing social cards is combining a compelling image with concise, action-oriented
          copy. Your <code className="text-primary mx-1">og:title</code> should be under 60 characters and
          include your primary keyword. The <code className="text-primary mx-1">og:description</code> should
          expand on the title in under 155 characters. Always use a high-quality image at the recommended
          dimensions for each platform.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          For Twitter, use <code className="text-primary mx-1">summary_large_image</code> card type for
          maximum visual impact. Test your tags with Facebook's Sharing Debugger, Twitter's Card Validator,
          and LinkedIn's Post Inspector before publishing.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Ideal Image Sizes for <span className="gradient-text">Each Platform</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { platform: "Facebook", size: "1200 × 630px", ratio: "1.91:1" },
            { platform: "Twitter / X", size: "1200 × 600px", ratio: "2:1" },
            { platform: "LinkedIn", size: "1200 × 627px", ratio: "1.91:1" },
          ].map((p) => (
            <div key={p.platform} className="glass-card rounded-xl p-5 text-center space-y-2">
              <h3 className="font-display font-semibold text-foreground">{p.platform}</h3>
              <p className="text-primary font-mono text-sm">{p.size}</p>
              <p className="text-xs text-muted-foreground">Aspect ratio: {p.ratio}</p>
            </div>
          ))}
        </div>
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
              q: "Do I need both OG tags and Twitter Card tags?",
              a: "Yes. While Twitter can fall back to OG tags, having dedicated Twitter Card meta tags gives you finer control over how your content appears on X. Our generator outputs both sets automatically.",
            },
            {
              q: "How often should I update my OG tags?",
              a: "Update them whenever you change your page's title, description, or featured image. Social platforms cache preview cards aggressively—use their debug tools to force a refresh after updating.",
            },
            {
              q: "Can OG tags improve my SEO ranking?",
              a: "OG tags don't directly affect search rankings, but they significantly improve click-through rates from social media. Higher engagement indirectly signals search engines that your content is valuable.",
            },
            {
              q: "What image format is best for OG images?",
              a: "Use JPEG for photographs (smaller file size) and PNG for graphics with text or transparency. Keep file size under 8MB. Facebook recommends minimum 600×315px, but 1200×630px is ideal for high-resolution displays.",
            },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-foreground text-left hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

/* ─── Main Page ─── */
const OgTagGenerator = () => {
  const [config, setConfig] = useState<OgConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<PreviewTab>("facebook");

  useEffect(() => {
    document.title = "OG Tag Generator & Visualizer — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Generate perfect Open Graph meta tags and preview exactly how your content will look on Facebook, Twitter, and LinkedIn. Free, instant, no signup."
      );
    }
  }, []);

  const metaTags = useMemo(() => generateMetaTags(config), [config]);
  const update = <K extends keyof OgConfig>(key: K, value: OgConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              OG Tag <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Preview your social cards in real-time across Facebook, Twitter, and LinkedIn—then copy perfect meta tags.
            </p>
          </motion.div>

          {/* Tool Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left — Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 h-fit lg:sticky lg:top-28"
            >
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Meta Properties
              </span>

              <Field label="Page Title" icon={Type} value={config.title} onChange={(v) => update("title", v)} placeholder="My Awesome Page" />
              <Field label="Description" icon={FileText} value={config.description} onChange={(v) => update("description", v)} placeholder="A brief description of the page..." textarea />
              <Field label="Image URL" icon={ImageIcon} value={config.imageUrl} onChange={(v) => update("imageUrl", v)} placeholder="https://example.com/image.jpg" />
              <Field label="Site URL" icon={Globe} value={config.siteUrl} onChange={(v) => update("siteUrl", v)} placeholder="https://example.com" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Site Name" icon={Globe} value={config.siteName} onChange={(v) => update("siteName", v)} placeholder="My Site" />
                <Field label="Twitter Handle" icon={Type} value={config.twitterHandle} onChange={(v) => update("twitterHandle", v)} placeholder="@handle" />
              </div>

              {/* OG Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  Content Type
                </label>
                <select
                  value={config.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  {["website", "article", "product", "profile", "video.other"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <MetaCodeBlock code={metaTags} />
            </motion.div>

            {/* Right — Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-5 block">
                  Live Preview
                </span>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-6 w-fit">
                  <TabButton label="Facebook" active={activeTab === "facebook"} onClick={() => setActiveTab("facebook")} />
                  <TabButton label="Twitter / X" active={activeTab === "twitter"} onClick={() => setActiveTab("twitter")} />
                  <TabButton label="LinkedIn" active={activeTab === "linkedin"} onClick={() => setActiveTab("linkedin")} />
                </div>

                {/* Card preview */}
                <AnimatePresence mode="wait">
                  {activeTab === "facebook" && <FacebookPreview key="fb" config={config} />}
                  {activeTab === "twitter" && <TwitterPreview key="tw" config={config} />}
                  {activeTab === "linkedin" && <LinkedInPreview key="li" config={config} />}
                </AnimatePresence>
              </div>

              {/* Tips */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Title should be 60 characters or fewer for best display.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Description works best at 155 characters or fewer.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Use 1200×630px images for optimal rendering across all platforms.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Always test with platform debuggers after deployment.
                  </li>
                </ul>
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

export default OgTagGenerator;
