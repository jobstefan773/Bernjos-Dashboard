import { CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PayrollPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Payroll workspace</CardTitle>
          <CardDescription>
            Route scaffolded for payroll modules. Attach queries, tables, and actions as the API
            evolves.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Mirror the branches feature structure to keep data fetching, helpers, and UI organized by
          domain.
        </CardContent>
      </Card>
    </div>
  );
}
