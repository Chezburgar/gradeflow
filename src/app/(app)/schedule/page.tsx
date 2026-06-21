"use client";

import { motion } from "framer-motion";
import { CalendarDays, Mail, MapPin } from "lucide-react";
import { useResource } from "@/components/DataProvider";
import { ResourceView } from "@/components/Resource";
import { PageHeader } from "@/components/PageHeader";
import { Card, EmptyState, Skeleton } from "@/components/ui";

export default function SchedulePage() {
  const sched = useResource("schedule");

  return (
    <div>
      <PageHeader title="Schedule" subtitle="Your classes, in order" />
      <ResourceView
        res={sched}
        resourceKey="schedule"
        skeleton={
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-[var(--radius-card)]" />
            ))}
          </div>
        }
      >
        {(classes) =>
          classes.length === 0 ? (
            <Card>
              <EmptyState icon={<CalendarDays size={24} />} title="No schedule found" hint="Your district may not publish a schedule here." />
            </Card>
          ) : (
            <div className="space-y-3">
              {classes.map((c, i) => (
                <motion.div
                  key={`${c.period}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="flex items-center gap-4 p-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-soft)] bg-accent-soft">
                      <span className="text-lg font-bold text-accent">{c.period || "•"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{c.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                        {c.teacher && (
                          c.teacherEmail ? (
                            <a href={`mailto:${c.teacherEmail}`} className="inline-flex items-center gap-1 hover:text-accent">
                              <Mail size={12} /> {c.teacher}
                            </a>
                          ) : (
                            <span>{c.teacher}</span>
                          )
                        )}
                        {c.room && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> Room {c.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        }
      </ResourceView>
    </div>
  );
}
