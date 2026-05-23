import { AlertTriangle, FileCheck2, Layers3, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatGrid } from "@/components/dashboard";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getAdminDashboardMetrics, getModules } from "@/lib/database";

export default async function AdminDashboardPage() {
  const [modules, metrics] = await Promise.all([
    getModules(),
    getAdminDashboardMetrics(),
  ]);
  const required = modules.filter((module) => module.required).length;
  const blueprints = modules.filter((module) => module.blueprint).length;
  const stats = [
    {
      label: "Active employees",
      value: String(metrics.activeEmployees),
      caption: "Active profiles in Supabase",
      icon: Users,
    },
    {
      label: "Published modules",
      value: String(metrics.publishedModules),
      caption: `${metrics.requiredModules} required, ${metrics.optionalModules} optional`,
      icon: Layers3,
    },
    {
      label: "Acknowledgment rate",
      value: `${metrics.acknowledgmentRate}%`,
      caption:
        metrics.acknowledgmentTotal > 0
          ? `${metrics.acknowledgmentCompleted}/${metrics.acknowledgmentTotal} required acknowledgments`
          : "No required acknowledgments yet",
      icon: FileCheck2,
    },
    {
      label: "Pending required",
      value: String(metrics.pendingRequired),
      caption: "Assigned required modules not complete",
      icon: AlertTriangle,
    },
  ];

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Admin dashboard"
        description="Manage policy modules, role assignments, acknowledgments, and completion status across YOO Clinic and ORI Wellness Center."
        actions={<ButtonLink href="/admin/modules/new">Create module</ButtonLink>}
      />

      <StatGrid stats={stats} />

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
            {modules.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-surface-muted p-5 text-sm text-muted">
                No active modules yet. Create the first module to start building
                the onboarding manual.
              </div>
            ) : null}

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
          <h2 className="text-lg font-semibold">System status</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-muted">
            <p>Supabase Auth is connected and public signup is closed.</p>
            <p>Employee accounts should be created from the admin area.</p>
            <p>Dashboard metrics now use live Supabase records.</p>
            <p>Next useful hardening: audit logs, watermarks, and sensitive-module controls.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
