"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canClaimInitialOwner } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    redirect("/login?message=Email and password are required.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/dashboard");
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
