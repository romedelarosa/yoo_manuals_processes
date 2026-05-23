import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ModuleEditor } from "@/components/module-editor";
import { PageHeader } from "@/components/ui";
import { getModule } from "@/lib/database";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const manualModule = await getModule(moduleId);

  if (!manualModule) {
    notFound();
  }

  return (
    <AppShell mode="admin">
      <PageHeader
        title={`Edit ${manualModule.title}`}
        description="Update content, assignment rules, quiz requirements, acknowledgment behavior, and version notes."
      />
      <ModuleEditor module={manualModule} />
    </AppShell>
  );
}
