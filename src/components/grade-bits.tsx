"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useSettings } from "@/store/settings";
import { useSemester } from "@/components/DataProvider";
import { exactPct, gradeVar, gradeVarFromLetter, letterFromPercent } from "@/lib/utils";
import type { Course } from "@/lib/studentvue/types";

/** Passive, exact semester-grade chip shown next to a course's quarter grade. */
export function SemesterTag({
  courseId,
  className,
}: {
  courseId: string;
  className?: string;
}) {
  const { percent, label } = useSemester(courseId);
  if (percent == null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-muted ${className ?? ""}`}
      title={`${label}: ${exactPct(percent)} (exact)`}
    >
      <span className="text-faint">Sem</span>
      <span style={{ color: gradeVar(percent) }}>{exactPct(percent)}</span>
    </span>
  );
}

export function MarkPill({
  mark,
  percent,
  size = "md",
}: {
  mark?: string;
  percent: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const display = useSettings((s) => s.gradeDisplay);
  const letter = mark && mark.trim() ? mark : letterFromPercent(percent);
  const color = mark && mark.trim() ? gradeVarFromLetter(mark) : gradeVar(percent);
  const pad = size === "lg" ? "px-3 py-1 text-base" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-sm";

  let text: string;
  if (display === "letter") text = letter;
  else if (display === "percent") text = percent != null ? `${percent.toFixed(1)}%` : letter;
  else text = percent != null ? `${letter} · ${percent.toFixed(1)}%` : letter;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${pad}`}
      style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
    >
      {text}
    </span>
  );
}

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const color =
    course.mark && course.mark.trim()
      ? gradeVarFromLetter(course.mark)
      : gradeVar(course.scoreRaw);
  const pct = course.scoreRaw ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 30 }}
    >
      <Link
        href={`/class?id=${course.id}`}
        className="card group relative flex items-center gap-4 overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: color }}
        />
        <div className="min-w-0 flex-1 pl-1.5">
          <div className="flex items-center gap-2">
            <span className="grid h-6 min-w-6 place-items-center rounded-md bg-surface-2 px-1.5 text-xs font-semibold text-muted">
              {course.period || "•"}
            </span>
            <p className="truncate font-semibold">{course.title}</p>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {course.teacher || "—"}
            {course.room ? ` · Rm ${course.room}` : ""}
          </p>
        </div>

        {pct != null && (
          <div className="hidden w-28 sm:block">
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, pct)}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        <div className="flex shrink-0 flex-col items-end gap-1">
          <MarkPill mark={course.mark} percent={pct} size="md" />
          <SemesterTag courseId={course.id} />
        </div>
        <ChevronRight size={18} className="text-faint transition-transform group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
