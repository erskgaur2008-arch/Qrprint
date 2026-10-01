drop policy if exists student_attendance_access on public.student_attendance;
create policy student_attendance_access on public.student_attendance
for all to authenticated
using (
  private.is_platform_admin()
  or private.is_school_admin(school_id)
  or (
    school_id in (select private.user_school_ids())
    and exists (
      select 1 from public.teacher_assignments ta
      join public.staff st on st.id = ta.staff_id
      join public.students s on s.id = student_attendance.student_id
      where ta.school_id = student_attendance.school_id and ta.class_id = s.class_id and ta.section_id = s.section_id
        and st.user_id = auth.uid() and st.status = 'active'
    )
  )
)
with check (
  private.is_platform_admin()
  or private.is_school_admin(school_id)
  or (
    school_id in (select private.user_school_ids())
    and exists (
      select 1 from public.teacher_assignments ta
      join public.staff st on st.id = ta.staff_id
      join public.students s on s.id = student_attendance.student_id
      where ta.school_id = student_attendance.school_id and ta.class_id = s.class_id and ta.section_id = s.section_id
        and st.user_id = auth.uid() and st.status = 'active'
    )
  )
);