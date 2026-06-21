import raw from "./districts-data";
import type { District } from "./studentvue/types";

/**
 * Bundled district directory (from the public Edupoint list). The browser can't
 * query Edupoint's lookup service directly (CORS), so a static build searches
 * this list. Manual URL entry is always available as a fallback.
 */
export function searchDistricts(query: string): District[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return raw
    .filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.address ?? "").toLowerCase().includes(q),
    )
    .slice(0, 40)
    .map((d) => ({
      name: d.name,
      address: d.address,
      url: (d.parentVueUrl ?? "").replace(/\/+$/, ""),
    }));
}
