import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");
  const { data: membership } = await supabase.from("school_users").select("school_id, display_name").eq("user_id", data.claims.sub).eq("is_active", true).not("school_id", "is", null).limit(1).maybeSingle();
  if (!membership?.school_id) return <main className="content"><div className="card"><h1>School access is not configured</h1><p className="muted">Your account has not been assigned to a school.</p></div></main>;
  const { data: school } = await supabase.from("schools").select("name").eq("id", membership.school_id).single();
  return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">
    <a href="/dashboard">Dashboard</a><a href="/dashboard/students">Students</a><a href="/dashboard/parents">Parents</a><a href="/dashboard/staff">Teachers & Staff</a><a href="/dashboard/admissions">Admissions</a><a href="/dashboard/attendance">Attendance</a><a href="/dashboard/fees">Fees</a><a href="/dashboard/academics">Academics</a><a href="/dashboard/homework">Homework</a><a href="/dashboard/exams">Exams & Results</a><a href="/dashboard/notices">Notices & Events</a><a href="/dashboard/reports">Reports</a><a href="/dashboard/settings">Settings</a>
  </div></aside><main className="main"><header className="top"><strong>{school?.name ?? "School"}</strong><span className="muted">School Admin · {membership.display_name ?? "Admin"}</span></header><section className="content"><div className="hero"><div><h1>Exams & Results</h1><p className="muted">Manage exams, marks and report cards.</p></div><span className="badge">Connected · Supabase</span></div><div className="card"><h2>Exams & Results</h2><p className="muted">This module is connected to your school account. The full workflow is the next build step.</p><a className="row" href="/dashboard"><strong>← Back to Dashboard</strong><span>→</span></a></div></section></main></div>;
}
