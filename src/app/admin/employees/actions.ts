"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSystemRole, requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function deleteEmployeeAction(employeeId: string) {
  const adminProfile = await requireAdmin();

  if (adminProfile?.id === employeeId) {
    redirect("/admin/employees?message=You cannot delete your own active access.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, user_system_roles(system_roles(slug))")
    .eq("id", employeeId)
    .maybeSingle();

  if (!targetProfile) {
    redirect("/admin/employees?message=Employee not found.");
  }

  const targetRoles = (targetProfile.user_system_roles ?? []) as Array<{
    system_roles?: { slug?: string } | null;
  }>;
  const targetIsSuperAdmin = targetRoles.some(
    (row) => row.system_roles?.slug === "super-admin",
  );

  if (targetIsSuperAdmin && !hasSystemRole(adminProfile, "super-admin")) {
    redirect("/admin/employees?message=Only a super admin can delete another super admin.");
  }

  await Promise.all([
    supabase.from("user_employee_roles").delete().eq("user_id", employeeId),
    supabase.from("user_businesses").delete().eq("user_id", employeeId),
    supabase.from("user_system_roles").delete().eq("user_id", employeeId),
  ]);

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("id", employeeId);

  if (error) {
    redirect(`/admin/employees?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/employees");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/roles");
  revalidatePath("/dashboard");
  redirect("/admin/employees?message=Employee deleted from active use.");
}
