# Credenciais locais (não vão para o Git)

Esta pasta guarda **valores secretos** só na tua máquina. O Git ignora tudo aqui **exceto** este `README.md` e o modelo `local.env.example`.

## O que fazer uma vez

1. Copia o modelo: `cp secrets/local.env.example secrets/local.env`
2. Preenche `secrets/local.env` com as chaves reais (password da base, etc.).
3. Mantém também `.env.local` com o que o Next.js precisa em runtime **ou** duplica as mesmas variáveis em `secrets/local.env` — este ficheiro **sobrescreve** chaves iguais em `.env.local` quando usas scripts como `npm run db:apply`.

## O que o assistente costuma precisar

| Necessidade | Variável / onde obter |
|-------------|------------------------|
| App Next.js + Supabase cliente | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Dashboard → Settings → API) |
| Ações servidor privilegiadas | `SUPABASE_SERVICE_ROLE_KEY` (mesmo sítio; **nunca** expor no browser) |
| Migrações SQL (`npm run db:apply`) | `SUPABASE_DB_PASSWORD` **ou** `DATABASE_URL` completo (Settings → **Database**, não são as API keys) |
| IA (refeições, voz, etc.) | `OPENROUTER_API_KEY` |
| Pagamentos | chaves Stripe em `.env.example` |

## Segurança

- **Não** commits `local.env`, screenshots com keys, nem pastas de backup com passwords dentro do repo.
- Se algo com segredos foi partilhado por engano, **roda** as chaves no Supabase / Stripe / OpenRouter.
