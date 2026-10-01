import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "@/components/reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const { data: membership } = await supabase
    .from("school_users")
    .select("school_id, display_name")
    .eq("user_id", claims.sub)
    .eq("is_active", true)
    .not("school_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!membership?.school_id) {
    return <main className="content"><div className="card"><h1>School access is not configured</h1><p className="muted">Your account has not been assigned to a school.</p></div></main>;
  }

  const schoolId = membership.school_id;
  const [schoolResult, studentsResult, staffResult, parentsResult, attendanceResult, feesResult, paymentsResult, enquiriesResult, applicationsResult, marksResult] = await Promise.all([
    supabase.from("schools").select("name").eq("id", schoolId).single(),
    supabase.from("students").select("id,name,admission_no,class_id,section_id,class_name,section,status,gender").eq("school_id", schoolId).order("name").limit(1000),
    supabase.from("staff").select("id,name,employee_no,designation,status").eq("school_id", schoolId).order("name").limit(1000),
    supabase.from("parents").select("id,name,phone,email,status").eq("school_id", schoolId).order("name").limit(1000),
    supabase.from("student_attendance").select("id,student_id,attendance_date,status").eq("school_id", schoolId).order("attendance_date",{ascending:false}).limit(1000),
    supabase.from("student_fees").select("id,student_id,description,amount,discount,due_date,status").eq("school_id", schoolId).order("due_date",{ascending:false}).limit(1000),
    supabase.from("payments").select("id,student_id,student_fee_id,amount,payment_mode,paid_at,transaction_reference").eq("school_id", schoolId).order("paid_at",{ascending:false}).limit(1000),
    supabase.from("admission_enquiries").select("id,enquiry_no,student_name,class_interested,parent_name,parent_phone,source,status,next_follow_up_at,created_at").eq("school_id", schoolId).order("created_at",{ascending:false}).limit(1000),
    supabase.from("admission_applications").select("id,application_no,student_name,class_applied,parent_name,status,created_at").eq("school_id", schoolId).order("created_at",{ascending:false}).limit(1000),
    supabase.from("exam_marks").select("id,student_id,exam_schedule_id,marks,grade,remarks").eq("school_id", schoolId).order("created_at",{ascending:false}).limit(1000)
  ]);

  const students = studentsResult.data ?? [];
  const staff = staffResult.data ?? [];
  const parents = parentsResult.data ?? [];
  const attendance = attendanceResult.data ?? [];
  const fees = feesResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const enquiries = enquiriesResult.data ?? [];
  const applications = applicationsResult.data ?? [];
  const marks = marksResult.data ?? [];

  const classIds = Array.from(new Set(students.map(s=>s.class_id).filter(Boolean))) as string[];
  const sectionIds = Array.from(new Set(students.map(s=>s.section_id).filter(Boolean))) as string[];
  const scheduleIds = Array.from(new Set(marks.map(m=>m.exam_schedule_id)));
  const [{data:classes},{data:sections},{data:schedules}] = await Promise.all([
    classIds.length ? supabase.from("classes").select("id,name").in("id",classIds) : Promise.resolve({data:[] as {id:string;name:string}[]}),
    sectionIds.length ? supabase.from("sections").select("id,name").in("id",sectionIds) : Promise.resolve({data:[] as {id:string;name:string}[]}),
    scheduleIds.length ? supabase.from("exam_schedules").select("id,exam_id,class_id,section_id,subject_id,exam_date,max_marks").in("id",scheduleIds) : Promise.resolve({data:[] as any[]})
  ]);

  const examIds = Array.from(new Set((schedules??[]).map(s=>s.exam_id)));
  const subjectIds = Array.from(new Set((schedules??[]).map(s=>s.subject_id)));
  const [{data:exams},{data:subjects}] = await Promise.all([
    examIds.length ? supabase.from("exams").select("id,name").in("id",examIds) : Promise.resolve({data:[] as {id:string;name:string}[]}),
    subjectIds.length ? supabase.from("subjects").select("id,name").in("id",subjectIds) : Promise.resolve({data:[] as {id:string;name:string}[]})
  ]);

  const classMap = new Map((classes??[]).map(x=>[x.id,x.name]));
  const sectionMap = new Map((sections??[]).map(x=>[x.id,x.name]));
  const studentMap = new Map(students.map(s=>[s.id,s]));
  const scheduleMap = new Map((schedules??[]).map(x=>[x.id,x]));
  const examMap = new Map((exams??[]).map(x=>[x.id,x.name]));
  const subjectMap = new Map((subjects??[]).map(x=>[x.id,x.name]));

  const studentRows = students.map(s=>({name:s.name,admission_no:s.admission_no,class:classMap.get(s.class_id??"")??s.class_name??"—",section:sectionMap.get(s.section_id??"")??s.section??"—",gender:s.gender??"—",status:s.status}));
  const attendanceRows = attendance.map(a=>{const s=studentMap.get(a.student_id);return {date:a.attendance_date,student:s?.name??"Student",admission_no:s?.admission_no??"—",class:classMap.get(s?.class_id??"")??s?.class_name??"—",section:sectionMap.get(s?.section_id??"")??s?.section??"—",status:a.status};});
  const paidByFee = new Map<string,number>();
  for(const p of payments) paidByFee.set(p.student_fee_id,(paidByFee.get(p.student_fee_id)??0)+Number(p.amount));
  const feeRows = fees.map(f=>{const s=studentMap.get(f.student_id);const billed=Number(f.amount)-Number(f.discount);const paid=paidByFee.get(f.id)??0;return {date:f.due_date??"",student:s?.name??"Student",admission_no:s?.admission_no??"—",class:classMap.get(s?.class_id??"")??s?.class_name??"—",section:sectionMap.get(s?.section_id??"")??s?.section??"—",description:f.description,billed,paid,balance:Math.max(0,billed-paid),status:Math.max(0,billed-paid)===0?"paid":f.status};});
  const admissionRows = enquiries.map(e=>({date:e.created_at.slice(0,10),enquiry_no:e.enquiry_no,student:e.student_name,class:e.class_interested??"—",parent:e.parent_name??"—",source:e.source??"—",status:e.status,next_follow_up:e.next_follow_up_at?.slice(0,10)??"—"}));
  const examRows = marks.map(m=>{const s=studentMap.get(m.student_id);const sc=scheduleMap.get(m.exam_schedule_id);return {exam:examMap.get(sc?.exam_id??"")??"Exam",date:sc?.exam_date??"",student:s?.name??"Student",class:classMap.get(sc?.class_id??"")??"—",section:sectionMap.get(sc?.section_id??"")??"—",subject:subjectMap.get(sc?.subject_id??"")??"—",marks:m.marks,max_marks:sc?.max_marks??"—",grade:m.grade??"—",status:"entered"};});
  const staffRows = staff.map(s=>({name:s.name,employee_no:s.employee_no??"—",designation:s.designation??"—",status:s.status}));
  const totalBilled=fees.reduce((n,f)=>n+Number(f.amount)-Number(f.discount),0);
  const totalPaid=payments.reduce((n,p)=>n+Number(p.amount),0);
  const presentCount=attendance.filter(a=>["present","late"].includes(String(a.status).toLowerCase())).length;

  const nav=[["Dashboard","/dashboard"],["Students","/dashboard/students"],["Parents","/dashboard/parents"],["Teachers & Staff","/dashboard/staff"],["Admissions","/dashboard/admissions"],["Attendance","/dashboard/attendance"],["Fees","/dashboard/fees"],["Academics","/dashboard/academics"],["Homework","/dashboard/homework"],["Exams & Results","/dashboard/exams"],["Notices & Events","/dashboard/notices"],["Reports","/dashboard/reports"],["Settings","/dashboard/settings"]];

  return <div className="shell">
    <aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{nav.map(([name,href])=><a key={name} className={name==="Reports"?"active":""} href={href}>{name}</a>)}</div></aside>
    <main className="main"><header className="top"><strong>{schoolResult.data?.name??"School"}</strong><span className="muted">School Admin · {membership.display_name??"Admin"}</span></header>
      <section className="content"><div className="hero"><div><h1>Reports</h1><p className="muted">Live student, attendance, fee, admission, exam and staff reports.</p></div><span className="badge">Live · Supabase</span></div>
        <ReportsClient
          summary={{students:students.length,staff:staff.length,parents:parents.length,attendance:attendance.length,attendancePresent:presentCount,billed:totalBilled,paid:totalPaid,pending:Math.max(0,totalBilled-totalPaid),enquiries:enquiries.length,applications:applications.length,marks:marks.length}}
          students={studentRows} attendance={attendanceRows} fees={feeRows} admissions={admissionRows} exams={examRows} staff={staffRows}
        />
      </section>
    </main>
  </div>;
}
