import "server-only";

import { getStripe } from "./stripe-client";

export interface SubscriptionPlanPreview {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
  status: "live" | "placeholder";
}

export function getSubscriptionPlansPreview(): SubscriptionPlanPreview[] {
  const hasStripe = Boolean(getStripe() && process.env.STRIPE_WEBHOOK_SECRET);

  return [
    {
      id: "ritmo-natural-premium",
      name: "Ritmo Natural — protocolos extra",
      priceLabel: hasStripe ? "Ver programas com preço" : "Configura Stripe",
      description:
        "Checkout Stripe ativo quando STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET e Price IDs (BD ou STRIPE_PROGRAM_PRICE_IDS) estiverem definidos.",
      status: hasStripe ? "live" : "placeholder",
    },
  ];
}

export { createStripeCheckoutSessionUrl } from "./checkout";
