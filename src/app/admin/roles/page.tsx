import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { employeeRoles, systemRoles } from "@/lib/mock-data";

export default function RolesPage() {
  return (
    <AppShell mode="admin">
      <PageHeader
        title="Roles and permissions"
        description="System roles control permissions. Operational roles control which modules employees receive."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">System permission roles</h2>
            <Badge tone="accent">Access control</Badge>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {systemRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-md border border-border bg-surface-muted p-4"
              >
                <p className="font-semibold text-foreground">{role.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Employee operational roles</h2>
            <Badge>Module assignment</Badge>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {employeeRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-md border border-border bg-surface-muted p-4"
              >
                <p className="font-semibold text-foreground">{role.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
