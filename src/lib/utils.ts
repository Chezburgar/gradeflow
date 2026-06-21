import clsx, { type ClassValue } from "clsx";
import type { Course } from "./studentvue/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Prefix a public asset path with the deploy basePath (for GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}

/* ---------------- grades ---------------- */

export function letterFromPercent(p: number | null): string {
  if (p == null) return "—";
  if (p >= 92.5) return "A";
  if (p >= 89.5) return "A-";
  if (p >= 86.5) return "B+";
  if (p >= 82.5) return "B";
  if (p >= 79.5) return "B-";
  if (p >= 76.5) return "C+";
  if (p >= 72.5) return "C";
  if (p >= 69.5) return "C-";
  if (p >= 66.5) return "D+";
  if (p >= 62.5) return "D";
  if (p >= 59.5) return "D-";
  return "F";
}

/** CSS var token for a grade given a percent (0-100). */
export function gradeVar(p: number | null): string {
  if (p == null) return "var(--muted)";
  if (p >= 89.5) return "var(--grade-a)";
  if (p >= 79.5) return "var(--grade-b)";
  if (p >= 69.5) return "var(--grade-c)";
  if (p >= 59.5) return "var(--grade-d)";
  return "var(--grade-f)";
}

export function gradeVarFromLetter(letter: string): string {
  const c = (letter || "").trim().toUpperCase()[0];
  if (c === "A") return "var(--grade-a)";
  if (c === "B") return "var(--grade-b)";
  if (c === "C") return "var(--grade-c)";
  if (c === "D") return "var(--grade-d)";
  if (c === "F") return "var(--grade-f)";
  return "var(--muted)";
}

const GPA_MAP: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

export function gpaFromLetter(letter: string): number | null {
  const key = (letter || "").trim().toUpperCase();
  if (key in GPA_MAP) return GPA_MAP[key];
  return null;
}

export function courseGpa(c: Course): number | null {
  const fromLetter = gpaFromLetter(c.mark);
  if (fromLetter != null) return fromLetter;
  if (c.scoreRaw != null) return gpaFromLetter(letterFromPercent(c.scoreRaw));
  return null;
}

export function overallGpa(courses: Course[]): number | null {
  const vals = courses.map(courseGpa).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function overallAverage(courses: Course[]): number | null {
  const vals = courses
    .map((c) => c.scoreRaw)
    .filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Show a percentage exactly (no rounding) — only strips floating-point noise. */
export function exactPct(n: number | null): string {
  if (n == null) return "—";
  const cleaned = Math.round(n * 1e6) / 1e6; // kill FP artifacts, keep true value
  return `${cleaned}%`;
}

/** Marking periods that make up the actual term (excludes interim/progress). */
export function realPeriods<T extends { name: string }>(periods: T[]): T[] {
  return periods.filter((p) => !/interim|progress/i.test(p.name));
}

/** Group real marking periods into semesters (4 quarters → 2 halves). */
export function groupSemesters<T extends { index: number; name: string }>(
  reals: T[],
): { label: string; periods: T[] }[] {
  if (reals.length >= 4 && reals.length % 2 === 0) {
    const half = reals.length / 2;
    return [
      { label: "Semester 1", periods: reals.slice(0, half) },
      { label: "Semester 2", periods: reals.slice(half) },
    ];
  }
  if (reals.length >= 2) return [{ label: "Final grade", periods: reals }];
  return [];
}

/* ---------------- dates ---------------- */

/** Parse "M/D/YYYY" (StudentVUE format) or ISO into a Date. */
export function parseDate(s: string): Date | null {
  if (!s) return null;
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return new Date(Number(us[3]), Number(us[1]) - 1, Number(us[2]));
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function relativeDay(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${-diff} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function daysUntil(iso: string): number | null {
  const d = parseDate(iso);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
