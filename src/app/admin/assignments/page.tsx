import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getBusinessName, getRoleName } from "@/lib/access";
import { getModules } from "@/lib/database";

export default async function AssignmentsPage() {
  const modules = await getModules();

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Assignment management"
        description="Modules are assigned by business and operational role. Employees inherit only matching active modules."
      />

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="p-5">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr_1.2fr]">
              <div>
                <p className="font-semibold text-foreground">{module.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {module.required ? "Required" : "Optional"} - Version{" "}
                  {module.version}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Businesses
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {module.businessIds.map((businessId) => (
                    <Badge key={businessId}>{getBusinessName(businessId)}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Roles
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {module.employeeRoleIds.map((roleId) => (
                    <Badge key={roleId}>{getRoleName(roleId)}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
