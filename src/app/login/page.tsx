import { LockKeyhole } from "lucide-react";
import { signInAction, signUpAction } from "./actions";
import { canClaimInitialOwner } from "@/lib/auth";
import { Card, FieldLabel, TextInput } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const ownerClaimAvailable = await canClaimInitialOwner();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LockKeyhole />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Sign in</h1>
              <p className="text-sm text-muted">Internal access only</p>
            </div>
          </div>

          {params.message ? (
            <div className="mt-5 rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
              {params.message}
            </div>
          ) : null}

          <form action={signInAction} className="mt-6 flex flex-col gap-4">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <div className="flex flex-col gap-2">
              <FieldLabel>Email</FieldLabel>
              <TextInput name="email" placeholder="you@company.com" type="email" />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Password</FieldLabel>
              <TextInput name="password" placeholder="Your password" type="password" />
            </div>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#0b4d3c]">
              Sign in
            </button>
          </form>
        </Card>

        {ownerClaimAvailable ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground">
              First owner setup
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Create the first account, then claim owner access on the setup
              page. After that, public registration closes and employee accounts
              must be created by an admin.
            </p>

            <form action={signUpAction} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <FieldLabel>Full name</FieldLabel>
                <TextInput name="fullName" placeholder="Owner full name" />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Email</FieldLabel>
                <TextInput name="email" placeholder="owner@company.com" type="email" />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Password</FieldLabel>
                <TextInput name="password" placeholder="Create a password" type="password" />
              </div>
              <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:border-primary">
                Create owner account
              </button>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Employee access
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Public registration is closed. Employees receive access only after
              an owner, admin, or manager creates their account and assigns the
              correct business and role.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
