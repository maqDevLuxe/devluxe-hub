/**
 * UsageContext — Tracks daily usage of SaaS tools for Free-tier rate limiting.
 * Free users get 3 daily uses. Pro/Ultimate get unlimited.
 */
import { createContext, useContext, useState, type ReactNode } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface UsageContextType {
  dailyUsage: number;
  maxFreeUsage: number;
  canUse: boolean;
  incrementUsage: () => boolean; // returns false if limit reached
  resetUsage: () => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

const MAX_FREE_USAGE = 3;

export const UsageProvider = ({ children }: { children: ReactNode }) => {
  const { tier } = useSubscription();
  const [dailyUsage, setDailyUsage] = useState(0);

  const canUse = tier !== "free" || dailyUsage < MAX_FREE_USAGE;

  const incrementUsage = (): boolean => {
    if (tier !== "free") return true; // unlimited for paid
    if (dailyUsage >= MAX_FREE_USAGE) return false;
    setDailyUsage((prev) => prev + 1);
    return true;
  };

  const resetUsage = () => setDailyUsage(0);

  return (
    <UsageContext.Provider value={{ dailyUsage, maxFreeUsage: MAX_FREE_USAGE, canUse, incrementUsage, resetUsage }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const ctx = useContext(UsageContext);
  if (!ctx) throw new Error("useUsage must be used within UsageProvider");
  return ctx;
};
