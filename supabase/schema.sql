-- Solfest — live event data.
-- Run this once in the Supabase SQL editor.
--
-- One row per party. `data` is the exact shape of content/events/<slug>.json,
-- so seeding is a straight copy and adding a field to the JSON needs no migration.
-- You are the only writer, so there is no concurrent-edit problem to solve.

create table if not exists public.events (
  slug       text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.events enable row level security;

-- Guests read. Anyone with the link can see the party.
drop policy if exists "events readable by anyone" on public.events;
create policy "events readable by anyone"
  on public.events for select
  using (true);

-- Only signed-in users write. IMPORTANT: turn OFF new signups in
-- Authentication -> Sign In / Providers, so the only account is yours.
-- That keeps your email out of this public repo while staying locked down.
drop policy if exists "signed-in users write" on public.events;
create policy "signed-in users write"
  on public.events for all
  to authenticated
  using (true)
  with check (true);

-- Keep updated_at honest so the "sist oppdatert" stamp cannot lie.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_touch on public.events;
create trigger events_touch
  before update on public.events
  for each row execute function public.touch_updated_at();

-- Push UPDATEs to every connected phone.
alter publication supabase_realtime add table public.events;
