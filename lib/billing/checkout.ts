import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import { getAppBaseUrl } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { resolveStripePriceId } from "./resolve-stripe-price";
import { getStripe } from "./stripe-client";

export async function createStripeCheckoutSessionUrl(programSlug: string): Promise<string | null> {
  const stripe = getStripe();
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  if (!stripe || !user || !supabase) {
    return null;
  }

  const { data: program, error } = await supabase
    .from("programs")
    .select("id, slug, name, stripe_price_id")
    .eq("slug", programSlug)
    .eq("active", true)
    .maybeSingle();

  if (error || !program) {
    return null;
  }

  const priceId = resolveStripePriceId(program.slug, program.stripe_price_id);
  if (!priceId) {
    return null;
  }

  const origin = getAppBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/programs?checkout=ok`,
    cancel_url: `${origin}/upgrade?checkout=cancel`,
    metadata: {
      user_id: user.id,
      program_slug: program.slug,
    },
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
  });

  return session.url;
}
