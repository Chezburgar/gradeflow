"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useData } from "@/components/DataProvider";
import type { ResourceKey } from "@/components/DataProvider";

interface Res<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function ResourceView<T>({
  res,
  resourceKey,
  skeleton,
  children,
}: {
  res: Res<T>;
  resourceKey?: ResourceKey;
  skeleton: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  const { refresh } = useData();

  if (res.error) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="text-grade-d" size={28} />
        <div>
          <p className="font-semibold">Couldn&apos;t load this</p>
          <p className="mt-1 text-sm text-muted">{res.error}</p>
        </div>
        {resourceKey && (
          <Button variant="soft" size="sm" onClick={() => refresh(resourceKey)}>
            <RefreshCw size={14} /> Try again
          </Button>
        )}
      </Card>
    );
  }

  if (res.loading && !res.data) return <>{skeleton}</>;
  if (!res.data) return <>{skeleton}</>;

  return <>{children(res.data)}</>;
}
