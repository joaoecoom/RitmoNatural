"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileActionState {
  success: boolean;
  message: string;
}

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { user } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase nao configurado.",
    };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const ageValue = String(formData.get("age") ?? "").trim();
  const primaryGoal = String(formData.get("primary_goal") ?? "").trim();
  const lifePhase = String(formData.get("life_phase") ?? "none").trim();
  const avatarFile = formData.get("avatar_file");

  if (fullName.length < 2) {
    return {
      success: false,
      message: "Indica um nome com pelo menos 2 caracteres.",
    };
  }

  const age = ageValue ? Number(ageValue) : null;

  if (age !== null && (Number.isNaN(age) || age < 18 || age > 90)) {
    return {
      success: false,
      message: "A idade deve estar entre 18 e 90.",
    };
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  let avatarPath = currentProfile?.avatar_url ?? null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const extension = avatarFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await avatarFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, buffer, {
        contentType: avatarFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: uploadError.message,
      };
    }

    avatarPath = filePath;
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    avatar_url: avatarPath,
    age,
    primary_goal: primaryGoal || null,
    life_phase: lifePhase || null,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/profile");
  revalidatePath("/today");
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return {
    success: true,
    message: "Perfil atualizado com sucesso.",
  };
}
