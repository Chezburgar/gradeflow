"use client";

import { useData } from "@/components/DataProvider";
import { Select } from "@/components/ui";
import type { Gradebook } from "@/lib/studentvue/types";

export function ReportPeriodSelect({ gradebook }: { gradebook: Gradebook }) {
  const { reportPeriod, setReportPeriod } = useData();
  if (!gradebook.reportPeriods.length) return null;
  const current = reportPeriod ?? gradebook.reportPeriod.index;

  return (
    <Select
      value={current}
      onChange={(e) => setReportPeriod(Number(e.target.value))}
      aria-label="Reporting period"
    >
      {gradebook.reportPeriods.map((rp) => (
        <option key={rp.index} value={rp.index}>
          {rp.name}
        </option>
      ))}
    </Select>
  );
}
