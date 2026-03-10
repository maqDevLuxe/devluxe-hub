/**
 * PreviewControls — Interactive controls for the component preview area.
 * Toggles: Light/Dark mode, LTR/RTL direction, English/Arabic language.
 */
import { Sun, Moon, ArrowLeftRight, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewControlsProps {
  previewDark: boolean;
  onToggleDark: () => void;
  previewRtl: boolean;
  onToggleRtl: () => void;
  previewLang: "en" | "ar";
  onToggleLang: () => void;
  hasArabic: boolean;
}

const PreviewControls = ({
  previewDark,
  onToggleDark,
  previewRtl,
  onToggleRtl,
  previewLang,
  onToggleLang,
  hasArabic,
}: PreviewControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Light / Dark toggle */}
      <button
        onClick={onToggleDark}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
          previewDark
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30"
        )}
        aria-label="Toggle preview theme"
      >
        {previewDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        {previewDark ? "Dark" : "Light"}
      </button>

      {/* LTR / RTL toggle */}
      <button
        onClick={onToggleRtl}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
          previewRtl
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30"
        )}
        aria-label="Toggle text direction"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        {previewRtl ? "RTL" : "LTR"}
      </button>

      {/* Language toggle (EN / AR) */}
      {hasArabic && (
        <button
          onClick={onToggleLang}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            previewLang === "ar"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
          aria-label="Toggle language"
        >
          <Languages className="w-3.5 h-3.5" />
          {previewLang === "ar" ? "عربي" : "EN"}
        </button>
      )}
    </div>
  );
};

export default PreviewControls;
