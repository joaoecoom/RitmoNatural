<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Credenciais

Valores secretos: `secrets/local.env` (gitignored; ver `secrets/README.md`) e/ou `.env.local`. O script `npm run db:apply` lê ambos; `secrets/local.env` sobrescreve chaves duplicadas.
