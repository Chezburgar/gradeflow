import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS = [
  {
    h: "The short version",
    p: "GradeFlow is built to keep your data on your device. There are no accounts, no analytics, no ad trackers, and no database of your grades. Your information lives in your browser.",
  },
  {
    h: "Your credentials",
    p: "StudentVUE's API requires your username and password on every request — it issues no session token. To keep you signed in, GradeFlow stores them in your browser's local storage. They are sent only to your own district's StudentVUE server. Because browsers block direct cross-site calls (CORS), requests are relayed through GradeFlow's server, which forwards them as-is and does not log or retain them.",
  },
  {
    h: "Your grades & school data",
    p: "Grades, attendance, schedule, and documents are fetched live from StudentVUE when you open a page and held only in memory for that session. They are not saved to any server.",
  },
  {
    h: "Your agenda & settings",
    p: "Agenda items and all customization preferences are stored locally in your browser. Clearing your browser data, or signing out, removes them. They are never uploaded.",
  },
  {
    h: "Demo mode",
    p: "The demo uses entirely fabricated sample data and never contacts any district server.",
  },
  {
    h: "Disclaimer",
    p: "GradeFlow is an unofficial project, not affiliated with or endorsed by Edupoint or StudentVUE. Use it at your own discretion.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Back
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Privacy</h1>
      <p className="mt-2 text-sm text-muted">Last updated June 2026</p>
      <div className="mt-8 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-semibold">{s.h}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
