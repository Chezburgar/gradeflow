"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useResource } from "@/components/DataProvider";
import { useAgenda } from "@/store/agenda";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card } from "@/components/ui";
import { gradebookUpcoming } from "@/lib/upcoming";
import { cn, parseDate, relativeDay, toISODate, todayISO } from "@/lib/utils";

interface DayEvent {
  title: string;
  type: string;
  color: string;
}

function colorFor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("holiday")) return "var(--grade-b)";
  if (t.includes("test")) return "var(--grade-f)";
  if (t.includes("project")) return "var(--grade-d)";
  if (t.includes("assign") || t.includes("homework")) return "var(--accent)";
  if (t.includes("reminder")) return "var(--grade-c)";
  return "var(--grade-c)";
}

export default function CalendarPage() {
  const cal = useResource("calendar");
  const gb = useResource("gradebook");
  const agenda = useAgenda((s) => s.items);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(todayISO());

  const events = useMemo(() => {
    const map: Record<string, DayEvent[]> = {};
    const push = (iso: string, e: DayEvent) => {
      (map[iso] ??= []).push(e);
    };
    for (const e of cal.data ?? []) {
      const d = parseDate(e.date);
      if (d) push(toISODate(d), { title: e.title, type: e.type, color: colorFor(e.type) });
    }
    for (const a of agenda) {
      if (a.due) push(a.due, { title: a.title, type: a.type, color: colorFor(a.type) });
    }
    for (const u of gradebookUpcoming(gb.data ?? null)) {
      push(u.dueISO, { title: u.title, type: u.type, color: colorFor(u.type) });
    }
    return map;
  }, [cal.data, agenda, gb.data]);

  const base = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [offset]);

  const grid = useMemo(() => {
    const first = new Date(base);
    const startDay = (first.getDay() + 6) % 7; // Monday start
    const start = new Date(first);
    start.setDate(start.getDate() - startDay);
    return Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [base]);

  const today = todayISO();
  const selectedEvents = events[selected] ?? [];

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="School events, due dates & your agenda"
        action={
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => setOffset((o) => o - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="min-w-36 text-center text-sm font-semibold">
              {base.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <Button size="icon" variant="outline" onClick={() => setOffset((o) => o + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      <Card className="p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((d) => {
            const iso = toISODate(d);
            const inMonth = d.getMonth() === base.getMonth();
            const dayEvents = events[iso] ?? [];
            const isToday = iso === today;
            const isSelected = iso === selected;
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={cn(
                  "flex min-h-16 flex-col rounded-[var(--radius-soft)] p-1.5 text-left transition-colors sm:min-h-20",
                  inMonth ? "hover:bg-surface-2" : "opacity-40",
                  isSelected && "ring-2 ring-accent",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full text-xs font-medium",
                    isToday && "bg-accent text-accent-fg",
                  )}
                >
                  {d.getDate()}
                </span>
                <div className="mt-1 hidden flex-1 space-y-0.5 overflow-hidden sm:block">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div
                      key={i}
                      className="truncate rounded px-1 text-[0.6rem] font-medium leading-tight"
                      style={{
                        background: `color-mix(in srgb, ${e.color} 18%, transparent)`,
                        color: e.color,
                      }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="px-1 text-[0.6rem] text-faint">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
                {/* mobile: dots */}
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex gap-0.5 sm:hidden">
                    {dayEvents.slice(0, 4).map((e, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h3 className="text-sm font-semibold">
          {relativeDay(selected)} ·{" "}
          <span className="text-muted">
            {parseDate(selected)?.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing scheduled.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {selectedEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[var(--radius-soft)] bg-surface-2 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                <span className="flex-1 text-sm font-medium">{e.title}</span>
                <span className="text-xs capitalize text-muted">{e.type}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
