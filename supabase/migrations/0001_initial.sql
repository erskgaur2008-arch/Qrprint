-- School CRM tenant foundation. Apply through Supabase migrations.
create table if not exists public.schools (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 address text,
 created_at timestamptz not null default now()
);
alter table public.schools enable row level security;
-- Authentication and tenant policies will be added in the next database phase.