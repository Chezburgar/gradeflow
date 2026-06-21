"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useResource } from "@/components/DataProvider";
import { ResourceView } from "@/components/Resource";
import { ReportPeriodSelect } from "@/components/ReportPeriod";
import { CourseCard } from "@/components/grade-bits";
import { PageHeader } from "@/components/PageHeader";
import { Card, GradeRing, Input, Skeleton } from "@/components/ui";
import { gradeVar, overallAverage, overallGpa } from "@/lib/utils";

export default function GradesPage() {
  const gb = useResource("gradebook");
  const [q, setQ] = useState("");

  return (
    <div>
      <PageHeader
        title="Grades"
        subtitle="Live grades for every class"
        action={gb.data ? <ReportPeriodSelect gradebook={gb.data} /> : undefined}
      />

      <ResourceView
        res={gb}
        resourceKey="gradebook"
        skeleton={
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-[var(--radius-card)]" />
            ))}
          </div>
        }
      >
        {(gradebook) => {
          const gpa = overallGpa(gradebook.courses);
          const avg = overallAverage(gradebook.courses);
          const filtered = gradebook.courses.filter(
            (c) =>
              !q ||
              c.title.toLowerCase().includes(q.toLowerCase()) ||
              c.teacher.toLowerCase().includes(q.toLowerCase()),
          );
          return (
            <div className="space-y-5">
              <Card className="flex flex-wrap items-center justify-between gap-6 p-6">
                <div className="flex items-center gap-6">
                  <GradeRing
                    value={gpa != null ? (gpa / 4) * 100 : 0}
                    size={96}
                    label={gpa != null ? gpa.toFixed(2) : "—"}
                    sublabel="GPA"
                  />
                  <GradeRing
                    value={avg ?? 0}
                    size={96}
                    label={avg != null ? avg.toFixed(1) : "—"}
                    sublabel="Average"
                    color={gradeVar(avg)}
                  />
                  <div>
                    <p className="text-3xl font-bold">{gradebook.courses.length}</p>
                    <p className="text-sm text-muted">classes this term</p>
                  </div>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search classes…"
                    className="pl-9"
                  />
                </div>
              </Card>

              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((c, i) => (
                  <CourseCard key={c.id} course={c} index={i} />
                ))}
              </div>
            </div>
          );
        }}
      </ResourceView>
    </div>
  );
}
