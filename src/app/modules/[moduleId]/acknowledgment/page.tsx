import { notFound } from "next/navigation";
import { AcknowledgmentForm } from "@/components/acknowledgment-form";
import { AppShell } from "@/components/app-shell";
import { demoEmployee, getModuleById, moduleMatchesUser } from "@/lib/access";

export default async function AcknowledgmentPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const manualModule = getModuleById(moduleId);

  if (!manualModule || !moduleMatchesUser(manualModule, demoEmployee)) {
    notFound();
  }

  return (
    <AppShell>
      <AcknowledgmentForm module={manualModule} />
    </AppShell>
  );
}
