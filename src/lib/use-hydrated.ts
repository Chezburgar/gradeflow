"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/store/session";
import { useSettings } from "@/store/settings";

/** True once the persisted zustand stores have finished hydrating from storage. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let session = useSession.persist.hasHydrated();
    let settings = useSettings.persist.hasHydrated();
    const check = () => session && settings && setHydrated(true);
    check();
    const a = useSession.persist.onFinishHydration(() => {
      session = true;
      check();
    });
    const b = useSettings.persist.onFinishHydration(() => {
      settings = true;
      check();
    });
    return () => {
      a?.();
      b?.();
    };
  }, []);

  return hydrated;
}
