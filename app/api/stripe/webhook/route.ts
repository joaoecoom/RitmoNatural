import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripe } from "@/lib/billing/stripe-client";
import { env } from "@/lib/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = env.stripeWebhookSecret;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook nao configurado." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Sem assinatura." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE]", err);
    return NextResponse.json({ error: "Assinatura invalida." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const programSlug = session.metadata?.program_slug;

  if (!userId || !programSlug) {
    console.error("[STRIPE_WEBHOOK_METADATA]", { userId, programSlug });
    return NextResponse.json({ error: "Metadata em falta." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client indisponivel." }, { status: 503 });
  }

  const { data: program, error: programError } = await admin
    .from("programs")
    .select("id")
    .eq("slug", programSlug)
    .maybeSingle();

  if (programError || !program) {
    console.error("[STRIPE_WEBHOOK_PROGRAM]", programSlug, programError);
    return NextResponse.json({ error: "Programa desconhecido." }, { status: 400 });
  }

  const { error: upsertError } = await admin.from("user_program_access").upsert(
    {
      user_id: userId,
      program_id: program.id,
      access_status: "active",
      granted_by: `stripe:${session.id}`,
    },
    { onConflict: "user_id,program_id" },
  );

  if (upsertError) {
    console.error("[STRIPE_WEBHOOK_UPSERT]", upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
