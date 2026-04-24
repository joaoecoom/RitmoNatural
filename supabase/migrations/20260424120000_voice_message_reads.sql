-- Leitura de mensagens de voz (notificações): estado lido/não lido por utilizador.
-- Idempotente: seguro correr mais do que uma vez.

create table if not exists public.voice_message_reads (
  user_id uuid not null references auth.users (id) on delete cascade,
  voice_message_id uuid not null references public.voice_messages (id) on delete cascade,
  read_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, voice_message_id)
);

create index if not exists voice_message_reads_user_id_idx
  on public.voice_message_reads (user_id, read_at desc);

create index if not exists voice_message_reads_message_idx
  on public.voice_message_reads (voice_message_id);

alter table public.voice_message_reads enable row level security;

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

notify pgrst, 'reload schema';
