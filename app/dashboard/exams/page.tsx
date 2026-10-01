import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExamsClient from "@/components/exams-client";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");
  const userId = data.claims.sub;
  const { data: membership } = await supabase.from("school_users").select("school_id, display_name").eq("user_id", userId).eq("is_active", true).not("school_id", "is", null).limit(1).maybeSingle();
  if (!membership?.school_id) return <main className="content"><div className="card"><h1>School access is not configured</h1><p className="muted">Your account has not been assigned to a school.</p></div></main>;

  const schoolId = membership.school_id;
  const [{ data: school }, { data: exams }, { data: schedules }, { data: classes }, { data: sections }, { data: subjects }, { data: students }, { data: marks }] = await Promise.all([
    supabase.from("schools").select("name").eq("id", schoolId).single(),
    supabase.from("exams").select("id,name,exam_type,start_date,end_date,status").eq("school_id", schoolId).order("start_date", { ascending: false }),
    supabase.from("exam_schedules").select("id,exam_id,class_id,section_id,subject_id,exam_date,start_time,duration_minutes,max_marks").eq("school_id", schoolId).order("exam_date"),
    supabase.from("classes").select("id,name,display_order").eq("school_id", schoolId).eq("is_active", true).order("display_order"),
    supabase.from("sections").select("id,class_id,name").eq("school_id", schoolId).eq("is_active", true).order("name"),
    supabase.from("subjects").select("id,name,code").eq("school_id", schoolId).order("name"),
    supabase.from("students").select("id,name,admission_no,class_id,section_id,class_name,section,status").eq("school_id", schoolId).order("name"),
    supabase.from("exam_marks").select("id,exam_schedule_id,student_id,marks,grade,remarks").eq("school_id", schoolId)
  ]);

  const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Settings","/dashboard/settings"]];

  return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h])=><a className={n==="Exams & Results"?"active":""} href={h} key={n}>{n}</a>)}</div></aside>
    <main className="main"><header className="top"><strong>{school?.name ?? "School"}</strong><span className="muted">School Admin · {membership.display_name ?? "Admin"}</span></header>
      <section className="content"><div className="hero"><div><h1>Exams & Results</h1><p className="muted">Create exams, schedule subjects, enter marks and generate report-card summaries.</p></div><span className="badge">Live · Supabase</span></div>
        <ExamsClient schoolId={schoolId} userId={userId} exams={exams||[]} schedules={schedules||[]} classes={classes||[]} sections={sections||[]} subjects={subjects||[]} students={students||[]} marks={marks||[]} />
      </section>
    </main></div>;
}