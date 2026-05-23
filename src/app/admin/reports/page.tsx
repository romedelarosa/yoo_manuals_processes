import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getEmployees, getModules } from "@/lib/database";

const reportRows = [
  {
    employee: "Mika Santos",
    business: "YOO Clinic",
    assigned: 4,
    completed: 1,
    acknowledged: 1,
    overdue: 1,
  },
  {
    employee: "Ara Lim",
    business: "YOO Clinic + ORI Wellness Center",
    assigned: 5,
    completed: 3,
    acknowledged: 3,
    overdue: 0,
  },
  {
    employee: "Owner Demo",
    business: "YOO Clinic + ORI Wellness Center",
    assigned: 6,
    completed: 6,
    acknowledged: 6,
    overdue: 0,
  },
];

export default async function ReportsPage() {
  const [employees, modules] = await Promise.all([getEmployees(), getModules()]);

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Completion reports"
        description="Track completion, acknowledgment, and overdue records by employee and assigned business."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted">Tracked employees</p>
          <p className="mt-2 text-3xl font-semibold">{employees.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Tracked modules</p>
          <p className="mt-2 text-3xl font-semibold">{modules.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Current version compliance</p>
          <p className="mt-2 text-3xl font-semibold">83%</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Acknowledged</th>
                <th className="px-4 py-3">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr key={row.employee} className="border-t border-border">
                  <td className="px-4 py-4 font-semibold text-foreground">
                    {row.employee}
                  </td>
                  <td className="px-4 py-4 text-muted">{row.business}</td>
                  <td className="px-4 py-4">{row.assigned}</td>
                  <td className="px-4 py-4">{row.completed}</td>
                  <td className="px-4 py-4">{row.acknowledged}</td>
                  <td className="px-4 py-4">
                    <Badge tone={row.overdue > 0 ? "warning" : "success"}>
                      {row.overdue}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
