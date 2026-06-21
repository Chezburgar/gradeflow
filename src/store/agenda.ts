import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AgendaType = "homework" | "test" | "project" | "reminder" | "event";
export type Priority = "low" | "normal" | "high";

export interface AgendaItem {
  id: string;
  title: string;
  course: string; // free text or course title
  type: AgendaType;
  due: string; // ISO date (yyyy-mm-dd)
  notes: string;
  priority: Priority;
  done: boolean;
  createdAt: number;
  source?: "manual" | "import"; // import = pulled from gradebook
  sourceKey?: string; // dedupe key for imported items
}

interface AgendaState {
  items: AgendaItem[];
  add: (item: Omit<AgendaItem, "id" | "createdAt" | "done"> & { done?: boolean }) => void;
  update: (id: string, patch: Partial<AgendaItem>) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  importItems: (items: Omit<AgendaItem, "id" | "createdAt" | "done">[]) => number;
  clearDone: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAgenda = create<AgendaState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...item, id: uid(), createdAt: Date.now(), done: item.done ?? false },
          ],
        })),

      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      toggle: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
        })),

      importItems: (incoming) => {
        const existing = new Set(
          get()
            .items.filter((i) => i.sourceKey)
            .map((i) => i.sourceKey),
        );
        const fresh = incoming.filter(
          (i) => !i.sourceKey || !existing.has(i.sourceKey),
        );
        if (fresh.length) {
          set((s) => ({
            items: [
              ...s.items,
              ...fresh.map((i) => ({
                ...i,
                id: uid(),
                createdAt: Date.now(),
                done: false,
              })),
            ],
          }));
        }
        return fresh.length;
      },

      clearDone: () => set((s) => ({ items: s.items.filter((i) => !i.done) })),
    }),
    { name: "gm-agenda" },
  ),
);
