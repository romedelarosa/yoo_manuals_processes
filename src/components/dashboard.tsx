import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { getBusinessName, getModuleStatus, getRoleName } from "@/lib/access";
import { cn } from "@/lib/cn";
import type { ManualModule, ModuleStatus, StatCard as StatCardType } from "@/lib/types";
import { Badge, ButtonLink, Card } from "./ui";

export function StatGrid({ stats }: { stats: StatCardType[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">{stat.caption}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-surface-muted text-primary">
                <Icon />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function ModuleCard({ module }: { module: ManualModule }) {
  const status = getModuleStatus(module.id);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={module.required ? "warning" : "neutral"}>
            {module.required ? "Required" : "Optional"}
          </Badge>
          <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
          {module.blueprint ? <Badge tone="accent">Process blueprint</Badge> : null}
          {module.attachments && module.attachments.length > 0 ? (
            <Badge>{module.attachments.length} attachment</Badge>
          ) : null}
          {module.quiz && !module.quiz.accessEnabled ? (
            <Badge tone="neutral">Checkpoint locked</Badge>
          ) : null}
        </div>

        <div>
          <Link
            href={`/modules/${module.id}`}
            className="text-lg font-semibold text-foreground hover:text-primary"
          >
            {module.title}
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span>{module.category}</span>
          <span>Version {module.version}</span>
          <span>{module.estimatedMinutes} min</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {module.businessIds.map((businessId) => (
            <Badge key={businessId}>{getBusinessName(businessId)}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {module.employeeRoleIds.slice(0, 3).map((roleId) => (
            <Badge key={roleId}>{getRoleName(roleId)}</Badge>
          ))}
          {module.employeeRoleIds.length > 3 ? (
            <Badge>+{module.employeeRoleIds.length - 3} roles</Badge>
          ) : null}
        </div>

        <ButtonLink href={`/modules/${module.id}`} variant="secondary">
          Open module
          <ArrowRight />
        </ButtonLink>
      </div>
    </Card>
  );
}

export function CompletionRules({ module }: { module: ManualModule }) {
  const rules = [
    {
      label: module.quiz
        ? module.quiz.accessEnabled
          ? "Checkpoint access open"
          : "Checkpoint access locked"
        : "No quiz required",
      icon: module.quiz ? HelpCircle : CheckCircle2,
      active: Boolean(module.quiz),
    },
    {
      label: module.acknowledgmentRequired
        ? "Acknowledgment required"
        : "Acknowledgment optional",
      icon: FileCheck2,
      active: module.acknowledgmentRequired,
    },
    {
      label: module.quiz
        ? `Unlock after lesson review`
        : `${module.estimatedMinutes} minute target`,
      icon: Clock3,
      active: true,
    },
    {
      label: `Version ${module.version} tracked`,
      icon: ShieldCheck,
      active: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rules.map((rule) => {
        const Icon = rule.icon;

        return (
          <div
            key={rule.label}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-3 text-sm",
              rule.active
                ? "border-[#c7decf] bg-[#f0f8f2] text-foreground"
                : "border-border bg-surface text-muted",
            )}
          >
            <Icon />
            <span>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function statusLabel(status: ModuleStatus) {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In progress";
  return "Pending";
}

function statusTone(status: ModuleStatus): "success" | "warning" | "neutral" {
  if (status === "completed") return "success";
  if (status === "in-progress") return "warning";
  return "neutral";
}
