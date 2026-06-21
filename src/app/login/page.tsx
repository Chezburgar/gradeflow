"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Loader2,
  MapPin,
  NotebookPen,
  Palette,
  School,
  Search,
  Sparkles,
} from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { useSession } from "@/store/session";
import { useHydrated } from "@/lib/use-hydrated";
import { DEMO_STUDENT } from "@/lib/studentvue/demo";
import { findDistrictsByZip, svue } from "@/lib/studentvue/relay-client";
import { searchDistricts } from "@/lib/districts";
import { asset } from "@/lib/utils";
import type { District } from "@/lib/studentvue/types";

const FEATURES = [
  { icon: Palette, title: "Make it yours", text: "8 themes, custom accents, fonts, layouts." },
  { icon: NotebookPen, title: "Agenda book", text: "Plan homework, tests & reminders in one place." },
  { icon: CalendarCheck, title: "Everything synced", text: "Grades, attendance, schedule & documents." },
];

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useSession();

  const [step, setStep] = useState<"district" | "credentials">("district");
  const [zip, setZip] = useState("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [manual, setManual] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const [host, setHost] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (hydrated && session.loggedIn) router.replace("/dashboard");
  }, [hydrated, session.loggedIn, router]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError("");
    setLookupLoading(true);
    setDistricts([]);
    try {
      const q = zip.trim();
      let results: District[] = [];
      // Real ZIP-proximity lookup (Edupoint allows browser CORS); fall back to
      // the bundled directory for names or if the lookup returns nothing.
      if (/^\d{5}$/.test(q)) {
        try {
          results = await findDistrictsByZip(q);
        } catch {
          /* fall back below */
        }
      }
      if (results.length === 0) results = searchDistricts(q);
      if (results.length === 0) {
        setLookupError(
          "No districts found. Try a district name or ZIP, or enter your URL manually.",
        );
      }
      setDistricts(results);
    } finally {
      setLookupLoading(false);
    }
  }

  function pickDistrict(d: District) {
    setHost(d.url);
    setDistrictName(d.name);
    setStep("credentials");
  }

  function useManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    setHost(manualUrl.trim());
    setDistrictName(manualUrl.trim().replace(/^https?:\/\//, ""));
    setStep("credentials");
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const student = await svue.studentInfo({ host, username, password });
      session.login({ host, username, password, student, districtName });
      router.replace("/dashboard");
    } catch (err) {
      setLoginError((err as Error).message);
    } finally {
      setLoginLoading(false);
    }
  }

  function startDemo() {
    session.startDemo(DEMO_STUDENT);
    router.replace("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* hero */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="relative z-10 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/icon.svg")} alt="" className="h-11 w-11 rounded-2xl" />
          <span className="text-2xl font-bold tracking-tight">
            Grade<span className="text-accent">Flow</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl"
          >
            Your grades,
            <br />
            <span className="text-grad">but actually nice.</span>
          </motion.h1>
          <p className="mt-4 text-lg text-muted">
            A faster, prettier, fully customizable window into StudentVUE — with a
            built-in agenda book to keep you on top of everything.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <f.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted">{f.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-faint">
          Unofficial. Not affiliated with Edupoint or StudentVUE.
        </p>
      </div>

      {/* form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="card w-full max-w-md p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/icon.svg")} alt="" className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold tracking-tight">
              Grade<span className="text-accent">Flow</span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === "district" ? (
              <motion.div
                key="district"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <h2 className="text-xl font-bold">Find your school district</h2>
                <p className="mt-1 text-sm text-muted">
                  Search by ZIP code, or enter your StudentVUE URL.
                </p>

                {!manual ? (
                  <>
                    <form onSubmit={lookup} className="mt-5 flex gap-2">
                      <div className="relative flex-1">
                        <MapPin
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                        />
                        <Input
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="ZIP code or district name"
                          className="pl-9"
                        />
                      </div>
                      <Button type="submit" disabled={lookupLoading} size="md">
                        {lookupLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Search size={16} />
                        )}
                        Search
                      </Button>
                    </form>

                    {lookupError && (
                      <p className="mt-3 text-sm text-grade-f">{lookupError}</p>
                    )}

                    <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                      {districts.map((d) => (
                        <button
                          key={d.url}
                          onClick={() => pickDistrict(d)}
                          className="flex w-full items-center gap-3 rounded-[var(--radius-soft)] border border-line bg-surface-2 p-3 text-left transition-colors hover:border-accent"
                        >
                          <School size={18} className="shrink-0 text-accent" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{d.name}</p>
                            <p className="truncate text-xs text-muted">{d.address}</p>
                          </div>
                          <ArrowRight size={16} className="text-faint" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setManual(true)}
                      className="mt-4 text-sm font-medium text-accent hover:underline"
                    >
                      Enter StudentVUE URL manually →
                    </button>
                  </>
                ) : (
                  <form onSubmit={useManual} className="mt-5 space-y-4">
                    <Field label="StudentVUE / district URL">
                      <Input
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://yourdistrict.edupoint.com"
                      />
                    </Field>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setManual(false)}>
                        <ArrowLeft size={16} /> Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Continue <ArrowRight size={16} />
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <button
                  onClick={() => setStep("district")}
                  className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
                >
                  <ArrowLeft size={15} /> Change district
                </button>
                <h2 className="text-xl font-bold">Sign in</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <School size={14} className="text-accent" />
                  <span className="truncate">{districtName}</span>
                </p>

                <form onSubmit={doLogin} className="mt-5 space-y-4">
                  <Field label="Username">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="StudentVUE username / Student ID"
                      autoComplete="username"
                    />
                  </Field>
                  <Field label="Password">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </Field>

                  {loginError && <p className="text-sm text-grade-f">{loginError}</p>}

                  <Button type="submit" className="w-full" size="lg" disabled={loginLoading}>
                    {loginLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Sign in
                  </Button>
                  <p className="text-center text-xs text-faint">
                    Use your StudentVUE password (not your Google login).{" "}
                    {host && (
                      <a
                        href={`${host.replace(/\/+$/, "")}/PXP2_Password_Help.aspx`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        Forgot it?
                      </a>
                    )}
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="my-6 flex items-center gap-3 text-xs text-faint">
            <span className="h-px flex-1 bg-line" />
            OR
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button variant="soft" className="w-full" size="lg" onClick={startDemo}>
            <Sparkles size={18} /> Explore the demo
          </Button>
          <p className="mt-3 text-center text-xs text-faint">
            No account needed — sample data, fully clickable.
          </p>
        </div>
      </div>
    </div>
  );
}
