import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TimetableClient from "@/components/timetable-client";

export default async function TimetablePage(){
 const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); if(!data?.claims?.sub)redirect("/login");
 const {data:m}=await supabase.from("school_users").select("school_id,display_name").eq("user_id",data.claims.sub).eq("is_active",true).not("school_id","is",null).limit(1).maybeSingle();
 if(!m?.school_id)return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;
 const sid=m.school_id;
 const [{data:school},{data:classes},{data:sections},{data:subjects},{data:teachers},{data:rows}]=await Promise.all([
  supabase.from("schools").select("name").eq("id",sid).single(),
  supabase.from("classes").select("id,name").eq("school_id",sid).eq("status","active").order("display_order"),
  supabase.from("sections").select("id,name,class_id").eq("school_id",sid).eq("status","active").order("name"),
  supabase.from("subjects").select("id,name").eq("school_id",sid).eq("status","active").order("name"),
  supabase.from("staff").select("id,name,employee_no").eq("school_id",sid).eq("status","active").ilike("designation","%teacher%").order("name"),
  supabase.from("timetables").select("id,class_id,section_id,subject_id,teacher_id,day_of_week,period_no,start_time,end_time,room,status").eq("school_id",sid).order("day_of_week").order("start_time")
 ]);
 const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Timetable","/dashboard/timetable"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Leave Management","/dashboard/leave"],["Settings","/dashboard/settings"]];
 return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Timetable"?"active":""} href={h} key={n}>{n}</a>)}</div></aside><main className="main"><header className="top"><strong>{school?.name??"School"}</strong><span className="muted">School Admin · {m.display_name??"Admin"}</span></header><section className="content"><div className="hero"><div><h1>Timetable</h1><p className="muted">Create and manage class schedules with teacher conflict protection.</p></div><span className="badge">Live · Supabase</span></div><TimetableClient schoolId={sid} userId={data.claims.sub} classes={classes??[]} sections={sections??[]} subjects={subjects??[]} teachers={teachers??[]} initial={rows??[]}/></section></main></div>;
}