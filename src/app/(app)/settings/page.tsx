"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GraduationCap,
  LogOut,
  Palette,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, CardHeader, Segmented, Toggle } from "@/components/ui";
import { useSettings } from "@/store/settings";
import { useSession } from "@/store/session";
import {
  ACCENTS,
  ALL_WIDGETS,
  DENSITIES,
  FONTS,
  RADII,
  THEMES,
} from "@/lib/theme-options";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const s = useSettings();
  const session = useSession();
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Make GradeFlow yours"
        action={
          <Button variant="ghost" onClick={s.resetAll}>
            <RotateCcw size={16} /> Reset
          </Button>
        }
      />

      <div className="space-y-5">
        {/* Theme */}
        <Card className="pb-5">
          <CardHeader title="Theme" icon={<Palette size={16} />} />
          <div className="mt-4 grid grid-cols-2 gap-3 px-5 sm:grid-cols-4">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => s.setTheme(t.id)}
                className={cn(
                  "group relative overflow-hidden rounded-[var(--radius-soft)] border-2 p-3 text-left transition-all",
                  s.theme === t.id ? "border-accent" : "border-line hover:border-faint",
                )}
              >
                <div className="mb-2 flex gap-1.5">
                  <span className="h-8 w-8 rounded-full border border-line" style={{ background: t.swatch[0] }} />
                  <span className="h-8 w-8 rounded-full border border-line" style={{ background: t.swatch[1] }} />
                </div>
                <span className="text-sm font-medium">{t.label}</span>
                {s.theme === t.id && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Accent */}
        <Card className="pb-5">
          <CardHeader title="Accent color" icon={<Wand2 size={16} />} />
          <div className="mt-4 flex flex-wrap items-center gap-3 px-5">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                onClick={() => s.setAccent(a.value)}
                title={a.name}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full transition-transform hover:scale-110",
                  s.accent === a.value && "ring-2 ring-offset-2 ring-offset-[var(--surface)]",
                )}
                style={{ background: a.value, boxShadow: s.accent === a.value ? `0 0 0 2px ${a.value}` : undefined }}
              >
                {s.accent === a.value && <Check size={16} className="text-white" />}
              </button>
            ))}
            <label className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border-2 border-dashed border-line text-muted hover:border-accent">
              <input
                type="color"
                value={s.accent}
                onChange={(e) => s.setAccent(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              +
            </label>
          </div>
        </Card>

        {/* Typography & shape */}
        <Card className="pb-5">
          <CardHeader title="Typography & shape" />
          <div className="mt-4 space-y-4 px-5">
            <Row label="Font">
              <Segmented value={s.font} onChange={s.setFont} options={FONTS.map((f) => ({ value: f.id, label: f.label }))} />
            </Row>
            <Row label="Corners">
              <Segmented value={s.radius} onChange={s.setRadius} options={RADII.map((r) => ({ value: r.id, label: r.label }))} />
            </Row>
            <Row label="Density">
              <Segmented value={s.density} onChange={s.setDensity} options={DENSITIES.map((d) => ({ value: d.id, label: d.label }))} />
            </Row>
          </div>
        </Card>

        {/* Effects */}
        <Card className="pb-5">
          <CardHeader title="Effects" icon={<Sparkles size={16} />} />
          <div className="mt-4 space-y-4 px-5">
            <Row label="Glass / blur surfaces">
              <Toggle checked={s.glass} onChange={s.setGlass} />
            </Row>
            <Row label="Animations">
              <Toggle checked={s.animations} onChange={s.setAnimations} />
            </Row>
          </div>
        </Card>

        {/* Grades */}
        <Card className="pb-5">
          <CardHeader title="Grades" icon={<GraduationCap size={16} />} />
          <div className="mt-4 space-y-4 px-5">
            <Row label="Grade display">
              <Segmented
                value={s.gradeDisplay}
                onChange={s.setGradeDisplay}
                options={[
                  { value: "both", label: "Both" },
                  { value: "letter", label: "Letter" },
                  { value: "percent", label: "%" },
                ]}
              />
            </Row>
          </div>
        </Card>

        {/* Dashboard widgets */}
        <Card className="pb-5">
          <CardHeader title="Dashboard layout" />
          <p className="px-5 pt-1 text-xs text-muted">Toggle and reorder the cards on your dashboard.</p>
          <div className="mt-3 space-y-2 px-5">
            {s.widgets.map((w, i) => {
              const meta = ALL_WIDGETS.find((m) => m.id === w.id);
              if (!meta) return null;
              return (
                <div key={w.id} className="flex items-center gap-3 rounded-[var(--radius-soft)] bg-surface-2 p-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => s.moveWidget(w.id, -1)}
                      disabled={i === 0}
                      className="text-muted hover:text-text disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => s.moveWidget(w.id, 1)}
                      disabled={i === s.widgets.length - 1}
                      className="text-muted hover:text-text disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium", !w.visible && "text-faint")}>{meta.label}</p>
                    <p className="truncate text-xs text-muted">{meta.description}</p>
                  </div>
                  <button
                    onClick={() => s.toggleWidget(w.id)}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full transition-colors",
                      w.visible ? "bg-accent-soft text-accent" : "text-faint hover:bg-surface-3",
                    )}
                  >
                    {w.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Account */}
        <Card className="pb-5">
          <CardHeader title="Account" />
          <div className="mt-4 space-y-3 px-5">
            <Row label="Signed in as">
              <span className="text-sm font-medium">{session.student?.name ?? "—"}</span>
            </Row>
            <Row label="School">
              <span className="text-sm font-medium">{session.student?.school || session.districtName || "—"}</span>
            </Row>
            {session.demo && (
              <div className="flex items-center gap-2 rounded-[var(--radius-soft)] bg-accent-soft px-3 py-2 text-xs text-accent">
                <Sparkles size={14} /> You&apos;re in demo mode with sample data.
              </div>
            )}
            <Button
              variant="danger"
              onClick={() => {
                session.logout();
                router.replace("/login");
              }}
            >
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-4 pb-4 text-xs text-faint">
          <Link href="/faq" className="hover:text-text">
            FAQ
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-text">
            Privacy
          </Link>
          <span>·</span>
          <span>GradeFlow — unofficial StudentVUE client</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}
