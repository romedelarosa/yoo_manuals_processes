import { CircleAlert } from "lucide-react";
import { getRoleName } from "@/lib/access";
import type { ProcessBlueprint } from "@/lib/types";
import { Badge, Card } from "./ui";

export function ProcessBlueprintView({
  blueprint,
}: {
  blueprint: ProcessBlueprint;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-[#17211b] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Service blueprint
        </p>
        <h2 className="mt-2 text-xl font-semibold">{blueprint.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          {blueprint.description}
        </p>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {blueprint.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex min-h-56 flex-col rounded-lg border border-border bg-[#fbfcf8] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Step
                  </p>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {step.description}
                </p>
                <div className="mt-auto pt-4">
                  <Badge>{getRoleName(step.ownerRoleId)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-foreground">Control points</h3>
          <div className="mt-4 flex flex-col gap-3">
            {blueprint.steps
              .filter((step) => step.escalation)
              .map((step) => (
                <div
                  key={step.id}
                  className="rounded-md border border-[#efd09a] bg-[#fff8e7] p-3"
                >
                  <div className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 shrink-0 text-warning" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted">
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
