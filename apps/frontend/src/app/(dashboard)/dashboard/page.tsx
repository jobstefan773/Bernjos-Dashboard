import { Activity, Building2, CreditCard, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const highlights = [
  { label: "Active branches", value: 12, icon: Building2, tone: "primary" },
  { label: "Accounts on payroll", value: 148, icon: Users, tone: "secondary" },
  { label: "Open leave requests", value: 6, icon: Activity, tone: "warning" },
  { label: "Pending payroll runs", value: 2, icon: CreditCard, tone: "default" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Control center</p>
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Operations overview</h1>
          <Badge variant="outline">Realtime snapshots</Badge>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.label} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-xl">What&apos;s next</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Connect the data</p>
            <p>Set NEXT_PUBLIC_API_BASE_URL and sign in to load live dashboards.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Add widgets</p>
            <p>Hang cards, charts, and lists per module (accounts, schedules, payroll).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
