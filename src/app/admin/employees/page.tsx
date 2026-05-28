import { AppShell } from "@/components/app-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getBusinessName, getRoleName } from "@/lib/access";
import { getEmployees } from "@/lib/database";
import { deleteEmployeeAction } from "./actions";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const employees = await getEmployees();

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Manage employees"
        description="Assign employees to businesses, system permissions, and operational roles that determine module access."
        actions={<ButtonLink href="/admin/employees/new">Add employee</ButtonLink>}
      />

      {params?.message ? (
        <div className="rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
          {params.message}
        </div>
      ) : null}

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
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr className="border-t border-border">
                  <td className="px-4 py-6 text-muted" colSpan={6}>
                    No active employees yet. Add an employee to assign access and modules.
                  </td>
                </tr>
              ) : null}

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
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink
                        href={`/admin/employees/${employee.id}/edit`}
                        variant="secondary"
                      >
                        Manage access
                      </ButtonLink>
                      <form action={deleteEmployeeAction.bind(null, employee.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`Delete ${employee.fullName} from active use? Their module access will be removed, but historical records will be preserved.`}
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
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
