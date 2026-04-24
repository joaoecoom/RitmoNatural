import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export interface AdminProfileRow {
  id: string;
  full_name: string | null;
  role: string;
  full_access: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

export interface AdminProfileListRow extends AdminProfileRow {
  email: string | null;
}

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];

export interface AdminUserProgramRow {
  program: Pick<ProgramRow, "id" | "name" | "slug" | "access_level" | "price_reference" | "sort_order">;
  accessStatus: "none" | "active" | "revoked" | "trial";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function listProfilesForAdmin(
  limit = 80,
  query?: string | null,
): Promise<AdminProfileListRow[]> {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return [];
  }

  const trimmed = query?.trim() ?? "";
  const needle = trimmed.toLowerCase();

  const { data: listData, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const emailById = new Map<string, string>();
  if (!listError && listData?.users) {
    for (const u of listData.users) {
      if (u.email) {
        emailById.set(u.id, u.email);
      }
    }
  }

  let filterIds: string[] | null = null;
  if (trimmed.includes("@")) {
    filterIds = (listData?.users ?? [])
      .filter((u) => u.email?.toLowerCase().includes(needle))
      .map((u) => u.id);
    if (filterIds.length === 0) {
      return [];
    }
  }

  let request = admin
    .from("profiles")
    .select("id, full_name, role, full_access, onboarding_completed, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filterIds) {
    request = request.in("id", filterIds);
  } else if (trimmed) {
    if (isUuid(trimmed)) {
      request = request.eq("id", trimmed);
    } else {
      request = request.ilike("full_name", `%${trimmed}%`);
    }
  }

  const { data, error } = await request;

  if (error || !data?.length) {
    return [];
  }

  return (data as AdminProfileRow[]).map((row) => ({
    ...row,
    email: emailById.get(row.id) ?? null,
  }));
}

export interface AdminUserDetail {
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  email: string | null;
  programs: AdminUserProgramRow[];
  recentCheckins: Pick<
    Database["public"]["Tables"]["daily_checkins"]["Row"],
    "id" | "stress_score" | "energy_score" | "created_at"
  >[];
  recentMeals: Pick<Database["public"]["Tables"]["meal_entries"]["Row"], "id" | "meal_text" | "created_at">[];
  mealsWithPhotoCount: number;
  notificationHistory: Pick<
    Database["public"]["Tables"]["notification_history"]["Row"],
    "id" | "title" | "type" | "sent_at" | "read_at" | "created_at"
  >[];
  notificationPreferences: Pick<
    Database["public"]["Tables"]["notification_preferences"]["Row"],
    | "checkin_enabled"
    | "meal_reminders_enabled"
    | "voice_reminders_enabled"
    | "water_reminders_enabled"
    | "sleep_reminders_enabled"
  > | null;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return null;
  }

  const [
    profileRes,
    authUserRes,
    programsRes,
    accessRes,
    checkinsRes,
    mealsRes,
    photoCountRes,
    notificationsRes,
    prefsRes,
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
    admin
      .from("programs")
      .select("id, name, slug, access_level, price_reference, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    admin.from("user_program_access").select("program_id, access_status").eq("user_id", userId),
    admin
      .from("daily_checkins")
      .select("id, stress_score, energy_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("meal_entries")
      .select("id, meal_text, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("meal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("image_url", "is", null),
    admin
      .from("notification_history")
      .select("id, title, type, sent_at, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("notification_preferences")
      .select(
        "checkin_enabled, meal_reminders_enabled, voice_reminders_enabled, water_reminders_enabled, sleep_reminders_enabled",
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const accessMap = new Map(
    (accessRes.data ?? []).map((a) => [a.program_id, a.access_status as string]),
  );

  const programs: AdminUserProgramRow[] = (programsRes.data ?? []).map((p) => {
    const raw = accessMap.get(p.id);
    let accessStatus: AdminUserProgramRow["accessStatus"] = "none";
    if (raw === "active" || raw === "revoked" || raw === "trial") {
      accessStatus = raw;
    }
    return { program: p, accessStatus };
  });

  return {
    profile: profileRes.data,
    email: authUserRes.data?.user?.email ?? null,
    programs,
    recentCheckins: (checkinsRes.data ?? []) as AdminUserDetail["recentCheckins"],
    recentMeals: (mealsRes.data ?? []) as AdminUserDetail["recentMeals"],
    mealsWithPhotoCount: photoCountRes.count ?? 0,
    notificationHistory: (notificationsRes.data ?? []) as AdminUserDetail["notificationHistory"],
    notificationPreferences: prefsRes.data ?? null,
  };
}
