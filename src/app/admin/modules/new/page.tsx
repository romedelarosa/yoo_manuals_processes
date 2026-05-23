import { AppShell } from "@/components/app-shell";
import { ModuleEditor } from "@/components/module-editor";
import { PageHeader } from "@/components/ui";

export default function NewModulePage() {
  return (
    <AppShell mode="admin">
      <PageHeader
        title="Create module"
        description="Draft a lean lesson, checkpoint, acknowledgment, or process blueprint assignment."
      />
      <ModuleEditor />
    </AppShell>
  );
}
