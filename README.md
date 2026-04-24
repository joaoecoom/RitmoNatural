# Ritmo Natural

MVP em `Next.js` para um produto de emagrecimento feminino com linguagem emocional, leve e guiada.

## Stack

- `Next.js` com `App Router`
- `TypeScript`
- `Tailwind CSS`
- `Supabase` para auth, base de dados e storage
- `OpenRouter` (texto), `OpenAI` (TTS opcional), `Stripe` (checkout + webhook), Web Push + cron de lembretes

## Estrutura

```text
app/
components/
features/
hooks/
lib/
supabase/
types/
```

## Funcionalidades do MVP

### Fase 1

- auth com email/password via Supabase
- protecao de rotas com `proxy.ts`
- onboarding multi-step
- dashboard base com estado do corpo, A Voz, ajustes e acoes rapidas
- schema SQL completo em `supabase/schema.sql`

### Fase 2

- check-in diario
- registo de refeicoes com texto e upload de foto
- secao `A Voz`
- ecra de progresso simples

### Fase 3

- refinamento visual premium e leve
- organizacao por features
- placeholders futuros para `OpenRouter` e `Stripe`

## Setup

1. Instala dependencias:

```bash
npm install
```

2. Copia o ambiente:

```bash
cp .env.example .env.local
```

3. Preenche as variaveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY` (texto da Voz / refeições)
- `OPENAI_API_KEY` (opcional — áudio MP3 nas mensagens da Voz)
- `NEXT_PUBLIC_APP_URL` (URL pública; em Vercel podes omitir se usares o domínio automático)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PROGRAM_PRICE_IDS` (JSON slug → price_id) ou preenche `programs.stripe_price_id` na BD
- Web Push: `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_SUBJECT` (ex.: mailto:…)
- `CRON_SECRET` — protege `GET /api/cron/daily-reminders` (Vercel Cron envia `Authorization: Bearer` quando defines `CRON_SECRET` no projeto)

4. No painel do Supabase:

- cria um projeto
- ativa auth com `email/password`
- abre o SQL editor
- executa o ficheiro `supabase/schema.sql`

5. Corre localmente:

```bash
npm run dev
```

## Notas de implementacao

- o auth esta preparado com `@supabase/ssr`
- as buckets esperadas sao `meal-photos`, `voice-audio` e `profile-photos`
- sem `OPENROUTER_API_KEY`, a Voz e as leituras de refeição usam texto mock em `lib/ai`
- **Stripe**: `POST /api/stripe/webhook` — configura o endpoint no Stripe com o mesmo `STRIPE_WEBHOOK_SECRET`; apos `checkout.session.completed` concede `user_program_access`
- **Web Push**: `public/sw.js` + registo em Definições (notificações push); cron em `vercel.json` chama `/api/cron/daily-reminders` às 07:00 UTC
- o MVP evita linguagem de calorias, macros e treino como centro visual

## Scripts úteis de produção

- `npm run readiness` — checklist automático (env + schema + admin seed).
- `npm run push:vapid` — gera chaves VAPID para Web Push.
- `npm run push:vapid -- --write` — grava VAPID em `secrets/local.env` (sem sobrescrever entradas existentes).

## Proximo passo natural

Depois de ligares o Supabase, o fluxo recomendado e:

1. criar conta
2. completar onboarding
3. abrir dashboard
4. testar check-in, refeicoes, A Voz e progresso
