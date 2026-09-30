create extension if not exists pgcrypto;

alter table public.staff
  add column if not exists attendance_pin_hash text;

create table if not exists public.attendance_qr_days (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  attendance_date date not null,
  qr_token text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_id, attendance_date),
  unique (school_id, qr_token)
);

create index if not exists attendance_qr_days_school_date_idx
  on public.attendance_qr_days(school_id, attendance_date);

alter table public.attendance_qr_days enable row level security;

drop policy if exists "attendance qr tenant select" on public.attendance_qr_days;
create policy "attendance qr tenant select"
on public.attendance_qr_days for select to authenticated
using (school_id in (select private.user_school_ids()));

drop policy if exists "attendance qr tenant insert" on public.attendance_qr_days;
create policy "attendance qr tenant insert"
on public.attendance_qr_days for insert to authenticated
with check (school_id in (select private.user_school_ids()));

create or replace function public.ensure_daily_attendance_qr(p_school_id uuid)
returns table(qr_token text, attendance_date date)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_date date := (now() at time zone 'Asia/Kolkata')::date;
  v_token text;
begin
  if not exists (
    select 1 from public.school_users su
    where su.user_id = auth.uid()
      and su.school_id = p_school_id
      and su.is_active = true
  ) then
    raise exception 'School access denied';
  end if;

  select q.qr_token into v_token
  from public.attendance_qr_days q
  where q.school_id = p_school_id and q.attendance_date = v_date;

  if v_token is null then
    v_token := encode(gen_random_bytes(24), 'hex');
    insert into public.attendance_qr_days(school_id, attendance_date, qr_token, created_by)
    values (p_school_id, v_date, v_token, auth.uid())
    on conflict (school_id, attendance_date) do update
      set qr_token = excluded.qr_token
    returning attendance_qr_days.qr_token into v_token;
  end if;

  return query select v_token, v_date;
end;
$$;

grant execute on function public.ensure_daily_attendance_qr(uuid) to authenticated;

create or replace function public.record_staff_punch(
  p_school_id uuid,
  p_qr_token text,
  p_employee_no text,
  p_pin text
)
returns table(
  staff_id uuid,
  staff_name text,
  punch_type text,
  punch_at timestamptz,
  working_minutes integer
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_staff public.staff%rowtype;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_now timestamptz := now();
  v_last public.attendance_punches%rowtype;
  v_type text;
  v_minutes integer := 0;
  v_total integer := 0;
  v_in timestamptz;
  v_out timestamptz;
  r record;
begin
  if not exists (
    select 1
    from public.attendance_qr_days q
    where q.school_id = p_school_id
      and q.attendance_date = v_today
      and q.qr_token = p_qr_token
  ) then
    raise exception 'Invalid or expired daily QR code';
  end if;

  select s.* into v_staff
  from public.staff s
  where s.school_id = p_school_id
    and s.employee_no = trim(p_employee_no)
    and s.status = 'active'
  limit 1;

  if v_staff.id is null then
    raise exception 'Staff record not found';
  end if;

  if v_staff.attendance_pin_hash is null
     or crypt(trim(p_pin), v_staff.attendance_pin_hash) <> v_staff.attendance_pin_hash then
    raise exception 'Invalid PIN';
  end if;

  select ap.* into v_last
  from public.attendance_punches ap
  where ap.school_id = p_school_id
    and ap.staff_id = v_staff.id
    and (ap.punch_at at time zone 'Asia/Kolkata')::date = v_today
  order by ap.punch_at desc
  limit 1
  for update;

  if v_last.id is not null and extract(epoch from (v_now - v_last.punch_at)) < 60 then
    raise exception 'Duplicate punch blocked. Please wait before punching again';
  end if;

  v_type := case when v_last.id is null or v_last.punch_type = 'PUNCH_OUT'
                 then 'PUNCH_IN' else 'PUNCH_OUT' end;

  insert into public.attendance_punches(school_id, staff_id, punch_at, punch_type, source)
  values (p_school_id, v_staff.id, v_now, v_type, 'qr_pin');

  for r in
    select punch_type, punch_at
    from public.attendance_punches
    where school_id = p_school_id
      and staff_id = v_staff.id
      and (punch_at at time zone 'Asia/Kolkata')::date = v_today
    order by punch_at
  loop
    if r.punch_type = 'PUNCH_IN' then
      v_in := r.punch_at;
    elsif r.punch_type = 'PUNCH_OUT' and v_in is not null then
      v_out := r.punch_at;
      if v_out > v_in then
        v_total := v_total + floor(extract(epoch from (v_out - v_in)) / 60)::integer;
      end if;
      v_in := null;
    end if;
  end loop;

  v_minutes := v_total;

  return query
  select v_staff.id, v_staff.name, v_type, v_now, v_minutes;
end;
$$;

grant execute on function public.record_staff_punch(uuid,text,text,text) to anon, authenticated;

create index if not exists attendance_punches_staff_date_idx
  on public.attendance_punches(school_id, staff_id, punch_at desc);
