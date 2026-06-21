import type { AgendaItem } from "@/store/agenda";
import type { Gradebook } from "@/lib/studentvue/types";
import { daysUntil, parseDate, toISODate } from "@/lib/utils";

export interface UpcomingItem {
  id: string;
  title: string;
  course: string;
  dueISO: string;
  type: string;
  source: "agenda" | "gradebook";
  done: boolean;
  priority?: AgendaItem["priority"];
}

/** Ungraded gradebook assignments that have a real due date, as importable items. */
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
        source: "gradebook",
        done: false,
      });
    }
  }
  return out;
}

export function agendaUpcoming(items: AgendaItem[]): UpcomingItem[] {
  return items.map((i) => ({
    id: i.id,
    title: i.title,
    course: i.course,
    dueISO: i.due,
    type: i.type,
    source: "agenda" as const,
    done: i.done,
    priority: i.priority,
  }));
}

/** Merged + sorted upcoming list (not-done, due today or later first). */
export function buildUpcoming(
  gb: Gradebook | null,
  agenda: AgendaItem[],
  opts: { includeGradebook?: boolean; horizon?: number } = {},
): UpcomingItem[] {
  const { includeGradebook = true, horizon } = opts;
  const all = [
    ...agendaUpcoming(agenda),
    ...(includeGradebook ? gradebookUpcoming(gb) : []),
  ].filter((i) => !i.done);

  return all
    .filter((i) => {
      const d = daysUntil(i.dueISO);
      if (d == null) return false;
      if (d < -1) return false; // hide long-overdue noise
      if (horizon != null && d > horizon) return false;
      return true;
    })
    .sort((a, b) => a.dueISO.localeCompare(b.dueISO));
}
