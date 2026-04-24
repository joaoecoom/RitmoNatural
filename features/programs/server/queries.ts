import "server-only";

import { resolveStripePriceId } from "@/lib/billing/resolve-stripe-price";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProgramWithAccess {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  access_level: string;
  price_reference: string | null;
  stripe_price_id: string | null;
  has_access: boolean;
  /** Checkout Stripe disponivel (preco na BD ou env) e sem acesso ainda. */
  can_checkout: boolean;
}

export async function getProgramsForUser(userId: string): Promise<ProgramWithAccess[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const [{ data: programs }, { data: access }, { data: profile }] = await Promise.all([
    supabase.from("programs").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase
      .from("user_program_access")
      .select("program_id")
      .eq("user_id", userId)
      .eq("access_status", "active"),
    supabase.from("profiles").select("full_access").eq("id", userId).maybeSingle(),
  ]);

  const fullUnlock = profile?.full_access === true;
  const accessSet = new Set((access ?? []).map((a) => a.program_id));

  return (programs ?? []).map((p) => {
    const hasAccess = fullUnlock || accessSet.has(p.id);
    const stripePriceId = p.stripe_price_id ?? null;
    const resolvedPrice = resolveStripePriceId(p.slug, stripePriceId);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      access_level: p.access_level,
      price_reference: p.price_reference,
      stripe_price_id: stripePriceId,
      has_access: hasAccess,
      can_checkout: !hasAccess && Boolean(resolvedPrice),
    };
  });
}
