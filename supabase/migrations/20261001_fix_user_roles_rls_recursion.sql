-- Fix user_roles RLS recursion by using a SECURITY DEFINER role-check helper.
create or replace function private.is_school_admin(p_school_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, private as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.school_id = p_school_id and ur.user_id = p_user_id and r.name = 'school_admin'
  );
$$;
revoke all on function private.is_school_admin(uuid,uuid) from public;
grant execute on function private.is_school_admin(uuid,uuid) to authenticated;

drop policy if exists user_roles_manage on public.user_roles;
create policy user_roles_manage on public.user_roles
for all to authenticated
using (
  private.is_platform_admin()
  or (
    private.is_school_admin(school_id)
    and exists (select 1 from public.roles target_role where target_role.id = user_roles.role_id and target_role.name <> 'super_admin')
  )
)
with check (
  private.is_platform_admin()
  or (
    private.is_school_admin(school_id)
    and exists (select 1 from public.roles target_role where target_role.id = user_roles.role_id and target_role.name <> 'super_admin')
  )
);