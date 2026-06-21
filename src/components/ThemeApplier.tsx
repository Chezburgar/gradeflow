"use client";

import { useEffect } from "react";
import { useSettings } from "@/store/settings";
import { FONTS, RADII } from "@/lib/theme-options";

function readableOn(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#ffffff";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.55 ? "#10151d" : "#ffffff";
}

export function ThemeApplier() {
  const {
    theme,
    accent,
    font,
    density,
    radius,
    glass,
    animations,
  } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark"
          : theme;
      root.setAttribute("data-theme", resolved);
    };
    applyTheme();

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => theme === "system" && applyTheme();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty(
      "--accent-soft",
      `color-mix(in srgb, ${accent} 15%, transparent)`,
    );
    root.style.setProperty("--accent-fg", readableOn(accent));
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--app-font",
      FONTS.find((f) => f.id === font)?.stack ?? FONTS[0].stack,
    );
  }, [font]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--radius",
      `${RADII.find((r) => r.id === radius)?.px ?? 18}px`,
    );
  }, [radius]);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute("data-glass", glass ? "on" : "off");
  }, [glass]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-animations",
      animations ? "on" : "off",
    );
  }, [animations]);

  return null;
}
