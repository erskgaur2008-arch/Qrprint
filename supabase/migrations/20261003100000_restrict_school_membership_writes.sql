-- Require an active school membership as well as the role before granting
-- school-admin authority. This also makes deactivated memberships lose access.
create or replace function private.is_school_admin(
  p_school_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $function$
  select exists (
    select 1
    from public.school_users su
    join public.user_roles ur
      on ur.user_id = su.user_id
     and ur.school_id = su.school_id
    join public.roles r on r.id = ur.role_id
    where su.school_id = p_school_id
      and su.user_id = p_user_id
      and su.is_active = true
      and r.name = 'school_admin'
  );
$function$;

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
