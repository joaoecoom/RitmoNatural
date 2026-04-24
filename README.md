# Ritmo Natural

MVP em `Next.js` para um produto de emagrecimento feminino com linguagem emocional, leve e guiada.

## Stack

- `Next.js` com `App Router`
- `TypeScript`
- `Tailwind CSS`
- `Supabase` para auth, base de dados e storage
- placeholders para `OpenRouter` e `Stripe`

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
- `OPENROUTER_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

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
- as buckets esperadas sao `meal-photos` e `voice-audio`
- a interpretacao de refeicoes e as respostas da Voz usam mocks em `lib/ai`
- o billing futuro esta preparado em `lib/billing/stripe.ts`
- o MVP evita linguagem de calorias, macros e treino como centro visual

## Proximo passo natural

Depois de ligares o Supabase, o fluxo recomendado e:

1. criar conta
2. completar onboarding
3. abrir dashboard
4. testar check-in, refeicoes, A Voz e progresso
