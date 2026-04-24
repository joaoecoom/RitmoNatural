import { NextResponse } from "next/server";
import webpush from "web-push";

import { env, getAppBaseUrl, isWebPushServerConfigured } from "@/lib/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTodayDateLisbon } from "@/lib/utils/today-date";

export const runtime = "nodejs";

type ReminderType =
  | "checkin_morning"
  | "water_before_lunch"
  | "meal_log_after_lunch"
  | "voice_afternoon"
  | "sleep_routine";

function toHm(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }
  return value.slice(0, 5);
}

function plusMinutes(hm: string, delta: number): string {
  const [h, m] = hm.split(":").map((v) => Number(v));
  const total = h * 60 + m + delta;
  const day = 24 * 60;
  const normalized = ((total % day) + day) % day;
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function inWindow(nowHm: string, targetHm: string, windowMinutes = 14): boolean {
  const [nh, nm] = nowHm.split(":").map(Number);
  const [th, tm] = targetHm.split(":").map(Number);
  const n = nh * 60 + nm;
  const t = th * 60 + tm;
  return Math.abs(n - t) <= windowMinutes;
}

function getLisbonNowHm(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hh}:${mm}`;
}

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

  const { data: subs, error: subsError } = await admin
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth");

  if (subsError || !subs?.length) {
    return NextResponse.json({ sent: 0, message: subsError?.message ?? "Sem subscricoes." });
  }

  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const [
    { data: settingsRows },
    { data: schedules },
    { data: notificationSchedules },
    { data: prefs },
    { data: alreadySentToday },
  ] = await Promise.all([
      admin.from("user_settings").select("user_id, push_notifications").in("user_id", userIds),
      admin
        .from("user_schedule")
        .select("user_id, lunch_time, sleep_time, wake_time")
        .in("user_id", userIds),
      admin
        .from("notification_schedule")
        .select("user_id, checkin_time, water_time, meal_log_time, voice_time, sleep_time")
        .in("user_id", userIds),
      admin
        .from("notification_preferences")
        .select(
          "user_id, checkin_enabled, meal_reminders_enabled, voice_reminders_enabled, water_reminders_enabled, sleep_reminders_enabled",
        )
        .in("user_id", userIds),
      admin
        .from("notification_history")
        .select("user_id, type, created_at")
        .in("user_id", userIds)
        .gte("created_at", `${getTodayDateLisbon()}T00:00:00+00:00`),
    ]);

  const pushOn = new Set(
    (settingsRows ?? []).filter((r) => r.push_notifications).map((r) => r.user_id),
  );
  const scheduleByUser = new Map((schedules ?? []).map((s) => [s.user_id, s]));
  const notificationScheduleByUser = new Map(
    (notificationSchedules ?? []).map((s) => [s.user_id, s]),
  );
  const prefsByUser = new Map((prefs ?? []).map((p) => [p.user_id, p]));

  const sentByUserAndType = new Set(
    (alreadySentToday ?? []).map((h) => `${h.user_id}:${h.type}`),
  );
  const lisbonNowHm = getLisbonNowHm();

  const baseUrl = getAppBaseUrl();
  let sent = 0;
  let failed = 0;
  const notificationRows: Array<{
    user_id: string;
    title: string;
    body: string;
    type: string;
    scheduled_for: string;
    sent_at: string | null;
  }> = [];

  function buildCandidate(userId: string): {
    type: ReminderType;
    title: string;
    body: string;
    url: string;
  } | null {
    const sched = scheduleByUser.get(userId);
    const custom = notificationScheduleByUser.get(userId);
    const pref = prefsByUser.get(userId);

    const wake = toHm(sched?.wake_time, "07:00");
    const lunch = toHm(sched?.lunch_time, "13:00");
    const sleep = toHm(sched?.sleep_time, "23:00");
    const checkinTime = toHm(custom?.checkin_time, wake);
    const waterTime = toHm(custom?.water_time, plusMinutes(lunch, -20));
    const mealLogTime = toHm(custom?.meal_log_time, plusMinutes(lunch, 45));
    const voiceTime = toHm(custom?.voice_time, "16:00");
    const sleepRoutineTime = toHm(custom?.sleep_time, plusMinutes(sleep, -30));

    const candidates: Array<{
      type: ReminderType;
      time: string;
      enabled: boolean;
      title: string;
      body: string;
      url: string;
    }> = [
      {
        type: "checkin_morning",
        time: checkinTime,
        enabled: pref?.checkin_enabled ?? true,
        title: "Ritmo Natural",
        body: "Está na hora de perceber como o teu corpo acordou hoje.",
        url: `${baseUrl}/check-in`,
      },
      {
        type: "water_before_lunch",
        time: waterTime,
        enabled: pref?.water_reminders_enabled ?? true,
        title: "Ritmo Natural",
        body: "Antes do almoço: dá ao teu corpo um sinal de segurança com água.",
        url: `${baseUrl}/today`,
      },
      {
        type: "meal_log_after_lunch",
        time: mealLogTime,
        enabled: pref?.meal_reminders_enabled ?? true,
        title: "Ritmo Natural",
        body: "Regista a tua refeição sem culpa, só para entender o padrão.",
        url: `${baseUrl}/meals`,
      },
      {
        type: "voice_afternoon",
        time: voiceTime,
        enabled: pref?.voice_reminders_enabled ?? true,
        title: "A Voz",
        body: "A Voz tem uma orientação curta para ti.",
        url: `${baseUrl}/voice`,
      },
      {
        type: "sleep_routine",
        time: sleepRoutineTime,
        enabled: pref?.sleep_reminders_enabled ?? true,
        title: "Ritmo Natural",
        body: "Vamos fechar o dia com menos ruído interno.",
        url: `${baseUrl}/today`,
      },
    ];

    for (const c of candidates) {
      if (!c.enabled) {
        continue;
      }
      if (!inWindow(lisbonNowHm, c.time)) {
        continue;
      }
      if (sentByUserAndType.has(`${userId}:${c.type}`)) {
        continue;
      }
      return c;
    }

    return null;
  }

  for (const row of subs) {
    if (!pushOn.has(row.user_id)) {
      continue;
    }

    const subscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    };

    const candidate = buildCandidate(row.user_id);
    if (!candidate) {
      continue;
    }

    const payload = JSON.stringify({
      title: candidate.title,
      body: candidate.body,
      data: { url: candidate.url },
    });
    const nowIso = new Date().toISOString();
    const title = candidate.title;
    const body = candidate.body;

    try {
      await webpush.sendNotification(subscription, payload, { TTL: 3600 });
      sent += 1;
      sentByUserAndType.add(`${row.user_id}:${candidate.type}`);
      notificationRows.push({
        user_id: row.user_id,
        title,
        body,
        type: candidate.type,
        scheduled_for: nowIso,
        sent_at: nowIso,
      });
    } catch (e) {
      failed += 1;
      console.error("[CRON_PUSH]", row.endpoint.slice(0, 48), e);
      notificationRows.push({
        user_id: row.user_id,
        title,
        body,
        type: candidate.type,
        scheduled_for: nowIso,
        sent_at: null,
      });
    }
  }

  if (notificationRows.length > 0) {
    await admin.from("notification_history").insert(notificationRows);
  }

  return NextResponse.json({ sent, failed, scanned: subs.length });
}
