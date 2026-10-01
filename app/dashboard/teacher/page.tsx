import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: membership } = await supabase.from("school_users").select("school_id,display_name,is_active").eq("user_id",userId).eq("is_active",true).limit(1).maybeSingle();
  if (!membership?.school_id) redirect("/login");
  const schoolId = membership.school_id;

  const { data: roleRow } = await supabase.from("user_roles").select("role_id").eq("school_id",schoolId).eq("user_id",userId).limit(1).maybeSingle();
  const { data: role } = roleRow?.role_id ? await supabase.from("roles").select("name,description").eq("id",roleRow.role_id).maybeSingle() : {data:null};
  if (!role || !["teacher","staff"].includes(role.name)) redirect("/dashboard");

  const { data: staff } = await supabase.from("staff").select("id,name,employee_no,designation,department").eq("school_id",schoolId).eq("user_id",userId).maybeSingle();
  const staffId = staff?.id;

  const [assignmentResult, timetableResult, homeworkResult, leaveResult, schoolResult] = await Promise.all([
    staffId ? supabase.from("teacher_assignments").select("id,class_id,section_id,subject_id,is_primary").eq("school_id",schoolId).eq("teacher_id",staffId) : Promise.resolve({data:[]}),
    staffId ? supabase.from("timetables").select("id,class_id,section_id,subject_id,day_of_week,period_no,start_time,end_time,room,status").eq("school_id",schoolId).eq("teacher_id",staffId).eq("status","active").order("day_of_week").order("period_no") : Promise.resolve({data:[]}),
    staffId ? supabase.from("homework").select("id,title,assigned_date,due_date,status").eq("school_id",schoolId).eq("teacher_id",staffId).order("due_date",{ascending:true}).limit(5) : Promise.resolve({data:[]}),
    staffId ? supabase.from("leave_requests").select("id,leave_type,start_date,end_date,status,reason").eq("school_id",schoolId).eq("requester_type","staff").eq("requester_id",staffId).order("created_at",{ascending:false}).limit(5) : Promise.resolve({data:[]}),
    supabase.from("schools").select("name").eq("id",schoolId).single()
  ]);

  const classIds=[...new Set((assignmentResult.data??[]).map((x:any)=>x.class_id))];
  const sectionIds=[...new Set((assignmentResult.data??[]).map((x:any)=>x.section_id))];
  const subjectIds=[...new Set((assignmentResult.data??[]).map((x:any)=>x.subject_id))];
  const [{data:classes},{data:sections},{data:subjects}] = await Promise.all([
    classIds.length ? supabase.from("classes").select("id,name").in("id",classIds) : Promise.resolve({data:[]}),
    sectionIds.length ? supabase.from("sections").select("id,name").in("id",sectionIds) : Promise.resolve({data:[]}),
    subjectIds.length ? supabase.from("subjects").select("id,name").in("id",subjectIds) : Promise.resolve({data:[]})
  ]);
  const cm=new Map((classes??[]).map((x:any)=>[x.id,x.name])), sm=new Map((sections??[]).map((x:any)=>[x.id,x.name])), subm=new Map((subjects??[]).map((x:any)=>[x.id,x.name]));
  const assignmentNames=(assignmentResult.data??[]).map((x:any)=>String(cm.get(x.class_id)??"Class")+" "+String(sm.get(x.section_id)??"")+" · "+String(subm.get(x.subject_id)??"Subject"));

  const nav=[["My Dashboard","/dashboard/teacher"],["My Classes","/dashboard/academics"],["Attendance","/dashboard/attendance"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Timetable","/dashboard/timetable"],["Leave","/dashboard/leave"],["Communication","/dashboard/communication"]];
  return <div className="shell">
    <aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([n,h],i)=><Link className={i===0?"active":""} href={h} key={n}>{n}</Link>)}</div></aside>
    <main className="main"><header className="top"><strong>{schoolResult.data?.name??"School"}</strong><span className="muted">{role.description??role.name} · {membership.display_name??"User"}</span></header>
      <section className="content">
        <div className="hero"><div><h1>Welcome, {staff?.name??membership.display_name??"Teacher"}</h1><p className="muted">Your role-based teaching workspace.</p></div><span className="badge">Live · Supabase</span></div>
        <div className="cards">
          <div className="card"><div className="label">Assigned Classes</div><div className="value">{classIds.length}</div></div>
          <div className="card"><div className="label">Subjects</div><div className="value">{subjectIds.length}</div></div>
          <div className="card"><div className="label">Timetable Periods</div><div className="value">{timetableResult.data?.length??0}</div></div>
          <div className="card"><div className="label">Pending Leave</div><div className="value">{(leaveResult.data??[]).filter((x:any)=>x.status==="pending").length}</div></div>
        </div>
        <div className="grid">
          <div className="card"><h2>My Classes & Subjects</h2>{assignmentNames.length?assignmentNames.map((x,i)=><div className="row" key={i}><strong>{x}</strong><span>→</span></div>):<p className="muted">No teaching assignments have been assigned yet.</p>}</div>
          <div className="card"><h2>Upcoming Homework</h2>{(homeworkResult.data??[]).length?(homeworkResult.data??[]).map((x:any)=><div className="row" key={x.id}><div><strong>{x.title}</strong><div className="muted">Due {x.due_date??"—"}</div></div><span className="badge">{x.status}</span></div>):<p className="muted">No homework assigned by you yet.</p>}</div>
        </div>
        <div className="card" style={{marginTop:16}}><h2>My Timetable</h2>{(timetableResult.data??[]).length?(timetableResult.data??[]).slice(0,8).map((x:any)=><div className="row" key={x.id}><div><strong>Period {x.period_no} · {subm.get(x.subject_id)??"Subject"}</strong><div className="muted">Day {x.day_of_week} · {cm.get(x.class_id)??"Class"} {sm.get(x.section_id)??""} · {x.start_time?.slice(0,5)}–{x.end_time?.slice(0,5)} {x.room?("· "+x.room):""}</div></div></div>):<p className="muted">No timetable periods assigned yet.</p>}</div>
      </section>
    </main>
  </div>;
}