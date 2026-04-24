-- Restauro da tabela user_settings (necessária para trigger handle_new_user e ecrã Definições)

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  appearance_mode text not null default 'soft',
  push_notifications boolean not null default true,
  daily_voice_reminder boolean not null default true,
  meal_reminders boolean not null default false,
  weekly_reflection boolean not null default true,
  soundscape_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Backfill para contas existentes
insert into public.user_settings (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
on public.user_settings for select
using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
on public.user_settings for insert
with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
on public.user_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute procedure public.set_updated_at();

notify pgrst, 'reload schema';
