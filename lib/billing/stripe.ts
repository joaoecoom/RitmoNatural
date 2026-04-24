export interface SubscriptionPlanPreview {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
  status: "placeholder";
}

export function getSubscriptionPlansPreview(): SubscriptionPlanPreview[] {
  return [
    {
      id: "ritmo-natural-premium",
      name: "Ritmo Natural Premium",
      priceLabel: "Em breve",
      description:
        "Estrutura preparada para futura subscricao com Stripe, sem checkout ligado no MVP.",
      status: "placeholder",
    },
  ];
}

export async function createCheckoutPlaceholder() {
  return {
    ok: false,
    message: "Checkout Stripe ainda nao esta ativo neste MVP.",
  };
}
