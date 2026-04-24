-- Jornada diária, objetivos, horários, programas, notificações (histórico/preferências), admin em perfis.

alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin', 'super_admin')),
  add column if not exists full_access boolean not null default false;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  primary_goal text not null,
  target_weight numeric(5, 2),
  deadline date,
  emotional_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

create table if not exists public.user_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  breakfast_time time without time zone not null default time '08:00',
  lunch_time time without time zone not null default time '13:00',
  snack_time time without time zone not null default time '16:30',
  dinner_time time without time zone not null default time '20:00',
  sleep_time time without time zone not null default time '23:00',
  wake_time time without time zone not null default time '07:00',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

create table if not exists public.daily_journey (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  journey_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  completed_steps integer not null default 0 check (completed_steps >= 0),
  total_steps integer not null default 0 check (total_steps >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, journey_date)
);

create index if not exists daily_journey_user_date_idx
  on public.daily_journey (user_id, journey_date desc);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  journey_id uuid not null references public.daily_journey (id) on delete cascade,
  title text not null,
  description text not null,
  task_type text not null check (
    task_type in (
      'checkin',
      'meal',
      'water',
      'voice',
      'breath',
      'sleep',
      'reflection'
    )
  ),
  scheduled_time time without time zone,
  sort_order integer not null default 0,
  deep_link text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists daily_tasks_journey_idx
  on public.daily_tasks (journey_id, sort_order);

create index if not exists daily_tasks_user_idx
  on public.daily_tasks (user_id, created_at desc);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_enabled boolean not null default true,
  meal_reminders_enabled boolean not null default true,
  voice_reminders_enabled boolean not null default true,
  water_reminders_enabled boolean not null default true,
  sleep_reminders_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

create table if not exists public.notification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  scheduled_for timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_history_user_idx
  on public.notification_history (user_id, created_at desc);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  access_level text not null default 'base' check (access_level in ('base', 'upsell', 'downsell')),
  price_reference text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_program_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  access_status text not null default 'active' check (access_status in ('active', 'revoked', 'trial')),
  granted_by text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, program_id)
);

create index if not exists user_program_access_user_idx
  on public.user_program_access (user_id);

-- Impede alteração de role/full_access pela própria utilizadora via API
create or replace function public.profiles_lock_privileged_columns()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and auth.uid() is not null and new.id = auth.uid() then
    new.role := old.role;
    new.full_access := old.full_access;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_privileged_columns on public.profiles;
create trigger profiles_lock_privileged_columns
before update on public.profiles
for each row
execute procedure public.profiles_lock_privileged_columns();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
before update on public.goals
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_user_schedule_updated_at on public.user_schedule;
create trigger set_user_schedule_updated_at
before update on public.user_schedule
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_schedule (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Programas iniciais
insert into public.programs (name, slug, description, access_level, price_reference, sort_order)
values
  ('Ritmo Natural Base', 'ritmo-natural-base', 'Acesso principal da subscrição.', 'base', null, 1),
  ('Protocolo de Saída Rápida 7 Dias', 'protocolo-7-dias', 'Plano intensivo de 7 dias com tarefas mais guiadas.', 'upsell', 'Upsell 1', 2),
  ('Versão Guiada 3 Dias', 'versao-3-dias', 'Mini jornada de 3 dias, mais simples e rápida.', 'downsell', 'Downsell 1.1', 3),
  ('Plano Simplificado Diário', 'plano-simplificado-diario', 'Um ajuste por dia, para pouca disciplina.', 'downsell', 'Downsell 1.2', 4),
  ('Áudio Reset Rápido', 'audio-reset-rapido', 'Áudios curtos para reduzir stress e recentrar.', 'downsell', 'Downsell 1.3', 5),
  ('Sistema Completo de Regulação do Corpo', 'sistema-completo-regulacao', 'Protocolos de sono, stress, alimentação e rotina.', 'upsell', 'Upsell 2', 6),
  ('Plano Essencial do Ritmo Natural', 'plano-essencial', 'Versão mais simples, mas ainda valiosa.', 'downsell', 'Downsell 2.1', 7),
  ('Foco Sono e Stress', 'foco-sono-stress', 'Área específica sono + stress.', 'downsell', 'Downsell 2.2', 8),
  ('Guia de Correção Rápida', 'guia-correcao-rapida', 'Solução rápida, leve e prática.', 'downsell', 'Downsell 2.3', 9)
on conflict (slug) do nothing;

-- Backfill horários e preferências para utilizadores existentes
insert into public.user_schedule (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

insert into public.notification_preferences (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- Acesso ao programa base para todas as contas existentes
insert into public.user_program_access (user_id, program_id, access_status, granted_by)
select p.id, pr.id, 'active', 'migration'
from public.profiles p
cross join public.programs pr
where pr.slug = 'ritmo-natural-base'
on conflict (user_id, program_id) do nothing;

alter table public.goals enable row level security;
alter table public.user_schedule enable row level security;
alter table public.daily_journey enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_history enable row level security;
alter table public.programs enable row level security;
alter table public.user_program_access enable row level security;

-- programs: leitura pública autenticada (catálogo)
drop policy if exists "programs_select_all" on public.programs;
create policy "programs_select_all"
on public.programs for select
using (auth.role() = 'authenticated');

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own"
on public.goals for select
using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own"
on public.goals for insert
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
on public.goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_schedule_select_own" on public.user_schedule;
create policy "user_schedule_select_own"
on public.user_schedule for select
using (auth.uid() = user_id);

drop policy if exists "user_schedule_insert_own" on public.user_schedule;
create policy "user_schedule_insert_own"
on public.user_schedule for insert
with check (auth.uid() = user_id);

drop policy if exists "user_schedule_update_own" on public.user_schedule;
create policy "user_schedule_update_own"
on public.user_schedule for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_journey_select_own" on public.daily_journey;
create policy "daily_journey_select_own"
on public.daily_journey for select
using (auth.uid() = user_id);

drop policy if exists "daily_journey_insert_own" on public.daily_journey;
create policy "daily_journey_insert_own"
on public.daily_journey for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_journey_update_own" on public.daily_journey;
create policy "daily_journey_update_own"
on public.daily_journey for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_tasks_select_own" on public.daily_tasks;
create policy "daily_tasks_select_own"
on public.daily_tasks for select
using (auth.uid() = user_id);

drop policy if exists "daily_tasks_insert_own" on public.daily_tasks;
create policy "daily_tasks_insert_own"
on public.daily_tasks for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_tasks_update_own" on public.daily_tasks;
create policy "daily_tasks_update_own"
on public.daily_tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
create policy "notification_preferences_select_own"
on public.notification_preferences for select
using (auth.uid() = user_id);

drop policy if exists "notification_preferences_insert_own" on public.notification_preferences;
create policy "notification_preferences_insert_own"
on public.notification_preferences for insert
with check (auth.uid() = user_id);

drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
create policy "notification_preferences_update_own"
on public.notification_preferences for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_history_select_own" on public.notification_history;
create policy "notification_history_select_own"
on public.notification_history for select
using (auth.uid() = user_id);

drop policy if exists "notification_history_insert_own" on public.notification_history;
create policy "notification_history_insert_own"
on public.notification_history for insert
with check (auth.uid() = user_id);

drop policy if exists "notification_history_update_own" on public.notification_history;
create policy "notification_history_update_own"
on public.notification_history for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_program_access_select_own" on public.user_program_access;
create policy "user_program_access_select_own"
on public.user_program_access for select
using (auth.uid() = user_id);

-- Acessos a programas: só leitura para a app; escritas via service_role (admin / Stripe).

notify pgrst, 'reload schema';
