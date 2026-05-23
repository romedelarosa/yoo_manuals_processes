import { AppShell } from "@/components/app-shell";
import { ModuleEditor } from "@/components/module-editor";
import { PageHeader } from "@/components/ui";
import { createModuleAction } from "./actions";

export default async function NewModulePage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Create module"
        description="Draft a lean lesson, checkpoint, acknowledgment, or process blueprint assignment."
      />
      {params?.message ? (
        <div className="rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
          {params.message}
        </div>
      ) : null}
      <ModuleEditor action={createModuleAction} />
    </AppShell>
  );
}
