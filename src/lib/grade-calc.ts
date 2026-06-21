import type { Course } from "@/lib/studentvue/types";

export interface Override {
  earned: number | null;
  possible: number | null;
}

export interface Hypothetical {
  id: string;
  name: string;
  type: string;
  earned: number;
  possible: number;
}

/** A user-added grade category (not from the school gradebook). */
export interface CustomCategory {
  id: string;
  type: string;
  weight: number; // 0..1
  /** When true the category's weight is added on top of 100% (extra credit). */
  additive?: boolean;
}

export interface CategoryResult {
  type: string;
  weight: number | null;
  earned: number;
  possible: number;
  percent: number | null;
  count: number;
  custom?: boolean;
  additive?: boolean;
}

export interface CourseResult {
  percent: number | null;
  categories: CategoryResult[];
  weighted: boolean;
}

interface Item {
  type: string;
  earned: number;
  possible: number;
}

export interface ComputeOptions {
  overrides?: Record<string, Override>;
  hypos?: Hypothetical[];
  /** Extra user-created categories merged into the weighting. */
  customCategories?: CustomCategory[];
  /** Override a category's weight by its type name (0..1). */
  weightOverrides?: Record<string, number>;
}

/**
 * Recompute a course grade from its assignments, applying score overrides,
 * hypothetical assignments, user-added categories, and weight overrides.
 * Mirrors StudentVUE: weighted by category when weights exist, otherwise
 * straight points. Additive (extra-credit) categories add on top of 100%.
 */
export function computeCourse(
  course: Course,
  opts: ComputeOptions = {},
): CourseResult {
  const {
    overrides = {},
    hypos = [],
    customCategories = [],
    weightOverrides = {},
  } = opts;

  const items: Item[] = [];

  for (const a of course.assignments) {
    const ov = overrides[a.id];
    // Per-field fallback: editing only one field keeps the assignment's
    // original value for the other (and lets you score an ungraded item).
    const earned = ov && ov.earned != null ? ov.earned : a.pointsEarned;
    const possible = ov && ov.possible != null ? ov.possible : a.pointsPossible;
    if (earned != null && possible != null && possible > 0) {
      items.push({ type: a.type || "Other", earned, possible });
    }
  }
  for (const h of hypos) {
    if (h.possible > 0) {
      items.push({ type: h.type || "Other", earned: h.earned, possible: h.possible });
    }
  }

  // Merge real + custom categories, applying any weight overrides.
  const defs: { type: string; weight: number | null; custom?: boolean; additive?: boolean }[] = [
    ...course.categories.map((c) => ({
      type: c.type,
      weight: weightOverrides[c.type] != null ? weightOverrides[c.type] : c.weight,
      custom: false,
      additive: false,
    })),
    ...customCategories.map((c) => ({
      type: c.type,
      weight: weightOverrides[c.type] != null ? weightOverrides[c.type] : c.weight,
      custom: true,
      additive: c.additive,
    })),
  ];

  const hasWeights = defs.some((c) => c.weight != null && c.weight > 0);

  if (hasWeights) {
    const used = new Set<number>();
    const categories: CategoryResult[] = defs.map((cat) => {
      const matched = items.filter((it, idx) => {
        if (it.type.toLowerCase() === cat.type.toLowerCase() && !used.has(idx)) {
          used.add(idx);
          return true;
        }
        return false;
      });
      const earned = matched.reduce((s, i) => s + i.earned, 0);
      const possible = matched.reduce((s, i) => s + i.possible, 0);
      return {
        type: cat.type,
        weight: cat.weight,
        earned,
        possible,
        percent: possible > 0 ? (earned / possible) * 100 : null,
        count: matched.length,
        custom: cat.custom,
        additive: cat.additive,
      };
    });

    // normal categories are normalized to their own total weight
    const normal = categories.filter((c) => !c.additive && c.percent != null && c.weight);
    const totalWeight = normal.reduce((s, c) => s + (c.weight ?? 0), 0);
    const base =
      totalWeight > 0
        ? normal.reduce((s, c) => s + (c.percent ?? 0) * (c.weight ?? 0), 0) / totalWeight
        : null;

    // additive (extra credit) categories add weight*percent points on top
    const bonus = categories
      .filter((c) => c.additive && c.percent != null && c.weight)
      .reduce((s, c) => s + (c.percent ?? 0) * (c.weight ?? 0), 0);

    const percent = base != null ? base + bonus : bonus > 0 ? bonus : null;

    return { percent, categories, weighted: true };
  }

  // points mode (no weights anywhere)
  const earned = items.reduce((s, i) => s + i.earned, 0);
  const possible = items.reduce((s, i) => s + i.possible, 0);
  const byType = new Map<string, Item[]>();
  for (const i of items) {
    if (!byType.has(i.type)) byType.set(i.type, []);
    byType.get(i.type)!.push(i);
  }
  const categories: CategoryResult[] = [...byType.entries()].map(([type, list]) => {
    const e = list.reduce((s, i) => s + i.earned, 0);
    const p = list.reduce((s, i) => s + i.possible, 0);
    return {
      type,
      weight: null,
      earned: e,
      possible: p,
      percent: p > 0 ? (e / p) * 100 : null,
      count: list.length,
    };
  });

  return {
    percent: possible > 0 ? (earned / possible) * 100 : null,
    categories,
    weighted: false,
  };
}

/* ---------------- semester / final calculation ---------------- */

export interface SemesterPart {
  label: string;
  percent: number | null; // editable quarter or exam %
  weight: number; // relative weight
}

/** Weighted average of semester parts (quarters + optional exam). */
export function computeSemester(parts: SemesterPart[]): number | null {
  const active = parts.filter((p) => p.percent != null && p.weight > 0);
  const total = active.reduce((s, p) => s + p.weight, 0);
  if (total <= 0) return null;
  return active.reduce((s, p) => s + (p.percent ?? 0) * p.weight, 0) / total;
}
