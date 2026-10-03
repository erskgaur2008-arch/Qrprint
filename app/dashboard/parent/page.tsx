import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ParentDashboard(){
  const sb=await createClient();
  const {data:c}=await sb.auth.getClaims();
  const uid=c?.claims?.sub;
  if(!uid) redirect("/parent-login");
  const {data:p}=await sb.from("parents").select("id,name,school_id,email,phone").eq("user_id",uid).maybeSingle();
  if(!p)return <main className="content"><div className="card"><h1>Parent profile not linked</h1><p className="muted">Ask the school administrator to link your account.</p></div></main>;

  const {data:links}=await sb.from("student_parents").select("student_id,relationship,is_primary").eq("parent_id",p.id);
  const ids=(links??[]).map(x=>x.student_id);
  const [{data:students},{data:school}]=await Promise.all([
    ids.length?sb.from("students").select("id,name,admission_no,class_name,section,class_id,section_id,status").in("id",ids):Promise.resolve({data:[]}),
    sb.from("schools").select("name").eq("id",p.school_id).single()
  ]);
  const [{data:attendance},{data:fees},{data:homework},{data:marks},{data:reports},{data:timetable},{data:notices},{data:notifications},{data:leaves}]=await Promise.all([
    ids.length?sb.from("student_attendance").select("student_id,attendance_date,status").in("student_id",ids).order("attendance_date",{ascending:false}).limit(50):Promise.resolve({data:[]}),
    ids.length?sb.from("student_fees").select("student_id,description,amount,discount,due_date,status").in("student_id",ids).order("due_date",{ascending:false}).limit(50):Promise.resolve({data:[]}),
    sb.from("homework").select("id,class_id,section_id,subject_id,title,description,assigned_date,due_date,status").eq("school_id",p.school_id).order("due_date",{ascending:false}).limit(20),
    ids.length?sb.from("exam_marks").select("student_id,exam_schedule_id,marks,grade,remarks").in("student_id",ids).order("created_at",{ascending:false}).limit(50):Promise.resolve({data:[]}),
    ids.length?sb.from("report_cards").select("student_id,exam_id,total_marks,max_marks,percentage,overall_grade,remarks,status").in("student_id",ids).order("created_at",{ascending:false}).limit(20):Promise.resolve({data:[]}),
    sb.from("timetables").select("class_id,section_id,subject_id,day_of_week,period_no,start_time,end_time,room,status").eq("school_id",p.school_id).eq("status","active").order("day_of_week").order("period_no"),
    sb.from("notices").select("id,title,content,publish_date,status").eq("school_id",p.school_id).eq("status","published").order("publish_date",{ascending:false}).limit(10),
    sb.from("notifications").select("id,title,message,notification_type,status,created_at").eq("school_id",p.school_id).eq("status","published").order("created_at",{ascending:false}).limit(10),
    ids.length?sb.from("leave_requests").select("requester_id,leave_type,start_date,end_date,status,reason").eq("school_id",p.school_id).eq("requester_type","student").in("requester_id",ids).order("created_at",{ascending:false}).limit(20):Promise.resolve({data:[]})
  ]);
  const names=new Map((students??[]).map(s=>[s.id,s.name]));
  const childClassIds=new Set((students??[]).map(s=>s.class_id).filter(Boolean));
  const childSectionIds=new Set((students??[]).map(s=>s.section_id).filter(Boolean));
  const relevantHomework=(homework??[]).filter(h=>childClassIds.has(h.class_id)&&(!h.section_id||childSectionIds.has(h.section_id))).slice(0,8);
  const relevantTimetable=(timetable??[]).filter(t=>childClassIds.has(t.class_id)&&childSectionIds.has(t.section_id)).slice(0,12);
  const attendanceCount=(attendance??[]).filter(a=>a.status==="present"||a.status==="late").length;
  const feeDue=(fees??[]).reduce((n,f)=>n+Number(f.amount||0)-Number(f.discount||0),0);
  return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav"><a className="active" href="/dashboard/parent">Home</a><a href="/dashboard/parent#attendance">Attendance</a><a href="/dashboard/parent#fees">Fees</a><a href="/dashboard/parent#homework">Homework</a><a href="/dashboard/parent#results">Results</a><a href="/dashboard/parent#timetable">Timetable</a><a href="/dashboard/parent#notices">Notices</a><a href="/dashboard/parent#communication">Communication</a><a href="/dashboard/parent#leave">Leave</a></div></aside><main className="main"><header className="top"><strong>{school?.name??"School"}</strong><span className="muted">Parent · {p.name}</span></header><section className="content"><div className="hero"><div><h1>Parent Portal</h1><p className="muted">One place to monitor every child.</p></div><span className="badge">Live · Supabase</span></div>
  <div className="cards"><div className="card"><div className="label">Children</div><div className="value">{students?.length??0}</div></div><div className="card"><div className="label">Recent Attendance</div><div className="value">{attendanceCount}</div></div><div className="card"><div className="label">Fee Ledger Items</div><div className="value">{fees?.length??0}</div></div><div className="card"><div className="label">Fee Billed</div><div className="value">₹{feeDue.toLocaleString("en-IN")}</div></div></div>
  <div className="card" style={{marginTop:16}}><h2>My Children</h2><div className="grid">{(students??[]).map(s=><div className="card" key={s.id}><h3>{s.name}</h3><p className="muted">{s.admission_no??"No admission no."} · {s.class_name??"Class"} {s.section??""}</p><div className="row"><span>Relationship</span><strong>{links?.find(l=>l.student_id===s.id)?.relationship??"Parent"}</strong></div><div className="row"><span>Status</span><strong>{s.status}</strong></div></div>)}</div></div>
  <div id="attendance" className="card" style={{marginTop:16}}><h2>Attendance</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>Child</th><th>Date</th><th>Status</th></tr></thead><tbody>{(attendance??[]).slice(0,20).map((a,i)=><tr key={i}><td>{names.get(a.student_id)??"Student"}</td><td>{a.attendance_date}</td><td><span className="badge">{a.status}</span></td></tr>)}</tbody></table></div></div>
  <div id="fees" className="card" style={{marginTop:16}}><h2>Fees</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>Child</th><th>Description</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>{(fees??[]).map((f,i)=><tr key={i}><td>{names.get(f.student_id)??"Student"}</td><td>{f.description??"Fee"}</td><td>₹{Number(f.amount||0).toLocaleString("en-IN")}</td><td>{f.due_date??"—"}</td><td><span className="badge">{f.status}</span></td></tr>)}</tbody></table></div></div>
  <div id="homework" className="card" style={{marginTop:16}}><h2>Homework</h2>{relevantHomework.length?relevantHomework.map(h=><div className="row" key={h.id}><div><strong>{h.title}</strong><div className="muted">{h.description??"Assigned homework"} · Due {h.due_date??"—"}</div></div><span className="badge">{h.status}</span></div>):<p className="muted">No recent homework.</p>}</div>
  <div id="results" className="card" style={{marginTop:16}}><h2>Results & Report Cards</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>Child</th><th>Marks</th><th>Grade</th><th>Percentage</th><th>Status</th></tr></thead><tbody>{(reports??[]).map((r,i)=><tr key={i}><td>{names.get(r.student_id)??"Student"}</td><td>{r.total_marks}/{r.max_marks}</td><td>{r.overall_grade??"—"}</td><td>{r.percentage??"—"}%</td><td>{r.status}</td></tr>)}{!(reports??[]).length&&(marks??[]).slice(0,10).map((m,i)=><tr key={"m"+i}><td>{names.get(m.student_id)??"Student"}</td><td>{m.marks??"—"}</td><td>{m.grade??"—"}</td><td>—</td><td>{m.remarks??"—"}</td></tr>)}</tbody></table></div></div>
  <div id="timetable" className="card" style={{marginTop:16}}><h2>Timetable</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>Day</th><th>Period</th><th>Time</th><th>Room</th></tr></thead><tbody>{relevantTimetable.map((t,i)=><tr key={i}><td>{["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][t.day_of_week]??t.day_of_week}</td><td>{t.period_no}</td><td>{String(t.start_time).slice(0,5)}–{String(t.end_time).slice(0,5)}</td><td>{t.room??"—"}</td></tr>)}</tbody></table></div></div>
  <div id="notices" className="card" style={{marginTop:16}}><h2>Notices</h2>{(notices??[]).map(n=><div className="row" key={n.id}><div><strong>{n.title}</strong><div className="muted">{n.content}</div></div><span>{n.publish_date}</span></div>)}</div>
  <div id="communication" className="card" style={{marginTop:16}}><h2>Communication</h2>{(notifications??[]).map(n=><div className="row" key={n.id}><div><strong>{n.title}</strong><div className="muted">{n.message}</div></div><span className="badge">{n.notification_type}</span></div>)}{!(notifications??[]).length&&<p className="muted">No new notifications.</p>}</div>
  <div id="leave" className="card" style={{marginTop:16}}><h2>Leave</h2>{(leaves??[]).map((l,i)=><div className="row" key={i}><div><strong>{names.get(l.requester_id)??"Student"} · {l.leave_type}</strong><div className="muted">{l.start_date} to {l.end_date} · {l.reason??""}</div></div><span className="badge">{l.status}</span></div>)}{!(leaves??[]).length&&<p className="muted">No leave requests found.</p>}</div>
  <div className="card" style={{marginTop:16}}><h2>Account</h2><p className="muted">{p.email??"No email"} · {p.phone??"No phone"}</p><a className="button" href="/login">School Login</a></div>
 </section></main></div>;
}