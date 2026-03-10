/**
 * ComponentDetail — Individual component preview page.
 * Features:
 *  - Live Preview area with Light/Dark, LTR/RTL, and EN/AR toggles
 *  - Code Snippet area (blurred + upgrade overlay for gated components)
 *  - Copy-to-clipboard for unlocked code
 *  - SaaS tool usage tracking with limit modal
 */
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Eye } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PreviewControls from "@/components/PreviewControls";
import UpgradeOverlay from "@/components/UpgradeOverlay";
import UsageLimitModal from "@/components/UsageLimitModal";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsage } from "@/contexts/UsageContext";
import { componentLibrary } from "@/data/componentLibrary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ComponentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { hasAccess } = useSubscription();
  const { canUse, incrementUsage } = useUsage();

  const [copied, setCopied] = useState(false);
  const [previewDark, setPreviewDark] = useState(true);
  const [previewRtl, setPreviewRtl] = useState(false);
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("en");
  const [showUsageModal, setShowUsageModal] = useState(false);

  const comp = componentLibrary.find((c) => c.id === id);

  if (!comp) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Component not found</h1>
          <Link to="/components" className="text-primary hover:underline">
            Back to library
          </Link>
        </div>
      </div>
    );
  }

  const codeLocked = !hasAccess(comp.requiredTier);
  const hasArabic = !!comp.previewAr;

  /* Determine which preview HTML to render */
  const previewHtml = previewLang === "ar" && hasArabic ? comp.previewAr! : comp.preview;

  const handleCopy = () => {
    if (codeLocked) return;
    navigator.clipboard.writeText(comp.preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Track SaaS tool usage on "Use Tool" action */
  const handleUseTool = () => {
    if (!incrementUsage()) {
      setShowUsageModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            to="/components"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to library
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold">{comp.name}</h1>
            <Badge className="bg-primary/20 text-primary text-xs">{comp.category}</Badge>
            {comp.isSaasTool && (
              <Badge className="bg-accent text-accent-foreground text-xs gap-1">
                <Eye className="w-3 h-3" />
                SaaS Tool
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">{comp.description}</p>
        </motion.div>

        {/* ── Live Preview ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card overflow-hidden mb-6"
        >
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live Preview
            </h2>
            <PreviewControls
              previewDark={previewDark}
              onToggleDark={() => setPreviewDark(!previewDark)}
              previewRtl={previewRtl}
              onToggleRtl={() => {
                setPreviewRtl(!previewRtl);
                if (!previewRtl && hasArabic) setPreviewLang("ar");
                if (previewRtl) setPreviewLang("en");
              }}
              previewLang={previewLang}
              onToggleLang={() => setPreviewLang(previewLang === "en" ? "ar" : "en")}
              hasArabic={hasArabic}
            />
          </div>

          {/* Preview area — isolated theme */}
          <div
            className={cn(
              "p-8 min-h-[280px] flex items-center justify-center transition-colors duration-300",
              previewDark ? "bg-[hsl(230,25%,7%)] text-[hsl(220,20%,92%)]" : "bg-[hsl(0,0%,97%)] text-[hsl(230,25%,10%)]"
            )}
            dir={previewRtl ? "rtl" : "ltr"}
          >
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </motion.div>

        {/* SaaS tool usage button */}
        {comp.isSaasTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Button onClick={handleUseTool} className="btn-pro rounded-xl">
              Use This Tool
            </Button>
          </motion.div>
        )}

        {/* ── Code Snippet ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl border border-border bg-card overflow-hidden"
        >
          {/* Code toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Source Code
            </h2>
            {!codeLocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-2 text-muted-foreground text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>

          {/* Code content — blurred if locked */}
          <div className={cn("relative", codeLocked && "select-none")}>
            <pre
              className={cn(
                "p-5 overflow-x-auto text-sm font-mono text-foreground/80 leading-relaxed",
                codeLocked && "blur-[6px] pointer-events-none"
              )}
            >
              <code>{comp.preview}</code>
            </pre>

            {/* Upgrade overlay */}
            {codeLocked && <UpgradeOverlay requiredTier={comp.requiredTier} />}
          </div>
        </motion.div>

        {/* Tags */}
        <div className="flex gap-2 mt-6 flex-wrap">
          {comp.tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </main>

      <Footer />

      {/* Usage limit modal */}
      <UsageLimitModal open={showUsageModal} onClose={() => setShowUsageModal(false)} />
    </div>
  );
};

export default ComponentDetail;
