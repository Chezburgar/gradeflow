"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2 } from "lucide-react";
import { useResource } from "@/components/DataProvider";
import { ResourceView } from "@/components/Resource";
import { PageHeader } from "@/components/PageHeader";
import { Card, EmptyState, Skeleton } from "@/components/ui";
import { useSession } from "@/store/session";
import { svue } from "@/lib/studentvue/relay-client";
import { relativeDay } from "@/lib/utils";
import type { StudentDocument } from "@/lib/studentvue/types";

export default function DocumentsPage() {
  const docs = useResource("documents");
  const session = useSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  async function download(d: StudentDocument) {
    if (session.demo) {
      setToast("Downloads aren't available in demo mode.");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    setBusy(d.guid);
    try {
      const data = await svue.documentContent(
        { host: session.host, username: session.username, password: session.password },
        d.guid,
      );
      const a = document.createElement("a");
      a.href = `data:application/octet-stream;base64,${data.base64}`;
      a.download = data.fileName || `${d.type}.pdf`;
      a.click();
    } catch (e) {
      setToast((e as Error).message);
      setTimeout(() => setToast(""), 3000);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader title="Documents" subtitle="Report cards & progress reports" />
      <ResourceView
        res={docs}
        resourceKey="documents"
        skeleton={
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-[var(--radius-card)]" />
            ))}
          </div>
        }
      >
        {(list) =>
          list.length === 0 ? (
            <Card>
              <EmptyState icon={<FileText size={24} />} title="No documents" hint="Nothing has been published to your account." />
            </Card>
          ) : (
            <div className="space-y-3">
              {list.map((d, i) => (
                <motion.button
                  key={d.guid || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => download(d)}
                  className="card flex w-full items-center gap-4 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-soft)] bg-accent-soft text-accent">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{d.comment || d.type}</p>
                    <p className="text-xs text-muted">
                      {d.type} · {relativeDay(d.date)}
                    </p>
                  </div>
                  {busy === d.guid ? (
                    <Loader2 size={18} className="animate-spin text-muted" />
                  ) : (
                    <Download size={18} className="text-faint" />
                  )}
                </motion.button>
              ))}
            </div>
          )
        }
      </ResourceView>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-surface-3 px-4 py-2 text-sm shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}
