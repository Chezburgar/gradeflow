import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_WIDGETS,
  type Density,
  type FontId,
  type GradeDisplay,
  type RadiusId,
  type ThemeId,
  type WidgetId,
} from "@/lib/theme-options";

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
}

interface SettingsState {
  theme: ThemeId;
  accent: string;
  font: FontId;
  density: Density;
  radius: RadiusId;
  glass: boolean;
  animations: boolean;
  gradeDisplay: GradeDisplay;
  widgets: WidgetConfig[];
  hydrated: boolean;

  setTheme: (t: ThemeId) => void;
  setAccent: (c: string) => void;
  setFont: (f: FontId) => void;
  setDensity: (d: Density) => void;
  setRadius: (r: RadiusId) => void;
  setGlass: (v: boolean) => void;
  setAnimations: (v: boolean) => void;
  setGradeDisplay: (g: GradeDisplay) => void;
  toggleWidget: (id: WidgetId) => void;
  moveWidget: (id: WidgetId, dir: -1 | 1) => void;
  resetAll: () => void;
}

const DEFAULTS = {
  theme: "dark" as ThemeId,
  accent: "#1fb6d6",
  font: "sans" as FontId,
  density: "cozy" as Density,
  radius: "soft" as RadiusId,
  glass: true,
  animations: true,
  gradeDisplay: "both" as GradeDisplay,
  widgets: DEFAULT_WIDGETS,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      hydrated: false,

      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setFont: (font) => set({ font }),
      setDensity: (density) => set({ density }),
      setRadius: (radius) => set({ radius }),
      setGlass: (glass) => set({ glass }),
      setAnimations: (animations) => set({ animations }),
      setGradeDisplay: (gradeDisplay) => set({ gradeDisplay }),

      toggleWidget: (id) =>
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w,
          ),
        }),

      moveWidget: (id, dir) => {
        const widgets = [...get().widgets];
        const i = widgets.findIndex((w) => w.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= widgets.length) return;
        [widgets[i], widgets[j]] = [widgets[j], widgets[i]];
        set({ widgets });
      },

      resetAll: () => set({ ...DEFAULTS }),
    }),
    {
      name: "gm-settings",
      onRehydrateStorage: () => (state) => {
        // ensure new widgets added in updates appear for existing users
        if (state) {
          const ids = new Set(state.widgets.map((w) => w.id));
          const merged = [
            ...state.widgets.filter((w) => DEFAULT_WIDGETS.some((d) => d.id === w.id)),
            ...DEFAULT_WIDGETS.filter((d) => !ids.has(d.id)),
          ];
          state.widgets = merged;
          state.hydrated = true;
        }
      },
    },
  ),
);
