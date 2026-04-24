"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function adminClientOrThrow() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin nao configurado.");
  }
  return admin;
}

export async function adminSetFullAccessAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  const nextRaw = String(formData.get("next") ?? "");
  if (!userId) {
    return;
  }
  const next = nextRaw === "true";
  const admin = adminClientOrThrow();
  const { error } = await admin.from("profiles").update({ full_access: next }).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
  revalidatePath("/programs");
}

export async function adminGrantProgramAction(formData: FormData): Promise<void> {
  const actor = await requireSuperAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  const programId = String(formData.get("programId") ?? "").trim();
  if (!userId || !programId) {
    return;
  }
  const admin = adminClientOrThrow();
  const { error } = await admin.from("user_program_access").upsert(
    {
      user_id: userId,
      program_id: programId,
      access_status: "active",
      granted_by: `super_admin:${actor.id}`,
    },
    { onConflict: "user_id,program_id" },
  );
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/programs");
}

export async function adminRevokeProgramAction(formData: FormData): Promise<void> {
  const actor = await requireSuperAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  const programId = String(formData.get("programId") ?? "").trim();
  if (!userId || !programId) {
    return;
  }
  const admin = adminClientOrThrow();
  const { error } = await admin
    .from("user_program_access")
    .update({
      access_status: "revoked",
      granted_by: `super_admin_revoke:${actor.id}`,
    })
    .eq("user_id", userId)
    .eq("program_id", programId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/programs");
}
