import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getRequiredSupabaseEnv, isSupabaseConfigured } from "@/lib/config/env";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getRequiredSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies during render.
        }
      },
    },
  });
}
