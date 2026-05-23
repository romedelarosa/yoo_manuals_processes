"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSystemRole, requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateEmployeeAccessAction(
  employeeId: string,
  formData: FormData,
) {
  const adminProfile = await requireAdmin();
  const canManageSystemRoles = hasSystemRole(adminProfile, "super-admin");
  const supabase = createSupabaseAdminClient();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const status = String(formData.get("status") ?? "active");
  const businessSlugs = formData.getAll("businessIds").map(String).filter(Boolean);
  const employeeRoleSlugs = formData
    .getAll("employeeRoleIds")
    .map(String)
    .filter(Boolean);
  const systemRoleSlugs = formData
    .getAll("systemRoleIds")
    .map(String)
    .filter(Boolean);

  if (!fullName || !jobTitle) {
    redirect(
      `/admin/employees/${employeeId}/edit?message=Full name and job title are required.`,
    );
  }

  if (businessSlugs.length === 0 || employeeRoleSlugs.length === 0) {
    redirect(
      `/admin/employees/${employeeId}/edit?message=Select at least one business and one operational role.`,
    );
  }

  await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      job_title: jobTitle,
      status: status === "inactive" ? "inactive" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", employeeId);

  const [{ data: businesses }, { data: employeeRoles }] = await Promise.all([
    supabase.from("businesses").select("id,slug").in("slug", businessSlugs),
    supabase.from("employee_roles").select("id,slug").in("slug", employeeRoleSlugs),
  ]);

  await Promise.all([
    supabase.from("user_employee_roles").delete().eq("user_id", employeeId),
    supabase.from("user_businesses").delete().eq("user_id", employeeId),
  ]);

  if (businesses?.length) {
    await supabase.from("user_businesses").insert(
      businesses.map((business) => ({
        user_id: employeeId,
        business_id: business.id,
      })),
    );
  }

  if (businesses?.length && employeeRoles?.length) {
    await supabase.from("user_employee_roles").insert(
      businesses.flatMap((business) =>
        employeeRoles.map((role) => ({
          user_id: employeeId,
          business_id: business.id,
          employee_role_id: role.id,
        })),
      ),
    );
  }

  if (canManageSystemRoles) {
    const finalSystemRoleSlugs = new Set(systemRoleSlugs);
    finalSystemRoleSlugs.add("employee");

    if (adminProfile?.id === employeeId && hasSystemRole(adminProfile, "super-admin")) {
      finalSystemRoleSlugs.add("super-admin");
    }

    const { data: systemRoles } = await supabase
      .from("system_roles")
      .select("id,slug")
      .in("slug", Array.from(finalSystemRoleSlugs));

    await supabase.from("user_system_roles").delete().eq("user_id", employeeId);

    if (systemRoles?.length) {
      await supabase.from("user_system_roles").insert(
        systemRoles.map((role) => ({
          user_id: employeeId,
          system_role_id: role.id,
        })),
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/employees");
  revalidatePath("/admin/reports");
  revalidatePath("/dashboard");
  redirect("/admin/employees");
}
