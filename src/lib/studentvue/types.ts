// Normalized StudentVUE data shapes used throughout the app.

export interface District {
  name: string;
  address: string;
  url: string; // PvueURL base, e.g. https://md-mcps-psv.edupoint.com
}

export interface Credentials {
  host: string; // district base url
  username: string;
  password: string;
}

export interface ReportPeriod {
  index: number;
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface Assignment {
  id: string;
  name: string;
  type: string;
  date: string;
  dueDate: string;
  scoreString: string; // raw "Score" e.g. "95.00" or "Not Graded"
  scoreType: string;
  points: string; // e.g. "9.00 / 10.0000"
  pointsEarned: number | null;
  pointsPossible: number | null;
  percent: number | null;
  notes: string;
  graded: boolean;
}

export interface GradeCategory {
  type: string;
  weight: number | null; // 0..1
  points: number | null;
  pointsPossible: number | null;
  percent: number | null;
  mark: string;
}

export interface Course {
  id: string;
  period: string;
  title: string;
  room: string;
  teacher: string;
  teacherEmail: string;
  mark: string; // letter, e.g. "A"
  scoreRaw: number | null; // percent
  categories: GradeCategory[];
  assignments: Assignment[];
}

export interface Gradebook {
  reportPeriod: ReportPeriod;
  reportPeriods: ReportPeriod[];
  courses: Course[];
}

export interface AttendanceEvent {
  date: string;
  reason: string;
  note: string;
  periods: { period: string; name: string; reason: string; course: string; staff: string }[];
}

export interface AttendanceSummary {
  type: string;
  total: number;
  byPeriod: { period: string; total: number }[];
}

export interface Attendance {
  type: string;
  startDate: string;
  endDate: string;
  events: AttendanceEvent[];
  totals: { excused: number; unexcused: number; tardy: number; activity: number };
}

export interface ScheduleClass {
  period: string;
  name: string;
  room: string;
  teacher: string;
  teacherEmail: string;
  sectionId: string;
}

export interface StudentDocument {
  guid: string;
  date: string;
  type: string;
  comment: string;
}

export interface StudentInfo {
  name: string;
  studentId: string;
  grade: string;
  school: string;
  email: string;
  photo: string; // base64 (may be empty)
  birthDate: string;
  counselor: string;
}

export interface CalendarEvent {
  date: string;
  title: string;
  type: string; // "Assignment" | "Holiday" | "Regular" | ...
  agu?: string;
}
