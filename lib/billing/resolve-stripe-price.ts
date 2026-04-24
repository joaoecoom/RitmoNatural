import "server-only";

let cachedOverrides: Record<string, string> | null = null;

function loadEnvPriceOverrides(): Record<string, string> {
  if (cachedOverrides) {
    return cachedOverrides;
  }
  const raw = process.env.STRIPE_PROGRAM_PRICE_IDS?.trim();
  if (!raw) {
    cachedOverrides = {};
    return cachedOverrides;
  }
  try {
    cachedOverrides = JSON.parse(raw) as Record<string, string>;
  } catch {
    cachedOverrides = {};
  }
  return cachedOverrides;
}

/** JSON em STRIPE_PROGRAM_PRICE_IDS: { "protocolo-7-dias": "price_xxx" } tem prioridade sobre a coluna na BD. */
export function resolveStripePriceId(slug: string, dbPriceId: string | null | undefined): string | null {
  const fromEnv = loadEnvPriceOverrides()[slug]?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const fromDb = dbPriceId?.trim();
  return fromDb || null;
}
