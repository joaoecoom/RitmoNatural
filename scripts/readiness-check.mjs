/**
 * Readiness check rápido para produção.
 *
 * Verifica:
 * - envs críticos (Supabase, IA/TTS, Push, cron, Stripe)
 * - estado da base de dados (tabelas/colunas-chave)
 * - presença de admin inicial por email (se definido)
 *
 * Uso:
 *   npm run readiness
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function applyEnvLines(content, overwrite) {
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) {
      continue;
    }
    const i = t.indexOf("=");
    if (i <= 0) {
      continue;
    }
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (overwrite || process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

function loadProjectEnv() {
  const envLocal = path.join(root, ".env.local");
  if (fs.existsSync(envLocal)) {
    applyEnvLines(fs.readFileSync(envLocal, "utf8"), false);
  }
  const secretsEnv = path.join(root, "secrets", "local.env");
  if (fs.existsSync(secretsEnv)) {
    applyEnvLines(fs.readFileSync(secretsEnv, "utf8"), true);
  }
}

function bool(v) {
  return Boolean(v && String(v).trim().length > 0);
}

function logCheck(name, ok, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`[${status}] ${name}${suffix}`);
}

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!base || !password) {
    return null;
  }
  let host;
  try {
    host = new URL(base).hostname;
  } catch {
    return null;
  }
  const ref = host.split(".")[0];
  const enc = encodeURIComponent(password);
  return `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`;
}

async function checkDbObjects(connectionString) {
  if (!connectionString) {
    return { ok: false, reason: "DATABASE_URL/SUPABASE_DB_PASSWORD ausente." };
  }
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const tables = [
      "daily_journey",
      "daily_tasks",
      "goals",
      "user_schedule",
      "notification_preferences",
      "notification_history",
      "programs",
      "user_program_access",
      "push_subscriptions",
    ];
    const missing = [];
    for (const t of tables) {
      const r = await client.query(
        `select 1 from information_schema.tables where table_schema = 'public' and table_name = $1`,
        [t],
      );
      if (r.rowCount === 0) {
        missing.push(t);
      }
    }

    const colPrograms = await client.query(
      `select 1 from information_schema.columns
       where table_schema='public' and table_name='programs' and column_name='stripe_price_id'`,
    );
    const colProfilesRole = await client.query(
      `select 1 from information_schema.columns
       where table_schema='public' and table_name='profiles' and column_name='role'`,
    );
    const colProfilesFull = await client.query(
      `select 1 from information_schema.columns
       where table_schema='public' and table_name='profiles' and column_name='full_access'`,
    );

    const ok =
      missing.length === 0 &&
      colPrograms.rowCount > 0 &&
      colProfilesRole.rowCount > 0 &&
      colProfilesFull.rowCount > 0;

    return {
      ok,
      reason: ok
        ? "Estrutura principal encontrada."
        : `Faltas: ${[
            ...missing,
            colPrograms.rowCount > 0 ? null : "programs.stripe_price_id",
            colProfilesRole.rowCount > 0 ? null : "profiles.role",
            colProfilesFull.rowCount > 0 ? null : "profiles.full_access",
          ]
            .filter(Boolean)
            .join(", ")}`,
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Erro ao validar DB.",
    };
  } finally {
    await client.end().catch(() => {});
  }
}

async function checkAdminSeed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const initial = process.env.INITIAL_ADMIN_EMAIL;

  if (!url || !service) {
    return { ok: false, reason: "SUPABASE admin env ausente." };
  }
  if (!initial) {
    return { ok: false, reason: "INITIAL_ADMIN_EMAIL não definido." };
  }

  try {
    const admin = createClient(url, service, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      return { ok: false, reason: error.message };
    }
    const found = (data?.users ?? []).find(
      (u) => u.email?.toLowerCase() === initial.toLowerCase(),
    );
    return {
      ok: Boolean(found),
      reason: found ? "Admin encontrado em auth.users." : "Admin não encontrado.",
    };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Erro no check admin." };
  }
}

loadProjectEnv();

console.log("\n=== Ritmo Natural Readiness Check ===\n");

const envChecks = [
  ["Supabase URL", bool(process.env.NEXT_PUBLIC_SUPABASE_URL)],
  ["Supabase anon key", bool(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
  ["Supabase service role", bool(process.env.SUPABASE_SERVICE_ROLE_KEY)],
  ["OpenRouter (texto Voz)", bool(process.env.OPENROUTER_API_KEY)],
  ["OpenAI TTS (áudio Voz)", bool(process.env.OPENAI_API_KEY)],
  ["Web push public key", bool(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY)],
  ["Web push private key", bool(process.env.WEB_PUSH_PRIVATE_KEY)],
  ["Web push subject", bool(process.env.WEB_PUSH_SUBJECT)],
  ["Cron secret", bool(process.env.CRON_SECRET)],
  ["App base URL", bool(process.env.NEXT_PUBLIC_APP_URL)],
  ["Stripe secret key", bool(process.env.STRIPE_SECRET_KEY)],
  ["Stripe webhook secret", bool(process.env.STRIPE_WEBHOOK_SECRET)],
];

for (const [name, ok] of envChecks) {
  logCheck(name, ok);
}

console.log("\n--- Database ---");
const dbResult = await checkDbObjects(buildDatabaseUrl());
logCheck("Schema principal", dbResult.ok, dbResult.reason);

console.log("\n--- Admin ---");
const adminResult = await checkAdminSeed();
logCheck("Initial admin", adminResult.ok, adminResult.reason);

const hardRequired =
  bool(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  bool(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  dbResult.ok;

console.log("\n--- Resultado ---");
if (hardRequired) {
  console.log("Base funcional pronta. Itens em FAIL acima são pendências de integração opcional.");
} else {
  console.log("Ainda não pronto: corrigir FAILs obrigatórios (Supabase + schema).");
  process.exitCode = 1;
}

