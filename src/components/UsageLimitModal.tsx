/**
 * UsageLimitModal — Modal shown when Free users exceed daily SaaS tool usage.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";
import { useUsage } from "@/contexts/UsageContext";

interface UsageLimitModalProps {
  open: boolean;
  onClose: () => void;
}

const UsageLimitModal = ({ open, onClose }: UsageLimitModalProps) => {
  const { dailyUsage, maxFreeUsage } = useUsage();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          >
            <div className="glass-card rounded-2xl border border-border p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <Zap className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-xl font-bold mb-2">Daily Limit Reached</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You've used <span className="text-primary font-semibold">{dailyUsage}/{maxFreeUsage}</span> free tool uses today.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upgrade to Professional for unlimited access to all SaaS tools.
                </p>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-muted mb-6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((dailyUsage / maxFreeUsage) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <a
                    href="/components#pricing"
                    className="flex-1 py-3 rounded-xl btn-pro font-semibold text-sm text-center"
                  >
                    Upgrade to Pro
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UsageLimitModal;
