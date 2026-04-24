import "server-only";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";
import type { Profile } from "@/types/domain";

export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "super_admin") {
    redirect("/today");
  }

  return profile;
}

export async function isSuperAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "super_admin";
}
