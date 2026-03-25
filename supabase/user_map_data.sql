create extension if not exists pgcrypto;

create table if not exists public.user_map_data (
    user_id uuid primary key references auth.users(id) on delete cascade,
    obtained_pins jsonb not null default '[]'::jsonb,
    custom_pins jsonb not null default '[]'::jsonb,
    custom_pin_obtained jsonb not null default '[]'::jsonb,
    routes jsonb not null default '[]'::jsonb,
    pinned_routes jsonb not null default '[]'::jsonb,
    preferences jsonb not null default '{}'::jsonb,
    migrated_from_local boolean not null default false,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create or replace function public.set_user_map_data_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    if tg_op = 'insert' and new.created_at is null then
        new.created_at = now();
    end if;
    return new;
end;
$$;

drop trigger if exists set_user_map_data_updated_at on public.user_map_data;

create trigger set_user_map_data_updated_at
before insert or update on public.user_map_data
for each row
execute function public.set_user_map_data_updated_at();

alter table public.user_map_data enable row level security;

drop policy if exists "user_map_data_select_own" on public.user_map_data;
create policy "user_map_data_select_own"
on public.user_map_data
for select
using (auth.uid() = user_id);

drop policy if exists "user_map_data_insert_own" on public.user_map_data;
create policy "user_map_data_insert_own"
on public.user_map_data
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_map_data_update_own" on public.user_map_data;
create policy "user_map_data_update_own"
on public.user_map_data
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_map_data_delete_own" on public.user_map_data;
create policy "user_map_data_delete_own"
on public.user_map_data
for delete
using (auth.uid() = user_id);
