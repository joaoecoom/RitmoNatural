/**
 * Aplica ficheiros SQL em supabase/migrations/ à base Postgres do projeto Supabase.
 *
 * Lê variáveis de .env.local e depois de secrets/local.env (este sobrescreve).
 * Requer uma destas opções:
 * - DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
 * - SUPABASE_DB_PASSWORD=... (e NEXT_PUBLIC_SUPABASE_URL para montar o host)
 *
 * A password é a "Database password" em Supabase Dashboard → Project Settings → Database.
 * Não uses a anon key nem a service_role key como password.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

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
    if (overwrite || process.env[key] === undefined) {
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

loadProjectEnv();

const connectionString = buildDatabaseUrl();

if (!connectionString) {
  console.error(
    "Falta configurar a base de dados. Adiciona a .env.local ou secrets/local.env:\n" +
      "  SUPABASE_DB_PASSWORD=<password da base em Supabase → Settings → Database>\n" +
      "ou coloca DATABASE_URL completo (URI Postgres).\n" +
      "  Ver secrets/README.md\n",
  );
  process.exit(1);
}

const migrationsDir = path.join(root, "supabase", "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("Nenhum ficheiro .sql em supabase/migrations/");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, "utf8");
    process.stdout.write(`A aplicar ${file}... `);
    await client.query(sql);
    process.stdout.write("ok\n");
  }
} finally {
  await client.end();
}

console.log("Migracoes concluidas.");
