import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CompletionRules } from "@/components/dashboard";
import { ModuleAttachments } from "@/components/module-attachments";
import { ProcessBlueprintView } from "@/components/process-blueprint";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import {
  getBusinessName,
  getModuleStatus,
  getRoleName,
} from "@/lib/access";
import { getModule } from "@/lib/database";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const manualModule = await getModule(moduleId);

  if (!manualModule) {
    notFound();
  }

  const status = getModuleStatus(manualModule.id);
  const checkpointOpen = manualModule.quiz?.accessEnabled ?? false;

  return (
    <AppShell>
      <PageHeader
        title={manualModule.title}
        description={manualModule.description}
        actions={
          <>
            {manualModule.quiz && checkpointOpen ? (
              <ButtonLink href={`/modules/${manualModule.id}/quiz`} variant="secondary">
                Start checkpoint
              </ButtonLink>
            ) : null}
            {manualModule.quiz && !checkpointOpen ? (
              <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface-muted px-4 text-sm font-semibold text-muted">
                Checkpoint locked
              </span>
            ) : null}
            {manualModule.acknowledgmentRequired ? (
              <ButtonLink href={`/modules/${manualModule.id}/acknowledgment`}>
                Sign acknowledgment
              </ButtonLink>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone={manualModule.required ? "warning" : "neutral"}>
                {manualModule.required ? "Required" : "Optional"}
              </Badge>
              <Badge tone={status === "completed" ? "success" : "neutral"}>
                {status}
              </Badge>
              <Badge>{manualModule.category}</Badge>
              <Badge>Version {manualModule.version}</Badge>
            </div>
            {manualModule.quiz ? (
              <p className="mt-4 text-sm leading-6 text-muted">
                {checkpointOpen
                  ? "Checkpoint access is currently open. It should be taken after reviewing the lesson, in a separate assessment screen."
                  : "Checkpoint access is currently closed by an admin or business manager. Review the module now; the checkpoint will become available when access is opened."}
              </p>
            ) : null}
          </Card>

          {manualModule.blueprint ? (
            <ProcessBlueprintView blueprint={manualModule.blueprint} />
          ) : null}

          <ModuleAttachments attachments={manualModule.attachments} />

          {manualModule.sections.map((section, index) => (
            <Card key={section.id} className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Lesson {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{section.body}</p>
            </Card>
          ))}
        </section>

        <aside className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Completion rules
            </h2>
            <div className="mt-4">
              <CompletionRules module={manualModule} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Access scope</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Businesses
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {manualModule.businessIds.map((businessId) => (
                    <Badge key={businessId}>{getBusinessName(businessId)}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Roles
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {manualModule.employeeRoleIds.map((roleId) => (
                    <Badge key={roleId}>{getRoleName(roleId)}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
