import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getModuleStatus, getProgressForModule } from "@/lib/access";
import { getModules } from "@/lib/database";

export default async function ProgressPage() {
  const assignedModules = await getModules();

  return (
    <AppShell>
      <PageHeader
        title="My progress"
        description="Completion records show module status, checkpoint result, acknowledgment state, and tracked module version."
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quiz</th>
                <th className="px-4 py-3">Acknowledgment</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Completed</th>
              </tr>
            </thead>
            <tbody>
              {assignedModules.map((module) => {
                const record = getProgressForModule(module.id);
                const status = getModuleStatus(module.id);

                return (
                  <tr key={module.id} className="border-t border-border">
                    <td className="px-4 py-4">
                      <Link
                        href={`/modules/${module.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {module.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">{module.category}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={status === "completed" ? "success" : "neutral"}>
                        {status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={record?.quizPassed ? "success" : "neutral"}>
                        {module.quiz
                          ? record?.quizPassed
                            ? "Passed"
                            : "Required"
                          : "Not required"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={record?.acknowledged ? "success" : "neutral"}>
                        {module.acknowledgmentRequired
                          ? record?.acknowledged
                            ? "Signed"
                            : "Required"
                          : "Optional"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted">{module.version}</td>
                    <td className="px-4 py-4 text-muted">
                      {record?.completedAt ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
