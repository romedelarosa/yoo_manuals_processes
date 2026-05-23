import { AppShell } from "@/components/app-shell";
import {
  ButtonLink,
  Card,
  FieldLabel,
  PageHeader,
  SelectInput,
  TextInput,
} from "@/components/ui";

export default function NewEmployeePage() {
  return (
    <AppShell mode="admin">
      <PageHeader
        title="Add employee"
        description="Create a profile, then assign businesses and roles. Supabase Auth invitation wiring is the next production step."
      />

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel>Full name</FieldLabel>
            <TextInput placeholder="Employee full name" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Email</FieldLabel>
            <TextInput placeholder="employee@example.com" type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Business</FieldLabel>
            <SelectInput defaultValue="YOO Clinic">
              <option>YOO Clinic</option>
              <option>ORI Wellness Center</option>
              <option>Both businesses</option>
            </SelectInput>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Operational role</FieldLabel>
            <SelectInput defaultValue="General Staff">
              <option>General Staff</option>
              <option>Front Desk / Admin Coordinator</option>
              <option>Nurse</option>
              <option>Therapist</option>
              <option>Doctor / Medical Director</option>
              <option>Sales / Client Relations</option>
              <option>Manager / Supervisor</option>
            </SelectInput>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/admin/employees">Save demo employee</ButtonLink>
          <ButtonLink href="/admin/employees" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </Card>
    </AppShell>
  );
}
