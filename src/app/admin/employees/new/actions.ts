"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createEmployeeAction(formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const business = String(formData.get("business") ?? "");
  const employeeRole = String(formData.get("employeeRole") ?? "");
  const temporaryPassword = String(formData.get("temporaryPassword") ?? "");

  if (!fullName || !email || !business || !employeeRole || !temporaryPassword) {
    redirect("/admin/employees/new?message=All fields are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    redirect(`/admin/employees/new?message=${encodeURIComponent(error.message)}`);
  }

  const authUserId = data.user?.id;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let profileId = existingProfile?.id as string | undefined;

  if (!profileId && authUserId) {
    const { data: insertedProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        auth_user_id: authUserId,
        email,
        full_name: fullName,
        job_title: employeeRole,
      })
      .select("id")
      .single();

    if (profileError) {
      redirect(`/admin/employees/new?message=${encodeURIComponent(profileError.message)}`);
    }

    profileId = insertedProfile.id;
  }

  if (!profileId) {
    redirect("/admin/employees/new?message=Could not create or locate employee profile.");
  }

  const { data: employeeSystemRole } = await supabase
    .from("system_roles")
    .select("id")
    .eq("slug", "employee")
    .single();

  if (employeeSystemRole?.id) {
    await supabase
      .from("user_system_roles")
      .upsert({ user_id: profileId, system_role_id: employeeSystemRole.id });
  }

  const { data: employeeRoleRow } = await supabase
    .from("employee_roles")
    .select("id")
    .eq("slug", employeeRole)
    .single();

  const businessQuery = supabase.from("businesses").select("id").eq("is_active", true);
  const { data: businessRows } =
    business === "both"
      ? await businessQuery
      : await businessQuery.eq("slug", business);

  for (const businessRow of businessRows ?? []) {
    await supabase
      .from("user_businesses")
      .upsert({ user_id: profileId, business_id: businessRow.id });

    if (employeeRoleRow?.id) {
      await supabase.from("user_employee_roles").upsert({
        user_id: profileId,
        business_id: businessRow.id,
        employee_role_id: employeeRoleRow.id,
      });
    }
  }

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}
