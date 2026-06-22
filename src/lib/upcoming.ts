import type { Gradebook } from "@/lib/studentvue/types";
import { daysUntil, parseDate, toISODate } from "@/lib/utils";

export interface UpcomingItem {
  id: string;
  title: string;
  course: string;
  dueISO: string;
  type: string;
}

/** Ungraded gradebook assignments that have a real due date. */
export function gradebookUpcoming(gb: Gradebook | null): UpcomingItem[] {
  if (!gb) return [];
  const out: UpcomingItem[] = [];
  for (const c of gb.courses) {
    for (const a of c.assignments) {
      if (a.graded) continue;
      const d = parseDate(a.dueDate || a.date);
      if (!d) continue;
      out.push({
        id: `gb-${c.id}-${a.id}`,
        title: a.name,
        course: c.title,
        dueISO: toISODate(d),
        type: a.type || "assignment",
      });
    }
  }
  return out;
}

/** Upcoming assignments, sorted, within an optional day horizon. */
export function buildUpcoming(
  gb: Gradebook | null,
  opts: { horizon?: number } = {},
): UpcomingItem[] {
  const { horizon } = opts;
  return gradebookUpcoming(gb)
    .filter((i) => {
      const d = daysUntil(i.dueISO);
      if (d == null) return false;
      if (d < -1) return false; // hide long-overdue noise
      if (horizon != null && d > horizon) return false;
      return true;
    })
    .sort((a, b) => a.dueISO.localeCompare(b.dueISO));
}
