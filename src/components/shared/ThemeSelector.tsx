import React from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  LaptopMinimal,
  Sun,
  Moon,
  Waves,
  Flower2,
  Coffee,
  Sparkles,
  Sunset,
  Snowflake,
  Terminal,
  Zap,
  Trees,
  Braces,
  FileText,
  BookOpen,
  Check,
} from "lucide-react";

interface ThemeOption {
  value: string;
  label: string;
  icon: React.ElementType;
  bg?: string;
}

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes: ThemeOption[] = [
    { value: "system", label: t("themeSystem"), icon: LaptopMinimal },
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
    { value: "ocean", label: "Ocean", icon: Waves, bg: "bg-blue-500" },
    { value: "sakura", label: "Sakura", icon: Flower2, bg: "bg-pink-400" },
    { value: "coffee", label: "Coffee", icon: Coffee, bg: "bg-amber-700" },
    {
      value: "lavender",
      label: "Lavender",
      icon: Sparkles,
      bg: "bg-purple-500",
    },
    { value: "sunset", label: "Sunset", icon: Sunset, bg: "bg-orange-500" },
    { value: "nord", label: "Nord", icon: Snowflake, bg: "bg-slate-500" },
    { value: "retro", label: "Retro", icon: Terminal, bg: "bg-green-700" },
    { value: "cyberpunk", label: "Cyberpunk", icon: Zap, bg: "bg-fuchsia-600" },
    { value: "forest", label: "Forest", icon: Trees, bg: "bg-emerald-600" },
    { value: "monokai", label: "Monokai", icon: Braces, bg: "bg-yellow-600" },
    { value: "paper", label: "Paper", icon: FileText, bg: "bg-stone-400" },
    {
      value: "notebook",
      label: "Notebook",
      icon: BookOpen,
      bg: "bg-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
              "hover:border-primary/50 hover:bg-accent",
              isActive
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-background",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                t.bg || "bg-muted",
                t.value === "system" &&
                  "bg-linear-to-br from-background to-muted",
                t.value === "light" && "bg-white border",
                t.value === "dark" && "bg-slate-900",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  t.value === "light" && "text-slate-900",
                  t.value === "dark" && "text-white",
                  !t.bg &&
                    t.value !== "light" &&
                    t.value !== "dark" &&
                    "text-foreground",
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.label}</div>
            </div>
            {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
