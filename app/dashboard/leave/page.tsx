import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaveClient from "@/components/leave-client";

export default async function LeavePage(){
 const supabase=await createClient();
 const {data}=await supabase.auth.getClaims();
 if(!data?.claims?.sub)redirect("/login");
 const userId=data.claims.sub;
 const {data:membership}=await supabase.from("school_users").select("school_id,display_name").eq("user_id",userId).eq("is_active",true).not("school_id","is",null).limit(1).maybeSingle();
 if(!membership?.school_id)return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;
 const schoolId=membership.school_id;
 const [{data:school},{data:staff},{data:students},{data:leaves}]=await Promise.all([
  supabase.from("schools").select("name").eq("id",schoolId).single(),
  supabase.from("staff").select("id,name,employee_no,designation").eq("school_id",schoolId).eq("status","active").order("name"),
  supabase.from("students").select("id,name,admission_no,class_name,section").eq("school_id",schoolId).order("name").limit(1000),
  supabase.from("leave_requests").select("id,requester_type,requester_id,leave_type,start_date,end_date,reason,status,review_notes,created_at").eq("school_id",schoolId).order("created_at",{ascending:false}).limit(1000)
 ]);
 const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Leave Management","/dashboard/leave"],["Settings","/dashboard/settings"]];
 return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Leave Management"?"active":""} href={h} key={n}>{n}</a>)}</div></aside><main className="main"><header className="top"><strong>{school?.name??"School"}</strong><span className="muted">School Admin · {membership.display_name??"Admin"}</span></header><section className="content leave-page"><div className="hero"><div><h1>Leave Management</h1><p className="muted">Create, review and track staff and student leave requests.</p></div><span className="badge">Live · Supabase</span></div><LeaveClient schoolId={schoolId} userId={userId} staff={staff??[]} students={students??[]} initial={leaves??[]}/></section></main></div>;
}
