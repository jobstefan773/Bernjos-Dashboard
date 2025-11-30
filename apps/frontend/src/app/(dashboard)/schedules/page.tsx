import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SchedulesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CalendarClock className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Planning area</CardTitle>
          <CardDescription>
            Hook this page up to the schedules endpoints when ready. It already lives inside the
            authenticated shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add calendar views, shift templates, and approvals here. Leverage the same feature folder
          pattern as the branches example.
        </CardContent>
      </Card>
    </div>
  );
}
