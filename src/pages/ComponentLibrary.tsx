/**
 * ComponentLibrary — Premium storefront for the UI Component Library.
 * Vogue-style editorial layout with glassmorphism category cards,
 * sidebar filters, search, tier switcher, and pricing section.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock, Sparkles, Crown, Search, ShoppingBag,
  LayoutDashboard, Megaphone, Wallet, Zap, Filter,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { useSubscription, type SubscriptionTier } from "@/contexts/SubscriptionContext";
import { componentLibrary, CATEGORIES, type ComponentCategory } from "@/data/componentLibrary";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ── Category visual config ───────────────────────────── */
const CATEGORY_META: Record<ComponentCategory, { icon: typeof ShoppingBag; gradient: string; count: number }> = {
  "E-commerce UI": {
    icon: ShoppingBag,
    gradient: "from-pink-500/20 to-rose-500/20",
    count: componentLibrary.filter((c) => c.category === "E-commerce UI").length,
  },
  "SaaS Dashboards": {
    icon: LayoutDashboard,
    gradient: "from-purple-500/20 to-indigo-500/20",
    count: componentLibrary.filter((c) => c.category === "SaaS Dashboards").length,
  },
  "Marketing Blocks": {
    icon: Megaphone,
    gradient: "from-cyan-500/20 to-blue-500/20",
    count: componentLibrary.filter((c) => c.category === "Marketing Blocks").length,
  },
  "Web3 / Fintech": {
    icon: Wallet,
    gradient: "from-amber-500/20 to-orange-500/20",
    count: componentLibrary.filter((c) => c.category === "Web3 / Fintech").length,
  },
};

const TIER_BADGE: Record<SubscriptionTier, { label: string; className: string; icon: React.ReactNode }> = {
  free: { label: "Free", className: "bg-muted text-muted-foreground", icon: <Zap className="w-3 h-3" /> },
  professional: { label: "Pro", className: "bg-primary/20 text-primary", icon: <Sparkles className="w-3 h-3" /> },
  ultimate: { label: "Ultimate", className: "bg-accent text-accent-foreground", icon: <Crown className="w-3 h-3" /> },
};

const ComponentLibrary = () => {
  const { hasAccess, tier, setTier } = useSubscription();
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = componentLibrary;
    if (activeCategory !== "All") list = list.filter((c) => c.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20">
        {/* ── Hero ──────────────────────────────── */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[hsl(190,90%,50%)]/10 blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-medium"
            >
              Premium Collection
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              UI Components{" "}
              <span className="gradient-text">Redefined</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              A curated library of production-ready, pixel-perfect components.
              Built for developers who demand perfection.
            </motion.p>

            {/* Tier Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-2 mb-6"
            >
              {(["free", "professional", "ultimate"] as SubscriptionTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium border transition-all",
                    tier === t
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_hsl(var(--glow)/0.15)]"
                      : "border-border bg-card/50 glass-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {TIER_BADGE[t].icon}
                  <span className="ml-1.5">{TIER_BADGE[t].label}</span>
                </button>
              ))}
            </motion.div>
            <p className="text-xs text-muted-foreground">
              Switch tiers to preview access levels
            </p>
          </div>
        </section>

        {/* ── Category Cards (Editorial Grid) ──── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const isActive = activeCategory === cat;

              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => setActiveCategory(isActive ? "All" : cat)}
                  className={cn(
                    "relative rounded-2xl border p-6 text-left transition-all group overflow-hidden",
                    isActive
                      ? "border-primary/50 bg-card shadow-[0_0_40px_-10px_hsl(var(--glow)/0.2)]"
                      : "border-border glass-card hover:border-primary/30"
                  )}
                >
                  {/* Gradient blob */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity group-hover:opacity-50", meta.gradient)} />

                  <div className="relative z-10">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", isActive ? "bg-primary/20" : "bg-muted")}>
                      <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{cat}</h3>
                    <p className="text-sm text-muted-foreground">{meta.count} components</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── Main Content: Sidebar + Grid ──────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex gap-8">
            {/* Sidebar filters (desktop) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Categories</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveCategory("All")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        activeCategory === "All" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      All Components
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                          activeCategory === cat ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {cat}
                        <span className="ml-2 text-xs opacity-50">
                          ({CATEGORY_META[cat].count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier filter */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Access Level</h4>
                  <div className="space-y-2">
                    {(["free", "professional", "ultimate"] as SubscriptionTier[]).map((t) => (
                      <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={cn("w-2 h-2 rounded-full", t === "free" ? "bg-muted-foreground" : t === "professional" ? "bg-primary" : "bg-accent-foreground")} />
                        {TIER_BADGE[t].label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile filter toggle */}
            <div className="lg:hidden w-full">
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-2.5 rounded-xl border border-border bg-card text-muted-foreground"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setActiveCategory("All")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs transition-all",
                      activeCategory === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs transition-all",
                        activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Component Grid (only on desktop alongside sidebar) */}
            <div className="hidden lg:grid flex-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((comp, i) => (
                <ComponentCard key={comp.id} comp={comp} index={i} hasAccess={hasAccess} />
              ))}
              {filtered.length === 0 && <EmptyState />}
            </div>
          </div>

          {/* Grid (mobile — full width below filter) */}
          <div className="grid lg:hidden grid-cols-1 sm:grid-cols-2 gap-5 mt-0">
            {filtered.map((comp, i) => (
              <ComponentCard key={comp.id} comp={comp} index={i} hasAccess={hasAccess} />
            ))}
            {filtered.length === 0 && <EmptyState />}
          </div>
        </section>

        {/* ── Pricing Section ──────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <PricingSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* ── Sub-components ────────────────────────────────────── */

function ComponentCard({
  comp,
  index,
  hasAccess,
}: {
  comp: (typeof componentLibrary)[0];
  index: number;
  hasAccess: (tier: SubscriptionTier) => boolean;
}) {
  const locked = !hasAccess(comp.requiredTier);
  const badge = TIER_BADGE[comp.requiredTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={locked ? "#" : `/components/${comp.id}`}
        onClick={(e) => locked && e.preventDefault()}
        className={cn(
          "group relative flex flex-col rounded-2xl border p-5 transition-all h-full",
          locked
            ? "border-border opacity-50 cursor-not-allowed"
            : "border-border glass-card hover:border-primary/40 hover:shadow-[0_0_40px_-10px_hsl(var(--glow)/0.15)]"
        )}
      >
        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl z-10">
            <div className="text-center">
              <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground font-medium">
                {badge.label} Only
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-foreground text-sm leading-tight">{comp.name}</h3>
          <Badge className={cn("text-[10px] gap-0.5 shrink-0 ml-2", badge.className)}>
            {badge.icon}
            {badge.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">{comp.description}</p>

        {/* Mini preview */}
        <div className="rounded-xl bg-muted/30 border border-border p-4 h-28 flex items-center justify-center overflow-hidden">
          <div
            className="transform scale-[0.4] origin-center pointer-events-none"
            dangerouslySetInnerHTML={{ __html: comp.preview }}
          />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {comp.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-20 text-center">
      <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
      <p className="text-muted-foreground">No components found. Try a different search or category.</p>
    </div>
  );
}

export default ComponentLibrary;
