"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canClaimInitialOwner } from "@/lib/auth";
import { getSignedInHomePath } from "@/lib/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    redirect("/login?message=Email and password are required.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  if (next.startsWith("/") && next !== "/dashboard") {
    redirect(next);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_system_roles(system_roles(slug))")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  const roleRows = (profile?.user_system_roles ?? []) as Array<{
    system_roles?: { slug?: string } | null;
  }>;
  redirect(getSignedInHomePath(roleRows.map((row) => row.system_roles?.slug)));
}

export async function signUpAction(formData: FormData) {
  const ownerClaimAvailable = await canClaimInitialOwner();

  if (!ownerClaimAvailable) {
    redirect("/login?message=Public registration is closed. Ask an admin or manager to create your employee account.");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    redirect("/login?message=Name, email, and password are required for signup.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  if (!data.session) {
    redirect("/login?message=Account created. Check your email if confirmation is enabled, then sign in.");
  }

  redirect("/setup?message=Account created. Claim owner access if this is the first account.");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
