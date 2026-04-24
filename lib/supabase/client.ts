import { createBrowserClient } from "@supabase/ssr";

import { getRequiredSupabaseEnv, isSupabaseConfigured } from "@/lib/config/env";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    const { url, anonKey } = getRequiredSupabaseEnv();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
