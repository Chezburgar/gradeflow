"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calculator,
  Layers,
  Mail,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useResource, useSemester } from "@/components/DataProvider";
import { ResourceView } from "@/components/Resource";
import { ScoreLine } from "@/components/Charts";
import { MarkPill } from "@/components/grade-bits";
import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  GradeRing,
  Input,
  Select,
  Skeleton,
  Toggle,
} from "@/components/ui";
import {
  computeCourse,
  type CustomCategory,
  type Hypothetical,
  type Override,
} from "@/lib/grade-calc";
import {
  exactPct,
  gradeVar,
  letterFromPercent,
  parseDate,
  relativeDay,
} from "@/lib/utils";
import type { Assignment, Course } from "@/lib/studentvue/types";

export default function ClassPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading…</div>}>
      <ClassDetailInner />
    </Suspense>
  );
}

function ClassDetailInner() {
  const id = useSearchParams().get("id") ?? "";
  const gb = useResource("gradebook");

  return (
    <ResourceView
      res={gb}
      resourceKey="gradebook"
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-40 rounded-[var(--radius-card)]" />
          <Skeleton className="h-72 rounded-[var(--radius-card)]" />
        </div>
      }
    >
      {(gradebook) => {
        const course = gradebook.courses.find((c) => c.id === id);
        if (!course) {
          return (
            <div className="py-20 text-center">
              <p className="text-lg font-semibold">Class not found</p>
              <Link href="/grades" className="mt-2 inline-block text-accent hover:underline">
                ← Back to grades
              </Link>
            </div>
          );
        }
        return <CourseDetail course={course} />;
      }}
    </ResourceView>
  );
}

function CourseDetail({ course }: { course: Course }) {
  const semester = useSemester(course.id);
  const [whatIf, setWhatIf] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [hypos, setHypos] = useState<Hypothetical[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [weightOverrides, setWeightOverrides] = useState<Record<string, number>>({});

  const live = useMemo(
    () =>
      computeCourse(
        course,
        whatIf ? { overrides, hypos, customCategories, weightOverrides } : {},
      ),
    [course, overrides, hypos, customCategories, weightOverrides, whatIf],
  );

  const basePercent = course.scoreRaw;
  const shownPercent = whatIf ? live.percent : basePercent;
  const shownLetter =
    whatIf || !course.mark ? letterFromPercent(shownPercent) : course.mark;
  const ringColor = gradeVar(shownPercent);

  const history = useMemo(() => {
    const graded = course.assignments
      .filter((a) => a.percent != null)
      .map((a) => ({ a, d: parseDate(a.date) }))
      .filter((x) => x.d)
      .sort((x, y) => x.d!.getTime() - y.d!.getTime());
    return {
      labels: graded.map((x) =>
        x.d!.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      ),
      values: graded.map((x) => x.a.percent!),
    };
  }, [course]);

  function setOverride(id: string, patch: Partial<Override>) {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        earned: prev[id]?.earned ?? null,
        possible: prev[id]?.possible ?? null,
        ...patch,
      },
    }));
  }

  function reset() {
    setOverrides({});
    setHypos([]);
    setCustomCategories([]);
    setWeightOverrides({});
  }

  const hasChanges =
    hypos.length > 0 ||
    Object.keys(overrides).length > 0 ||
    customCategories.length > 0 ||
    Object.keys(weightOverrides).length > 0;

  return (
    <div>
      <Link
        href="/grades"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
      >
        <ArrowLeft size={15} /> All grades
      </Link>

      <PageHeader title={course.title} subtitle={`Period ${course.period || "—"}`} />

      {/* summary */}
      <Card className="mb-5 flex flex-wrap items-center gap-6 p-6">
        <div className="relative">
          <GradeRing
            value={shownPercent ?? 0}
            label={shownLetter}
            sublabel={shownPercent != null ? `${shownPercent.toFixed(1)}%` : "—"}
            color={ringColor}
          />
          {whatIf && (
            <span className="absolute -right-1 -top-1 rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-bold text-accent-fg">
              WHAT-IF
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          {course.teacher && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Teacher</span>
              {course.teacherEmail ? (
                <a
                  href={`mailto:${course.teacherEmail}`}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  {course.teacher} <Mail size={13} />
                </a>
              ) : (
                <span className="font-medium">{course.teacher}</span>
              )}
            </div>
          )}
          {course.room && (
            <p className="text-sm">
              <span className="text-muted">Room</span>{" "}
              <span className="font-medium">{course.room}</span>
            </p>
          )}
          {semester.percent != null && (
            <p className="text-sm">
              <span className="text-muted">{semester.label}</span>{" "}
              <span className="font-semibold" style={{ color: gradeVar(semester.percent) }}>
                {exactPct(semester.percent)}
              </span>
            </p>
          )}
          {whatIf && basePercent != null && (
            <p className="text-sm text-muted">
              Actual grade:{" "}
              <span className="font-medium text-text">
                {course.mark || letterFromPercent(basePercent)} · {basePercent.toFixed(1)}%
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 rounded-[var(--radius-soft)] bg-surface-2 px-3 py-2">
            <Calculator size={16} className="text-accent" />
            <span className="text-sm font-medium">What-if</span>
            <Toggle checked={whatIf} onChange={setWhatIf} />
          </div>
          {whatIf && hasChanges && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw size={14} /> Reset
            </Button>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* categories + chart */}
        <div className="space-y-5 lg:col-span-2">
          {(live.categories.length > 0 || whatIf) && (
            <BreakdownCard
              live={live}
              whatIf={whatIf}
              onWeight={(type, pct) =>
                setWeightOverrides((prev) => ({ ...prev, [type]: pct / 100 }))
              }
              onAddCustom={(c) => setCustomCategories((prev) => [...prev, c])}
              onRemoveCustom={(type) => {
                setCustomCategories((prev) => prev.filter((c) => c.type !== type));
                setWeightOverrides((prev) => {
                  const n = { ...prev };
                  delete n[type];
                  return n;
                });
                setHypos((prev) => prev.filter((h) => h.type !== type));
              }}
            />
          )}

          {history.values.length > 1 && (
            <Card className="pb-5">
              <CardHeader title="Score history" />
              <div className="px-4 pt-4">
                <ScoreLine labels={history.labels} values={history.values} />
              </div>
            </Card>
          )}
        </div>

        {/* assignments */}
        <div className="lg:col-span-3">
          <Card className="relative">
            <CardHeader
              title={`Assignments (${course.assignments.length})`}
              action={
                whatIf ? (
                  <AddHypo
                    categories={live.categories.map((c) => c.type)}
                    onAdd={(h) => setHypos((p) => [...p, h])}
                  />
                ) : undefined
              }
            />
            <div className="mt-2 divide-y divide-line">
              {course.assignments.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  No assignments posted yet.
                </p>
              )}
              {course.assignments.map((a) => (
                <AssignmentRow
                  key={a.id}
                  a={a}
                  whatIf={whatIf}
                  override={overrides[a.id]}
                  onChange={(p) => setOverride(a.id, p)}
                />
              ))}

              <AnimatePresence>
                {hypos.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <Badge color="var(--accent)">hypothetical</Badge>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {h.name}
                    </span>
                    <span className="text-sm text-muted">
                      {h.earned}/{h.possible}
                    </span>
                    <button
                      onClick={() => setHypos((p) => p.filter((x) => x.id !== h.id))}
                      className="text-faint hover:text-grade-f"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AssignmentRow({
  a,
  whatIf,
  override,
  onChange,
}: {
  a: Assignment;
  whatIf: boolean;
  override?: Override;
  onChange: (p: Partial<Override>) => void;
}) {
  const earned = override?.earned ?? a.pointsEarned;
  const possible = override?.possible ?? a.pointsPossible;
  const pct = earned != null && possible ? (earned / possible) * 100 : a.percent;

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{a.name}</p>
          {a.type && (
            <span className="hidden shrink-0 text-xs text-faint sm:inline">{a.type}</span>
          )}
        </div>
        <p className="text-xs text-muted">
          {a.graded ? a.date : `Due ${relativeDay(a.dueDate || a.date)}`}
          {a.notes ? ` · ${a.notes}` : ""}
        </p>
      </div>

      {whatIf ? (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={earned ?? ""}
            onChange={(e) =>
              onChange({ earned: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="h-9 w-16 px-2 text-center"
            placeholder="–"
          />
          <span className="text-muted">/</span>
          <Input
            type="number"
            value={possible ?? ""}
            onChange={(e) =>
              onChange({ possible: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="h-9 w-16 px-2 text-center"
            placeholder="–"
          />
        </div>
      ) : a.graded ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            {a.pointsEarned != null && a.pointsPossible != null
              ? `${a.pointsEarned}/${a.pointsPossible}`
              : a.scoreString}
          </span>
          <MarkPill percent={pct} size="sm" />
        </div>
      ) : (
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
          {a.pointsPossible != null ? `— / ${a.pointsPossible}` : "Not graded"}
        </span>
      )}
    </div>
  );
}

function AddHypo({
  categories,
  onAdd,
}: {
  categories: string[];
  onAdd: (h: Hypothetical) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(categories[0] ?? "Other");
  const [earned, setEarned] = useState("");
  const [possible, setPossible] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Plus size={13} /> Add
      </button>
    );
  }

  return (
    <div className="absolute right-4 top-12 z-10 w-64 rounded-[var(--radius-soft)] border border-line bg-surface p-3 shadow-lg">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Assignment name"
        className="mb-2 h-9"
      />
      <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-2 h-9 w-full"
      >
        {(categories.length ? categories : ["Other"]).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <div className="mb-2 flex items-center gap-1.5">
        <Input
          type="number"
          value={earned}
          onChange={(e) => setEarned(e.target.value)}
          placeholder="Earned"
          className="h-9"
        />
        <span className="text-muted">/</span>
        <Input
          type="number"
          value={possible}
          onChange={(e) => setPossible(e.target.value)}
          placeholder="Total"
          className="h-9"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            if (!possible) return;
            onAdd({
              id: Math.random().toString(36).slice(2),
              name: name || "Hypothetical",
              type,
              earned: Number(earned) || 0,
              possible: Number(possible),
            });
            setOpen(false);
            setName("");
            setEarned("");
            setPossible("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

/* ---------------- breakdown + custom categories ---------------- */

function BreakdownCard({
  live,
  whatIf,
  onWeight,
  onAddCustom,
  onRemoveCustom,
}: {
  live: ReturnType<typeof computeCourse>;
  whatIf: boolean;
  onWeight: (type: string, pct: number) => void;
  onAddCustom: (c: CustomCategory) => void;
  onRemoveCustom: (type: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [additive, setAdditive] = useState(false);

  return (
    <Card className="pb-4">
      <CardHeader
        title="Breakdown"
        icon={<Layers size={16} />}
        action={
          whatIf ? (
            <button
              onClick={() => setAdding((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <Plus size={13} /> Category
            </button>
          ) : undefined
        }
      />

      {adding && (
        <div className="mx-5 mt-3 space-y-2 rounded-[var(--radius-soft)] border border-line bg-surface-2 p-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g. Final Exam)"
            className="h-9"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight %"
              className="h-9 w-24"
            />
            <label className="flex flex-1 items-center gap-2 text-xs text-muted">
              <Toggle checked={additive} onChange={setAdditive} />
              Extra credit
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const w = Number(weight);
                if (!name.trim() || !w) return;
                onAddCustom({
                  id: Math.random().toString(36).slice(2),
                  type: name.trim(),
                  weight: w / 100,
                  additive,
                });
                setName("");
                setWeight("");
                setAdditive(false);
                setAdding(false);
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-3 px-5">
        {live.categories.length === 0 && (
          <p className="py-3 text-center text-sm text-muted">
            This class isn&apos;t weighted by category.
          </p>
        )}
        {live.categories.map((cat) => (
          <div key={cat.type}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                <span className="truncate">{cat.type}</span>
                {cat.additive && <Badge color="var(--grade-b)">extra</Badge>}
                {cat.custom && whatIf && (
                  <button
                    onClick={() => onRemoveCustom(cat.type)}
                    className="text-faint hover:text-grade-f"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-muted">
                <span>{cat.percent != null ? `${cat.percent.toFixed(1)}%` : "—"}</span>
                {cat.weight != null &&
                  (whatIf ? (
                    <span className="flex items-center text-faint">
                      ·
                      <Input
                        type="number"
                        defaultValue={Math.round((cat.weight ?? 0) * 100)}
                        onChange={(e) =>
                          onWeight(cat.type, Number(e.target.value) || 0)
                        }
                        className="ml-1 h-7 w-14 px-1.5 text-center text-xs"
                      />
                      %
                    </span>
                  ) : (
                    <span className="text-faint">· {Math.round(cat.weight * 100)}%</span>
                  ))}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className="h-full rounded-full"
                style={{ background: gradeVar(cat.percent) }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, cat.percent ?? 0)}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
