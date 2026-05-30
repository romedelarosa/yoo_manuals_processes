import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, FieldLabel, PageHeader, SelectInput, TextInput } from "@/components/ui";
import { hasSystemRole, requireAdmin } from "@/lib/auth";
import { getBusinesses, getEmployees, getRoleDefinitions } from "@/lib/database";
import { updateEmployeeAccessAction } from "./actions";

export default async function EditEmployeeAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>;
  searchParams?: Promise<{ message?: string }>;
}) {
  const [{ employeeId }, query, adminProfile] = await Promise.all([
    params,
    searchParams,
    requireAdmin(),
  ]);
  const [employees, businesses, roleDefinitions] = await Promise.all([
    getEmployees(),
    getBusinesses(),
    getRoleDefinitions(),
  ]);
  const employee = employees.find((item) => item.id === employeeId);

  if (!employee) {
    notFound();
  }

  const canManageSystemRoles = hasSystemRole(adminProfile, "super-admin");

  return (
    <AppShell mode="admin">
      <PageHeader
        title={`Manage ${employee.fullName}`}
        description="Update business access, operational role assignment, and system permissions."
        actions={<ButtonLink href="/admin/employees" variant="secondary">Back to employees</ButtonLink>}
      />

      {query?.message ? (
        <div className="rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
          {query.message}
        </div>
      ) : null}

      <Card className="p-6">
        <form
          action={updateEmployeeAccessAction.bind(null, employee.id)}
          className="flex flex-col gap-6"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <FieldLabel>Full name</FieldLabel>
              <TextInput name="fullName" defaultValue={employee.fullName} required />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Job title</FieldLabel>
              <TextInput name="jobTitle" defaultValue={employee.jobTitle} required />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Status</FieldLabel>
              <SelectInput name="status" defaultValue={employee.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectInput>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <h2 className="text-base font-semibold text-foreground">
                Business access
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                This controls which business modules the employee can receive.
              </p>
              <div className="mt-3 grid gap-2">
                {businesses.map((business) => (
                  <label
                    key={business.id}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="businessIds"
                      value={business.id}
                      defaultChecked={employee.businessIds.includes(business.id)}
                    />
                    {business.name}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                Operational roles
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                These roles determine which role-specific modules appear.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {roleDefinitions.employeeRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="employeeRoleIds"
                      value={role.id}
                      defaultChecked={employee.employeeRoleIds.includes(role.id)}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </section>
          </div>

          <section>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-foreground">
                System permissions
              </h2>
              <p className="text-sm leading-6 text-muted">
                Employee access is always kept. Only super admins can grant admin-level permissions.
              </p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {roleDefinitions.systemRoles.map((role) => {
                const checked = employee.systemRoleIds.includes(role.id);
                const lockedEmployee = role.id === "employee";

                return (
                  <label
                    key={role.id}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="systemRoleIds"
                      value={role.id}
                      defaultChecked={checked || lockedEmployee}
                      disabled={!canManageSystemRoles || lockedEmployee}
                    />
                    <span>{role.name}</span>
                    {!canManageSystemRoles && checked ? <Badge tone="accent">Current</Badge> : null}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface-muted p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_0.9fr] md:items-end">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Password reset
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Optional. Enter a new temporary password only when you need to
                  reset this employee&apos;s login password.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>New temporary password</FieldLabel>
                <TextInput
                  name="newPassword"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
              Save access
            </button>
            <ButtonLink href="/admin/employees" variant="secondary">
              Cancel
            </ButtonLink>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
