import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getBusinessName, getRoleName } from "@/lib/access";
import { modules } from "@/lib/mock-data";

export default function ModulesPage() {
  return (
    <AppShell mode="admin">
      <PageHeader
        title="Manage modules"
        description="Create short lessons, assign them by business and role, attach checkpoints, and require acknowledgments."
        actions={<ButtonLink href="/admin/modules/new">Create module</ButtonLink>}
      />

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={module.required ? "warning" : "neutral"}>
                    {module.required ? "Required" : "Optional"}
                  </Badge>
                  <Badge tone={module.active ? "success" : "neutral"}>
                    {module.active ? "Active" : "Inactive"}
                  </Badge>
                  {module.blueprint ? <Badge tone="accent">Blueprint</Badge> : null}
                  {module.attachments && module.attachments.length > 0 ? (
                    <Badge>{module.attachments.length} attachment</Badge>
                  ) : null}
                </div>
                <Link
                  href={`/modules/${module.id}`}
                  className="mt-3 block text-lg font-semibold text-foreground hover:text-primary"
                >
                  {module.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {module.description}
                </p>
              </div>
              <ButtonLink href={`/admin/modules/${module.id}/edit`} variant="secondary">
                Edit
              </ButtonLink>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="flex flex-wrap gap-2">
                {module.businessIds.map((businessId) => (
                  <Badge key={businessId}>{getBusinessName(businessId)}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {module.employeeRoleIds.slice(0, 4).map((roleId) => (
                  <Badge key={roleId}>{getRoleName(roleId)}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
