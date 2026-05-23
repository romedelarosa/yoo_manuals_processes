import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "./supabase/server";

export async function getSessionUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getSessionUser();

  if (!user && isSupabaseConfigured()) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentProfile() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      `
      *,
      user_businesses(businesses(id, slug, name)),
      user_system_roles(system_roles(id, slug, name)),
      user_employee_roles(businesses(id, slug, name), employee_roles(id, slug, name))
    `,
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data;
}

export function hasSystemRole(
  profile: Awaited<ReturnType<typeof getCurrentProfile>>,
  roleSlug: string,
) {
  const roleRows = (profile?.user_system_roles ?? []) as Array<{
    system_roles?: { slug?: string } | null;
  }>;

  return roleRows.some((row) => row.system_roles?.slug === roleSlug);
}

export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const profile = await getCurrentProfile();

  if (
    !profile ||
    (!hasSystemRole(profile, "super-admin") &&
      !hasSystemRole(profile, "business-admin") &&
      !hasSystemRole(profile, "content-admin"))
  ) {
    redirect("/setup?message=Admin access is required. Claim owner access if this is the first account.");
  }

  return profile;
}

export async function canClaimInitialOwner() {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("can_claim_initial_owner");

  if (error) {
    return false;
  }

  return Boolean(data);
}
