import { AppShell } from "@/components/app-shell";
import {
  ButtonLink,
  Card,
  FieldLabel,
  PageHeader,
  SelectInput,
  TextInput,
} from "@/components/ui";
import { createEmployeeAction } from "./actions";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell mode="admin">
      <PageHeader
        title="Add employee"
        description="Create an employee account, assign business access, and set the employee's operational role."
      />

      <Card className="p-6">
        {params.message ? (
          <div className="mb-5 rounded-md border border-[#efd09a] bg-[#fff8e7] px-4 py-3 text-sm text-warning">
            {params.message}
          </div>
        ) : null}

        <form action={createEmployeeAction} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel>Full name</FieldLabel>
            <TextInput name="fullName" placeholder="Employee full name" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Email</FieldLabel>
            <TextInput name="email" placeholder="employee@example.com" type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Business</FieldLabel>
            <SelectInput name="business" defaultValue="yoo-clinic">
              <option value="yoo-clinic">YOO Clinic</option>
              <option value="ori-wellness">ORI Wellness Center</option>
              <option value="both">Both businesses</option>
            </SelectInput>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Operational role</FieldLabel>
            <SelectInput name="employeeRole" defaultValue="general-staff">
              <option value="general-staff">General Staff</option>
              <option value="front-desk">Front Desk / Admin Coordinator</option>
              <option value="nurse">Nurse</option>
              <option value="therapist">Therapist</option>
              <option value="doctor">Doctor / Medical Director</option>
              <option value="sales">Sales / Client Relations</option>
              <option value="manager">Manager / Supervisor</option>
            </SelectInput>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <FieldLabel>Temporary password</FieldLabel>
            <TextInput
              name="temporaryPassword"
              placeholder="Give this privately to the employee"
              type="password"
            />
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
              Create employee account
            </button>
            <ButtonLink href="/admin/employees" variant="secondary">
              Cancel
            </ButtonLink>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
