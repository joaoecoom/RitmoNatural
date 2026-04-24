import { createClient } from "@supabase/supabase-js";

import {
  getRequiredSupabaseAdminEnv,
  isSupabaseAdminConfigured,
} from "@/lib/config/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  const { url, serviceRoleKey } = getRequiredSupabaseAdminEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
