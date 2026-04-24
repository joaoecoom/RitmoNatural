const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  webPushPublicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
  webPushPrivateKey: process.env.WEB_PUSH_PRIVATE_KEY,
  webPushSubject: process.env.WEB_PUSH_SUBJECT,
  cronSecret: process.env.CRON_SECRET,
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(
    env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey,
  );
}

export function isOpenAiTtsConfigured() {
  return Boolean(env.openaiApiKey);
}

export function isWebPushServerConfigured() {
  return Boolean(
    env.webPushPublicKey && env.webPushPrivateKey && env.webPushSubject,
  );
}

/** URL pública da app (Stripe redirects, links absolutos). */
export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}

export function getRequiredSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase nao configurado. Preenche NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: env.supabaseUrl as string,
    anonKey: env.supabaseAnonKey as string,
  };
}

export function getRequiredSupabaseAdminEnv() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      "Supabase admin nao configurado. Preenche SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url: env.supabaseUrl as string,
    anonKey: env.supabaseAnonKey as string,
    serviceRoleKey: env.supabaseServiceRoleKey as string,
  };
}

export { env };
