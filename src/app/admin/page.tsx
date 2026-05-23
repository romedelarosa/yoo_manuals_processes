import { AppShell } from "@/components/app-shell";
import { StatGrid } from "@/components/dashboard";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { adminStats } from "@/lib/mock-data";
import { getModules } from "@/lib/database";

export default async function AdminDashboardPage() {
  const modules = await getModules();
  const required = modules.filter((module) => module.required).length;
  const blueprints = modules.filter((module) => module.blueprint).length;

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Admin dashboard"
        description="Manage policy modules, role assignments, acknowledgments, and completion status across YOO Clinic and ORI Wellness Center."
        actions={<ButtonLink href="/admin/modules/new">Create module</ButtonLink>}
      />

      <StatGrid stats={adminStats} />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Content health</h2>
              <p className="mt-1 text-sm text-muted">
                Keep content short, assigned, versioned, and acknowledged when
                needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="warning">{required} required</Badge>
              <Badge tone="accent">{blueprints} blueprint</Badge>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {modules.slice(0, 5).map((module) => (
              <div
                key={module.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{module.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {module.category} - Version {module.version}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={module.required ? "warning" : "neutral"}>
                    {module.required ? "Required" : "Optional"}
                  </Badge>
                  <Badge tone={module.active ? "success" : "neutral"}>
                    {module.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold">Next implementation steps</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-muted">
            <p>1. Connect Supabase Auth and replace demo employee selection.</p>
            <p>2. Run the SQL migration and test RLS with employee accounts.</p>
            <p>3. Persist quiz attempts, progress, and acknowledgments.</p>
            <p>4. Add content editor save/publish workflows.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
