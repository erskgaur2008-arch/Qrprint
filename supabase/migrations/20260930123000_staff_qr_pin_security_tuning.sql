revoke execute on function public.ensure_daily_attendance_qr(uuid) from anon;

create index if not exists attendance_qr_days_created_by_idx
  on public.attendance_qr_days(created_by);