import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getCompletionReportRows, getEmployees, getModules } from "@/lib/database";

export default async function ReportsPage() {
  const [employees, modules, reportRows] = await Promise.all([
    getEmployees(),
    getModules(),
    getCompletionReportRows(),
  ]);
  const assignedTotal = reportRows.reduce((total, row) => total + row.assigned, 0);
  const completedTotal = reportRows.reduce((total, row) => total + row.completed, 0);
  const completionRate =
    assignedTotal > 0 ? Math.round((completedTotal / assignedTotal) * 100) : 0;

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
          <p className="text-sm text-muted">Completion rate</p>
          <p className="mt-2 text-3xl font-semibold">{completionRate}%</p>
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
                <th className="px-4 py-3">Pending required</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length === 0 ? (
                <tr className="border-t border-border">
                  <td className="px-4 py-6 text-muted" colSpan={6}>
                    No employee records yet. Add employees to begin reporting
                    completion and acknowledgments.
                  </td>
                </tr>
              ) : null}

              {reportRows.map((row) => (
                <tr key={row.employeeId} className="border-t border-border">
                  <td className="px-4 py-4 font-semibold text-foreground">
                    {row.employee}
                  </td>
                  <td className="px-4 py-4 text-muted">{row.business}</td>
                  <td className="px-4 py-4">{row.assigned}</td>
                  <td className="px-4 py-4">{row.completed}</td>
                  <td className="px-4 py-4">{row.acknowledged}</td>
                  <td className="px-4 py-4">
                    <Badge tone={row.pendingRequired > 0 ? "warning" : "success"}>
                      {row.pendingRequired}
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
