"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Clock,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { useResource } from "@/components/DataProvider";
import { ResourceView } from "@/components/Resource";
import { ReportPeriodSelect } from "@/components/ReportPeriod";
import { MarkPill, SemesterTag } from "@/components/grade-bits";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader, GradeRing, Skeleton } from "@/components/ui";
import { useSettings } from "@/store/settings";
import { useSession } from "@/store/session";
import {
  gradeVar,
  gradeVarFromLetter,
  letterFromPercent,
  overallAverage,
  overallGpa,
  relativeDay,
} from "@/lib/utils";
import { buildUpcoming } from "@/lib/upcoming";
import type { WidgetId } from "@/lib/theme-options";
import type { Gradebook } from "@/lib/studentvue/types";

const TYPE_DOT: Record<string, string> = {
  test: "var(--grade-f)",
  project: "var(--grade-d)",
  homework: "var(--accent)",
  reminder: "var(--grade-c)",
  event: "var(--grade-b)",
};

export default function DashboardPage() {
  const gb = useResource("gradebook");
  const att = useResource("attendance");
  const widgets = useSettings((s) => s.widgets);
  const student = useSession((s) => s.student);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = student?.name?.split(/[\s,]+/)[0] ?? "there";

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        subtitle={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        action={
          gb.data ? <ReportPeriodSelect gradebook={gb.data} /> : undefined
        }
      />

      <ResourceView
        res={gb}
        resourceKey="gradebook"
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-[var(--radius-card)]" />
            <Skeleton className="h-64 rounded-[var(--radius-card)]" />
          </div>
        }
      >
        {(gradebook) => (
          <div className="space-y-5">
            {widgets
              .filter((w) => w.visible)
              .map((w) => (
                <Widget
                  key={w.id}
                  id={w.id}
                  gradebook={gradebook}
                  attendance={att.data}
                />
              ))}
          </div>
        )}
      </ResourceView>
    </div>
  );
}

function Widget({
  id,
  gradebook,
  attendance,
}: {
  id: WidgetId;
  gradebook: Gradebook;
  attendance: import("@/lib/studentvue/types").Attendance | null;
}) {
  switch (id) {
    case "gpa":
      return <GpaWidget gradebook={gradebook} />;
    case "courses":
      return <CoursesWidget gradebook={gradebook} />;
    case "upcoming":
      return <UpcomingWidget gradebook={gradebook} />;
    case "attendance":
      return <AttendanceWidget attendance={attendance} />;
    case "trend":
      return <TrendWidget gradebook={gradebook} />;
    default:
      return null;
  }
}

function GpaWidget({ gradebook }: { gradebook: Gradebook }) {
  const gpa = overallGpa(gradebook.courses);
  const avg = overallAverage(gradebook.courses);
  const sorted = [...gradebook.courses]
    .filter((c) => c.scoreRaw != null)
    .sort((a, b) => (b.scoreRaw ?? 0) - (a.scoreRaw ?? 0));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <Card className="flex flex-wrap items-center gap-6 p-6">
      <GradeRing
        value={gpa != null ? (gpa / 4) * 100 : 0}
        label={gpa != null ? gpa.toFixed(2) : "—"}
        sublabel="GPA"
        color="var(--accent)"
      />
      <GradeRing
        value={avg ?? 0}
        label={avg != null ? `${avg.toFixed(1)}` : "—"}
        sublabel="Average"
        color={gradeVar(avg)}
      />
      <div className="flex-1 space-y-3">
        <Stat
          label="Classes"
          value={`${gradebook.courses.length}`}
          hint={gradebook.reportPeriod.name}
        />
        {best && (
          <Stat
            label="Highest"
            value={best.title}
            pill={<MarkPill mark={best.mark} percent={best.scoreRaw} size="sm" />}
          />
        )}
        {worst && worst !== best && (
          <Stat
            label="Needs love"
            value={worst.title}
            pill={<MarkPill mark={worst.mark} percent={worst.scoreRaw} size="sm" />}
          />
        )}
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  pill,
}: {
  label: string;
  value: string;
  hint?: string;
  pill?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
      {pill ?? (hint && <span className="text-xs text-faint">{hint}</span>)}
    </div>
  );
}

function CoursesWidget({ gradebook }: { gradebook: Gradebook }) {
  return (
    <Card className="overflow-hidden pb-2">
      <CardHeader
        title="Your classes"
        icon={<GraduationCap size={16} />}
        action={
          <Link
            href="/grades"
            className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            All grades <ArrowRight size={13} />
          </Link>
        }
      />
      <div className="mt-3 divide-y divide-line">
        {gradebook.courses.map((c) => {
          const color =
            c.mark && c.mark.trim()
              ? gradeVarFromLetter(c.mark)
              : gradeVar(c.scoreRaw);
          return (
            <Link
              key={c.id}
              href={`/class?id=${c.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
            >
              <span className="h-9 w-1 rounded-full" style={{ background: color }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="truncate text-xs text-muted">{c.teacher || "—"}</p>
              </div>
              <SemesterTag courseId={c.id} />
              <MarkPill mark={c.mark} percent={c.scoreRaw} size="sm" />
              <ChevronRight size={16} className="text-faint" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function UpcomingWidget({ gradebook }: { gradebook: Gradebook }) {
  const items = buildUpcoming(gradebook, { horizon: 14 }).slice(0, 6);
  return (
    <Card className="overflow-hidden pb-3">
      <CardHeader title="Upcoming" icon={<Clock size={16} />} />
      {items.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-muted">
          Nothing due in the next two weeks. 🎉
        </p>
      ) : (
        <div className="mt-3 divide-y divide-line">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 px-5 py-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: TYPE_DOT[i.type] ?? "var(--accent)" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{i.title}</p>
                <p className="truncate text-xs text-muted">{i.course}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted">
                {relativeDay(i.dueISO)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AttendanceWidget({
  attendance,
}: {
  attendance: import("@/lib/studentvue/types").Attendance | null;
}) {
  return (
    <Card className="overflow-hidden pb-5">
      <CardHeader
        title="Attendance"
        icon={<CalendarCheck size={16} />}
        action={
          <Link
            href="/attendance"
            className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            Details <ArrowRight size={13} />
          </Link>
        }
      />
      {!attendance ? (
        <div className="grid grid-cols-2 gap-3 px-5 pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 pt-4 sm:grid-cols-4">
          <AttStat label="Excused" value={attendance.totals.excused} color="var(--grade-b)" />
          <AttStat label="Unexcused" value={attendance.totals.unexcused} color="var(--grade-f)" />
          <AttStat label="Tardies" value={attendance.totals.tardy} color="var(--grade-c)" />
          <AttStat label="Activities" value={attendance.totals.activity} color="var(--accent)" />
        </div>
      )}
    </Card>
  );
}

function AttStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[var(--radius-soft)] bg-surface-2 p-3 text-center">
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function TrendWidget({ gradebook }: { gradebook: Gradebook }) {
  const rows = gradebook.courses
    .filter((c) => c.scoreRaw != null)
    .sort((a, b) => (b.scoreRaw ?? 0) - (a.scoreRaw ?? 0));

  return (
    <Card className="overflow-hidden pb-5">
      <CardHeader title="Grade spread" icon={<TrendingUp size={16} />} />
      <div className="space-y-3 px-5 pt-4">
        {rows.map((c, i) => {
          const pct = c.scoreRaw ?? 0;
          const color = c.mark ? gradeVarFromLetter(c.mark) : gradeVar(pct);
          return (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-32 truncate text-xs text-muted sm:w-44">{c.title}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 0.9, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-12 text-right text-xs font-semibold" style={{ color }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
