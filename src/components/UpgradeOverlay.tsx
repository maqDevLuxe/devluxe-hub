/**
 * UpgradeOverlay — Glassmorphism "Upgrade to Unlock" overlay for blurred code sections.
 * Shown over the code snippet area for Free-tier users on gated components.
 */
import { Lock, ArrowRight } from "lucide-react";
import { type SubscriptionTier } from "@/contexts/SubscriptionContext";

interface UpgradeOverlayProps {
  requiredTier: SubscriptionTier;
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  professional: "Professional",
  ultimate: "Ultimate",
};

const UpgradeOverlay = ({ requiredTier }: UpgradeOverlayProps) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl overflow-hidden">
      {/* Glass background */}
      <div className="absolute inset-0 glass-card bg-background/60 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-8 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Upgrade to Unlock</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This code requires the{" "}
          <span className="text-primary font-semibold">{TIER_LABELS[requiredTier]}</span>{" "}
          plan. Get instant access to the full source code.
        </p>
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 btn-pro px-6 py-3 rounded-xl font-semibold text-sm"
        >
          View Plans
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
