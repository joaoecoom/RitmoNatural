/**
 * Gera chaves VAPID para Web Push.
 *
 * Uso:
 *   npm run push:vapid
 *   npm run push:vapid -- --write
 *
 * --write:
 *   acrescenta as chaves em secrets/local.env (sem sobrescrever linhas já existentes).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import webpush from "web-push";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const shouldWrite = process.argv.includes("--write");

const keys = webpush.generateVAPIDKeys();

const snippet = [
  `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=${keys.publicKey}`,
  `WEB_PUSH_PRIVATE_KEY=${keys.privateKey}`,
  "WEB_PUSH_SUBJECT=mailto:contacto@teudominio.pt",
].join("\n");

console.log("\n=== VAPID Keys ===\n");
console.log(snippet);
console.log("");

if (!shouldWrite) {
  console.log("Dica: usa --write para guardar em secrets/local.env automaticamente.");
  process.exit(0);
}

const target = path.join(root, "secrets", "local.env");
const exists = fs.existsSync(target);
const current = exists ? fs.readFileSync(target, "utf8") : "";

const lines = current.split("\n");
const hasPublic = lines.some((l) => l.trim().startsWith("NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY="));
const hasPrivate = lines.some((l) => l.trim().startsWith("WEB_PUSH_PRIVATE_KEY="));
const hasSubject = lines.some((l) => l.trim().startsWith("WEB_PUSH_SUBJECT="));

const out = [...lines];
if (!hasPublic) out.push(`NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=${keys.publicKey}`);
if (!hasPrivate) out.push(`WEB_PUSH_PRIVATE_KEY=${keys.privateKey}`);
if (!hasSubject) out.push("WEB_PUSH_SUBJECT=mailto:contacto@teudominio.pt");

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${out.join("\n").replace(/\n+$/g, "")}\n`, "utf8");

console.log(`Gravado em ${target}`);
