export type ThemeId =
  | "system"
  | "dark"
  | "light"
  | "oled"
  | "midnight"
  | "sunset"
  | "forest"
  | "nebula"
  | "storm"
  | "slate"
  | "crimson"
  | "coffee"
  | "latte"
  | "glacier"
  | "meadow"
  | "rose";

export type FontId = "sans" | "serif" | "rounded" | "mono";
export type Density = "compact" | "cozy" | "spacious";
export type RadiusId = "sharp" | "soft" | "round";
export type GradeDisplay = "percent" | "letter" | "both";

export const THEMES: { id: ThemeId; label: string; swatch: [string, string]; dark: boolean }[] = [
  { id: "system", label: "System", swatch: ["#08141f", "#f4f6fb"], dark: true },
  { id: "dark", label: "Deep Sea", swatch: ["#08141f", "#0e1f2c"], dark: true },
  { id: "light", label: "Daylight", swatch: ["#f4f6fb", "#ffffff"], dark: false },
  { id: "oled", label: "OLED Black", swatch: ["#000000", "#121215"], dark: true },
  { id: "midnight", label: "Midnight", swatch: ["#0a0f1f", "#18203f"], dark: true },
  { id: "sunset", label: "Sunset", swatch: ["#1a0f17", "#2f1a2a"], dark: true },
  { id: "forest", label: "Forest", swatch: ["#08130d", "#13271b"], dark: true },
  { id: "nebula", label: "Nebula", swatch: ["#120a1f", "#251840"], dark: true },
  { id: "storm", label: "Storm", swatch: ["#0c1218", "#1c2733"], dark: true },
  { id: "slate", label: "Slate", swatch: ["#0e1014", "#1d2129"], dark: true },
  { id: "crimson", label: "Crimson", swatch: ["#170a0d", "#2d161c"], dark: true },
  { id: "coffee", label: "Coffee", swatch: ["#15100c", "#2a201a"], dark: true },
  { id: "latte", label: "Latte", swatch: ["#f6efe6", "#fffaf3"], dark: false },
  { id: "glacier", label: "Glacier", swatch: ["#eaf2fa", "#ffffff"], dark: false },
  { id: "meadow", label: "Meadow", swatch: ["#eef6ee", "#ffffff"], dark: false },
  { id: "rose", label: "Rose", swatch: ["#fbeef4", "#fffafc"], dark: false },
];

export const ACCENTS: { name: string; value: string }[] = [
  { name: "Aqua", value: "#1fb6d6" },
  { name: "Sky", value: "#38bdf8" },
  { name: "Ocean", value: "#2563eb" },
  { name: "Lagoon", value: "#06b6d4" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Seafoam", value: "#2dd4bf" },
  { name: "Wave", value: "#3b82f6" },
  { name: "Iris", value: "#6366f1" },
  { name: "Coral", value: "#fb7185" },
  { name: "Mint", value: "#34d399" },
];

export const FONTS: { id: FontId; label: string; stack: string }[] = [
  { id: "sans", label: "Sans", stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { id: "rounded", label: "Rounded", stack: 'ui-rounded, "SF Pro Rounded", "Segoe UI", "Nunito", system-ui, sans-serif' },
  { id: "serif", label: "Serif", stack: 'Georgia, "Iowan Old Style", "Times New Roman", serif' },
  { id: "mono", label: "Mono", stack: 'var(--font-geist-mono), ui-monospace, "Cascadia Code", monospace' },
];

export const RADII: { id: RadiusId; label: string; px: number }[] = [
  { id: "sharp", label: "Sharp", px: 6 },
  { id: "soft", label: "Soft", px: 18 },
  { id: "round", label: "Round", px: 28 },
];

export const DENSITIES: { id: Density; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "cozy", label: "Cozy" },
  { id: "spacious", label: "Spacious" },
];

export type WidgetId =
  | "gpa"
  | "courses"
  | "upcoming"
  | "agenda"
  | "attendance"
  | "trend";

export const ALL_WIDGETS: { id: WidgetId; label: string; description: string }[] = [
  { id: "gpa", label: "GPA & Averages", description: "Overall GPA ring and term average" },
  { id: "courses", label: "Course Grades", description: "Live grade for every class" },
  { id: "upcoming", label: "Upcoming Work", description: "Assignments & agenda items due soon" },
  { id: "agenda", label: "Agenda Preview", description: "Today + tomorrow from your agenda book" },
  { id: "attendance", label: "Attendance", description: "Absences and tardies at a glance" },
  { id: "trend", label: "Grade Trend", description: "Average across classes as a chart" },
];

export const DEFAULT_WIDGETS: { id: WidgetId; visible: boolean }[] = ALL_WIDGETS.map((w) => ({
  id: w.id,
  visible: true,
}));
