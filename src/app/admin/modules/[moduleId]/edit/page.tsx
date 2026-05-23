import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ModuleEditor } from "@/components/module-editor";
import { PageHeader } from "@/components/ui";
import { getModule } from "@/lib/database";
import { updateModuleAction } from "./actions";

export default async function EditModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<{ message?: string }>;
}) {
  const { moduleId } = await params;
  const query = await searchParams;
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
      {query?.message ? (
        <div className="rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
          {query.message}
        </div>
      ) : null}
      <ModuleEditor
        action={updateModuleAction.bind(null, moduleId)}
        module={manualModule}
        submitLabel="Update module"
      />
    </AppShell>
  );
}
