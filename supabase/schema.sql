create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  age integer check (age is null or age between 18 and 90),
  life_phase text check (
    life_phase is null
    or life_phase in ('postpartum', 'menopause', 'high_stress', 'none')
  ),
  primary_goal text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.profiles
add column if not exists avatar_url text;

create table if not exists public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symptoms text[] not null default '{}',
  stress_level integer not null check (stress_level between 1 and 10),
  sleep_quality integer not null check (sleep_quality between 1 and 10),
  notes text,
  accepts_notifications boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stress_score integer not null check (stress_score between 1 and 10),
  energy_score integer not null check (energy_score between 1 and 10),
  bloating_score integer not null check (bloating_score between 1 and 10),
  vent_text text,
  vent_audio_url text,
  voice_response text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.daily_checkins
add column if not exists vent_audio_url text;

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_text text not null,
  image_url text,
  interpretation text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.voice_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  audio_url text,
  message_type text not null default 'daily_guidance' check (
    message_type in ('daily_guidance', 'checkin_response', 'meal_reflection', 'encouragement')
  ),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.voice_message_reads (
  user_id uuid not null references auth.users (id) on delete cascade,
  voice_message_id uuid not null references public.voice_messages (id) on delete cascade,
  read_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, voice_message_id)
);

create index if not exists voice_message_reads_user_id_idx
  on public.voice_message_reads (user_id, read_at desc);

create table if not exists public.daily_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  adjustment_type text not null default 'mindset' check (
    adjustment_type in ('meal', 'rest', 'mindset', 'hydration', 'movement')
  ),
  is_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.progress_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  state_label text not null check (
    state_label in (
      'Modo Sobrevivencia',
      'A sair do Modo Sobrevivencia',
      'Ritmo Natural em progresso'
    )
  ),
  score integer not null check (score between 0 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  appearance_mode text not null default 'soft' check (
    appearance_mode in ('light', 'soft', 'dark')
  ),
  push_notifications boolean not null default true,
  daily_voice_reminder boolean not null default true,
  meal_reminders boolean not null default false,
  weekly_reflection boolean not null default true,
  soundscape_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists onboarding_answers_user_id_idx
  on public.onboarding_answers (user_id, created_at desc);

create index if not exists daily_checkins_user_id_idx
  on public.daily_checkins (user_id, created_at desc);

create index if not exists meal_entries_user_id_idx
  on public.meal_entries (user_id, created_at desc);

create index if not exists voice_messages_user_id_idx
  on public.voice_messages (user_id, created_at desc);

create index if not exists voice_message_reads_message_idx
  on public.voice_message_reads (voice_message_id);

create index if not exists daily_adjustments_user_id_idx
  on public.daily_adjustments (user_id, created_at desc);

create index if not exists progress_states_user_id_idx
  on public.progress_states (user_id, created_at desc);

create index if not exists user_settings_user_id_idx
  on public.user_settings (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.onboarding_answers enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.meal_entries enable row level security;
alter table public.voice_messages enable row level security;
alter table public.voice_message_reads enable row level security;
alter table public.daily_adjustments enable row level security;
alter table public.progress_states enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "onboarding_answers_select_own" on public.onboarding_answers;
create policy "onboarding_answers_select_own"
on public.onboarding_answers for select
using (auth.uid() = user_id);

drop policy if exists "onboarding_answers_insert_own" on public.onboarding_answers;
create policy "onboarding_answers_insert_own"
on public.onboarding_answers for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_checkins_select_own" on public.daily_checkins;
create policy "daily_checkins_select_own"
on public.daily_checkins for select
using (auth.uid() = user_id);

drop policy if exists "daily_checkins_insert_own" on public.daily_checkins;
create policy "daily_checkins_insert_own"
on public.daily_checkins for insert
with check (auth.uid() = user_id);

drop policy if exists "meal_entries_select_own" on public.meal_entries;
create policy "meal_entries_select_own"
on public.meal_entries for select
using (auth.uid() = user_id);

drop policy if exists "meal_entries_insert_own" on public.meal_entries;
create policy "meal_entries_insert_own"
on public.meal_entries for insert
with check (auth.uid() = user_id);

drop policy if exists "voice_messages_select_own" on public.voice_messages;
create policy "voice_messages_select_own"
on public.voice_messages for select
using (auth.uid() = user_id);

drop policy if exists "voice_messages_insert_own" on public.voice_messages;
create policy "voice_messages_insert_own"
on public.voice_messages for insert
with check (auth.uid() = user_id);

drop policy if exists "voice_message_reads_select_own" on public.voice_message_reads;
create policy "voice_message_reads_select_own"
on public.voice_message_reads for select
using (auth.uid() = user_id);

drop policy if exists "voice_message_reads_insert_own" on public.voice_message_reads;
create policy "voice_message_reads_insert_own"
on public.voice_message_reads for insert
with check (auth.uid() = user_id);

drop policy if exists "voice_message_reads_update_own" on public.voice_message_reads;
create policy "voice_message_reads_update_own"
on public.voice_message_reads for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_adjustments_select_own" on public.daily_adjustments;
create policy "daily_adjustments_select_own"
on public.daily_adjustments for select
using (auth.uid() = user_id);

drop policy if exists "daily_adjustments_insert_own" on public.daily_adjustments;
create policy "daily_adjustments_insert_own"
on public.daily_adjustments for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_adjustments_update_own" on public.daily_adjustments;
create policy "daily_adjustments_update_own"
on public.daily_adjustments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "progress_states_select_own" on public.progress_states;
create policy "progress_states_select_own"
on public.progress_states for select
using (auth.uid() = user_id);

drop policy if exists "progress_states_insert_own" on public.progress_states;
create policy "progress_states_insert_own"
on public.progress_states for insert
with check (auth.uid() = user_id);

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

insert into storage.buckets (id, name, public)
values
  ('meal-photos', 'meal-photos', false),
  ('voice-audio', 'voice-audio', false),
  ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

drop policy if exists "meal_photos_select_own" on storage.objects;
create policy "meal_photos_select_own"
on storage.objects for select
using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "meal_photos_insert_own" on storage.objects;
create policy "meal_photos_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "meal_photos_update_own" on storage.objects;
create policy "meal_photos_update_own"
on storage.objects for update
using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "voice_audio_select_own" on storage.objects;
create policy "voice_audio_select_own"
on storage.objects for select
using (
  bucket_id = 'voice-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "voice_audio_insert_own" on storage.objects;
create policy "voice_audio_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'voice-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "voice_audio_update_own" on storage.objects;
create policy "voice_audio_update_own"
on storage.objects for update
using (
  bucket_id = 'voice-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'voice-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile_photos_select_own" on storage.objects;
create policy "profile_photos_select_own"
on storage.objects for select
using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile_photos_insert_own" on storage.objects;
create policy "profile_photos_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile_photos_update_own" on storage.objects;
create policy "profile_photos_update_own"
on storage.objects for update
using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
