-- Super Admin tenant, plan and subscription management.
create or replace function public.super_admin_create_school(
  p_name text,p_slug text,p_address text default null,p_city text default null,p_state text default null,
  p_phone text default null,p_email text default null,p_academic_year_name text default '2026-27',
  p_academic_year_start date default date '2026-04-01',p_academic_year_end date default date '2027-03-31'
) returns uuid language plpgsql security invoker set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_school_id uuid; v_plan_id uuid;
begin
 if v_uid is null or not private.is_platform_admin() then raise exception 'Platform admin access required'; end if;
 if trim(coalesce(p_name,''))='' or trim(coalesce(p_slug,''))='' then raise exception 'School name and slug are required'; end if;
 if exists(select 1 from public.schools where lower(slug)=lower(trim(p_slug))) then raise exception 'School slug already exists'; end if;
 insert into public.schools(name,slug,address,city,state,country,phone,email,status) values(trim(p_name),lower(trim(p_slug)),nullif(trim(p_address),''),nullif(trim(p_city),''),nullif(trim(p_state),''),'India',nullif(trim(p_phone),''),nullif(trim(p_email),''),'active') returning id into v_school_id;
 insert into public.school_branding(school_id) values(v_school_id);
 insert into public.school_settings(school_id) values(v_school_id);
 insert into public.academic_years(school_id,name,start_date,end_date,is_current) values(v_school_id,p_academic_year_name,p_academic_year_start,p_academic_year_end,true);
 select id into v_plan_id from public.subscription_plans where name='Free' limit 1;
 if v_plan_id is not null then insert into public.subscriptions(school_id,plan_id,status,billing_cycle,starts_at,trial_ends_at,current_period_start,current_period_end) values(v_school_id,v_plan_id,'trial','monthly',now(),now()+interval '14 days',now(),now()+interval '1 month'); end if;
 insert into public.audit_logs(school_id,user_id,action,table_name,record_id,metadata) values(v_school_id,v_uid,'platform_school_created','schools',v_school_id,jsonb_build_object('name',p_name,'slug',p_slug));
 return v_school_id;
end $$;

create or replace function public.super_admin_update_school(p_school_id uuid,p_name text,p_slug text,p_address text default null,p_city text default null,p_state text default null,p_phone text default null,p_email text default null)
returns boolean language plpgsql security invoker set search_path=public as $$
declare v_uid uuid:=auth.uid();
begin
 if v_uid is null or not private.is_platform_admin() then raise exception 'Platform admin access required'; end if;
 if trim(coalesce(p_name,''))='' or trim(coalesce(p_slug,''))='' then raise exception 'School name and slug are required'; end if;
 if exists(select 1 from public.schools where lower(slug)=lower(trim(p_slug)) and id<>p_school_id) then raise exception 'School slug already exists'; end if;
 update public.schools set name=trim(p_name),slug=lower(trim(p_slug)),address=nullif(trim(p_address),''),city=nullif(trim(p_city),''),state=nullif(trim(p_state),''),phone=nullif(trim(p_phone),''),email=nullif(trim(p_email),''),updated_at=now() where id=p_school_id;
 if not found then raise exception 'School not found'; end if;
 insert into public.audit_logs(school_id,user_id,action,table_name,record_id) values(p_school_id,v_uid,'platform_school_updated','schools',p_school_id); return true;
end $$;

create or replace function public.super_admin_set_school_status(p_school_id uuid,p_status text) returns boolean language plpgsql security invoker set search_path=public as $$
declare v_uid uuid:=auth.uid();
begin
 if v_uid is null or not private.is_platform_admin() then raise exception 'Platform admin access required'; end if;
 if p_status not in ('active','suspended','inactive') then raise exception 'Invalid school status'; end if;
 update public.schools set status=p_status,updated_at=now() where id=p_school_id;
 if not found then raise exception 'School not found'; end if;
 update public.subscriptions set status=case when p_status='suspended' then 'suspended' when p_status='inactive' then 'cancelled' when status='suspended' then 'active' else status end,updated_at=now() where school_id=p_school_id;
 insert into public.audit_logs(school_id,user_id,action,table_name,record_id,metadata) values(p_school_id,v_uid,'platform_school_status_changed','schools',p_school_id,jsonb_build_object('status',p_status)); return true;
end $$;

create or replace function public.super_admin_upsert_plan(p_plan_id uuid,p_name text,p_description text,p_monthly_price numeric,p_annual_price numeric,p_max_students integer,p_max_staff integer,p_features jsonb,p_is_active boolean)
returns uuid language plpgsql security invoker set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_id uuid;
begin
 if v_uid is null or not private.is_platform_admin() then raise exception 'Platform admin access required'; end if;
 if trim(coalesce(p_name,''))='' then raise exception 'Plan name is required'; end if;
 if p_monthly_price<0 or p_annual_price<0 then raise exception 'Prices cannot be negative'; end if;
 if p_plan_id is null then
   insert into public.subscription_plans(name,description,monthly_price,annual_price,max_students,max_staff,features,is_active) values(trim(p_name),p_description,coalesce(p_monthly_price,0),coalesce(p_annual_price,0),p_max_students,p_max_staff,coalesce(p_features,'{}'::jsonb),coalesce(p_is_active,true)) returning id into v_id;
 else
   update public.subscription_plans set name=trim(p_name),description=p_description,monthly_price=coalesce(p_monthly_price,0),annual_price=coalesce(p_annual_price,0),max_students=p_max_students,max_staff=p_max_staff,features=coalesce(p_features,'{}'::jsonb),is_active=coalesce(p_is_active,true),updated_at=now() where id=p_plan_id returning id into v_id;
   if v_id is null then raise exception 'Plan not found'; end if;
 end if;
 insert into public.audit_logs(user_id,action,table_name,record_id,metadata) values(v_uid,case when p_plan_id is null then 'platform_plan_created' else 'platform_plan_updated' end,'subscription_plans',v_id,jsonb_build_object('name',p_name)); return v_id;
exception when unique_violation then raise exception 'A plan with this name already exists';
end $$;

create or replace function public.super_admin_set_plan_active(p_plan_id uuid,p_is_active boolean) returns boolean language plpgsql security invoker set search_path=public as $$
declare v_uid uuid:=auth.uid();
begin
 if v_uid is null or not private.is_platform_admin() then raise exception 'Platform admin access required'; end if;
 update public.subscription_plans set is_active=p_is_active,updated_at=now() where id=p_plan_id;
 if not found then raise exception 'Plan not found'; end if;
 insert into public.audit_logs(user_id,action,table_name,record_id,metadata) values(v_uid,'platform_plan_status_changed','subscription_plans',p_plan_id,jsonb_build_object('is_active',p_is_active)); return true;
end $$;

create or replace function public.super_admin_assign_subscription(p_school_id uuid,p_plan_id uuid,p_status text,p_billing_cycle text,p_trial_days integer default 0)
returns uuid language plpgsql security invoker set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_id uuid; v_now timestamptz:=now();
begin
 if v_uid is null or not private.is_platform_admin() then raise exception 'Platform admin access required'; end if;
 if p_status not in ('trial','active','past_due','suspended','cancelled') then raise exception 'Invalid subscription status'; end if;
 if p_billing_cycle not in ('monthly','annual') then raise exception 'Invalid billing cycle'; end if;
 if not exists(select 1 from public.schools where id=p_school_id) then raise exception 'School not found'; end if;
 if not exists(select 1 from public.subscription_plans where id=p_plan_id) then raise exception 'Plan not found'; end if;
 insert into public.subscriptions(school_id,plan_id,status,billing_cycle,starts_at,trial_ends_at,current_period_start,current_period_end) values(p_school_id,p_plan_id,p_status,p_billing_cycle,v_now,case when p_status='trial' then v_now+make_interval(days=>greatest(0,p_trial_days)) else null end,v_now,case when p_billing_cycle='annual' then v_now+interval '1 year' else v_now+interval '1 month' end)
 on conflict(school_id) do update set plan_id=excluded.plan_id,status=excluded.status,billing_cycle=excluded.billing_cycle,trial_ends_at=excluded.trial_ends_at,current_period_start=excluded.current_period_start,current_period_end=excluded.current_period_end,updated_at=now() returning id into v_id;
 insert into public.audit_logs(school_id,user_id,action,table_name,record_id,metadata) values(p_school_id,v_uid,'platform_subscription_changed','subscriptions',v_id,jsonb_build_object('plan_id',p_plan_id,'status',p_status,'billing_cycle',p_billing_cycle)); return v_id;
end $$;

drop policy if exists super_admin_schools on public.schools;create policy super_admin_schools on public.schools for all to authenticated using(private.is_platform_admin()) with check(private.is_platform_admin());
drop policy if exists super_admin_branding on public.school_branding;create policy super_admin_branding on public.school_branding for all to authenticated using(private.is_platform_admin()) with check(private.is_platform_admin());
drop policy if exists super_admin_settings on public.school_settings;create policy super_admin_settings on public.school_settings for all to authenticated using(private.is_platform_admin()) with check(private.is_platform_admin());
drop policy if exists super_admin_academic_years on public.academic_years;create policy super_admin_academic_years on public.academic_years for all to authenticated using(private.is_platform_admin()) with check(private.is_platform_admin());
drop policy if exists super_admin_plans on public.subscription_plans;create policy super_admin_plans on public.subscription_plans for all to authenticated using(private.is_platform_admin()) with check(private.is_platform_admin());
drop policy if exists super_admin_audit_insert on public.audit_logs;create policy super_admin_audit_insert on public.audit_logs for insert to authenticated with check(private.is_platform_admin());

revoke all on function public.super_admin_create_school(text,text,text,text,text,text,text,text,date,date) from public,anon,authenticated;
revoke all on function public.super_admin_update_school(uuid,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.super_admin_set_school_status(uuid,text) from public,anon,authenticated;
revoke all on function public.super_admin_upsert_plan(uuid,text,text,numeric,numeric,integer,integer,jsonb,boolean) from public,anon,authenticated;
revoke all on function public.super_admin_set_plan_active(uuid,boolean) from public,anon,authenticated;
revoke all on function public.super_admin_assign_subscription(uuid,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.super_admin_create_school(text,text,text,text,text,text,text,text,date,date) to authenticated;
grant execute on function public.super_admin_update_school(uuid,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.super_admin_set_school_status(uuid,text) to authenticated;
grant execute on function public.super_admin_upsert_plan(uuid,text,text,numeric,numeric,integer,integer,jsonb,boolean) to authenticated;
grant execute on function public.super_admin_set_plan_active(uuid,boolean) to authenticated;
grant execute on function public.super_admin_assign_subscription(uuid,uuid,text,text,integer) to authenticated;