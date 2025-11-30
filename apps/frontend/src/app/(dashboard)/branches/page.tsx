"use client";

import { useBranches } from "@/features/branches/hooks";
import { BranchTable } from "@/features/branches/components/branch-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BranchesPage() {
  const { data, isLoading, error, refetch, isFetching } = useBranches();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Network data</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Branches</h1>
          <Badge variant="secondary">TanStack Query + NestJS</Badge>
        </div>
      </div>
      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">What this demo does</CardTitle>
            <CardDescription>
              Calls <code className="rounded bg-muted px-1 py-0.5 text-xs">GET /branches</code> on
              the NestJS API, attaching the stored JWT as a Bearer token.
            </CardDescription>
          </div>
          <Badge variant={isFetching ? "secondary" : "success"} className="text-xs">
            {isFetching ? "Syncing" : "Ready"}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Update <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_API_BASE_URL</code>{" "}
            and log in to pull live branch data. Adjust feature hooks per module as you build out accounts,
            schedules, payroll, and more.
          </p>
        </CardContent>
      </Card>
      <Separator />
      <BranchTable
        data={data}
        isLoading={isLoading}
        error={error?.message ?? null}
        onRetry={() => refetch()}
      />
    </div>
  );
}
