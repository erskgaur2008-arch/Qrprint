-- Prevent ordinary members from creating or editing school membership records.
-- Membership changes are restricted to school admins for their own school
-- and platform admins. Reads remain limited to own membership or tenant peers.

drop policy if exists school_users_access on public.school_users;

create policy school_users_select
on public.school_users
for select
to authenticated
using (
  user_id = (select auth.uid())
  or school_id in (select private.user_school_ids())
  or private.is_platform_admin()
);

create policy school_users_insert
on public.school_users
for insert
to authenticated
with check (
  private.is_platform_admin()
  or private.is_school_admin(school_id)
);

create policy school_users_update
on public.school_users
for update
to authenticated
using (
  private.is_platform_admin()
  or private.is_school_admin(school_id)
)
with check (
  private.is_platform_admin()
  or private.is_school_admin(school_id)
);

create policy school_users_delete
on public.school_users
for delete
to authenticated
using (
  private.is_platform_admin()
  or private.is_school_admin(school_id)
);
