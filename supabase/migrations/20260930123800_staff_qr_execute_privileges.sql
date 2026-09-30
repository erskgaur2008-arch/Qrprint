revoke execute on function public.ensure_daily_attendance_qr(uuid) from public;
revoke execute on function public.ensure_daily_attendance_qr(uuid) from anon;
grant execute on function public.ensure_daily_attendance_qr(uuid) to authenticated;
