"use server";

import { redirect } from "next/navigation";

import { createStripeCheckoutSessionUrl } from "@/lib/billing/checkout";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export async function startProgramCheckoutAction(formData: FormData): Promise<void> {
  await requireCompletedOnboarding();
  const slug = String(formData.get("program_slug") ?? "").trim();

  if (!slug) {
    redirect("/upgrade?checkout=erro");
  }

  const url = await createStripeCheckoutSessionUrl(slug);

  if (!url) {
    redirect("/upgrade?checkout=indisponivel");
  }

  redirect(url);
}
