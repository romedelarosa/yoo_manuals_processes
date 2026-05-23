import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getBusinessName, getRoleName } from "@/lib/access";
import { employees } from "@/lib/mock-data";

export default function EmployeesPage() {
  return (
    <AppShell mode="admin">
      <PageHeader
        title="Manage employees"
        description="Assign employees to businesses, system permissions, and operational roles that determine module access."
        actions={<ButtonLink href="/admin/employees/new">Add employee</ButtonLink>}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Businesses</th>
                <th className="px-4 py-3">Operational roles</th>
                <th className="px-4 py-3">System access</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-border">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-foreground">
                      {employee.fullName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {employee.jobTitle} - {employee.email}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.businessIds.map((businessId) => (
                        <Badge key={businessId}>{getBusinessName(businessId)}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.employeeRoleIds.map((roleId) => (
                        <Badge key={roleId}>{getRoleName(roleId)}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.systemRoleIds.map((roleId) => (
                        <Badge key={roleId} tone="accent">
                          {roleId}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={employee.status === "active" ? "success" : "neutral"}>
                      {employee.status}
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
