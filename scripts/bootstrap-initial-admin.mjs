/**
 * Cria utilizador Auth + perfil com role super_admin.
 * Variáveis (secrets/local.env ou .env.local):
 *   INITIAL_ADMIN_EMAIL
 *   INITIAL_ADMIN_PASSWORD
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso: node scripts/bootstrap-initial-admin.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  for (const name of [".env.local", "secrets/local.env"]) {
    const envPath = path.join(root, name);
    if (!fs.existsSync(envPath)) {
      continue;
    }
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.INITIAL_ADMIN_EMAIL;
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error(
    "Faltam variáveis: INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: listErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});

if (listErr) {
  console.error(listErr.message);
  process.exit(1);
}

const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

let userId = found?.id;

if (!userId) {
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Admin Ritmo" },
  });

  if (createErr || !created.user) {
    console.error(createErr?.message ?? "Falha ao criar utilizador.");
    process.exit(1);
  }

  userId = created.user.id;
  console.log("Utilizador Auth criado.");
} else {
  console.log("Utilizador Auth já existia.");
}

const { error: upErr } = await admin.from("profiles").upsert(
  {
    id: userId,
    full_name: "Admin Ritmo",
    role: "super_admin",
    full_access: true,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" },
);

if (upErr) {
  console.error("Perfil:", upErr.message);
  process.exit(1);
}

console.log("Perfil upsert: super_admin + full_access.");
console.log("Email:", email);
