import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { QuizForm } from "@/components/quiz-form";
import { ButtonLink, Card } from "@/components/ui";
import { demoEmployee, getModuleById, moduleMatchesUser } from "@/lib/access";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const manualModule = getModuleById(moduleId);

  if (!manualModule || !moduleMatchesUser(manualModule, demoEmployee)) {
    notFound();
  }

  if (!manualModule.quiz?.accessEnabled) {
    return (
      <AppShell>
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Checkpoint is not open yet
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            An admin or business manager has not opened this checkpoint for
            employees. You can review the lesson now and return once checkpoint
            access is enabled.
          </p>
          <div className="mt-5">
            <ButtonLink href={`/modules/${manualModule.id}`} variant="secondary">
              Back to module
            </ButtonLink>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <QuizForm module={manualModule} />
    </AppShell>
  );
}
