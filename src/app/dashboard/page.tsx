import { AppShell } from "@/components/app-shell";
import { ModuleCard, StatGrid } from "@/components/dashboard";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { demoEmployee, getAssignedModules, getCompletionSummary } from "@/lib/access";
import { businesses, employeeStats } from "@/lib/mock-data";

export default function DashboardPage() {
  const assignedModules = getAssignedModules(demoEmployee);
  const requiredModules = assignedModules.filter((module) => module.required);
  const optionalModules = assignedModules.filter((module) => !module.required);
  const summary = getCompletionSummary(demoEmployee);

  return (
    <AppShell>
      <PageHeader
        title={`Welcome, ${demoEmployee.fullName}`}
        description="Your assigned onboarding modules, policy refreshers, checkpoints, and acknowledgments are scoped by business and role."
        actions={<ButtonLink href="/progress" variant="secondary">View progress</ButtonLink>}
      />

      <StatGrid
        stats={employeeStats.map((stat) => {
          if (stat.label === "Assigned") return { ...stat, value: String(summary.assigned) };
          if (stat.label === "Completed") return { ...stat, value: String(summary.completed) };
          if (stat.label === "In progress") return { ...stat, value: String(summary.inProgress) };
          return stat;
        })}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Assigned profile
            </p>
            <p className="mt-1 text-sm text-muted">
              {demoEmployee.jobTitle} with role-specific access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {demoEmployee.businessIds.map((businessId) => {
              const business = businesses.find((item) => item.id === businessId);
              return <Badge key={businessId}>{business?.name ?? businessId}</Badge>;
            })}
            {demoEmployee.employeeRoleIds.map((roleId) => (
              <Badge key={roleId} tone="accent">
                {roleId}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Required modules
          </h2>
          <p className="mt-1 text-sm text-muted">
            Complete these before the target onboarding or refresh deadline.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {requiredModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Optional refreshers
          </h2>
          <p className="mt-1 text-sm text-muted">
            Useful reference content that does not currently block completion.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {optionalModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
