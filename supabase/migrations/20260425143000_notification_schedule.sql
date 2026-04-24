-- Horários de notificação por tipo (editáveis pela utilizadora)

create table if not exists public.notification_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_time time without time zone not null default time '07:00',
  water_time time without time zone not null default time '12:40',
  meal_log_time time without time zone not null default time '13:45',
  voice_time time without time zone not null default time '16:00',
  sleep_time time without time zone not null default time '22:30',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

-- Backfill para contas existentes
insert into public.notification_schedule (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

alter table public.notification_schedule enable row level security;

drop policy if exists "notification_schedule_select_own" on public.notification_schedule;
create policy "notification_schedule_select_own"
on public.notification_schedule for select
using (auth.uid() = user_id);

drop policy if exists "notification_schedule_insert_own" on public.notification_schedule;
create policy "notification_schedule_insert_own"
on public.notification_schedule for insert
with check (auth.uid() = user_id);

drop policy if exists "notification_schedule_update_own" on public.notification_schedule;
create policy "notification_schedule_update_own"
on public.notification_schedule for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists set_notification_schedule_updated_at on public.notification_schedule;
create trigger set_notification_schedule_updated_at
before update on public.notification_schedule
for each row
execute procedure public.set_updated_at();

notify pgrst, 'reload schema';
