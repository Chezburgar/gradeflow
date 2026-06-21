"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  Input,
  Segmented,
  Select,
  Textarea,
} from "@/components/ui";
import { useResource } from "@/components/DataProvider";
import { useSettings } from "@/store/settings";
import {
  useAgenda,
  type AgendaItem,
  type AgendaType,
  type Priority,
} from "@/store/agenda";
import { gradebookUpcoming } from "@/lib/upcoming";
import {
  cn,
  daysUntil,
  parseDate,
  relativeDay,
  todayISO,
  toISODate,
} from "@/lib/utils";

const TYPES: { id: AgendaType; label: string; color: string }[] = [
  { id: "homework", label: "Homework", color: "var(--accent)" },
  { id: "test", label: "Test", color: "var(--grade-f)" },
  { id: "project", label: "Project", color: "var(--grade-d)" },
  { id: "reminder", label: "Reminder", color: "var(--grade-c)" },
  { id: "event", label: "Event", color: "var(--grade-b)" },
];
const typeColor = (t: string) => TYPES.find((x) => x.id === t)?.color ?? "var(--accent)";

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export default function AgendaPage() {
  const items = useAgenda((s) => s.items);
  const toggle = useAgenda((s) => s.toggle);
  const remove = useAgenda((s) => s.remove);
  const importItems = useAgenda((s) => s.importItems);
  const gb = useResource("gradebook");

  const [view, setView] = useState<"list" | "week">("list");
  const [status, setStatus] = useState<"all" | "todo" | "done">("todo");
  const [courseFilter, setCourseFilter] = useState("all");
  const [editing, setEditing] = useState<AgendaItem | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const courses = useMemo(() => {
    const fromGb = gb.data?.courses.map((c) => c.title) ?? [];
    const fromItems = items.map((i) => i.course).filter(Boolean);
    return Array.from(new Set([...fromGb, ...fromItems]));
  }, [gb.data, items]);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (status === "todo" && i.done) return false;
        if (status === "done" && !i.done) return false;
        if (courseFilter !== "all" && i.course !== courseFilter) return false;
        return true;
      }),
    [items, status, courseFilter],
  );

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(item: AgendaItem) {
    setEditing(item);
    setOpen(true);
  }

  function doImport() {
    const up = gradebookUpcoming(gb.data ?? null).map((u) => ({
      title: u.title,
      course: u.course,
      type: (u.type.toLowerCase().includes("test")
        ? "test"
        : u.type.toLowerCase().includes("project") || u.type.toLowerCase().includes("essay")
          ? "project"
          : "homework") as AgendaType,
      due: u.dueISO,
      notes: "",
      priority: "normal" as Priority,
      source: "import" as const,
      sourceKey: u.id,
    }));
    const n = importItems(up);
    setToast(n ? `Imported ${n} assignment${n > 1 ? "s" : ""}` : "Nothing new to import");
    setTimeout(() => setToast(""), 2500);
  }

  const stats = {
    total: items.length,
    todo: items.filter((i) => !i.done).length,
    overdue: items.filter((i) => !i.done && (daysUntil(i.due) ?? 0) < 0).length,
  };

  return (
    <div>
      <PageHeader
        title="Agenda book"
        subtitle="Plan homework, tests, projects & reminders"
        action={
          <div className="flex gap-2">
            {gb.data && (
              <Button variant="outline" onClick={doImport}>
                <Download size={16} /> Import
              </Button>
            )}
            <Button onClick={openNew}>
              <Plus size={16} /> Add item
            </Button>
          </div>
        }
      />

      {/* stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <MiniStat label="To do" value={stats.todo} />
        <MiniStat label="Overdue" value={stats.overdue} color="var(--grade-f)" />
        <MiniStat label="Total" value={stats.total} />
      </div>

      {/* controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: (<span className="flex items-center gap-1.5"><ListTodo size={15} /> List</span>) },
            { value: "week", label: (<span className="flex items-center gap-1.5"><CalendarDays size={15} /> Week</span>) },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="all">All classes</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: "todo", label: "To do" },
              { value: "done", label: "Done" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
      </div>

      {view === "list" ? (
        <ListView items={filtered} onToggle={toggle} onEdit={openEdit} onRemove={remove} onAdd={openNew} />
      ) : (
        <WeekView items={filtered} onToggle={toggle} onEdit={openEdit} />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg shadow-lg lg:bottom-8"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AgendaDialog
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        courses={courses}
      />
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-3xl font-bold" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}

/* ---------------- list view ---------------- */

const GROUP_ORDER = ["Overdue", "Today", "Tomorrow", "This week", "Later", "No date"];

function groupOf(iso: string): string {
  const d = daysUntil(iso);
  if (d == null) return "No date";
  if (d < 0) return "Overdue";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d <= 7) return "This week";
  return "Later";
}

function ListView({
  items,
  onToggle,
  onEdit,
  onRemove,
  onAdd,
}: {
  items: AgendaItem[];
  onToggle: (id: string) => void;
  onEdit: (i: AgendaItem) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const groups = useMemo(() => {
    const map: Record<string, AgendaItem[]> = {};
    for (const i of items) {
      const g = groupOf(i.due);
      (map[g] ??= []).push(i);
    }
    for (const g of Object.keys(map)) {
      map[g].sort((a, b) => (a.due || "z").localeCompare(b.due || "z"));
    }
    return map;
  }, [items]);

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-accent">
          <ListTodo size={26} />
        </div>
        <div>
          <p className="font-semibold">Your agenda is clear</p>
          <p className="mt-1 text-sm text-muted">Add an item or import from your gradebook.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={16} /> Add item
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => (
        <div key={g}>
          <h3
            className={cn(
              "mb-2 text-sm font-semibold",
              g === "Overdue" ? "text-grade-f" : "text-muted",
            )}
          >
            {g}
            <span className="ml-2 text-faint">{groups[g].length}</span>
          </h3>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {groups[g].map((i) => (
                <AgendaRow
                  key={i.id}
                  item={i}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgendaRow({
  item,
  onToggle,
  onEdit,
  onRemove,
}: {
  item: AgendaItem;
  onToggle: (id: string) => void;
  onEdit: (i: AgendaItem) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="card group flex items-center gap-3 p-3.5"
    >
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
          item.done ? "border-transparent bg-accent text-accent-fg" : "border-line hover:border-accent",
        )}
      >
        {item.done && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            <path d="M20 6 9 17l-5-5" />
          </motion.svg>
        )}
      </button>

      <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: typeColor(item.type) }} />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", item.done && "text-faint line-through")}>
          {item.title}
        </p>
        <p className="truncate text-xs text-muted">
          {item.course || "General"}
          {item.priority === "high" && !item.done && (
            <span className="ml-1.5 font-medium text-grade-f">· High</span>
          )}
          {item.notes ? ` · ${item.notes}` : ""}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 text-xs font-medium",
          !item.done && (daysUntil(item.due) ?? 0) < 0 ? "text-grade-f" : "text-muted",
        )}
      >
        {item.due ? relativeDay(item.due) : "—"}
      </span>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => onEdit(item)} className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
          <Pencil size={14} />
        </button>
        <button onClick={() => onRemove(item.id)} className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-grade-f">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------- week view ---------------- */

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function WeekView({
  items,
  onToggle,
  onEdit,
}: {
  items: AgendaItem[];
  onToggle: (id: string) => void;
  onEdit: (i: AgendaItem) => void;
}) {
  const showWeekend = useSettings((s) => s.showWeekend);
  const [offset, setOffset] = useState(0);

  const start = useMemo(() => {
    const s = startOfWeek(new Date());
    s.setDate(s.getDate() + offset * 7);
    return s;
  }, [offset]);

  const days = useMemo(() => {
    const count = showWeekend ? 7 : 5;
    return Array.from({ length: count }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [start, showWeekend]);

  const byDay = useMemo(() => {
    const map: Record<string, AgendaItem[]> = {};
    for (const i of items) {
      if (!i.due) continue;
      (map[i.due] ??= []).push(i);
    }
    return map;
  }, [items]);

  const today = todayISO();
  const label = `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[days.length - 1].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted">{label}</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => setOffset((o) => o - 1)}>
            <ChevronLeft size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOffset(0)}>
            Today
          </Button>
          <Button size="icon" variant="outline" onClick={() => setOffset((o) => o + 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-3", showWeekend ? "md:grid-cols-7" : "md:grid-cols-5")}>
        {days.map((d) => {
          const iso = toISODate(d);
          const list = (byDay[iso] ?? []).sort((a, b) => a.title.localeCompare(b.title));
          const isToday = iso === today;
          return (
            <Card key={iso} className={cn("min-h-32 p-3", isToday && "ring-2 ring-accent")}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className={cn("text-xs font-semibold", isToday ? "text-accent" : "text-muted")}>
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className={cn("text-lg font-bold", isToday && "text-accent")}>
                  {d.getDate()}
                </span>
              </div>
              <div className="space-y-1.5">
                {list.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => onEdit(i)}
                    onDoubleClick={() => onToggle(i.id)}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-2",
                      i.done && "opacity-50",
                    )}
                    style={{ background: `color-mix(in srgb, ${typeColor(i.type)} 12%, transparent)` }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: typeColor(i.type) }} />
                    <span className={cn("truncate", i.done && "line-through")}>{i.title}</span>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-faint">
        Tip: click an item to edit, double-click to mark done.
      </p>
    </div>
  );
}

/* ---------------- dialog ---------------- */

function AgendaDialog({
  open,
  onClose,
  editing,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  editing: AgendaItem | null;
  courses: string[];
}) {
  const add = useAgenda((s) => s.add);
  const update = useAgenda((s) => s.update);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [type, setType] = useState<AgendaType>("homework");
  const [due, setDue] = useState(todayISO());
  const [priority, setPriority] = useState<Priority>("normal");
  const [notes, setNotes] = useState("");

  // sync form when dialog opens or target item changes
  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setCourse(editing?.course ?? "");
    setType(editing?.type ?? "homework");
    setDue(editing?.due ?? todayISO());
    setPriority(editing?.priority ?? "normal");
    setNotes(editing?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  function save() {
    if (!title.trim()) return;
    const payload = { title: title.trim(), course, type, due, priority, notes };
    if (editing) update(editing.id, payload);
    else add({ ...payload, source: "manual" });
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit item" : "New agenda item"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{editing ? "Save" : "Add"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 7 problem set"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Class">
            <Input
              list="agenda-courses"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Optional"
            />
            <datalist id="agenda-courses">
              {courses.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Due date">
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
        </div>

        <Field label="Type">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                  type === t.id ? "text-accent-fg" : "text-muted hover:text-text",
                )}
                style={
                  type === t.id
                    ? { background: t.color }
                    : { background: "var(--surface-2)" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Priority">
          <Segmented
            value={priority}
            onChange={setPriority}
            options={(["low", "normal", "high"] as Priority[]).map((p) => ({
              value: p,
              label: PRIORITY_LABEL[p],
            }))}
          />
        </Field>

        <Field label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything to remember…"
          />
        </Field>
      </div>
    </Dialog>
  );
}
