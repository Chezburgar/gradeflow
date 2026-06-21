import type {
  Assignment,
  Attendance,
  AttendanceEvent,
  CalendarEvent,
  Course,
  District,
  Gradebook,
  GradeCategory,
  ReportPeriod,
  ScheduleClass,
  StudentDocument,
  StudentInfo,
} from "./types";

/* ---------------- helpers ---------------- */

type X = Record<string, unknown>;

function toArray<T = X>(v: unknown): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? (v as T[]) : [v as T];
}

function attr(node: unknown, name: string): string {
  if (!node || typeof node !== "object") return "";
  const v = (node as X)[`@_${name}`];
  return v == null ? "" : String(v);
}

function num(v: string): number | null {
  if (v == null || v === "") return null;
  const cleaned = v.replace(/[%,]/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function pct(v: string): number | null {
  const n = num(v);
  return n == null ? null : n;
}

/* ---------------- districts ---------------- */

export function parseDistricts(doc: X): District[] {
  const list = doc["DistrictLists"] as X | undefined;
  const infos = list?.["DistrictInfos"] as X | undefined;
  const items = toArray(infos?.["DistrictInfo"]);
  return items
    .map((d) => ({
      name: attr(d, "Name"),
      address: attr(d, "Address"),
      url: attr(d, "PvueURL").replace(/\/+$/, ""),
    }))
    .filter((d) => d.url);
}

/* ---------------- gradebook ---------------- */

export function parseGradebook(doc: X): Gradebook {
  const gb = (doc["Gradebook"] as X) ?? doc;

  const rpWrap = gb["ReportingPeriods"] as X | undefined;
  const reportPeriods: ReportPeriod[] = toArray(rpWrap?.["ReportPeriod"]).map((r) => ({
    index: Number(attr(r, "Index")) || 0,
    name: attr(r, "GradePeriod"),
    startDate: attr(r, "StartDate"),
    endDate: attr(r, "EndDate"),
  }));

  const currentRp = gb["ReportingPeriod"] as X | undefined;
  const currentName = attr(currentRp, "GradePeriod");
  const reportPeriod: ReportPeriod = {
    index:
      reportPeriods.find((r) => r.name === currentName)?.index ??
      reportPeriods[0]?.index ??
      0,
    name: currentName || reportPeriods[0]?.name || "Current",
    startDate: attr(currentRp, "StartDate"),
    endDate: attr(currentRp, "EndDate"),
  };

  const coursesWrap = gb["Courses"] as X | undefined;
  const courses: Course[] = toArray(coursesWrap?.["Course"]).map((c, i) =>
    parseCourse(c, i),
  );

  return { reportPeriod, reportPeriods, courses };
}

function parseCourse(c: X, i: number): Course {
  const marksWrap = c["Marks"] as X | undefined;
  const mark = toArray(marksWrap?.["Mark"])[0] as X | undefined;

  const calcWrap = mark?.["GradeCalculationSummary"] as X | undefined;
  const categories: GradeCategory[] = toArray(calcWrap?.["AssignmentGradeCalc"]).map(
    (g) => ({
      type: attr(g, "Type"),
      weight: pct(attr(g, "Weight")) != null ? pct(attr(g, "Weight"))! / 100 : null,
      points: num(attr(g, "Points")),
      pointsPossible: num(attr(g, "PointsPossible")),
      percent: pct(attr(g, "WeightedPct")) ?? pct(attr(g, "CalculatedMark")),
      mark: attr(g, "CalculatedMark"),
    }),
  );

  const asgWrap = mark?.["Assignments"] as X | undefined;
  const assignments: Assignment[] = toArray(asgWrap?.["Assignment"]).map((a) =>
    parseAssignment(a),
  );

  return {
    id: attr(c, "Period") || String(i),
    period: attr(c, "Period"),
    title: attr(c, "Title"),
    room: attr(c, "Room"),
    teacher: attr(c, "Staff"),
    teacherEmail: attr(c, "StaffEMail"),
    mark: attr(mark, "CalculatedScoreString"),
    scoreRaw: num(attr(mark, "CalculatedScoreRaw")),
    categories: categories.filter((g) => g.type.toLowerCase() !== "total"),
    assignments,
  };
}

function parseAssignment(a: X): Assignment {
  const points = attr(a, "Points");
  let earned: number | null = null;
  let possible: number | null = null;
  const m = points.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (m) {
    earned = parseFloat(m[1]);
    possible = parseFloat(m[2]);
  } else {
    possible = num(points);
  }
  const scoreString = attr(a, "Score") || attr(a, "ScoreCalValue");
  const graded = !/not graded|^$/i.test(scoreString.trim());
  let percent: number | null = null;
  if (earned != null && possible) percent = (earned / possible) * 100;

  return {
    id: attr(a, "GradebookID") || attr(a, "Measure"),
    name: attr(a, "Measure"),
    type: attr(a, "Type"),
    date: attr(a, "Date"),
    dueDate: attr(a, "DueDate") || attr(a, "Date"),
    scoreString,
    scoreType: attr(a, "ScoreType"),
    points,
    pointsEarned: earned,
    pointsPossible: possible,
    percent,
    notes: attr(a, "Notes"),
    graded,
  };
}

/* ---------------- attendance ---------------- */

export function parseAttendance(doc: X): Attendance {
  const at = (doc["Attendance"] as X) ?? doc;
  const absWrap = at["Absences"] as X | undefined;
  const events: AttendanceEvent[] = toArray(absWrap?.["Absence"]).map((ab) => {
    const periodsWrap = ab["Periods"] as X | undefined;
    return {
      date: attr(ab, "AbsenceDate"),
      reason: attr(ab, "Reason"),
      note: attr(ab, "Note"),
      periods: toArray(periodsWrap?.["Period"]).map((p) => ({
        period: attr(p, "Number"),
        name: attr(p, "Name"),
        reason: attr(p, "Reason"),
        course: attr(p, "Course"),
        staff: attr(p, "Staff"),
      })),
    };
  });

  // count reasons
  const totals = { excused: 0, unexcused: 0, tardy: 0, activity: 0 };
  for (const e of events) {
    const r = e.reason.toLowerCase();
    if (r.includes("tardy")) totals.tardy++;
    else if (r.includes("unexcused")) totals.unexcused++;
    else if (r.includes("activit")) totals.activity++;
    else totals.excused++;
  }

  return {
    type: attr(at, "Type"),
    startDate: attr(at, "StartPeriod"),
    endDate: attr(at, "EndPeriod"),
    events,
    totals,
  };
}

/* ---------------- schedule ---------------- */

export function parseSchedule(doc: X): ScheduleClass[] {
  const sched = (doc["StudentClassSchedule"] as X) ?? doc;
  const listWrap = sched["ClassLists"] as X | undefined;
  let items = toArray(listWrap?.["ClassListing"]);
  if (items.length === 0) {
    // term-based schedule variant
    const today = sched["TodayScheduleInfoData"] as X | undefined;
    const classWrap = today?.["SchoolInfos"] as X | undefined;
    items = toArray(classWrap);
  }
  return items.map((c) => ({
    period: attr(c, "Period"),
    name: attr(c, "CourseTitle") || attr(c, "ClassName"),
    room: attr(c, "RoomName") || attr(c, "Room"),
    teacher: attr(c, "Teacher"),
    teacherEmail: attr(c, "TeacherEmail"),
    sectionId: attr(c, "SectionGU"),
  }));
}

/* ---------------- documents ---------------- */

export function parseDocuments(doc: X): StudentDocument[] {
  const dd = (doc["StudentDocuments"] as X) ?? doc;
  const listWrap = dd["StudentDocumentDatas"] as X | undefined;
  return toArray(listWrap?.["StudentDocumentData"]).map((d) => ({
    guid: attr(d, "DocumentGU"),
    date: attr(d, "DocumentDate"),
    type: attr(d, "DocumentType"),
    comment: attr(d, "DocumentComment"),
  }));
}

/* ---------------- student info ---------------- */

export function parseStudentInfo(doc: X): StudentInfo {
  const si = (doc["StudentInfo"] as X) ?? doc;
  const text = (node: unknown): string => {
    if (node == null) return "";
    if (typeof node === "object") {
      const t = (node as X)["#text"];
      return t == null ? "" : String(t);
    }
    return String(node);
  };
  return {
    name: text(si["FormattedName"]),
    studentId: text(si["PermID"]),
    grade: text(si["Grade"]),
    school: text(si["CurrentSchool"]),
    email: text(si["EMail"]),
    photo: text(si["Photo"]),
    birthDate: text(si["BirthDate"]),
    counselor: text(si["CounselorName"]),
  };
}

/* ---------------- document content ---------------- */

export function parseDocumentContent(doc: X): {
  fileName: string;
  base64: string;
  type: string;
} {
  const root = (doc["StudentAttachedDocumentData"] as X) ?? doc;
  const datas = root["DocumentDatas"] as X | undefined;
  const d = toArray(datas?.["DocumentData"])[0] as X | undefined;
  const codeNode = d?.["Base64Code"];
  const base64 =
    codeNode && typeof codeNode === "object"
      ? String((codeNode as X)["#text"] ?? "")
      : String(codeNode ?? "");
  return {
    fileName: attr(d, "FileName") || "document",
    type: attr(d, "DocType") || attr(d, "DocumentType"),
    base64,
  };
}

/* ---------------- calendar ---------------- */

export function parseCalendar(doc: X): CalendarEvent[] {
  const cal = (doc["CalendarListing"] as X) ?? doc;
  const eventsWrap = cal["EventLists"] as X | undefined;
  return toArray(eventsWrap?.["EventList"]).map((e) => ({
    date: attr(e, "Date"),
    title: attr(e, "Title"),
    type: attr(e, "DayType") || attr(e, "EventType") || "Event",
    agu: attr(e, "AGU"),
  }));
}
