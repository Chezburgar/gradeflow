"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useSession } from "@/store/session";
import { useHydrated } from "@/lib/use-hydrated";

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const loggedIn = useSession((s) => s.loggedIn);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(loggedIn ? "/dashboard" : "/login");
  }, [hydrated, loggedIn, router]);

  return (
    <div className="grid min-h-screen place-items-center text-muted">
      <RefreshCw className="animate-spin" size={22} />
    </div>
  );
}
