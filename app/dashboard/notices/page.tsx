import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NoticesClient from "@/components/notices-client";

export default async function Page(){
 const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); if(!data?.claims?.sub)redirect("/login");
 const userId=data.claims.sub; const {data:membership}=await supabase.from("school_users").select("school_id,display_name").eq("user_id",userId).eq("is_active",true).not("school_id","is",null).limit(1).maybeSingle();
 if(!membership?.school_id)return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;
 const schoolId=membership.school_id; const [{data:school},{data:notices},{data:events}]=await Promise.all([
  supabase.from("schools").select("name").eq("id",schoolId).single(),
  supabase.from("notices").select("id,title,content,audience,publish_date,status").eq("school_id",schoolId).order("publish_date",{ascending:false}),
  supabase.from("events").select("id,title,description,event_date,start_time,end_time,location,status").eq("school_id",schoolId).order("event_date",{ascending:true})
 ]);
 const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Settings","/dashboard/settings"]];
 return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Notices & Events"?"active":""} href={h} key={n}>{n}</a>)}</div></aside><main className="main"><header className="top"><strong>{school?.name??"School"}</strong><span className="muted">School Admin · {membership.display_name??"Admin"}</span></header><section className="content"><div className="hero"><div><h1>Notices & Events</h1><p className="muted">Create, publish and manage school notices and events.</p></div><span className="badge">Live · Supabase</span></div><NoticesClient schoolId={schoolId} userId={userId} notices={notices||[]} events={events||[]}/></section></main></div>;
}