import { redirect } from "next/navigation";
import { getSignedInHomePath } from "@/lib/access";
import { getCurrentProfile, getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();
  const roleRows = (profile?.user_system_roles ?? []) as Array<{
    system_roles?: { slug?: string } | null;
  }>;

  redirect(getSignedInHomePath(roleRows.map((row) => row.system_roles?.slug)));
}
