import "server-only";

import Stripe from "stripe";

import { env } from "@/lib/config/env";

export function getStripe(): Stripe | null {
  if (!env.stripeSecretKey) {
    return null;
  }

  return new Stripe(env.stripeSecretKey, {
    typescript: true,
  });
}
