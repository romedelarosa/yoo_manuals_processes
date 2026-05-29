import { CircleAlert } from "lucide-react";
import { getRoleName } from "@/lib/access";
import type { ProcessBlueprint } from "@/lib/types";
import { Badge, Card } from "./ui";

export function ProcessBlueprintView({
  blueprint,
}: {
  blueprint: ProcessBlueprint;
}) {
  const controlPoints = blueprint.steps.filter((step) => step.escalation);

  return (
    <Card className="overflow-hidden border-[#ccd8d2]">
      <div className="border-b border-[#22342c] bg-[#13241d] p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              Service blueprint
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">
              {blueprint.title}
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-white/72">
              {blueprint.description}
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/75">
            {blueprint.steps.length} step{blueprint.steps.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-full gap-4 md:grid-cols-2 xl:flex">
            {blueprint.steps.map((step, index) => (
              <article
                key={step.id}
                className="group relative flex min-h-64 flex-col rounded-lg border border-border bg-[#fbfcf8] p-5 transition hover:border-primary/50 xl:min-w-[292px] xl:flex-1"
              >
                {index < blueprint.steps.length - 1 ? (
                  <div className="absolute -right-3 top-10 hidden h-px w-6 bg-border xl:block" />
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-base font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        Step
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Owner: {getRoleName(step.ownerRoleId)}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-semibold leading-6 text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {step.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Badge>{getRoleName(step.ownerRoleId)}</Badge>
                  {step.escalation ? <Badge tone="warning">Control point</Badge> : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface-muted p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Control points
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Escalation notes and handoff risks to watch during the process.
              </p>
            </div>
            <Badge tone={controlPoints.length > 0 ? "warning" : "neutral"}>
              {controlPoints.length} flagged
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {controlPoints.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-white/70 p-4 text-sm leading-6 text-muted">
                No escalation notes have been set for this blueprint yet.
              </div>
            ) : null}

            {controlPoints.map((step) => (
                <div
                  key={step.id}
                  className="rounded-md border border-[#efd09a] bg-[#fff8e7] p-4"
                >
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 shrink-0 text-warning" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {step.escalation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
