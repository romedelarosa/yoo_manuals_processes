"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteModuleAction(moduleId: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("modules")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);

  if (error) {
    redirect(`/admin/modules?message=${encodeURIComponent(error.message)}`);
  }

  await Promise.all([
    supabase.from("module_businesses").delete().eq("module_id", moduleId),
    supabase.from("module_roles").delete().eq("module_id", moduleId),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath("/admin/reports");
  revalidatePath("/dashboard");
  revalidatePath(`/modules/${moduleId}`);
  redirect("/admin/modules?message=Module deleted from active use.");
}
