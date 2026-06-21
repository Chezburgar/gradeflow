"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  RefreshCw,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/store/session";
import { useData } from "@/components/DataProvider";
import { useHydrated } from "@/lib/use-hydrated";
import { asset, cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/grades", label: "Grades", icon: GraduationCap },
  { href: "/agenda", label: "Agenda", icon: NotebookPen },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/grades", "/agenda", "/schedule", "/settings"].includes(n.href),
);

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/icon.svg")} alt="" className="h-9 w-9 rounded-xl" />
      <span className="text-lg font-bold tracking-tight">
        Grade<span className="text-accent">Flow</span>
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-[var(--radius-soft)] px-3.5 py-2.5 text-sm font-medium transition-colors",
        active ? "text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 -z-0 rounded-[var(--radius-soft)] bg-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <Icon size={19} className="relative z-10 shrink-0" />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useSession();
  const { refresh } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (hydrated && !session.loggedIn) router.replace("/login");
  }, [hydrated, session.loggedIn, router]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!hydrated || !session.loggedIn) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-muted">
          <RefreshCw className="animate-spin" size={18} />
          Loading…
        </div>
      </div>
    );
  }

  const initials =
    session.student?.name
      ?.split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ?? "ME";

  const doRefresh = () => {
    setSpinning(true);
    refresh();
    setTimeout(() => setSpinning(false), 900);
  };

  const SidebarBody = (
    <>
      <div className="px-4 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <NavLink
            key={n.href}
            {...n}
            active={pathname === n.href || pathname.startsWith(n.href + "/")}
          />
        ))}
      </nav>
      <div className="space-y-2 p-3">
        {session.demo && (
          <div className="flex items-center gap-2 rounded-[var(--radius-soft)] bg-accent-soft px-3 py-2 text-xs text-accent">
            <Sparkles size={14} /> Demo mode — sample data
          </div>
        )}
        <div className="flex items-center gap-3 rounded-[var(--radius-soft)] bg-surface-2 px-3 py-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {session.student?.name ?? "Student"}
            </p>
            <p className="truncate text-xs text-muted">
              {session.student?.school || session.districtName}
            </p>
          </div>
          <button
            onClick={() => {
              session.logout();
              router.replace("/login");
            }}
            title="Sign out"
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-3 hover:text-text"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside className="glassable sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line lg:flex">
        {SidebarBody}
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="card fixed inset-y-0 left-0 z-50 flex w-72 flex-col rounded-none rounded-r-[var(--radius-card)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {SidebarBody}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glassable sticky top-0 z-30 flex items-center gap-3 border-b border-line px-4 py-3 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-[var(--radius-soft)] text-muted hover:bg-surface-2 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={doRefresh}
              title="Refresh data"
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-soft)] text-muted hover:bg-surface-2 hover:text-text"
            >
              <RefreshCw size={18} className={cn(spinning && "animate-spin")} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="glassable fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line px-2 py-2 lg:hidden">
        {MOBILE_NAV.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-soft)] py-1.5 text-[0.65rem] font-medium transition-colors",
                active ? "text-accent" : "text-muted",
              )}
            >
              <n.icon size={20} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
