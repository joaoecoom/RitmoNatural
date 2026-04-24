import { NextResponse } from "next/server";
import webpush from "web-push";

import { env, getAppBaseUrl, isWebPushServerConfigured } from "@/lib/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Chamada por Vercel Cron ou scheduler externo com header Authorization: Bearer CRON_SECRET */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const bearerOk = env.cronSecret && authHeader === `Bearer ${env.cronSecret}`;
  const queryOk = env.cronSecret && querySecret === env.cronSecret;

  if (!bearerOk && !queryOk) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  if (!isWebPushServerConfigured()) {
    return NextResponse.json({ error: "Web Push nao configurado." }, { status: 503 });
  }

  webpush.setVapidDetails(
    env.webPushSubject as string,
    env.webPushPublicKey as string,
    env.webPushPrivateKey as string,
  );

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin indisponivel." }, { status: 503 });
  }

  const { data: subs, error: subsError } = await admin.from("push_subscriptions").select("user_id, endpoint, p256dh, auth");

  if (subsError || !subs?.length) {
    return NextResponse.json({ sent: 0, message: subsError?.message ?? "Sem subscricoes." });
  }

  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const { data: settingsRows } = await admin
    .from("user_settings")
    .select("user_id, push_notifications")
    .in("user_id", userIds);

  const pushOn = new Set(
    (settingsRows ?? []).filter((r) => r.push_notifications).map((r) => r.user_id),
  );

  const baseUrl = getAppBaseUrl();
  let sent = 0;
  let failed = 0;

  for (const row of subs) {
    if (!pushOn.has(row.user_id)) {
      continue;
    }

    const subscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    };

    const payload = JSON.stringify({
      title: "Ritmo Natural",
      body: "Está na hora de perceber como o teu corpo acordou hoje.",
      data: { url: `${baseUrl}/check-in` },
    });

    try {
      await webpush.sendNotification(subscription, payload, { TTL: 3600 });
      sent += 1;
    } catch (e) {
      failed += 1;
      console.error("[CRON_PUSH]", row.endpoint.slice(0, 48), e);
    }
  }

  return NextResponse.json({ sent, failed, scanned: subs.length });
}
