import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdmissionsClient from "@/components/admissions-client";

export default async function AdmissionsPage() {
  const supabase=await createClient();
  const {data}=await supabase.auth.getClaims();
  if(!data?.claims?.sub) redirect("/login");
  const {data:membership}=await supabase.from("school_users").select("school_id,display_name").eq("user_id",data.claims.sub).eq("is_active",true).not("school_id","is",null).limit(1).maybeSingle();
  if(!membership?.school_id) return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;
  const [{data:school},{data:enquiries}]=await Promise.all([
    supabase.from("schools").select("name,city,state").eq("id",membership.school_id).single(),
    supabase.from("admission_enquiries").select("id,enquiry_no,student_name,class_interested,parent_name,parent_phone,parent_email,source,status,next_follow_up_at,notes").eq("school_id",membership.school_id).order("created_at",{ascending:false})
  ]);
  const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Settings","/dashboard/settings"]];
  return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Admissions"?"active":""} href={h} key={n}>{n}</a>)}</div></aside><main className="main"><header className="top"><strong>{school?.name??"School"}</strong><span className="muted">School Admin · {membership.display_name??"Admin"}</span></header><section className="content"><div className="hero"><div><h1>Admissions CRM</h1><p className="muted">Manage enquiries, follow-ups and the admission pipeline for {school?.name??"your school"}.</p></div><span className="badge">Live · Supabase</span></div><AdmissionsClient schoolId={membership.school_id} initial={enquiries??[]}/></section></main></div>;
}