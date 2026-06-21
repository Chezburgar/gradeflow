import type {
  Attendance,
  CalendarEvent,
  Course,
  Gradebook,
  ScheduleClass,
  StudentDocument,
  StudentInfo,
} from "./types";

/** Fully fabricated data so the app is explorable without real credentials. */

const REPORT_PERIODS = [
  { index: 0, name: "Quarter 1" },
  { index: 1, name: "Quarter 2" },
  { index: 2, name: "Quarter 3" },
  { index: 3, name: "Quarter 4" },
];

function asg(
  name: string,
  type: string,
  earned: number | null,
  possible: number,
  daysAgo: number,
  notes = "",
) {
  const d = new Date(2026, 5, 18 - daysAgo);
  const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  const graded = earned != null;
  return {
    id: `${name}-${daysAgo}`,
    name,
    type,
    date,
    dueDate: date,
    scoreString: graded ? `${earned} out of ${possible}` : "Not Graded",
    scoreType: "Raw Score",
    points: graded ? `${earned.toFixed(2)} / ${possible.toFixed(4)}` : `${possible.toFixed(4)}`,
    pointsEarned: earned,
    pointsPossible: possible,
    percent: graded ? (earned / possible) * 100 : null,
    notes,
    graded,
  };
}

const COURSES: Course[] = [
  {
    id: "1",
    period: "1",
    title: "AP Calculus BC",
    room: "204",
    teacher: "Ramirez, Elena",
    teacherEmail: "elena.ramirez@demo.edu",
    mark: "A-",
    scoreRaw: 91.4,
    categories: [
      { type: "Tests", weight: 0.5, points: 178, pointsPossible: 200, percent: 89, mark: "B+" },
      { type: "Homework", weight: 0.2, points: 95, pointsPossible: 100, percent: 95, mark: "A" },
      { type: "Quizzes", weight: 0.3, points: 88, pointsPossible: 95, percent: 92.6, mark: "A-" },
    ],
    assignments: [
      asg("Unit 7 Test: Series", "Tests", 91, 100, 3),
      asg("Taylor Series Quiz", "Quizzes", 19, 20, 6),
      asg("HW 7.4 Convergence", "Homework", 10, 10, 8),
      asg("HW 7.3 Ratio Test", "Homework", 9, 10, 11),
      asg("Unit 6 Test: Integrals", "Tests", 87, 100, 17),
      asg("Final Project: Modeling", "Tests", null, 100, -10, "Due next Friday"),
    ],
  },
  {
    id: "2",
    period: "2",
    title: "AP English Literature",
    room: "118",
    teacher: "Okafor, Daniel",
    teacherEmail: "daniel.okafor@demo.edu",
    mark: "B+",
    scoreRaw: 88.2,
    categories: [
      { type: "Essays", weight: 0.6, points: 165, pointsPossible: 200, percent: 82.5, mark: "B-" },
      { type: "Participation", weight: 0.2, points: 48, pointsPossible: 50, percent: 96, mark: "A" },
      { type: "Reading Quizzes", weight: 0.2, points: 44, pointsPossible: 50, percent: 88, mark: "B+" },
    ],
    assignments: [
      asg("Hamlet Analytical Essay", "Essays", 82, 100, 2),
      asg("Reading Quiz: Act IV", "Reading Quizzes", 9, 10, 5),
      asg("Socratic Seminar", "Participation", 10, 10, 7),
      asg("Comparative Essay Draft", "Essays", 83, 100, 14),
      asg("Final Synthesis Essay", "Essays", null, 100, -6, "Outline due Monday"),
    ],
  },
  {
    id: "3",
    period: "3",
    title: "AP Physics C",
    room: "G12",
    teacher: "Nguyen, Tracy",
    teacherEmail: "tracy.nguyen@demo.edu",
    mark: "A",
    scoreRaw: 95.1,
    categories: [
      { type: "Labs", weight: 0.4, points: 96, pointsPossible: 100, percent: 96, mark: "A" },
      { type: "Tests", weight: 0.4, points: 92, pointsPossible: 100, percent: 92, mark: "A-" },
      { type: "Homework", weight: 0.2, points: 50, pointsPossible: 50, percent: 100, mark: "A+" },
    ],
    assignments: [
      asg("Lab 9: Rotational Motion", "Labs", 24, 25, 1),
      asg("Magnetism Test", "Tests", 46, 50, 4),
      asg("HW Set 9", "Homework", 10, 10, 6),
      asg("Lab 8: Induction", "Labs", 24, 25, 12),
      asg("HW Set 8", "Homework", 10, 10, 13),
    ],
  },
  {
    id: "4",
    period: "4",
    title: "US History",
    room: "221",
    teacher: "Patel, Anita",
    teacherEmail: "anita.patel@demo.edu",
    mark: "C+",
    scoreRaw: 78.6,
    categories: [
      { type: "Tests", weight: 0.5, points: 140, pointsPossible: 200, percent: 70, mark: "C-" },
      { type: "Projects", weight: 0.3, points: 84, pointsPossible: 100, percent: 84, mark: "B" },
      { type: "Homework", weight: 0.2, points: 45, pointsPossible: 50, percent: 90, mark: "A-" },
    ],
    assignments: [
      asg("Cold War Unit Test", "Tests", 68, 100, 3),
      asg("Civil Rights Project", "Projects", 84, 100, 9),
      asg("Reading Notes Ch. 22", "Homework", 9, 10, 10),
      asg("WWII Unit Test", "Tests", 72, 100, 19),
      asg("DBQ Essay", "Projects", null, 100, -3, "Due Wednesday"),
    ],
  },
  {
    id: "5",
    period: "5",
    title: "Spanish III",
    room: "140",
    teacher: "Garcia, Lucia",
    teacherEmail: "lucia.garcia@demo.edu",
    mark: "A-",
    scoreRaw: 90.8,
    categories: [
      { type: "Speaking", weight: 0.4, points: 76, pointsPossible: 80, percent: 95, mark: "A" },
      { type: "Writing", weight: 0.3, points: 52, pointsPossible: 60, percent: 86.7, mark: "B+" },
      { type: "Vocab Quizzes", weight: 0.3, points: 55, pointsPossible: 60, percent: 91.7, mark: "A-" },
    ],
    assignments: [
      asg("Oral Presentation", "Speaking", 38, 40, 2),
      asg("Vocab Quiz: Unidad 6", "Vocab Quizzes", 18, 20, 5),
      asg("Composition: Mi Futuro", "Writing", 26, 30, 8),
      asg("Vocab Quiz: Unidad 5", "Vocab Quizzes", 19, 20, 15),
    ],
  },
  {
    id: "6",
    period: "6",
    title: "Wellness & PE",
    room: "GYM",
    teacher: "Brooks, Marcus",
    teacherEmail: "marcus.brooks@demo.edu",
    mark: "A+",
    scoreRaw: 99.0,
    categories: [
      { type: "Participation", weight: 0.7, points: 70, pointsPossible: 70, percent: 100, mark: "A+" },
      { type: "Fitness Log", weight: 0.3, points: 29, pointsPossible: 30, percent: 96.7, mark: "A" },
    ],
    assignments: [
      asg("Week 12 Participation", "Participation", 10, 10, 1),
      asg("Fitness Log Check", "Fitness Log", 10, 10, 4),
      asg("Week 11 Participation", "Participation", 10, 10, 8),
    ],
  },
];

export const DEMO_GRADEBOOK: Gradebook = {
  reportPeriod: { index: 3, name: "Quarter 4" },
  reportPeriods: REPORT_PERIODS,
  courses: COURSES,
};

export const DEMO_STUDENT: StudentInfo = {
  name: "Alex Carter",
  studentId: "1048257",
  grade: "11",
  school: "Riverside High School",
  email: "alex.carter@demo.edu",
  photo: "",
  birthDate: "3/14/2009",
  counselor: "Ms. Jordan Lee",
};

export const DEMO_SCHEDULE: ScheduleClass[] = COURSES.map((c) => ({
  period: c.period,
  name: c.title,
  room: c.room,
  teacher: c.teacher,
  teacherEmail: c.teacherEmail,
  sectionId: c.id,
}));

export const DEMO_ATTENDANCE: Attendance = {
  type: "Daily",
  startDate: "8/26/2025",
  endDate: "6/18/2026",
  events: [
    {
      date: "6/9/2026",
      reason: "Excused Absence",
      note: "Doctor appointment",
      periods: [{ period: "1", name: "AP Calculus BC", reason: "Excused", course: "AP Calculus BC", staff: "Ramirez, Elena" }],
    },
    {
      date: "5/21/2026",
      reason: "Tardy",
      note: "Bus delay",
      periods: [{ period: "1", name: "AP Calculus BC", reason: "Tardy", course: "AP Calculus BC", staff: "Ramirez, Elena" }],
    },
    {
      date: "4/30/2026",
      reason: "Activity",
      note: "Robotics competition",
      periods: [],
    },
    {
      date: "3/12/2026",
      reason: "Excused Absence",
      note: "Family",
      periods: [],
    },
    {
      date: "2/18/2026",
      reason: "Tardy",
      note: "",
      periods: [{ period: "2", name: "AP English Literature", reason: "Tardy", course: "AP English Literature", staff: "Okafor, Daniel" }],
    },
  ],
  totals: { excused: 2, unexcused: 0, tardy: 2, activity: 1 },
};

export const DEMO_DOCUMENTS: StudentDocument[] = [
  { guid: "d1", date: "5/1/2026", type: "Report Card", comment: "Quarter 3 Report Card" },
  { guid: "d2", date: "3/14/2026", type: "Progress Report", comment: "Mid-Quarter 3 Progress" },
  { guid: "d3", date: "1/16/2026", type: "Report Card", comment: "Quarter 2 Report Card" },
  { guid: "d4", date: "11/7/2025", type: "Progress Report", comment: "Mid-Quarter 2 Progress" },
];

export const DEMO_CALENDAR: CalendarEvent[] = [
  { date: "6/22/2026", title: "DBQ Essay Due - US History", type: "Assignment" },
  { date: "6/24/2026", title: "Final Synthesis Essay Outline", type: "Assignment" },
  { date: "6/26/2026", title: "Final Project: Modeling Due - Calc", type: "Assignment" },
  { date: "6/19/2026", title: "Spirit Day", type: "Event" },
  { date: "7/3/2026", title: "No School - Holiday", type: "Holiday" },
];
