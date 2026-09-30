import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AcademicsClient from "@/components/academics-client";
export default async function Page(){
 const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); if(!data?.claims?.sub)redirect("/login");
 const {data:m}=await supabase.from("school_users").select("school_id,display_name").eq("user_id",data.claims.sub).eq("is_active",true).not("school_id","is",null).limit(1).maybeSingle();
 if(!m?.school_id)return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;
 const [{data:school},{data:classes},{data:sections},{data:subjects},{data:teachers},{data:assignments}]=await Promise.all([
  supabase.from("schools").select("name").eq("id",m.school_id).single(),
  supabase.from("classes").select("id,name,display_order").eq("school_id",m.school_id).order("display_order"),
  supabase.from("sections").select("id,class_id,name,capacity").eq("school_id",m.school_id).order("name"),
  supabase.from("subjects").select("id,name,code").eq("school_id",m.school_id).order("name"),
  supabase.from("staff").select("id,name,employee_no").eq("school_id",m.school_id).ilike("designation","%teacher%").eq("status","active").order("name"),
  supabase.from("teacher_assignments").select("id,staff_id,class_id,section_id,subject_id").eq("school_id",m.school_id)
 ]);
 const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Settings","/dashboard/settings"]];
 return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Academics"?"active":""} href={h} key={n}>{n}</a>)}</div></aside><main className="main"><header className="top"><strong>{school?.name||"School"}</strong><span className="muted">School Admin · {m.display_name||"Admin"}</span></header><section className="content"><div className="hero"><div><h1>Academics</h1><p className="muted">Manage classes, sections, subjects and teacher assignments.</p></div><span className="badge">Live · Supabase</span></div><AcademicsClient schoolId={m.school_id} classes={classes||[]} sections={sections||[]} subjects={subjects||[]} teachers={teachers||[]} assignments={assignments||[]}/></section></main></div>;
}