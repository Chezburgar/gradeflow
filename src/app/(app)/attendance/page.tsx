"use client";

import { CalendarX, Clock } from "lucide-react";
import { useResource } from "@/components/DataProvider";
import { ResourceView } from "@/components/Resource";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardHeader, EmptyState, Skeleton } from "@/components/ui";
import { relativeDay } from "@/lib/utils";

function reasonColor(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("tardy")) return "var(--grade-c)";
  if (r.includes("unexcused")) return "var(--grade-f)";
  if (r.includes("activit")) return "var(--accent)";
  return "var(--grade-b)";
}

export default function AttendancePage() {
  const att = useResource("attendance");

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Absences, tardies & activities" />
      <ResourceView
        res={att}
        resourceKey="attendance"
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-[var(--radius-card)]" />
            <Skeleton className="h-64 rounded-[var(--radius-card)]" />
          </div>
        }
      >
        {(data) => (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tot label="Excused" value={data.totals.excused} color="var(--grade-b)" />
              <Tot label="Unexcused" value={data.totals.unexcused} color="var(--grade-f)" />
              <Tot label="Tardies" value={data.totals.tardy} color="var(--grade-c)" />
              <Tot label="Activities" value={data.totals.activity} color="var(--accent)" />
            </div>

            <Card className="overflow-hidden pb-2">
              <CardHeader title="History" icon={<Clock size={16} />} />
              {data.events.length === 0 ? (
                <EmptyState icon={<CalendarX size={24} />} title="Perfect attendance" hint="No absences on record." />
              ) : (
                <div className="mt-3 divide-y divide-line">
                  {data.events.map((e, i) => (
                    <div key={i} className="px-5 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-1 rounded-full" style={{ background: reasonColor(e.reason) }} />
                          <div>
                            <p className="text-sm font-medium">{e.reason || "Absence"}</p>
                            {e.note && <p className="text-xs text-muted">{e.note}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{relativeDay(e.date)}</p>
                          <p className="text-xs text-faint">{e.date}</p>
                        </div>
                      </div>
                      {e.periods.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 pl-4">
                          {e.periods.map((p, j) => (
                            <Badge key={j} color={reasonColor(p.reason)}>
                              P{p.period} {p.course || p.name} · {p.reason}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </ResourceView>
    </div>
  );
}

function Tot({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
