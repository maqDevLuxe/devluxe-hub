/**
 * SubscriptionContext — Manages user subscription tiers: Free, Professional, Ultimate.
 * Controls access to premium components in the UI Component Library.
 */
import { createContext, useContext, useState, type ReactNode } from "react";

export type SubscriptionTier = "free" | "professional" | "ultimate";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasAccess: (requiredTier: SubscriptionTier) => boolean;
  tierLabel: string;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  professional: 1,
  ultimate: 2,
};

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  professional: "Professional",
  ultimate: "Ultimate",
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<SubscriptionTier>("free");

  const hasAccess = (requiredTier: SubscriptionTier) =>
    TIER_LEVELS[tier] >= TIER_LEVELS[requiredTier];

  return (
    <SubscriptionContext.Provider
      value={{ tier, setTier, hasAccess, tierLabel: TIER_LABELS[tier] }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};
