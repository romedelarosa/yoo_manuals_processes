import {
  BookOpenCheck,
  BriefcaseBusiness,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getEmployees, getModules, getRoleDefinitions } from "@/lib/database";

export default async function RolesPage() {
  const [{ employeeRoles, systemRoles }, employees, modules] = await Promise.all([
    getRoleDefinitions(),
    getEmployees(),
    getModules(),
  ]);
  const activeEmployees = employees.filter((employee) => employee.status === "active");
  const employeeRoleUsage = employeeRoles.map((role) => {
    const employeeCount = activeEmployees.filter((employee) =>
      employee.employeeRoleIds.includes(role.id),
    ).length;
    const moduleCount = modules.filter((module) =>
      module.employeeRoleIds.includes(role.id),
    ).length;

    return {
      ...role,
      employeeCount,
      moduleCount,
    };
  });
  const systemRoleUsage = systemRoles.map((role) => ({
    ...role,
    employeeCount: employees.filter((employee) =>
      employee.systemRoleIds.includes(role.id),
    ).length,
    permissions: parsePermissionLabels(role.description),
  }));
  const totalOperationalAssignments = employeeRoleUsage.reduce(
    (total, role) => total + role.employeeCount,
    0,
  );
  const modulesWithRoleScope = modules.filter(
    (module) => module.employeeRoleIds.length > 0,
  ).length;

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Roles and permissions"
        description="Review who has access, which modules each role receives, and where to update role assignments."
        actions={
          <>
            <ButtonLink href="/admin/employees">Assign employees</ButtonLink>
            <ButtonLink href="/admin/modules/new" variant="secondary">
              Target a module
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BriefcaseBusiness}
          label="Operational roles"
          value={String(employeeRoles.length)}
          caption={`${totalOperationalAssignments} active employee assignments`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="System roles"
          value={String(systemRoles.length)}
          caption="Controls admin and employee permissions"
        />
        <MetricCard
          icon={Users}
          label="Active employees"
          value={String(activeEmployees.length)}
          caption="Can receive role-scoped modules"
        />
        <MetricCard
          icon={BookOpenCheck}
          label="Scoped modules"
          value={String(modulesWithRoleScope)}
          caption="Modules targeted to one or more roles"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Employee operational roles</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  These roles decide which onboarding, policy, SOP, and blueprint
                  modules each employee sees.
                </p>
              </div>
              <Badge>Module assignment</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Modules</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeRoleUsage.map((role) => (
                  <tr key={role.id} className="border-t border-border">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{role.name}</p>
                      <p className="mt-1 text-xs text-muted">{role.id}</p>
                    </td>
                    <td className="max-w-md px-4 py-4 text-muted">
                      {role.description || "No description yet."}
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={role.employeeCount > 0 ? "success" : "neutral"}>
                        {role.employeeCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={role.moduleCount > 0 ? "accent" : "neutral"}>
                        {role.moduleCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <ButtonLink href="/admin/employees" variant="secondary">
                          Assign
                        </ButtonLink>
                        <ButtonLink href="/admin/modules/new" variant="ghost">
                          Target module
                        </ButtonLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <UserRoundCog />
              </div>
              <div>
                <h2 className="text-lg font-semibold">How to use roles</h2>
                <div className="mt-3 flex flex-col gap-3 text-sm leading-6 text-muted">
                  <p>
                    Assign operational roles from each employee&apos;s Manage
                    access screen.
                  </p>
                  <p>
                    Assign modules to operational roles when creating or editing
                    a module.
                  </p>
                  <p>
                    Grant admin permissions only when the employee needs to
                    manage people, modules, or reports.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">System permission roles</h2>
              <Badge tone="accent">Access control</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {systemRoleUsage.map((role) => (
                <div
                  key={role.id}
                  className="rounded-md border border-border bg-surface-muted p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{role.name}</p>
                      <p className="mt-1 text-xs text-muted">{role.id}</p>
                    </div>
                    <Badge tone={role.employeeCount > 0 ? "success" : "neutral"}>
                      {role.employeeCount} user{role.employeeCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.permissions.length > 0 ? (
                      role.permissions.map((permission) => (
                        <Badge key={permission}>{permission}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted">
                        No granular permission labels configured.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{caption}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-md bg-surface-muted text-primary">
          <Icon />
        </div>
      </div>
    </Card>
  );
}

function parsePermissionLabels(description: string) {
  try {
    const permissions = JSON.parse(description) as Record<string, unknown>;
    return Object.entries(permissions)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key.replaceAll("_", " "));
  } catch {
    return description ? [description] : [];
  }
}
