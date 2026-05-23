import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col gap-7">
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LockKeyhole />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] text-foreground">
              Company Manual and Onboarding System
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted">
              A lean internal platform for YOO Clinic and ORI Wellness Center to
              assign role-based policies, short lessons, checkpoints,
              acknowledgments, and process blueprints.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/dashboard">
              Employee demo
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/admin" variant="secondary">
              Admin demo
            </ButtonLink>
          </div>
        </section>

        <Card className="p-6">
          <div className="rounded-lg bg-[#17211b] p-5 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck />
              <p className="font-semibold">MVP foundation</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/72">
              The current build uses seeded demo data and includes a
              Supabase-ready schema with RLS policies. It is structured so real
              authentication and database reads can replace demo data cleanly.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              "Secure login entry point",
              "Business and role-scoped modules",
              "Policy pages, quizzes, acknowledgments",
              "Service blueprint flowchart support",
              "Admin management and progress reports",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-4 py-3 text-sm"
              >
                <span>{item}</span>
                <span className="font-semibold text-primary">Ready</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
