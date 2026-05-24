import { ShieldCheck } from "lucide-react";
import { Card, ButtonLink } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { claimOwnerAccessAction } from "./actions";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Initial owner setup
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use this once after creating the first account. It assigns owner
              and content admin permissions, links both businesses, and prepares
              the account to manage employees and modules.
            </p>
          </div>
        </div>

        {params.message ? (
          <div className="mt-5 rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
            {params.message}
          </div>
        ) : null}

        <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4 text-sm">
          <p className="font-semibold text-foreground">
            Signed in profile: {profile?.full_name ?? "Pending profile trigger"}
          </p>
          <p className="mt-1 text-muted">{profile?.email}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={claimOwnerAccessAction}>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
              Claim owner access
            </button>
          </form>
          <ButtonLink href="/dashboard" variant="secondary">
            Go to dashboard
          </ButtonLink>
        </div>
      </Card>
    </main>
  );
}
