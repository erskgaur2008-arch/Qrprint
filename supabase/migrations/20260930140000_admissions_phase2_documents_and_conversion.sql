-- Admissions Phase 2: documents, application conversion and admission workflow
create table if not exists public.admission_documents (
 id uuid primary key default gen_random_uuid(),
 school_id uuid not null references public.schools(id) on delete cascade,
 application_id uuid not null references public.admission_applications(id) on delete cascade,
 document_type text not null,
 file_url text,
 status text not null default 'pending' check(status in ('pending','submitted','verified','rejected')),
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists admission_documents_application_idx on public.admission_documents(school_id,application_id);
alter table public.admission_documents enable row level security;
drop policy if exists admission_documents_tenant on public.admission_documents;
create policy admission_documents_tenant on public.admission_documents for all to authenticated using (school_id in (select private.user_school_ids())) with check (school_id in (select private.user_school_ids()));
alter table public.admission_applications add column if not exists enquiry_id uuid references public.admission_enquiries(id) on delete set null;
alter table public.admission_applications add column if not exists parent_email text;
create or replace function public.admit_application(p_application_id uuid, p_class_name text default null, p_section text default null)
returns uuid language plpgsql security definer set search_path = public, private as $$
declare a public.admission_applications%rowtype; school uuid; student_uuid uuid; parent_uuid uuid; adm_no text; parent_name text;
begin
 select * into a from public.admission_applications where id=p_application_id for update;
 if not found then raise exception 'Application not found'; end if;
 school:=a.school_id;
 if not exists (select 1 from private.user_school_ids() where id=school) then raise exception 'School access denied'; end if;
 if a.status <> 'approved' and a.status <> 'fee_pending' then raise exception 'Application must be approved or fee pending before admission'; end if;
 adm_no := 'ADM-' || to_char(now(),'YYYY') || '-' || lpad((coalesce((select count(*) from public.students where school_id=school),0)+1)::text,4,'0');
 insert into public.students(school_id,admission_no,name,class_name,section,admission_date,status)
 values(school,adm_no,a.student_name,coalesce(p_class_name,a.class_applied),p_section,current_date,'admitted') returning id into student_uuid;
 parent_name:=coalesce(a.parent_name,'Parent / Guardian');
 insert into public.parents(school_id,name,phone,email) values(school,parent_name,a.parent_phone,a.parent_email) returning id into parent_uuid;
 insert into public.student_parents(student_id,parent_id,relationship,is_primary) values(student_uuid,parent_uuid,'Parent / Guardian',true);
 update public.admission_applications set status='admitted',updated_at=now() where id=a.id;
 if a.enquiry_id is not null then update public.admission_enquiries set status='admitted',updated_at=now() where id=a.enquiry_id; end if;
 return student_uuid;
end; $$;
revoke all on function public.admit_application(uuid,text,text) from public;
grant execute on function public.admit_application(uuid,text,text) to authenticated;
