"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { credsOf, useSession } from "@/store/session";
import { groupSemesters, realPeriods } from "@/lib/utils";
import { svue } from "@/lib/studentvue/relay-client";
import {
  DEMO_ATTENDANCE,
  DEMO_CALENDAR,
  DEMO_DOCUMENTS,
  DEMO_GRADEBOOK,
  DEMO_SCHEDULE,
} from "@/lib/studentvue/demo";
import type {
  Attendance,
  CalendarEvent,
  Gradebook,
  ScheduleClass,
  StudentDocument,
} from "@/lib/studentvue/types";

export type ResourceKey =
  | "gradebook"
  | "attendance"
  | "schedule"
  | "documents"
  | "calendar";

interface Res<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type DataMap = {
  gradebook: Gradebook;
  attendance: Attendance;
  schedule: ScheduleClass[];
  documents: StudentDocument[];
  calendar: CalendarEvent[];
};

const DEMO: { [K in ResourceKey]: DataMap[K] } = {
  gradebook: DEMO_GRADEBOOK,
  attendance: DEMO_ATTENDANCE,
  schedule: DEMO_SCHEDULE,
  documents: DEMO_DOCUMENTS,
  calendar: DEMO_CALENDAR,
};

interface DataContextValue {
  resources: { [K in ResourceKey]: Res<DataMap[K]> };
  reportPeriod: number | null;
  setReportPeriod: (n: number) => void;
  ensure: (key: ResourceKey) => void;
  refresh: (key?: ResourceKey) => void;
  /** Fetch a specific reporting period's gradebook (for semester math). */
  fetchGradebookFor: (period: number) => Promise<Gradebook>;
  /** Exact (unrounded) semester grade per course id for the current semester. */
  semesterGrades: Record<string, number | null>;
  semesterLabel: string;
}

const empty = <T,>(): Res<T> => ({ data: null, loading: false, error: null });

const DataContext = createContext<DataContextValue | null>(null);

async function apiFetch<T>(
  key: ResourceKey,
  body: Record<string, unknown>,
): Promise<T> {
  const creds = {
    host: String(body.host ?? ""),
    username: String(body.username ?? ""),
    password: String(body.password ?? ""),
  };
  const rp = body.reportPeriod as number | undefined;
  switch (key) {
    case "gradebook":
      return (await svue.gradebook(creds, rp)) as T;
    case "attendance":
      return (await svue.attendance(creds)) as T;
    case "schedule":
      return (await svue.schedule(creds)) as T;
    case "documents":
      return (await svue.documents(creds)) as T;
    case "calendar":
      return (await svue.calendar(creds)) as T;
    default:
      throw new Error(`Unknown resource ${key}`);
  }
}

/** Deterministic per-period variation of the demo gradebook so the semester
 *  view has distinct quarter grades to combine. */
function demoGradebookFor(period: number): Gradebook {
  const base = DEMO_GRADEBOOK;
  const courses = base.courses.map((c) => {
    const seed = (Number(c.id) * 7 + period * 13) % 9;
    const delta = seed - 4; // -4..+4
    const scoreRaw = c.scoreRaw != null ? Math.max(40, Math.min(100, c.scoreRaw + delta)) : null;
    return { ...c, scoreRaw };
  });
  return {
    ...base,
    reportPeriod: { index: period, name: base.reportPeriods[period]?.name ?? `Period ${period + 1}` },
    courses,
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const [resources, setResources] = useState<DataContextValue["resources"]>({
    gradebook: empty(),
    attendance: empty(),
    schedule: empty(),
    documents: empty(),
    calendar: empty(),
  });
  const [reportPeriod, setReportPeriodState] = useState<number | null>(null);
  const requested = useRef<Set<ResourceKey>>(new Set());

  const setRes = useCallback(
    <K extends ResourceKey>(key: K, patch: Partial<Res<DataMap[K]>>) => {
      setResources((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    },
    [],
  );

  const load = useCallback(
    async (key: ResourceKey, extra?: Record<string, unknown>) => {
      if (!session.loggedIn) return;
      setRes(key, { loading: true, error: null });

      if (session.demo) {
        // simulate a tiny delay for realistic UX
        await new Promise((r) => setTimeout(r, 280));
        setRes(key, { loading: false, data: DEMO[key] as DataMap[typeof key] });
        return;
      }

      try {
        const data = await apiFetch<DataMap[typeof key]>(key, {
          ...credsOf(session),
          ...extra,
        });
        setRes(key, { loading: false, data });
      } catch (e) {
        setRes(key, { loading: false, error: (e as Error).message });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.loggedIn, session.demo, session.host, session.username, session.password, setRes],
  );

  const ensure = useCallback(
    (key: ResourceKey) => {
      if (requested.current.has(key)) return;
      requested.current.add(key);
      void load(key);
    },
    [load],
  );

  const refresh = useCallback(
    (key?: ResourceKey) => {
      const keys: ResourceKey[] = key
        ? [key]
        : (["gradebook", "attendance", "schedule", "documents", "calendar"] as ResourceKey[]);
      for (const k of keys) {
        requested.current.add(k);
        void load(k, k === "gradebook" && reportPeriod != null ? { reportPeriod } : undefined);
      }
    },
    [load, reportPeriod],
  );

  const setReportPeriod = useCallback(
    (n: number) => {
      setReportPeriodState(n);
      void load("gradebook", { reportPeriod: n });
    },
    [load],
  );

  const fetchGradebookFor = useCallback(
    async (period: number): Promise<Gradebook> => {
      if (session.demo) {
        await new Promise((r) => setTimeout(r, 120));
        return demoGradebookFor(period);
      }
      return apiFetch<Gradebook>("gradebook", { ...credsOf(session), reportPeriod: period });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.demo, session.host, session.username, session.password, session.cookie],
  );

  // eagerly load the gradebook on login (needed for the dashboard)
  useEffect(() => {
    if (session.loggedIn) {
      ensure("gradebook");
    } else {
      requested.current.clear();
      semLoaded.current = false;
      setPeriodCourse({});
      setResources({
        gradebook: empty(),
        attendance: empty(),
        schedule: empty(),
        documents: empty(),
        calendar: empty(),
      });
      setReportPeriodState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.loggedIn]);

  // background-load every real marking period so semester grades are available everywhere
  const [periodCourse, setPeriodCourse] = useState<
    Record<number, Record<string, number | null>>
  >({});
  const semLoaded = useRef(false);
  const gbData = resources.gradebook.data;

  useEffect(() => {
    if (!session.loggedIn || !gbData || semLoaded.current) return;
    const reals = realPeriods(gbData.reportPeriods);
    if (reals.length < 2) return;
    semLoaded.current = true;
    void (async () => {
      const entries = await Promise.all(
        reals.map(async (r) => {
          try {
            const g = await fetchGradebookFor(r.index);
            const map: Record<string, number | null> = {};
            for (const c of g.courses) map[c.id] = c.scoreRaw;
            return [r.index, map] as const;
          } catch {
            return [r.index, {} as Record<string, number | null>] as const;
          }
        }),
      );
      setPeriodCourse(Object.fromEntries(entries));
    })();
  }, [gbData, session.loggedIn, fetchGradebookFor]);

  const { semesterGrades, semesterLabel } = useMemo(() => {
    if (!gbData) return { semesterGrades: {} as Record<string, number | null>, semesterLabel: "" };
    const groups = groupSemesters(realPeriods(gbData.reportPeriods));
    const current = reportPeriod ?? gbData.reportPeriod.index;
    const group = groups.find((g) => g.periods.some((p) => p.index === current)) ?? groups[0];
    if (!group) return { semesterGrades: {}, semesterLabel: "" };
    const grades: Record<string, number | null> = {};
    for (const c of gbData.courses) {
      const vals = group.periods
        .map((p) => periodCourse[p.index]?.[c.id])
        .filter((v): v is number => v != null);
      grades[c.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
    return { semesterGrades: grades, semesterLabel: group.label };
  }, [gbData, periodCourse, reportPeriod]);

  return (
    <DataContext.Provider
      value={{
        resources,
        reportPeriod,
        setReportPeriod,
        ensure,
        refresh,
        fetchGradebookFor,
        semesterGrades,
        semesterLabel,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function useSemester(courseId: string) {
  const { semesterGrades, semesterLabel } = useData();
  return { percent: semesterGrades[courseId] ?? null, label: semesterLabel };
}

export function useResource<K extends ResourceKey>(key: K): Res<DataMap[K]> {
  const { resources, ensure } = useData();
  useEffect(() => {
    ensure(key);
  }, [key, ensure]);
  return resources[key];
}
