const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(
    env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey,
  );
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
