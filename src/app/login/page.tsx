import { LockKeyhole } from "lucide-react";
import { ButtonLink, Card, FieldLabel, TextInput } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LockKeyhole />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted">Internal access only</p>
          </div>
        </div>

        <form className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Email</FieldLabel>
            <TextInput defaultValue="mika.santos@example.com" type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Password</FieldLabel>
            <TextInput defaultValue="demo-password" type="password" />
          </div>
          <ButtonLink href="/dashboard">Continue as employee demo</ButtonLink>
          <ButtonLink href="/admin" variant="secondary">
            Continue as owner demo
          </ButtonLink>
        </form>

        <p className="mt-5 text-xs leading-5 text-muted">
          This is a prototype login screen. Production auth is wired through
          Supabase Auth using the helpers in <code>src/lib/supabase</code>.
        </p>
      </Card>
    </main>
  );
}
