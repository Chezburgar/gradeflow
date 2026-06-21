import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentInfo } from "@/lib/studentvue/types";

/**
 * Holds the StudentVUE session. NOTE: StudentVUE's SOAP API has no token
 * concept — the username + password must be sent on every request. To keep
 * the user signed in across reloads we persist them in localStorage. This is
 * a deliberate trade-off (documented in the README); use the demo for a
 * credential-free tour.
 */

interface SessionState {
  host: string;
  username: string;
  password: string;
  cookie: string; // for Google/SSO districts (PXP2 session cookie)
  demo: boolean;
  loggedIn: boolean;
  student: StudentInfo | null;
  districtName: string;

  login: (args: {
    host: string;
    username: string;
    password: string;
    student: StudentInfo;
    districtName?: string;
  }) => void;
  loginCookie: (args: {
    host: string;
    cookie: string;
    student: StudentInfo;
    districtName?: string;
  }) => void;
  startDemo: (student: StudentInfo) => void;
  setStudent: (s: StudentInfo) => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      host: "",
      username: "",
      password: "",
      cookie: "",
      demo: false,
      loggedIn: false,
      student: null,
      districtName: "",

      login: ({ host, username, password, student, districtName }) =>
        set({
          host,
          username,
          password,
          cookie: "",
          student,
          districtName: districtName ?? "",
          demo: false,
          loggedIn: true,
        }),

      loginCookie: ({ host, cookie, student, districtName }) =>
        set({
          host,
          username: "",
          password: "",
          cookie,
          student,
          districtName: districtName ?? "",
          demo: false,
          loggedIn: true,
        }),

      startDemo: (student) =>
        set({
          host: "",
          username: "demo",
          password: "",
          cookie: "",
          student,
          districtName: "Riverside USD (Demo)",
          demo: true,
          loggedIn: true,
        }),

      setStudent: (student) => set({ student }),

      logout: () =>
        set({
          host: "",
          username: "",
          password: "",
          cookie: "",
          demo: false,
          loggedIn: false,
          student: null,
          districtName: "",
        }),
    }),
    { name: "gm-session" },
  ),
);

export function credsOf(s: SessionState) {
  return s.cookie
    ? { host: s.host, cookie: s.cookie }
    : { host: s.host, username: s.username, password: s.password };
}
