import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommunicationClient from "@/components/communication-client";

export default async function Page(){
 const supabase=await createClient();
 const {data}=await supabase.auth.getClaims();
 if(!data?.claims?.sub) redirect("/login");
 const userId=data.claims.sub;
 const {data:membership}=await supabase.from("school_users").select("school_id,display_name").eq("user_id",userId).eq("is_active",true).not("school_id","is",null).limit(1).maybeSingle();
 if(!membership?.school_id)return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;
 const schoolId=membership.school_id;
 const [{data:school},{data:notifications},{data:reads},{data:users},{data:roles}]=await Promise.all([
  supabase.from("schools").select("name").eq("id",schoolId).single(),
  supabase.from("notifications").select("id,title,message,notification_type,target_type,target_role,recipient_user_id,scheduled_at,published_at,status,created_at").eq("school_id",schoolId).order("created_at",{ascending:false}),
  supabase.from("notification_reads").select("notification_id").eq("user_id",userId),
  supabase.from("school_users").select("user_id,display_name").eq("school_id",schoolId).eq("is_active",true).order("display_name"),
  supabase.from("roles").select("name").order("name")
 ]);
 const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Timetable","/dashboard/timetable"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Communication","/dashboard/communication"],["Reports","/dashboard/reports"],["Leave Management","/dashboard/leave"],["Settings","/dashboard/settings"]];
 return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Communication"?"active":""} href={h} key={n}>{n}</a>)}</div></aside><main className="main"><header className="top"><strong>{school?.name??"School"}</strong><span className="muted">School Admin · {membership.display_name??"Admin"}</span></header><section className="content communication-page"><div className="hero"><div><h1>Communication Center</h1><p className="muted">Manage in-app school communication and notifications.</p></div><span className="badge">Live · Supabase</span></div><CommunicationClient schoolId={schoolId} userId={userId} notifications={notifications||[]} users={users||[]} roles={roles||[]} readIds={(reads||[]).map(r=>r.notification_id)}/></section></main></div>;
}