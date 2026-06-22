"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";
import {
  THEME_PREFERENCE_LABELS,
  type ThemePreference,
} from "@/lib/theme/theme";
import { cn } from "@/lib/utils";

const themeOptions: {
  id: ThemePreference;
  icon: typeof Sun;
}[] = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "system", icon: Monitor },
];

type ThemePickerProps = {
  layout?: "vertical" | "horizontal";
  onSelect?: () => void;
  className?: string;
};

export function ThemePicker({
  layout = "vertical",
  onSelect,
  className,
}: ThemePickerProps) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      className={cn(
        layout === "horizontal"
          ? "flex flex-wrap gap-2"
          : "flex flex-col gap-1",
        className,
      )}
      role="group"
      aria-label="Tema de apariencia"
    >
      {themeOptions.map(({ id, icon: Icon }) => {
        const active = preference === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setPreference(id);
              onSelect?.();
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg text-sm font-medium transition",
              layout === "horizontal"
                ? "min-h-11 flex-1 justify-center px-3 py-2"
                : "min-h-11 w-full px-3 py-2.5 text-left",
              active
                ? "bg-geo-pink text-white"
                : "text-geo-navy hover:bg-geo-surface dark:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {THEME_PREFERENCE_LABELS[id]}
          </button>
        );
      })}
    </div>
  );
}
