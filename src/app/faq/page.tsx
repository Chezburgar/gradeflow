import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "What is GradeFlow?",
    a: "A faster, prettier, fully customizable front-end for Synergy StudentVUE. It shows the same grades, attendance, schedule, and documents your district already publishes — plus a what-if calculator and semester grades.",
  },
  {
    q: "Is this official / affiliated with my school?",
    a: "No. GradeFlow is an unofficial, independent project and is not affiliated with Edupoint or StudentVUE. It simply talks to the same public StudentVUE service your school uses.",
  },
  {
    q: "How do I log in?",
    a: "Find your district by ZIP code (or paste your StudentVUE URL), then sign in with the exact same username and password you use for StudentVUE.",
  },
  {
    q: "Where are my grades and password stored?",
    a: "StudentVUE has no login token — your username and password must be sent with every request, so they are stored locally in your browser to keep you signed in. They are sent only to your district's server (proxied through GradeFlow to avoid browser CORS limits) and never to anyone else. See the Privacy page for details.",
  },
  {
    q: "How do semester grades work?",
    a: "GradeFlow loads every marking period and shows your exact semester average right next to each quarter grade — automatically, no setup needed.",
  },
  {
    q: "What's the what-if calculator?",
    a: "On any class page, flip on 'What-if' to edit scores or add hypothetical assignments and instantly see how your grade would change — without affecting anything real.",
  },
  {
    q: "Can I try it without an account?",
    a: "Yes — tap 'Explore the demo' on the login screen for a fully clickable tour with sample data.",
  },
  {
    q: "How customizable is it?",
    a: "Very. Pick from 8 themes, any accent color, fonts, corner styles, density, glass effects, and animations. You can also show/hide and reorder your dashboard cards.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Back
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Frequently asked questions
      </h1>
      <div className="mt-8 space-y-4">
        {FAQS.map((f) => (
          <div key={f.q} className="card p-5">
            <h2 className="font-semibold">{f.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
