import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getRequiredSupabaseEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const body = (await request.json()) as { endpoint?: string };
  const endpoint = body.endpoint;

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint em falta." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getRequiredSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticada." }, { status: 401 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
