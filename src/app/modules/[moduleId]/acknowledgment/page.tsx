import { notFound } from "next/navigation";
import { AcknowledgmentForm } from "@/components/acknowledgment-form";
import { AppShell } from "@/components/app-shell";
import { getModule } from "@/lib/database";

export default async function AcknowledgmentPage({
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
    <AppShell>
      <AcknowledgmentForm module={manualModule} />
    </AppShell>
  );
}
