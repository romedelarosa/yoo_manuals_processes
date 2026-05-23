"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function claimOwnerAccessAction() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("claim_initial_owner");

  if (error) {
    redirect(`/setup?message=${encodeURIComponent(error.message)}`);
  }

  if (!data) {
    redirect("/setup?message=Owner access has already been claimed.");
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
