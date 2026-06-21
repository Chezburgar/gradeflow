# 💧 GradeFlow

A faster, prettier, **fully customizable** front-end for Synergy **StudentVUE** — with a built-in **agenda book** for students. A ground-up redesign of GradeMelon that keeps every feature and adds a lot more.

> Unofficial and not affiliated with Edupoint or StudentVUE. It talks to the same public StudentVUE service your school already uses.

## Features

**Everything the original had**
- 🔐 District lookup by ZIP (or paste your StudentVUE URL) + real StudentVUE sign-in
- 📊 Live grades with per-class breakdowns, category weights & assignment lists
- 🗓️ Attendance, class schedule, documents (report cards / progress reports), and a school calendar
- 📱 Installable PWA

**New & improved**
- 🎨 **Highly customizable** — 8 themes (Charcoal, OLED, Midnight, Sunset, Forest, Latte, Daylight, System), any accent color, 4 font styles, corner & density controls, glass/blur effects, and animation toggles. A reorderable, show/hide **dashboard widget** system.
- 📒 **Agenda book** — plan homework, tests, projects, reminders & events in **List** or **Week** views; one-click **import** of upcoming assignments straight from your gradebook.
- 🧮 **What-if calculator** — edit scores or add hypothetical assignments on any class page and watch your grade recompute live (weighted or points-based).
- 📈 Animated grade rings, grade-trend bars, and a Chart.js score-history graph.
- ⚡ Demo mode — a fully clickable tour with sample data, no credentials needed.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a CSS-variable theme engine (runtime theme + accent swapping)
- **Framer Motion** (animations), **Chart.js** (charts), **lucide-react** (icons)
- **Zustand** (persisted local-first state: settings, session, agenda)
- **fast-xml-parser** for the StudentVUE SOAP responses

## How the StudentVUE integration works

StudentVUE exposes a SOAP RPC endpoint at `{district}/Service/PXPCommunication.asmx` whose single
`ProcessWebServiceRequest` operation takes your credentials plus a `methodName` (`Gradebook`,
`Attendance`, `StudentClassList`, `StudentInfo`, `GetStudentDocumentInitialData`, `StudentCalendar`, …).
Browsers can't call it directly (CORS), so requests go through this app's `/api/*` route handlers
([src/app/api](src/app/api)), which build the SOAP envelope, call the district, parse the XML, and
return clean JSON. District discovery uses Edupoint's public `GetMatchDistrictList` directory service.

Core data layer: [src/lib/studentvue](src/lib/studentvue) (SOAP client, parsers, demo data, server helpers).

## Privacy

No accounts, no analytics, no database of your grades. StudentVUE issues no session token, so your
username/password are stored **in your browser** and sent only to your district's server (relayed,
not stored, by the proxy). Agenda items and settings live in local storage. See `/privacy` in the app.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Then either sign in with your real StudentVUE district + credentials, or click **Explore the demo**.

```bash
npm run build    # production build
npm run start    # serve the production build
```
